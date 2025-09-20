import { useState } from 'react'
import { Building2, Plus, Zap } from 'lucide-react'
import {
  CollapsibleCard,
  CardActionButton,
} from '@/components/ui/CollapsibleCard'
import useDepartments, {
  Department,
  DepartmentInput,
} from '../hooks/useDepartments'
import DepartmentCard from './DepartmentCard'
import AddDepartmentModal from './AddDepartmentModal'

export const DepartmentManagement = () => {
  const {
    departments,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    isCreatingPresets,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    createPresetDepartments,
  } = useDepartments()

  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  )

  const handleCreateNew = () => {
    setEditingDepartment(null)
    setShowModal(true)
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
  }

  const handleSubmit = (input: DepartmentInput) => {
    if (editingDepartment) {
      updateDepartment(
        { id: editingDepartment.id, input },
        {
          onSuccess: () => {
            handleCloseModal()
          },
        }
      )
    } else {
      createDepartment(input, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    }
  }

  const handleDelete = (id: string) => {
    deleteDepartment(id)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleDepartmentStatus({ id, isActive })
  }

  const handleCreatePresets = () => {
    createPresetDepartments()
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
      {departments.length === 0 && (
        <CardActionButton
          icon={Zap}
          label="Predefiniti"
          onClick={handleCreatePresets}
          variant="default"
          disabled={isCreatingPresets}
        />
      )}
    </>
  )

  return (
    <>
      <CollapsibleCard
        title="Gestione Reparti"
        icon={Building2}
        counter={stats.total}
        actions={cardActions}
        loading={isLoading}
        error={null}
        showEmpty={departments.length === 0}
        emptyMessage="Nessun reparto configurato. Crea il primo reparto o usa i predefiniti."
        className="mb-6"
      >
        {departments.length > 0 && (
          <div className="p-4">
            {/* Stats */}
            <div className="mb-4 grid grid-cols-3 gap-4">
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
            </div>

            {/* Department List */}
            <div className="space-y-3">
              {departments.map(department => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  isToggling={isToggling}
                  isDeleting={isDeleting}
                />
              ))}
            </div>

            {/* Quick Actions */}
            {departments.length < 10 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Azioni rapide:</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aggiungi Reparto
                  </button>
                  {stats.total < 4 && (
                    <button
                      type="button"
                      onClick={handleCreatePresets}
                      disabled={isCreatingPresets}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {isCreatingPresets
                        ? 'Creando...'
                        : 'Aggiungi Predefiniti'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CollapsibleCard>

      {/* Add/Edit Modal */}
      <AddDepartmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        department={editingDepartment}
        isLoading={isCreating || isUpdating}
      />
    </>
  )
}

export default DepartmentManagement
