import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  Edit,
  Check,
  X,
} from 'lucide-react'

interface Staff {
  id: string
  name: string
  role: string
  category: string
  email: string | null
  phone: string | null
  hire_date: string | null
  status: string
  haccp_certification: any
  department_assignments: string[] | null
}

interface UserProfile {
  id: string
  clerk_user_id: string
  company_id: string
  staff_id: string | null
  role: string
  created_at: string
  updated_at: string
  staff?: Staff
}

export function UserManagement() {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Record<string, string>>({})

  // Fetch user profiles with staff data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['user-profiles', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          `
          *,
          staff:staff_id (
            id,
            name,
            role,
            category,
            email,
            phone,
            hire_date,
            status,
            haccp_certification,
            department_assignments
          )
        `
        )
        .eq('company_id', companyId)

      if (error) throw error
      return data as UserProfile[]
    },
    enabled: !!companyId,
  })

  // Fetch staff members
  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')

      if (error) throw error
      return data as Staff[]
    },
    enabled: !!companyId,
  })

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string
      newRole: string
    }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles', companyId] })
      setEditingUser(null)
    },
  })

  // Link user to staff mutation
  const linkStaffMutation = useMutation({
    mutationFn: async ({
      userId,
      staffId,
    }: {
      userId: string
      staffId: string
    }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ staff_id: staffId })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles', companyId] })
    },
  })

  // Unlink user from staff mutation
  const unlinkStaffMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ staff_id: null })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles', companyId] })
    },
  })

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, newRole })
  }

  const handleStaffLink = (userId: string, staffId: string) => {
    linkStaffMutation.mutate({ userId, staffId })
  }

  const handleStaffUnlink = (userId: string) => {
    unlinkStaffMutation.mutate(userId)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'responsabile':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dipendente':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'collaboratore':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Amministratore'
      case 'responsabile':
        return 'Responsabile'
      case 'dipendente':
        return 'Dipendente'
      case 'collaboratore':
        return 'Collaboratore'
      default:
        return 'Guest'
    }
  }

  if (isLoadingUsers || isLoadingStaff) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Gestione Utenti e Ruoli
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {users?.length || 0} utenti registrati
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users?.map(user => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {user.staff?.name || 'Utente non collegato'}
                    </h4>
                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
                  {/* Role */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ruolo Sistema
                    </label>
                    {editingUser === user.id ? (
                      <select
                        value={user.role}
                        onChange={e =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="admin">Amministratore</option>
                        <option value="responsabile">Responsabile</option>
                        <option value="dipendente">Dipendente</option>
                        <option value="collaboratore">Collaboratore</option>
                        <option value="guest">Guest</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Staff Link */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Collegamento Staff
                    </label>
                    {user.staff ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Collegato
                        </span>
                        <button
                          onClick={() => handleStaffUnlink(user.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Rimuovi collegamento"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedStaff[user.id] || ''}
                        onChange={e =>
                          setSelectedStaff(prev => ({
                            ...prev,
                            [user.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleziona staff...</option>
                        {staff
                          ?.filter(s => s.email)
                          .map(staffMember => (
                            <option key={staffMember.id} value={staffMember.id}>
                              {staffMember.name} ({staffMember.email})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contatto
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {user.staff?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.staff.email}</span>
                        </div>
                      )}
                      {user.staff?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{user.staff.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Registrato
                    </label>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Details */}
                {user.staff && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Dettagli Staff
                    </h5>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="text-gray-500">Categoria:</span>
                        <p className="font-medium">{user.staff.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ruolo Staff:</span>
                        <p className="font-medium">{user.staff.role}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Stato:</span>
                        <p className="font-medium">{user.staff.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Assunto:</span>
                        <p className="font-medium">
                          {user.staff.hire_date
                            ? new Date(user.staff.hire_date).toLocaleDateString(
                                'it-IT'
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                {!user.staff && selectedStaff[user.id] && (
                  <button
                    onClick={() =>
                      handleStaffLink(user.id, selectedStaff[user.id])
                    }
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Collegare
                  </button>
                )}
                {editingUser === user.id && (
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Annulla
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users && users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun utente trovato
          </h3>
          <p className="text-gray-600">
            Non ci sono utenti registrati per questa azienda.
          </p>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="font-medium text-blue-900 mb-1">
              Gestione Ruoli e Permessi
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Amministratore:</strong> Accesso completo a tutte le
                funzionalità
              </p>
              <p>
                <strong>Responsabile:</strong> Gestione staff, dipartimenti e
                conservazione
              </p>
              <p>
                <strong>Dipendente:</strong> Accesso limitato a funzionalità
                operative
              </p>
              <p>
                <strong>Collaboratore:</strong> Accesso in sola lettura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
