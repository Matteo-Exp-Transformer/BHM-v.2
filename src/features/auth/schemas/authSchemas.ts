/**
 * 🔐 Auth Schemas - Zod Validation
 * 
 * Schemi di validazione per tutti i form di autenticazione
 * Allineati con i contratti API di Agente 2
 * 
 * @date 2025-10-20
 * @author Agente 3 - Experience Designer
 */

import { z } from 'zod'

// =============================================
// BASE SCHEMAS
// =============================================

// Email validation (RFC 5322)
export const emailSchema = z
  .string()
  .min(1, 'Email è obbligatoria')
  .email('Formato email non valido')
  .max(254, 'Email troppo lunga')

// Password policy: solo lettere, min 12 caratteri
export const passwordSchema = z
  .string()
  .min(12, 'Password deve essere di almeno 12 caratteri')
  .max(128, 'Password troppo lunga')
  .regex(/^[A-Za-z]+$/, 'Password deve contenere solo lettere (maiuscole e minuscole)')

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Nome è obbligatorio')
  .max(50, 'Nome troppo lungo')
  .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome può contenere solo lettere e spazi')

// =============================================
// FORM SCHEMAS
// =============================================

// Login Form
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false)
})

export type LoginFormData = z.infer<typeof loginFormSchema>

// Recovery Request Form
export const recoveryRequestSchema = z.object({
  email: emailSchema
})

export type RecoveryRequestData = z.infer<typeof recoveryRequestSchema>

// Recovery Confirm Form
export const recoveryConfirmSchema = z.object({
  token: z.string().min(1, 'Token è obbligatorio'),
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword']
})

export type RecoveryConfirmData = z.infer<typeof recoveryConfirmSchema>

// Invite Accept Form
export const inviteAcceptSchema = z.object({
  token: z.string().min(1, 'Token è obbligatorio'),
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword']
})

export type InviteAcceptData = z.infer<typeof inviteAcceptSchema>

// Invite Create Form (Admin)
export const inviteCreateSchema = z.object({
  email: emailSchema,
  roleId: z.string().min(1, 'Ruolo è obbligatorio'),
  tenantId: z.string().min(1, 'Tenant è obbligatorio')
})

export type InviteCreateData = z.infer<typeof inviteCreateSchema>

// =============================================
// API RESPONSE SCHEMAS
// =============================================

// Generic API Response
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    devMessage: z.string().optional()
  }).optional()
})

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    devMessage?: string
  }
}

// User Session Data
export const sessionDataSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.string(),
    tenantId: z.string()
  }),
  session: z.object({
    id: z.string(),
    expiresAt: z.string(),
    lastActivity: z.string()
  })
})

export type SessionData = z.infer<typeof sessionDataSchema>

// Invite Verification Data
export const inviteVerificationSchema = z.object({
  valid: z.boolean(),
  email: z.string().optional(),
  role: z.string().optional(),
  tenant: z.string().optional(),
  expiresAt: z.string().optional()
})

export type InviteVerification = z.infer<typeof inviteVerificationSchema>

// =============================================
// ERROR CODES (da API Spec)
// =============================================

export const AUTH_ERROR_CODES = {
  AUTH_FAILED: 'AUTH_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  CSRF_REQUIRED: 'CSRF_REQUIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVITE_INVALID: 'INVITE_INVALID',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  PASSWORD_POLICY_VIOLATION: 'PASSWORD_POLICY_VIOLATION',
  SESSION_EXPIRED: 'SESSION_EXPIRED'
} as const

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES]

// =============================================
// VALIDATION HELPERS
// =============================================

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Errore di validazione' } }
  }
}

// =============================================
// FORM FIELD HELPERS
// =============================================

export const getFieldError = (errors: Record<string, string> | undefined, field: string): string | undefined => {
  return errors?.[field]
}

export const hasFieldError = (errors: Record<string, string> | undefined, field: string): boolean => {
  return Boolean(errors?.[field])
}
