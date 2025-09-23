import { useState } from 'react'
import { Users, Plus, UserPlus } from 'lucide-react'
import {
  CollapsibleCard,
  CardActionButton,
} from '@/components/ui/CollapsibleCard'
import useStaff, { StaffMember, StaffInput } from '../hooks/useStaff'
import useDepartments from '../hooks/useDepartments'
import StaffCard from './StaffCard'
import AddStaffModal from './AddStaffModal'

export const StaffManagement = () => {
  const {
    staff,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    toggleStaffStatus,
  } = useStaff()

  const { departments } = useDepartments()

  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  const handleCreateNew = () => {
    setEditingStaff(null)
    setShowModal(true)
  }

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingStaff(null)
  }

  const handleSubmit = (input: StaffInput) => {
    if (editingStaff) {
      // TODO: Implement updateStaff function
      console.log('Update staff:', editingStaff.id, input)
      handleCloseModal()
    } else {
      // TODO: Implement createStaff function
      console.log('Create staff:', input)
      handleCloseModal()
    }
  }

  const handleDelete = (id: string) => {
    // TODO: Implement deleteStaff function
    console.log('Delete staff:', id)
  }

  const handleToggleStatus = (
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ) => {
    toggleStaffStatus({ id, status })
  }

  // Card actions
  const cardActions = (
    <>
      <CardActionButton
        icon={Plus}
        label="Nuovo"
        onClick={handleCreateNew}
        variant="primary"
      />
      <CardActionButton
        icon={UserPlus}
        label="Aggiungi Staff"
        onClick={handleCreateNew}
        variant="default"
      />
    </>
  )

  return (
    <>
      <CollapsibleCard
        title="Gestione Staff"
        icon={Users}
        counter={stats.total}
        actions={cardActions}
        loading={isLoading}
        error={null}
        showEmpty={staff.length === 0}
        emptyMessage="Nessun membro dello staff configurato. Aggiungi il primo dipendente per iniziare."
        className="mb-6"
      >
        {staff.length > 0 && (
          <div className="p-4">
            {/* Stats */}
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-500">Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-500">Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {stats.inactive}
                </div>
                <div className="text-sm text-gray-500">Inattivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.suspended || 0}
                </div>
                <div className="text-sm text-gray-500">Sospesi</div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Distribuzione Ruoli
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <span className="font-medium">
                    {staff.filter(s => s.role === 'admin').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Responsabili:</span>
                  <span className="font-medium">
                    {staff.filter(s => s.role === 'responsabile').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dipendenti:</span>
                  <span className="font-medium">
                    {staff.filter(s => s.role === 'dipendente').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collaboratori:</span>
                  <span className="font-medium">
                    {staff.filter(s => s.role === 'collaboratore').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Staff List */}
            <div className="space-y-3">
              {staff.map(staffMember => (
                <StaffCard
                  key={staffMember.id}
                  staffMember={staffMember}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  isToggling={isToggling}
                  isDeleting={isDeleting}
                  departments={departments}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Azioni rapide:</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Aggiungi Dipendente
                </button>
              </div>
            </div>
          </div>
        )}
      </CollapsibleCard>

      {/* Add/Edit Modal */}
      <AddStaffModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        staffMember={editingStaff}
        isLoading={isCreating || isUpdating}
        departments={departments}
      />
    </>
  )
}

export default StaffManagement
