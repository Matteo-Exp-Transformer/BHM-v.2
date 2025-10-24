import { z } from 'zod'

import type {
  // GenericTask,
  TaskFrequency,
  TaskPriority,
  // HaccpTaskCategory,
} from '@/types/onboarding'

// Constants allineati con il main app
export const HACCP_TASK_CATEGORIES: {
  value: string
  label: string
  icon: string
}[] = [
  { value: 'temperature', label: 'Controllo Temperature', icon: '🌡️' },
  { value: 'hygiene', label: 'Igiene e Sanificazione', icon: '🧼' },
  { value: 'maintenance', label: 'Manutenzione', icon: '🛠️' },
  { value: 'documentation', label: 'Documentazione', icon: '📄' },
  { value: 'training', label: 'Formazione', icon: '🎓' },
  { value: 'other', label: 'Altro', icon: '📝' },
]

export const TASK_FREQUENCIES: { value: TaskFrequency; label: string }[] = [
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'annually', label: 'Annuale' },
  { value: 'as_needed', label: 'Al bisogno' },
]

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Critica' },
]

// Schema di validazione Zod
const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Il nome del task è obbligatorio'),
  description: z.string().optional(),
  frequency: z.enum([
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'annual',
    'custom',
    'as_needed',
  ]),
  departmentId: z.string().optional(),
  conservationPointId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedDuration: z.number().min(1, 'La durata deve essere almeno 1 minuto'),
  checklist: z.array(z.string()).default([]),
  requiredTools: z.array(z.string()).default([]),
  haccpCategory: z.enum([
    'temperature',
    'hygiene',
    'maintenance',
    'documentation',
    'training',
    'other',
  ]),
  responsibleStaffIds: z.array(z.string()).default([]),
  documentationUrl: z.string().optional(),
  validationNotes: z.string().optional(),
})

// Funzione per generare ID semplice (allineata con il resto del progetto)
const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Funzione per creare un task bozza
export const createDraftTask = (existing?: any): any => {
  if (existing) {
    return {
      ...existing,
    }
  }

  return {
    id: generateId(),
    name: '',
    description: '',
    frequency: 'daily',
    priority: 'medium',
    estimatedDuration: 30,
    checklist: [],
    requiredTools: [],
    haccpCategory: 'other',
    responsibleStaffIds: [],
  }
}

// Funzione per normalizzare un task
export const normalizeGeneralTask = (task: any): any => {
  return {
    id: task.id || generateId(),
    name: task.name.trim(),
    description: task.description?.trim(),
    frequency: task.frequency,
    departmentId: task.departmentId,
    conservationPointId: task.conservationPointId,
    priority: task.priority,
    estimatedDuration: task.estimatedDuration,
    checklist: task.checklist || [],
    requiredTools: task.requiredTools || [],
    haccpCategory: task.haccpCategory,
    responsibleStaffIds: task.responsibleStaffIds || [],
    documentationUrl: task.documentationUrl?.trim(),
    validationNotes: task.validationNotes?.trim(),
  }
}

// Funzione per validare un task
export const validateGeneralTask = (
  task: any
): { success: boolean; errors?: Record<string, string> } => {
  const result = taskSchema.safeParse(task)

  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      const field = issue.path.join('.')
      errors[field] = issue.message
    })
    return { success: false, errors }
  }

  // Validazioni aggiuntive
  const errors: Record<string, string> = {}

  if (!task.name.trim()) {
    errors.name = 'Il nome del task è obbligatorio'
  }

  if (task.estimatedDuration <= 0) {
    errors.estimatedDuration = 'La durata deve essere maggiore di zero'
  }

  if (task.checklist.length === 0) {
    errors.checklist = 'Aggiungi almeno un elemento alla checklist'
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return { success: true }
}

// Funzione per ottenere il label di una categoria HACCP
export const getHaccpCategoryLabel = (category: string): string => {
  const found = HACCP_TASK_CATEGORIES.find(c => c.value === category)
  return found?.label || category
}

// Funzione per ottenere il label di una frequenza
export const getFrequencyLabel = (frequency: TaskFrequency): string => {
  const found = TASK_FREQUENCIES.find(f => f.value === frequency)
  return found?.label || frequency
}

// Funzione per ottenere il label di una priorità
export const getPriorityLabel = (priority: TaskPriority): string => {
  const found = TASK_PRIORITY_OPTIONS.find(p => p.value === priority)
  return found?.label || priority
}

// Funzione per stimare la durata basata sulla categoria
export const getEstimatedDurationByCategory = (
  category: string
): number => {
  switch (category) {
    case 'temperature':
      return 15
    case 'hygiene':
      return 45
    case 'maintenance':
      return 90
    case 'documentation':
      return 30
    case 'training':
      return 120
    case 'other':
    default:
      return 30
  }
}

// Task predefiniti comuni
export const getCommonTasksByCategory = (
  category: string
): Partial<any>[] => {
  switch (category) {
    case 'temperature':
      return [
        {
          name: 'Controllo temperatura frigoriferi',
          description:
            'Verifica e registrazione delle temperature dei frigoriferi',
          checklist: [
            'Verificare display temperatura',
            'Registrare su apposito registro',
            'Verificare allarmi',
          ],
          requiredTools: ['Termometro', 'Registro temperature'],
          estimatedDuration: 15,
        },
        {
          name: 'Controllo temperatura congelatori',
          description:
            'Verifica e registrazione delle temperature dei congelatori',
          checklist: [
            'Verificare display temperatura',
            'Registrare su apposito registro',
            'Verificare allarmi',
          ],
          requiredTools: ['Termometro', 'Registro temperature'],
          estimatedDuration: 15,
        },
      ]
    case 'hygiene':
      return [
        {
          name: 'Sanificazione superfici lavoro',
          description: 'Pulizia e sanificazione delle superfici di lavoro',
          checklist: [
            'Rimuovere residui',
            'Lavare con detergente',
            'Risciacquare',
            'Sanificare',
            'Asciugare',
          ],
          requiredTools: ['Detergente', 'Sanificante', 'Panni monouso'],
          estimatedDuration: 30,
        },
        {
          name: 'Lavaggio mani personale',
          description: 'Controllo procedura lavaggio mani del personale',
          checklist: [
            'Verificare disponibilità sapone',
            'Verificare disponibilità disinfettante',
            'Controllare asciugamani monouso',
          ],
          requiredTools: ['Sapone', 'Disinfettante', 'Asciugamani'],
          estimatedDuration: 10,
        },
      ]
    case 'maintenance':
      return [
        {
          name: 'Controllo funzionamento attrezzature',
          description: 'Verifica del corretto funzionamento delle attrezzature',
          checklist: [
            'Verificare accensione',
            'Controllare rumori anomali',
            'Verificare pulizia filtri',
          ],
          requiredTools: ['Checklist controlli', 'Registro manutenzioni'],
          estimatedDuration: 45,
        },
      ]
    case 'documentation':
      return [
        {
          name: 'Compilazione registri HACCP',
          description: 'Compilazione e controllo dei registri HACCP',
          checklist: [
            'Verificare completezza registrazioni',
            'Controllare firme operatori',
            'Archiviare documenti',
          ],
          requiredTools: ['Registri HACCP', 'Penna'],
          estimatedDuration: 20,
        },
      ]
    default:
      return []
  }
}
