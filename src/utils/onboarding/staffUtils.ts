import { z } from 'zod'

import { HACCP_CERT_REQUIRED_CATEGORIES, STAFF_ROLES } from '@/utils/haccpRules'

import type {
  StaffMember,
  StaffRole,
  StaffStepFormData,
  StaffValidationErrors,
} from '@/types/onboarding'

const staffSchema = z.object({
  name: z.string().min(2, 'Il nome è obbligatorio'),
  surname: z.string().min(2, 'Il cognome è obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9+\s-]*$/, 'Numero di telefono non valido')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'responsabile', 'dipendente', 'collaboratore']),
  categories: z.array(z.string()).min(1, 'Seleziona almeno una categoria'),
  departmentAssignments: z.array(z.string()),
  haccpExpiry: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const normalizeStaffMember = (
  member: StaffMember
): StaffStepFormData => ({
  name: member.name,
  surname: member.surname,
  email: member.email || '',
  phone: member.phone || '',
  role: member.role,
  categories: member.categories.length ? member.categories : ['Altro'],
  departmentAssignments: member.department_assignments || [],
  haccpExpiry: member.haccpExpiry || '',
  notes: member.notes || '',
})

export const canMemberSkipHaccp = (categories: string[]) =>
  categories.every(
    category => !HACCP_CERT_REQUIRED_CATEGORIES.includes(category)
  )

export const validateStaffMember = (
  member: StaffMember
): { success: boolean; fieldErrors?: StaffValidationErrors } => {
  const result = staffSchema.safeParse({
    name: member.name,
    surname: member.surname,
    email: member.email || '',
    phone: member.phone || '',
    role: member.role,
    categories: member.categories,
    departmentAssignments: member.department_assignments || [],
    haccpExpiry: member.haccpExpiry || '',
    notes: member.notes || '',
  })

  if (!result.success) {
    const fieldErrors: StaffValidationErrors = {}
    result.error.issues.forEach(issue => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as keyof StaffValidationErrors] =
          issue.message
      }
    })
    return { success: false, fieldErrors }
  }

  if (
    !canMemberSkipHaccp(member.categories) &&
    (!member.haccpExpiry || member.haccpExpiry.trim().length === 0)
  ) {
    return {
      success: false,
      fieldErrors: {
        haccpExpiry:
          'La certificazione HACCP è obbligatoria per questa categoria',
      },
    }
  }

  return { success: true }
}

export const buildStaffMember = (
  form: StaffStepFormData,
  editingId: string | null
): {
  member?: StaffMember
  validation: { success: boolean; fieldErrors?: StaffValidationErrors }
} => {
  const parsed = staffSchema.safeParse(form)

  const fieldErrors: StaffValidationErrors = {}

  if (!parsed.success) {
    parsed.error.issues.forEach(issue => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as keyof StaffValidationErrors] =
          issue.message
      }
    })
    return { validation: { success: false, fieldErrors } }
  }

  if (
    !canMemberSkipHaccp(form.categories) &&
    (!form.haccpExpiry || form.haccpExpiry.trim().length === 0)
  ) {
    fieldErrors.haccpExpiry =
      'Inserisci la data di scadenza della certificazione HACCP'
    return { validation: { success: false, fieldErrors } }
  }

  const roleExists = STAFF_ROLES.some(role => role.value === form.role)
  const role: StaffRole = roleExists ? (form.role as StaffRole) : 'dipendente'

  const member: StaffMember = {
    id:
      editingId ||
      `staff_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    name: form.name.trim(),
    surname: form.surname.trim(),
    fullName: `${form.name.trim()} ${form.surname.trim()}`,
    role,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    categories: Array.from(new Set(form.categories)),
    department_assignments: form.departmentAssignments,
    haccpExpiry: form.haccpExpiry || undefined,
    notes: form.notes || undefined,
  }

  const validation = validateStaffMember(member)

  if (!validation.success) {
    return { validation }
  }

  return { member, validation: { success: true } }
}

export const getHaccpExpiryStatus = (date?: string) => {
  if (!date) {
    return {
      level: 'missing' as const,
      message: 'Certificazione HACCP non registrata',
    }
  }

  const expiryDate = new Date(date)
  const today = new Date()

  if (Number.isNaN(expiryDate.getTime())) {
    return {
      level: 'missing' as const,
      message: 'Data certificazione non valida',
    }
  }

  const diff = expiryDate.getTime() - today.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) {
    return {
      level: 'expired' as const,
      message: `Certificato scaduto da ${Math.abs(days)} giorni`,
    }
  }

  if (days <= 30) {
    return {
      level: 'warning' as const,
      message: `Scade tra ${days} giorni`,
    }
  }

  return {
    level: 'ok' as const,
    message: `Valido fino al ${expiryDate.toLocaleDateString('it-IT')}`,
  }
}
