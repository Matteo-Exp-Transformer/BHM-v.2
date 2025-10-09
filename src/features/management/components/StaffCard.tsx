import { useState } from 'react'
import { StaffMember } from '../hooks/useStaff'
import {
  User,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Building2,
  Send,
  // UserCheck,
} from 'lucide-react'

interface StaffCardProps {
  staffMember: StaffMember
  onEdit: (staffMember: StaffMember) => void
  onDelete: (id: string) => void
  onToggleStatus: (
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ) => void
  onSendInvite?: (staffMember: StaffMember) => void
  isToggling?: boolean
  isDeleting?: boolean
  isSendingInvite?: boolean
  departments?: Array<{ id: string; name: string }>
}

export const StaffCard = ({
  staffMember,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendInvite,
  isToggling = false,
  isDeleting = false,
  isSendingInvite = false,
  departments = [],
}: StaffCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggleStatus = () => {
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active'
    onToggleStatus(staffMember.id, newStatus)
  }

  const handleDelete = () => {
    onDelete(staffMember.id)
    setShowDeleteConfirm(false)
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      admin: 'Amministratore',
      responsabile: 'Responsabile',
      dipendente: 'Dipendente',
      collaboratore: 'Collaboratore',
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-600'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'responsabile':
        return 'bg-blue-100 text-blue-800'
      case 'dipendente':
        return 'bg-green-100 text-green-800'
      case 'collaboratore':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Check HACCP certification expiry
  const isHaccpExpiring = () => {
    if (!staffMember.haccp_certification?.expiry_date) return false
    const expiryDate = new Date(staffMember.haccp_certification.expiry_date)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiryDate <= thirtyDaysFromNow && expiryDate > now
  }

  const isHaccpExpired = () => {
    if (!staffMember.haccp_certification?.expiry_date) return false
    const expiryDate = new Date(staffMember.haccp_certification.expiry_date)
    return expiryDate < new Date()
  }

  // Get assigned departments
  const getAssignedDepartments = () => {
    if (!staffMember.department_assignments) return []
    return departments.filter(dept =>
      staffMember.department_assignments?.includes(dept.id)
    )
  }

  return (
    <div
      className={`p-4 border rounded-lg transition-all duration-200 ${
        staffMember.status === 'active'
          ? 'border-gray-200 bg-white hover:shadow-md'
          : staffMember.status === 'suspended'
            ? 'border-red-300 bg-red-50 opacity-90'
            : 'border-gray-300 bg-gray-50 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Avatar */}
          <div
            className={`p-2 rounded-lg ${
              staffMember.status === 'active'
                ? 'bg-blue-100 text-blue-600'
                : staffMember.status === 'suspended'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            <User className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name and Status */}
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`text-sm font-semibold truncate ${
                  staffMember.status === 'active'
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {staffMember.name}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staffMember.status)}`}
              >
                {staffMember.status === 'active'
                  ? 'Attivo'
                  : staffMember.status === 'suspended'
                    ? 'Sospeso'
                    : 'Inattivo'}
              </span>
            </div>

            {/* Role and Category */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(staffMember.role)}`}
              >
                {getRoleDisplayName(staffMember.role)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                {staffMember.category}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-2">
              {staffMember.email && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{staffMember.email}</span>
                </div>
              )}
              {staffMember.phone && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3" />
                  <span>{staffMember.phone}</span>
                </div>
              )}
            </div>

            {/* Hire Date */}
            {staffMember.hire_date && (
              <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Assunto:{' '}
                  {new Date(staffMember.hire_date).toLocaleDateString('it-IT')}
                </span>
              </div>
            )}

            {/* HACCP Certification */}
            {staffMember.haccp_certification && (
              <div className="mb-2">
                <div
                  className={`flex items-center space-x-1 text-xs ${
                    isHaccpExpired()
                      ? 'text-red-600'
                      : isHaccpExpiring()
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}
                >
                  {isHaccpExpired() ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : isHaccpExpiring() ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Shield className="h-3 w-3" />
                  )}
                  <span>
                    HACCP{' '}
                    {staffMember.haccp_certification.level === 'advanced'
                      ? 'Avanzato'
                      : 'Base'}
                    {isHaccpExpired() && ' - SCADUTO'}
                    {isHaccpExpiring() && ' - IN SCADENZA'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Scadenza:{' '}
                  {new Date(
                    staffMember.haccp_certification.expiry_date
                  ).toLocaleDateString('it-IT')}
                </div>
              </div>
            )}

            {/* Department Assignments */}
            {getAssignedDepartments().length > 0 && (
              <div className="mb-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                  <Building2 className="h-3 w-3" />
                  <span>Reparti:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getAssignedDepartments().map(dept => (
                    <span
                      key={dept.id}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                    >
                      {dept.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {staffMember.notes && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-2">
                {staffMember.notes}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-4">
          {/* Send Invite (only if email present) */}
          {staffMember.email && onSendInvite && (
            <button
              type="button"
              onClick={() => onSendInvite(staffMember)}
              disabled={isSendingInvite}
              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              title="Invia invito email"
            >
              {isSendingInvite ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Toggle Status */}
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`p-1.5 rounded-md transition-colors ${
              staffMember.status === 'active'
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            } disabled:opacity-50`}
            title={
              staffMember.status === 'active'
                ? 'Disattiva dipendente'
                : 'Attiva dipendente'
            }
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : staffMember.status === 'active' ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(staffMember)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            title="Modifica dipendente"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Elimina dipendente"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Conferma'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffCard
