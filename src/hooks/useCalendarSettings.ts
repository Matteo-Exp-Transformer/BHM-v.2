import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import type {
  CompanyCalendarSettings,
  CalendarConfigInput,
  BusinessHourSlot
} from '@/types/calendar'

const QUERY_KEYS = {
  calendarSettings: (companyId: string) => ['calendar-settings', companyId] as const,
}

export const useCalendarSettings = () => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.calendarSettings(companyId || ''),
    queryFn: async (): Promise<CompanyCalendarSettings | null> => {
      if (!companyId) {
        return null
      }

      const { data, error } = await supabase
        .from('company_calendar_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading calendar settings:', error)
        throw error
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        company_id: data.company_id,
        fiscal_year_start: data.fiscal_year_start,
        fiscal_year_end: data.fiscal_year_end,
        closure_dates: data.closure_dates || [],
        open_weekdays: data.open_weekdays || [1,2,3,4,5,6],
        business_hours: data.business_hours || {},
        is_configured: data.is_configured || false,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      }
    },
    enabled: !!companyId && !!user,
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (input: CalendarConfigInput) => {
      if (!companyId) throw new Error('No company ID available')

      const existingSettings = settings

      if (existingSettings) {
        const { data, error } = await supabase
          .from('company_calendar_settings')
          .update({
            fiscal_year_start: input.fiscal_year_start,
            fiscal_year_end: input.fiscal_year_end,
            closure_dates: input.closure_dates,
            open_weekdays: input.open_weekdays,
            business_hours: input.business_hours,
            is_configured: true,
          })
          .eq('id', existingSettings.id)
          .eq('company_id', companyId)
          .select()
          .single()

        if (error) {
          if (error.code === '42501') {
            throw new Error('Permessi insufficienti per modificare la configurazione del calendario')
          }
          console.error('Error updating calendar settings:', error)
          throw error
        }

        return data
      } else {
        const { data, error } = await supabase
          .from('company_calendar_settings')
          .insert({
            company_id: companyId,
            fiscal_year_start: input.fiscal_year_start,
            fiscal_year_end: input.fiscal_year_end,
            closure_dates: input.closure_dates,
            open_weekdays: input.open_weekdays,
            business_hours: input.business_hours,
            is_configured: true,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '42501') {
            throw new Error('Permessi insufficienti per creare la configurazione del calendario')
          }
          console.error('Error creating calendar settings:', error)
          throw error
        }

        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.calendarSettings(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events', companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['aggregated-events', companyId],
      })
      toast.success('Configurazione calendario salvata con successo')
    },
    onError: (error: Error) => {
      console.error('Error saving calendar settings:', error)
      toast.error(error.message || 'Errore nel salvataggio della configurazione')
    },
  })

  const isDateOpen = (date: Date): boolean => {
    if (!settings || !settings.is_configured) {
      return true
    }

    const dayOfWeek = date.getDay()
    if (!settings.open_weekdays.includes(dayOfWeek)) {
      return false
    }

    const dateString = date.toISOString().split('T')[0]
    if (settings.closure_dates.includes(dateString)) {
      return false
    }

    const fiscalStart = new Date(settings.fiscal_year_start)
    const fiscalEnd = new Date(settings.fiscal_year_end)
    if (date < fiscalStart || date > fiscalEnd) {
      return false
    }

    return true
  }

  const getBusinessHours = (date: Date): BusinessHourSlot[] | null => {
    if (!settings || !settings.is_configured) {
      return null
    }

    const dayOfWeek = date.getDay()
    const hours = settings.business_hours[dayOfWeek.toString()]

    return hours || null
  }

  const isConfigured = (): boolean => {
    return settings?.is_configured || false
  }

  const isWithinFiscalYear = (date: Date): boolean => {
    if (!settings || !settings.is_configured) {
      return true
    }

    const fiscalStart = new Date(settings.fiscal_year_start)
    const fiscalEnd = new Date(settings.fiscal_year_end)

    return date >= fiscalStart && date <= fiscalEnd
  }

  return {
    settings,
    isLoading,
    error,
    refetch,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending,
    isDateOpen,
    getBusinessHours,
    isConfigured,
    isWithinFiscalYear,
  }
}
