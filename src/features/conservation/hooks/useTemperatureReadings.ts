import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { TemperatureReading, ConservationPoint } from '@/types/conservation'
import { toast } from 'react-toastify'
import { getCorrectiveAction, TOLERANCE_C } from '@/features/conservation/utils/correctiveActions'

export function useTemperatureReadings(conservationPointId?: string) {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()


  const {
    data: temperatureReadings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['temperature-readings', companyId, conservationPointId],
    queryFn: async () => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load temperature readings')
        throw new Error('No company ID available')
      }

      console.log('🔧 Loading temperature readings from Supabase for company:', companyId)

      // ✅ JOIN with conservation_points and user_profiles
      let query = supabase
        .from('temperature_readings')
        .select(`
          *,
          conservation_point:conservation_points(
            id,
            name,
            type,
            setpoint_temp
          )
        `)
        .eq('company_id', companyId)
        .order('recorded_at', { ascending: false })

      if (conservationPointId) {
        query = query.eq('conservation_point_id', conservationPointId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading temperature readings:', error)
        throw error
      }

      // ✅ Load user names separately if recorded_by exists
      // Note: recorded_by references auth.users.id, which maps to user_profiles.auth_user_id
      const readingsWithUsers = await Promise.all(
        (data || []).map(async (reading: any) => {
          if (reading.recorded_by) {
            try {
              console.log('🔍 Loading user data for reading:', reading.id, 'recorded_by:', reading.recorded_by)
              // Get user from user_profiles using auth_user_id (which matches auth.users.id)
              const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('id, first_name, last_name')
                .eq('auth_user_id', reading.recorded_by)
                .maybeSingle() // Use maybeSingle() instead of single() to avoid error if not found
              
              if (userError) {
                console.warn('⚠️ Error loading user data:', userError)
              } else if (userData) {
                console.log('✅ User data loaded:', userData)
                reading.recorded_by_user = userData
              } else {
                console.warn('⚠️ No user data found in user_profiles for recorded_by:', reading.recorded_by)
                // Try fallback: check if user exists via company_members -> staff
                try {
                  const { data: companyMember, error: fallbackError } = await supabase
                    .from('company_members')
                    .select('staff_id, staff:staff(id, name)')
                    .eq('user_id', reading.recorded_by)
                    .eq('company_id', companyId)
                    .maybeSingle()
                  
                  if (fallbackError) {
                    console.warn('⚠️ Fallback query error:', fallbackError)
                  } else if (companyMember?.staff) {
                    console.log('✅ User data found via staff fallback:', companyMember.staff)
                    // Staff has 'name' field (full name), split it if possible
                    const fullName = companyMember.staff.name || ''
                    const nameParts = fullName.trim().split(/\s+/)
                    const firstName = nameParts[0] || null
                    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null
                    
                    reading.recorded_by_user = {
                      id: companyMember.staff.id,
                      first_name: firstName,
                      last_name: lastName,
                      name: fullName, // Keep full name for backward compatibility
                    }
                  } else {
                    console.warn('⚠️ No company_member or staff found for user_id:', reading.recorded_by, 'company_id:', companyId)
                    // Log additional debug info
                    const { data: allMembers } = await supabase
                      .from('company_members')
                      .select('user_id, staff_id, company_id')
                      .eq('user_id', reading.recorded_by)
                      .limit(5)
                    console.log('🔍 All company_members for this user:', allMembers)
                  }
                } catch (fallbackErr) {
                  console.warn('⚠️ Fallback query exception:', fallbackErr)
                }
              }
            } catch (err) {
              // If user_profiles doesn't exist or join fails, continue without user data
              console.warn('❌ Could not load user data for reading:', reading.id, err)
            }
          } else {
            console.log('ℹ️ Reading has no recorded_by:', reading.id)
          }
          return reading
        })
      )

      console.log('✅ Loaded temperature readings from Supabase:', readingsWithUsers?.length || 0)
      return readingsWithUsers || []
    },
    enabled: !!companyId,
  })

  const createReadingMutation = useMutation({
    mutationFn: async (
      data: Omit<
        TemperatureReading,
        'id' | 'company_id' | 'created_at'
      >
    ) => {
      if (!companyId) throw new Error('No company ID available')

      // Convert recorded_at to ISO string if it's a Date object
      const recordedAtString = data.recorded_at 
        ? (typeof data.recorded_at === 'string' ? data.recorded_at : data.recorded_at.toISOString())
        : new Date().toISOString()

      // Build payload with only database fields (exclude computed/join fields like conservation_point)
      const payload = {
        conservation_point_id: data.conservation_point_id,
        temperature: data.temperature,
        recorded_at: recordedAtString,
        method: data.method || 'digital_thermometer', // ✅ DEFAULT
        notes: data.notes || null, // ✅ OPTIONAL
        photo_evidence: data.photo_evidence || null, // ✅ OPTIONAL
        recorded_by: data.recorded_by,
        company_id: companyId,
        // ✅ NOT including conservation_point (join/virtual field - doesn't exist in DB table)
      }

      console.log('💾 Inserting temperature reading with payload:', { ...payload, recorded_by: payload.recorded_by ? '***' : null })

      const { data: result, error } = await supabase
        .from('temperature_readings')
        .insert([payload])
        .select()
        .single()

      if (result) {
        console.log('✅ Temperature reading created:', result.id, 'recorded_by:', result.recorded_by)
      }

      if (error) {
        console.error('❌ Error creating temperature reading:', error)
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
      toast.success('Lettura temperatura registrata')
    },
    onError: error => {
      console.error('Error creating temperature reading:', error)
      toast.error('Errore nella registrazione della temperatura')
    },
  })

  const updateReadingMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<TemperatureReading>
    }) => {
      // Convert recorded_at to ISO string if it's a Date object
      const updateData: any = { ...data }
      if (updateData.recorded_at && typeof updateData.recorded_at !== 'string') {
        updateData.recorded_at = updateData.recorded_at.toISOString()
      }
      // Exclude computed/join fields that don't exist in DB
      if ('conservation_point' in updateData) {
        delete updateData.conservation_point
      }

      const { data: result, error } = await supabase
        .from('temperature_readings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      toast.success('Lettura aggiornata')
    },
    onError: error => {
      console.error('Error updating temperature reading:', error)
      toast.error("Errore nell'aggiornamento della lettura")
    },
  })

  const deleteReadingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('temperature_readings')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      toast.success('Lettura eliminata')
    },
    onError: error => {
      console.error('Error deleting temperature reading:', error)
      toast.error("Errore nell'eliminazione della lettura")
    },
  })

  // Statistics - simplified to only use fields that exist in DB
  const stats = {
    total: temperatureReadings?.length || 0,
    recent: temperatureReadings?.slice(0, 10) || [],
    averageTemperature: temperatureReadings?.length
      ? temperatureReadings.reduce((sum: number, r: any) => sum + r.temperature, 0) / temperatureReadings.length
      : 0,
    
    // ✅ COMPUTED STATS based on conservation point setpoint and tolerance range
    compliant: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      // Conformi: temperatura esattamente uguale al target
      return r.temperature === r.conservation_point.setpoint_temp
    }).length || 0,
    
    warning: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      const tolerance = r.conservation_point.type === 'blast' ? 5 : 
                       r.conservation_point.type === 'ambient' ? 3 : 2
      const toleranceMin = r.conservation_point.setpoint_temp - tolerance
      const toleranceMax = r.conservation_point.setpoint_temp + tolerance
      // Attenzione: temperatura diversa dal target MA nel range di tolleranza
      return r.temperature !== r.conservation_point.setpoint_temp &&
             r.temperature >= toleranceMin &&
             r.temperature <= toleranceMax
    }).length || 0,
    
    critical: temperatureReadings?.filter((r: any) => {
      if (!r.conservation_point) return false
      const tolerance = r.conservation_point.type === 'blast' ? 5 : 
                       r.conservation_point.type === 'ambient' ? 3 : 2
      const toleranceMin = r.conservation_point.setpoint_temp - tolerance
      const toleranceMax = r.conservation_point.setpoint_temp + tolerance
      // Critiche: temperatura fuori dal range di tolleranza
      return r.temperature < toleranceMin || r.temperature > toleranceMax
    }).length || 0,
    
    // TODO: Add method and validation status tracking when DB schema is updated
  }

  return {
    temperatureReadings: (temperatureReadings || []) as TemperatureReading[],
    isLoading,
    error,
    stats,
    createReading: createReadingMutation.mutate,
    updateReading: updateReadingMutation.mutate,
    deleteReading: deleteReadingMutation.mutate,
    isCreating: createReadingMutation.isPending,
    isUpdating: updateReadingMutation.isPending,
    isDeleting: deleteReadingMutation.isPending,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Temperature point status types
 */
export type TemperaturePointStatus = 'conforme' | 'critico' | 'richiesta_lettura' | 'nessuna_lettura'

/**
 * Get the latest temperature reading for a specific conservation point
 * @param readings - Array of temperature readings (should be sorted by recorded_at desc)
 * @param pointId - Conservation point ID to filter by
 * @returns The latest reading for the point, or undefined if none found
 */
export function getLatestReadingByPoint(
  readings: TemperatureReading[],
  pointId: string
): TemperatureReading | undefined {
  return readings.find(r => r.conservation_point_id === pointId)
}

/**
 * Group temperature readings by date
 * @param readings - Array of temperature readings
 * @returns Map of date string (YYYY-MM-DD) to array of readings for that date
 */
export function groupReadingsByDate(
  readings: TemperatureReading[]
): Map<string, TemperatureReading[]> {
  const grouped = new Map<string, TemperatureReading[]>()

  readings.forEach(reading => {
    const date = new Date(reading.recorded_at)
    // Usa data locale invece di UTC per raggruppare correttamente per giorno
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}` // YYYY-MM-DD in timezone locale

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(reading)
  })

  return grouped
}

/**
 * Determine the status of a conservation point based on its latest reading
 * and the "richiesta lettura" frontend state
 *
 * Status logic:
 * - nessuna_lettura: No readings exist for this point
 * - richiesta_lettura: Point is in the "richiesta lettura" set (after corrective action confirmed)
 * - critico: Latest reading is outside setpoint ± TOLERANCE_C
 * - conforme: Latest reading is within setpoint ± TOLERANCE_C
 *
 * @param point - Conservation point
 * @param latestReading - Latest temperature reading for this point (optional)
 * @param pointIdsInRichiestaLettura - Set of point IDs in "richiesta lettura" state
 * @returns Status type for the point
 */
export function getPointStatus(
  point: ConservationPoint,
  latestReading: TemperatureReading | undefined,
  pointIdsInRichiestaLettura: Set<string>
): TemperaturePointStatus {
  // Check if point is in "richiesta lettura" state (frontend only)
  if (pointIdsInRichiestaLettura.has(point.id)) {
    return 'richiesta_lettura'
  }

  // No readings yet
  if (!latestReading) {
    return 'nessuna_lettura'
  }

  // Check if reading requires corrective action (outside setpoint ± TOLERANCE_C)
  const correctiveAction = getCorrectiveAction(latestReading, point)
  if (correctiveAction) {
    return 'critico'
  }

  // Temperature is within acceptable range
  return 'conforme'
}
