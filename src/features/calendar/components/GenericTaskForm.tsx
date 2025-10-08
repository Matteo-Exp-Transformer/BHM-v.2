import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectOption,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

type MaintenanceFrequency = 'annuale' | 'mensile' | 'settimanale' | 'giornaliera' | 'custom'
type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
type CustomFrequencyDays = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'

interface GenericTaskFormData {
  name: string
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  note?: string
}

interface GenericTaskFormProps {
  staffOptions: Array<{ id: string; label: string; role: string; categories: string[] }>
  onSubmit: (data: GenericTaskFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

const MAINTENANCE_FREQUENCIES: Array<{
  value: MaintenanceFrequency
  label: string
}> = [
  { value: 'annuale', label: 'Annuale' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'settimanale', label: 'Settimanale' },
  { value: 'giornaliera', label: 'Giornaliera' },
  { value: 'custom', label: 'Personalizzata' },
]

const CUSTOM_DAYS: Array<{
  value: CustomFrequencyDays
  label: string
}> = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

export const GenericTaskForm = ({
  staffOptions,
  onSubmit,
  onCancel,
  isLoading = false,
}: GenericTaskFormProps) => {
  const [formData, setFormData] = useState<GenericTaskFormData>({
    name: '',
    frequenza: 'settimanale',
    assegnatoARuolo: 'dipendente',
    assegnatoACategoria: 'all',
    note: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (updates: Partial<GenericTaskFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Pulisci errori correlati
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key]
    })
    setErrors(newErrors)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome attività obbligatorio'
    }
    if (!formData.frequenza) {
      newErrors.frequenza = 'Frequenza obbligatoria'
    }
    if (!formData.assegnatoARuolo) {
      newErrors.ruolo = 'Ruolo obbligatorio'
    }
    if (formData.frequenza === 'custom' && (!formData.giorniCustom || formData.giorniCustom.length === 0)) {
      newErrors.giorni = 'Seleziona almeno un giorno per frequenza personalizzata'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      // Reset form dopo invio
      setFormData({
        name: '',
        frequenza: 'settimanale',
        assegnatoARuolo: 'dipendente',
        assegnatoACategoria: 'all',
        note: '',
      })
      setErrors({})
    }
  }

  const filteredStaffByRole = useMemo(() => {
    return staffOptions.filter(staff => staff.role === formData.assegnatoARuolo)
  }, [staffOptions, formData.assegnatoARuolo])

  const availableCategories = useMemo(() => {
    const categories = filteredStaffByRole
      .flatMap(staff => staff.categories)
      .filter(category => category && category.trim() !== '')
      .filter((category, index, arr) => arr.indexOf(category) === index)
    return categories
  }, [filteredStaffByRole])

  const filteredStaffByCategory = useMemo(() => {
    if (!formData.assegnatoACategoria || formData.assegnatoACategoria === 'all') {
      return filteredStaffByRole
    }
    return filteredStaffByRole.filter(staff =>
      staff.categories.includes(formData.assegnatoACategoria!)
    )
  }, [filteredStaffByRole, formData.assegnatoACategoria])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          Nuova Attività Generica
        </h4>
        <Button variant="outline" size="icon" onClick={onCancel}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nome attività */}
        <div className="md:col-span-2">
          <Label>Nome attività *</Label>
          <Input
            value={formData.name}
            onChange={e => updateField({ name: e.target.value })}
            placeholder="Es: Pulizia cucina, Controllo fornelli..."
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Frequenza */}
        <div>
          <Label>Frequenza *</Label>
          <Select
            value={formData.frequenza}
            onValueChange={value =>
              updateField({
                frequenza: value as MaintenanceFrequency,
                giorniCustom: value === 'custom' ? ['lunedi'] : undefined
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona frequenza" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_FREQUENCIES.map(freq => (
                <SelectOption key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
          {errors.frequenza && (
            <p className="mt-1 text-sm text-red-600">{errors.frequenza}</p>
          )}
        </div>

        {/* Ruolo */}
        <div>
          <Label>Ruolo *</Label>
          <Select
            value={formData.assegnatoARuolo || ''}
            onValueChange={value =>
              updateField({
                assegnatoARuolo: value as StaffRole,
                assegnatoACategoria: 'all',
                assegnatoADipendenteSpecifico: undefined
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona ruolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="admin">Amministratore</SelectOption>
              <SelectOption value="responsabile">Responsabile</SelectOption>
              <SelectOption value="dipendente">Dipendente</SelectOption>
              <SelectOption value="collaboratore">Collaboratore</SelectOption>
            </SelectContent>
          </Select>
          {errors.ruolo && (
            <p className="mt-1 text-sm text-red-600">{errors.ruolo}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <Label>Categoria</Label>
          <Select
            value={formData.assegnatoACategoria || 'all'}
            onValueChange={value =>
              updateField({
                assegnatoACategoria: value,
                assegnatoADipendenteSpecifico: undefined
              })
            }
            disabled={!formData.assegnatoARuolo || availableCategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                formData.assegnatoARuolo
                  ? "Seleziona categoria"
                  : "Prima seleziona un ruolo"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Tutte le categorie</SelectOption>
              {availableCategories.map(category => (
                <SelectOption key={category} value={category}>
                  {category}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dipendente specifico */}
        <div>
          <Label>Dipendente specifico</Label>
          <Select
            value={formData.assegnatoADipendenteSpecifico ?? 'none'}
            onValueChange={value =>
              updateField({
                assegnatoADipendenteSpecifico: value === 'none' ? undefined : value,
              })
            }
            disabled={filteredStaffByCategory.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Opzionale: seleziona dipendente specifico" />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="none">Nessun dipendente specifico</SelectOption>
              {filteredStaffByCategory.map(staff => (
                <SelectOption key={staff.id} value={staff.id}>
                  {staff.label} - {staff.categories.join(', ')}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Giorni custom se frequenza personalizzata */}
        {formData.frequenza === 'custom' && (
          <div className="md:col-span-2">
            <Label>Giorni della settimana *</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {CUSTOM_DAYS.map(day => (
                <label key={day.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.giorniCustom?.includes(day.value) ?? false}
                    onChange={e => {
                      const currentDays = formData.giorniCustom || []
                      const newDays = e.target.checked
                        ? [...currentDays, day.value]
                        : currentDays.filter(d => d !== day.value)
                      updateField({ giorniCustom: newDays })
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.giorni && (
              <p className="mt-1 text-sm text-red-600">{errors.giorni}</p>
            )}
          </div>
        )}

        {/* Note */}
        <div className="md:col-span-2">
          <Label>Note (opzionale)</Label>
          <Textarea
            rows={3}
            value={formData.note ?? ''}
            onChange={e => updateField({ note: e.target.value })}
            placeholder="Note aggiuntive sull'attività..."
          />
        </div>
      </div>

      {/* Azioni */}
      <div className="flex justify-end gap-3 border-t pt-4 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creazione...' : 'Crea Attività'}
        </Button>
      </div>
    </div>
  )
}

export default GenericTaskForm

