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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)

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

  // Calculate staff distribution by department
  // Note: staff.department_assignments is an array of department UUIDs
  const staffByDepartment = departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    count: staff.filter(s => 
      Array.isArray(s.department_assignments) && 
      s.department_assignments.includes(dept.id)
    ).length,
  })).filter(dept => dept.count > 0)

  // Filter staff by selected department
  const filteredStaff = selectedDepartmentId
    ? staff.filter(s => 
        Array.isArray(s.department_assignments) && 
        s.department_assignments.includes(selectedDepartmentId)
      )
    : staff

  const handleDepartmentClick = (deptId: string) => {
    setSelectedDepartmentId(selectedDepartmentId === deptId ? null : deptId)
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
        isLoading={isLoading}
        error={null}
        isEmpty={staff.length === 0}
        emptyMessage="Nessun membro dello staff configurato. Aggiungi il primo dipendente per iniziare."
        className="mb-6"
        contentClassName="px-4 py-6 sm:px-6"
        emptyActionLabel="Aggiungi staff"
        onEmptyAction={handleCreateNew}
      >
        {staff.length > 0 && (
          <div className="space-y-4">
            {/* Department Distribution */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Dipendenti per Reparto
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {staffByDepartment.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentClick(dept.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedDepartmentId === dept.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl font-bold text-gray-900">
                      {dept.count}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {dept.name}
                    </div>
                  </button>
                ))}
                {staffByDepartment.length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                    Nessun dipendente assegnato ai reparti
                  </div>
                )}
              </div>
              {selectedDepartmentId && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-blue-600">
                    Filtrando per: {staffByDepartment.find(d => d.id === selectedDepartmentId)?.name}
                  </p>
                  <button
                    onClick={() => setSelectedDepartmentId(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Mostra tutti
                  </button>
                </div>
              )}
            </div>

            {/* Staff List */}
            <div className="space-y-3">
              {filteredStaff.length > 0 ? (
                filteredStaff.map(staffMember => (
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nessun dipendente trovato{selectedDepartmentId ? ' in questo reparto' : ''}.</p>
                </div>
              )}
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
