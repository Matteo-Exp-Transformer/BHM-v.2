/**
 * 🔐 Auth Schemas - Zod Validation Schemas
 * 
 * Schemi Zod per validazione client-side dei form di autenticazione
 * Compatibili con i tipi TypeScript definiti in src/types/auth.ts
 * 
 * @date 2025-01-27
 * @author Agente 5 - Frontend Developer
 */

import { z } from 'zod'
import { PASSWORD_POLICY } from '@/types/auth'

// =============================================
// BASE SCHEMAS
// =============================================

const emailSchema = z
  .string()
  .min(1, 'Email è obbligatoria')
  .email('Formato email non valido')
  .max(255, 'Email troppo lunga')

const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, `Password deve essere di almeno ${PASSWORD_POLICY.minLength} caratteri`)
  .max(PASSWORD_POLICY.maxLength, `Password deve essere di massimo ${PASSWORD_POLICY.maxLength} caratteri`)
  .regex(PASSWORD_POLICY.pattern, 'Password deve contenere solo lettere, numeri e caratteri speciali')

const nameSchema = z
  .string()
  .min(1, 'Nome è obbligatorio')
  .max(50, 'Nome troppo lungo')
  .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Nome può contenere solo lettere, spazi, apostrofi e trattini')

const csrfTokenSchema = z
  .string()
  .min(1, 'Token CSRF è obbligatorio')
  .max(255, 'Token CSRF non valido')

// =============================================
// FORM SCHEMAS
// =============================================

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false),
  csrf_token: csrfTokenSchema
})

export const recoveryRequestSchema = z.object({
  email: emailSchema,
  csrf_token: csrfTokenSchema
})

export const recoveryConfirmSchema = z.object({
  token: z.string().min(1, 'Token di recupero è obbligatorio'),
  password: passwordSchema,
  csrf_token: csrfTokenSchema
})

export const inviteAcceptSchema = z.object({
  token: z.string().min(1, 'Token invito è obbligatorio'),
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
  csrf_token: csrfTokenSchema
})

export const inviteCreateSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'responsabile', 'dipendente', 'collaboratore'], {
    errorMap: () => ({ message: 'Ruolo non valido' })
  }),
  department_id: z.string().uuid().optional(),
  csrf_token: csrfTokenSchema
})

// =============================================
// API REQUEST SCHEMAS
// =============================================

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  csrf_token: csrfTokenSchema
})

export const recoveryRequestRequestSchema = z.object({
  email: emailSchema,
  csrf_token: csrfTokenSchema
})

export const recoveryConfirmRequestSchema = z.object({
  token: z.string().min(1, 'Token è obbligatorio'),
  password: passwordSchema
})

export const inviteAcceptRequestSchema = z.object({
  token: z.string().min(1, 'Token è obbligatorio'),
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema
})

// =============================================
// API RESPONSE SCHEMAS
// =============================================

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: z.string(),
  tenant_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login_at: z.string().datetime().optional(),
  is_active: z.boolean()
})

export const sessionDataSchema = z.object({
  token: z.string(),
  csrf_token: z.string(),
  expires_at: z.string().datetime(),
  refresh_token: z.string().optional(),
  user: userSchema
})

export const loginResponseSchema = z.object({
  success: z.literal(true),
  user: userSchema,
  session: sessionDataSchema
})

export const csrfTokenResponseSchema = z.object({
  csrf_token: z.string(),
  expires_at: z.string().datetime()
})

export const inviteVerificationSchema = z.object({
  valid: z.boolean(),
  invite: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    department_id: z.string().uuid().optional(),
    expires_at: z.string().datetime(),
    created_by: z.string().uuid()
  }).nullable()
})

// =============================================
// ERROR SCHEMAS
// =============================================

export const authErrorCodeSchema = z.enum([
  'AUTH_FAILED',
  'RATE_LIMITED',
  'CSRF_REQUIRED',
  'CSRF_INVALID',
  'TOKEN_INVALID',
  'TOKEN_EXPIRED',
  'INVITE_INVALID',
  'INVITE_EXPIRED',
  'PASSWORD_POLICY_VIOLATION',
  'SESSION_EXPIRED',
  'ACCOUNT_LOCKED',
  'VALIDATION_ERROR',
  'NETWORK_ERROR',
  'UNKNOWN_ERROR'
])

export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string()
})

export const authErrorDetailsSchema = z.object({
  retry_after: z.number().optional(),
  locked_until: z.string().datetime().optional(),
  field_errors: z.array(validationErrorSchema).optional()
})

export const authErrorSchema = z.object({
  code: authErrorCodeSchema,
  message: z.string(),
  devMessage: z.string().optional(),
  details: authErrorDetailsSchema.optional()
})

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    z.object({
      success: z.literal(true),
      data: dataSchema
    }),
    z.object({
      success: z.literal(false),
      error: authErrorSchema
    })
  ])

// =============================================
// RATE LIMITING SCHEMAS
// =============================================

export const rateLimitInfoSchema = z.object({
  remaining: z.number().min(0),
  reset: z.number().min(0),
  retryAfter: z.number().min(0).optional()
})

// =============================================
// TYPE EXPORTS (inferred from schemas)
// =============================================

export type LoginFormData = z.infer<typeof loginFormSchema>
export type RecoveryRequestData = z.infer<typeof recoveryRequestSchema>
export type RecoveryConfirmData = z.infer<typeof recoveryConfirmSchema>
export type InviteAcceptData = z.infer<typeof inviteAcceptSchema>
export type InviteCreateData = z.infer<typeof inviteCreateSchema>

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type RecoveryRequestRequest = z.infer<typeof recoveryRequestRequestSchema>
export type RecoveryConfirmRequest = z.infer<typeof recoveryConfirmRequestSchema>
export type InviteAcceptRequest = z.infer<typeof inviteAcceptRequestSchema>

export type AuthUser = z.infer<typeof userSchema>
export type SessionData = z.infer<typeof sessionDataSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type CsrfTokenResponse = z.infer<typeof csrfTokenResponseSchema>
export type InviteVerification = z.infer<typeof inviteVerificationSchema>

export type AuthErrorCode = z.infer<typeof authErrorCodeSchema>
export type ValidationError = z.infer<typeof validationErrorSchema>
export type AuthError = z.infer<typeof authErrorSchema>
export type RateLimitInfo = z.infer<typeof rateLimitInfoSchema>

export type ApiResponse<T = any> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>

// =============================================
// VALIDATION UTILITIES
// =============================================

export const validateForm = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export const getFieldError = (errors: z.ZodError, field: string): string | null => {
  const fieldError = errors.errors.find(err => err.path.includes(field))
  return fieldError ? fieldError.message : null
}

export const getAllFieldErrors = (errors: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {}
  errors.errors.forEach(err => {
    const field = err.path.join('.')
    fieldErrors[field] = err.message
  })
  return fieldErrors
}

// =============================================
// PASSWORD VALIDATION UTILITIES
// =============================================

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password deve essere di almeno ${PASSWORD_POLICY.minLength} caratteri`)
  }
  
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password deve essere di massimo ${PASSWORD_POLICY.maxLength} caratteri`)
  }
  
  if (!PASSWORD_POLICY.pattern.test(password)) {
    errors.push('Password deve contenere solo lettere, numeri e caratteri speciali')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getPasswordStrength = (password: string): {
  score: number
  label: 'weak' | 'medium' | 'strong'
  suggestions: string[]
} => {
  let score = 0
  const suggestions: string[] = []
  
  if (password.length >= PASSWORD_POLICY.minLength) score += 1
  else suggestions.push(`Aggiungi almeno ${PASSWORD_POLICY.minLength - password.length} caratteri`)
  
  if (password.length >= 16) score += 1
  else suggestions.push('Usa almeno 16 caratteri per maggiore sicurezza')
  
  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push('Aggiungi lettere maiuscole')
  
  if (/[a-z]/.test(password)) score += 1
  else suggestions.push('Aggiungi lettere minuscole')
  
  let label: 'weak' | 'medium' | 'strong'
  if (score <= 2) label = 'weak'
  else if (score <= 3) label = 'medium'
  else label = 'strong'
  
  return { score, label, suggestions }
}
