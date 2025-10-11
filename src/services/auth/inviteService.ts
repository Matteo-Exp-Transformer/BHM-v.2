/**
 * 📧 Invite Service - Sistema Inviti Supabase Auth
 * 
 * Gestisce il flusso completo degli inviti:
 * 1. Creazione token invito
 * 2. Invio email tramite Supabase
 * 3. Validazione token
 * 4. Accettazione invito e creazione account
 * 
 * @author BHM v2 Team
 * @date 2025-01-09
 */

import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

// =============================================
// TYPES & INTERFACES
// =============================================

export type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

export interface InviteToken {
  id: string
  token: string
  email: string
  company_id: string
  role: StaffRole
  staff_id: string | null
  invited_by: string | null
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface CreateInviteInput {
  email: string
  company_id: string
  role: StaffRole
  staff_id?: string
  expires_in_days?: number  // Default: 7 giorni
}

export interface AcceptInviteInput {
  token: string
  password: string
  first_name?: string
  last_name?: string
}

export interface InviteValidation {
  isValid: boolean
  invite?: InviteToken
  error?: string
}

// =============================================
// INVITE TOKEN MANAGEMENT
// =============================================

/**
 * Crea un nuovo token di invito
 * 
 * @param input - Dati invito (email, company_id, role, ecc.)
 * @returns Token creato
 * 
 * @example
 * const invite = await createInviteToken({
 *   email: 'mario@example.com',
 *   company_id: 'uuid-company',
 *   role: 'dipendente',
 *   staff_id: 'uuid-staff'
 * })
 */
export const createInviteToken = async (
  input: CreateInviteInput
): Promise<InviteToken> => {
  try {
    // 1. Verifica che l'utente corrente sia admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non autenticato')
    }

    // 2. Verifica permessi admin
    const { data: isAdminData, error: adminError } = await supabase.rpc(
      'is_admin',
      { p_company_id: input.company_id }
    )

    if (adminError || !isAdminData) {
      throw new Error('Solo gli admin possono inviare inviti')
    }

    // 3. Genera token univoco
    const token = crypto.randomUUID()

    // 4. Calcola data scadenza
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (input.expires_in_days || 7))

    // 5. Crea record invite_tokens
    const { data: invite, error } = await supabase
      .from('invite_tokens')
      .insert({
        token,
        email: input.email,
        company_id: input.company_id,
        role: input.role,
        staff_id: input.staff_id || null,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Errore creazione invite token:', error)
      throw new Error(`Impossibile creare invito: ${error.message}`)
    }

    console.log('✅ Invite token creato:', invite.id)
    return invite
  } catch (error: any) {
    console.error('❌ Errore createInviteToken:', error)
    throw error
  }
}

/**
 * Invia email di invito chiamando Edge Function Supabase
 * 
 * @param invite - Token di invito creato
 * @returns Success status
 * 
 * @example
 * await sendInviteEmail(invite)
 */
export const sendInviteEmail = async (invite: InviteToken): Promise<boolean> => {
  try {
    console.log('📧 Tentativo invio email a:', invite.email)
    
    // Genera link invito
    const inviteLink = `${window.location.origin}/accept-invite?token=${invite.token}`
    
    // Prova a usare Supabase Auth admin (richiede proper setup)
    // NOTA: Questa chiamata potrebbe fallire se non hai configurato SMTP custom
    const { error } = await supabase.auth.admin.inviteUserByEmail(invite.email, {
      data: {
        invite_link: inviteLink,
        role: invite.role,
        company_name: 'BHM App',
      },
      redirectTo: inviteLink,
    })

    if (error) {
      console.warn('⚠️ Invio email Supabase fallito:', error.message)
      console.log('💡 Link invito manuale:', inviteLink)
      // Non bloccare - il token è creato, email va inviata manualmente
      return false
    }

    console.log('✅ Email inviata con successo tramite Supabase!')
    return true
  } catch (error: any) {
    console.error('❌ Errore sendInviteEmail:', error.message)
    console.log('💡 Link invito disponibile nel database')
    return false
  }
}

/**
 * Valida un token di invito
 * 
 * @param token - Token UUID da validare
 * @returns Risultato validazione con dettagli invito
 * 
 * @example
 * const { isValid, invite } = await validateInviteToken(token)
 */
export const validateInviteToken = async (
  token: string
): Promise<InviteValidation> => {
  try {
    // 1. Query token
    const { data: invite, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invite) {
      return {
        isValid: false,
        error: 'Token non trovato'
      }
    }

    // 2. Verifica non già usato
    if (invite.used_at) {
      return {
        isValid: false,
        invite,
        error: 'Questo invito è già stato utilizzato'
      }
    }

    // 3. Verifica non scaduto
    const now = new Date()
    const expiresAt = new Date(invite.expires_at)
    
    if (expiresAt < now) {
      return {
        isValid: false,
        invite,
        error: 'Questo invito è scaduto'
      }
    }

    // 4. Token valido
    return {
      isValid: true,
      invite
    }
  } catch (error: any) {
    console.error('❌ Errore validateInviteToken:', error)
    return {
      isValid: false,
      error: 'Errore durante la validazione'
    }
  }
}

/**
 * Accetta un invito e crea account utente
 * 
 * @param input - Dati accettazione (token, password, nome)
 * @returns Utente creato
 * 
 * @example
 * const user = await acceptInvite({
 *   token: 'uuid-token',
 *   password: 'SecurePass123!',
 *   first_name: 'Mario',
 *   last_name: 'Rossi'
 * })
 */
export const acceptInvite = async (
  input: AcceptInviteInput
): Promise<any> => {
  try {
    // 1. Valida token
    const validation = await validateInviteToken(input.token)
    
    if (!validation.isValid || !validation.invite) {
      throw new Error(validation.error || 'Token non valido')
    }

    const invite = validation.invite

    // 2. Crea account Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invite.email,
      password: input.password,
      options: {
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          full_name: input.first_name && input.last_name 
            ? `${input.first_name} ${input.last_name}` 
            : invite.email,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (signUpError) {
      console.error('❌ Errore signup:', signUpError)
      throw new Error(`Impossibile creare account: ${signUpError.message}`)
    }

    if (!authData.user) {
      throw new Error('Utente non creato')
    }

    console.log('✅ Account Supabase creato:', authData.user.id)

    // 3. Crea record in company_members (usa upsert per prevenire duplicati)
    const { error: memberError } = await supabase
      .from('company_members')
      .upsert({
        user_id: authData.user.id,
        company_id: invite.company_id,
        role: invite.role,
        staff_id: invite.staff_id,
        is_active: true,
      }, {
        onConflict: 'user_id,company_id'
      })

    if (memberError) {
      console.error('❌ Errore creazione company_member:', memberError)
      // TODO: Rollback - eliminare utente auth appena creato?
      throw new Error(`Impossibile associare all'azienda: ${memberError.message}`)
    }

    console.log('✅ Company member creato')

    // 4. Crea user_session
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: authData.user.id,
        active_company_id: invite.company_id,
      })

    if (sessionError) {
      console.warn('⚠️ Errore creazione sessione (non critico):', sessionError)
      // Non blocchiamo il flusso - la sessione verrà creata al primo login
    }

    // 5. Marca invito come usato
    const { error: updateError } = await supabase
      .from('invite_tokens')
      .update({ 
        used_at: new Date().toISOString() 
      })
      .eq('id', invite.id)

    if (updateError) {
      console.warn('⚠️ Errore aggiornamento invite (non critico):', updateError)
    }

    console.log('✅ Invito accettato con successo')
    
    toast.success('Account creato con successo! Verifica la tua email.')
    
    return authData.user
  } catch (error: any) {
    console.error('❌ Errore acceptInvite:', error)
    toast.error(error.message || 'Errore durante l\'accettazione dell\'invito')
    throw error
  }
}

// =============================================
// INVITE MANAGEMENT UTILITIES
// =============================================

/**
 * Ottiene tutti gli inviti di un'azienda
 * 
 * @param companyId - ID azienda
 * @returns Lista inviti
 */
export const getCompanyInvites = async (
  companyId: string
): Promise<InviteToken[]> => {
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Errore caricamento inviti:', error)
    throw error
  }

  return data || []
}

/**
 * Ottiene inviti pending (non usati e non scaduti)
 * 
 * @param companyId - ID azienda
 * @returns Lista inviti pending
 */
export const getPendingInvites = async (
  companyId: string
): Promise<InviteToken[]> => {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('company_id', companyId)
    .is('used_at', null)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Errore caricamento inviti pending:', error)
    throw error
  }

  return data || []
}

/**
 * Cancella (elimina) un invito
 * 
 * @param inviteId - ID invito da cancellare
 * @returns Success status
 */
export const cancelInvite = async (inviteId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('invite_tokens')
    .delete()
    .eq('id', inviteId)

  if (error) {
    console.error('Errore cancellazione invito:', error)
    throw error
  }

  toast.success('Invito cancellato')
  return true
}

/**
 * Rigenera invito scaduto
 * 
 * @param oldInviteId - ID invito scaduto
 * @param expiresInDays - Nuova scadenza (default: 7 giorni)
 * @returns Nuovo invito
 */
export const regenerateInvite = async (
  oldInviteId: string,
  expiresInDays = 7
): Promise<InviteToken> => {
  // 1. Ottieni invito originale
  const { data: oldInvite, error: fetchError } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('id', oldInviteId)
    .single()

  if (fetchError || !oldInvite) {
    throw new Error('Invito originale non trovato')
  }

  // 2. Elimina vecchio invito
  await cancelInvite(oldInviteId)

  // 3. Crea nuovo invito con stessi dati
  const newInvite = await createInviteToken({
    email: oldInvite.email,
    company_id: oldInvite.company_id,
    role: oldInvite.role,
    staff_id: oldInvite.staff_id,
    expires_in_days: expiresInDays
  })

  toast.success('Invito rigenerato con successo')
  return newInvite
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Genera URL invito completo
 * 
 * @param token - Token UUID
 * @returns URL completo per accettare invito
 */
export const generateInviteURL = (token: string): string => {
  const baseURL = window.location.origin
  return `${baseURL}/accept-invite?token=${token}`
}

/**
 * Verifica se email è già registrata
 * 
 * @param email - Email da verificare
 * @returns True se email già esistente
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  // Verifica in auth.users (tramite admin API)
  // Nota: Questa funzione richiede Service Role Key
  // Per ora verifichiamo solo in company_members
  
  const { data, error } = await supabase
    .from('company_members')
    .select('id')
    .eq('user_id', email)  // TODO: Query corretta quando RLS attivo
    .limit(1)

  return (data?.length || 0) > 0
}

/**
 * Ottiene statistiche inviti per un'azienda
 * 
 * @param companyId - ID azienda
 * @returns Statistiche inviti
 */
export const getInviteStats = async (companyId: string) => {
  const allInvites = await getCompanyInvites(companyId)
  const now = new Date()

  return {
    total: allInvites.length,
    pending: allInvites.filter(
      i => !i.used_at && new Date(i.expires_at) > now
    ).length,
    accepted: allInvites.filter(i => i.used_at).length,
    expired: allInvites.filter(
      i => !i.used_at && new Date(i.expires_at) <= now
    ).length,
  }
}

// =============================================
// EXPORTS
// =============================================

export default {
  createInviteToken,
  sendInviteEmail,
  validateInviteToken,
  acceptInvite,
  getCompanyInvites,
  getPendingInvites,
  cancelInvite,
  regenerateInvite,
  generateInviteURL,
  checkEmailExists,
  getInviteStats,
}

