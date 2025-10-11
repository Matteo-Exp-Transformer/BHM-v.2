import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStaff } from '@/features/management/hooks/useStaff'
import type { CalendarEvent } from '@/types/calendar'

export interface EventAssignment {
  assigned_to_staff_id?: string | null
  assigned_to_role?: string | null
  assigned_to_category?: string | null
  assigned_to?: string[]
}

interface FilteredEventsResult {
  filteredEvents: CalendarEvent[]
  isLoading: boolean
  canViewAllEvents: boolean
  userStaffMember: ReturnType<typeof useStaff>['staff'][0] | null
}

export function useFilteredEvents(
  events: CalendarEvent[]
): FilteredEventsResult {
  const { userProfile, userRole, isLoading: authLoading } = useAuth()
  const { staff, isLoading: staffLoading } = useStaff()

  const isLoading = authLoading || staffLoading

  const userStaffMember = useMemo(() => {
    if (!userProfile?.staff_id || !staff) return null
    return staff.find(s => s.id === userProfile.staff_id) || null
  }, [userProfile?.staff_id, staff])

  const canViewAllEvents = useMemo(() => {
    return userRole === 'admin' || userRole === 'responsabile'
  }, [userRole])

  const filteredEvents = useMemo(() => {
    console.log('🔍 DEBUG FILTER: Eventi in input:', events?.length || 0)
    console.log('🔍 DEBUG FILTER: UserProfile:', userProfile ? 'Presente' : 'Assente')
    console.log('🔍 DEBUG FILTER: UserRole:', userRole)
    console.log('🔍 DEBUG FILTER: CanViewAllEvents:', canViewAllEvents)
    console.log('🔍 DEBUG FILTER: UserStaffMember:', userStaffMember ? 'Presente' : 'Assente')
    
    if (!userProfile || !events || events.length === 0) {
      console.log('❌ DEBUG FILTER: Nessun userProfile o eventi')
      return []
    }

    if (canViewAllEvents) {
      console.log('✅ DEBUG FILTER: Admin/Responsabile - Mostra tutti gli eventi')
      return events
    }

    if (!userStaffMember) {
      console.log('❌ DEBUG FILTER: Nessun userStaffMember')
      return []
    }

    const filtered = events.filter(event => {
      const assignment: EventAssignment = {
        assigned_to_staff_id: event.metadata?.assigned_to_staff_id || event.metadata?.staff_id,
        assigned_to_role: (event.metadata as any)?.assigned_to_role,
        assigned_to_category: (event.metadata as any)?.assigned_to_category,
        assigned_to: event.assigned_to,
      }

      const isAssignedToUser = checkEventAssignment(assignment, userStaffMember)
      
      // Debug per i primi 3 eventi
      if (events.indexOf(event) < 3) {
        console.log(`🔍 DEBUG FILTER Event ${event.title}:`, {
          metadata: event.metadata,
          assignment,
          isAssignedToUser,
          userStaffMember: {
            id: userStaffMember.id,
            name: userStaffMember.name,
            role: userStaffMember.role,
            category: userStaffMember.category
          }
        })
      }
      
      return isAssignedToUser
    })

    console.log(`📊 DEBUG FILTER: Eventi filtrati: ${filtered.length}/${events.length}`)
    return filtered
  }, [events, userProfile, canViewAllEvents, userStaffMember])

  return {
    filteredEvents,
    isLoading,
    canViewAllEvents,
    userStaffMember,
  }
}

function checkEventAssignment(
  assignment: EventAssignment,
  staffMember: NonNullable<ReturnType<typeof useStaff>['staff'][0]>
): boolean {
  // ✅ Se assegnato a categoria 'all', tutti vedono
  if (assignment.assigned_to_category === 'all') {
    console.log(`   ✅ DEBUG ASSIGNMENT: Categoria 'all' - visibile`)
    return true
  }

  // ✅ Se assegnato a reparto specifico, controlla department_assignments
  if (assignment.assigned_to_category?.startsWith('department:')) {
    const departmentId = assignment.assigned_to_category.replace(
      'department:',
      ''
    )
    if (staffMember.department_assignments?.includes(departmentId)) {
      return true
    }
  }

  if (assignment.assigned_to_staff_id === staffMember.id) {
    return true
  }

  if (
    assignment.assigned_to_role &&
    assignment.assigned_to_role === staffMember.role
  ) {
    return true
  }

  if (
    assignment.assigned_to_category &&
    assignment.assigned_to_category === staffMember.category
  ) {
    return true
  }

  if (
    assignment.assigned_to &&
    Array.isArray(assignment.assigned_to) &&
    assignment.assigned_to.includes(staffMember.id)
  ) {
    console.log(`   ✅ DEBUG ASSIGNMENT: Assigned_to array - visibile`)
    return true
  }

  console.log(`   ❌ DEBUG ASSIGNMENT: Nessun match - nascosto`)
  return false
}

export function getAssignmentLabel(
  assignment: EventAssignment,
  staff: ReturnType<typeof useStaff>['staff']
): string {
  if (assignment.assigned_to_staff_id) {
    const staffMember = staff.find(
      s => s.id === assignment.assigned_to_staff_id
    )
    return staffMember?.name || 'Dipendente specifico'
  }

  if (assignment.assigned_to_role) {
    const roleLabels: Record<string, string> = {
      admin: 'Amministratore',
      responsabile: 'Responsabile',
      dipendente: 'Dipendente',
      collaboratore: 'Collaboratore',
    }
    return (
      roleLabels[assignment.assigned_to_role] || assignment.assigned_to_role
    )
  }

  if (assignment.assigned_to_category) {
    return assignment.assigned_to_category
  }

  if (assignment.assigned_to && assignment.assigned_to.length > 0) {
    const names = assignment.assigned_to
      .map(id => staff.find(s => s.id === id)?.name)
      .filter(Boolean)
    return names.join(', ') || 'Multipli'
  }

  return 'Non assegnato'
}
