# 📧 Supabase Edge Function - Email Invites

## Overview

Per **produzione**, è necessario configurare una **Supabase Edge Function** per inviare email di invito in modo sicuro e scalabile.

Attualmente, il sistema usa `createInviteToken()` che crea il token nel database ma **NON invia email automaticamente** perché:
- 🚫 SMTP built-in di Supabase è limitato a **2 email/ora**
- 🚫 Non è possibile inviare email custom da frontend (security risk)

---

## ⚠️ Stato Attuale (Development)

### Cosa Funziona ✅
- ✅ Creazione token invito in `invite_tokens` table
- ✅ Validazione token in AcceptInvitePage
- ✅ Accettazione invito e creazione account
- ✅ Pulsante "Send Invite" in StaffManagement
- ✅ Toast notifica "Invito inviato" (ma email NON inviata automaticamente)

### Limitazione 🚧
**Email NON vengono inviate automaticamente** - il token è creato ma l'email deve essere inviata manualmente o tramite Edge Function.

---

## 🚀 Soluzione: Edge Function (Produzione)

### Step 1: Creare Edge Function

```bash
# Nella cartella supabase/functions/
supabase functions new send-invite-email
```

### Step 2: Implementare Function

File: `supabase/functions/send-invite-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // Parse request
    const { email, token, company_name } = await req.json()

    // Validate inputs
    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      )
    }

    // Create Supabase client con Service Role Key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Invia email usando servizio esterno (SendGrid, Resend, ecc.)
    const inviteUrl = `${Deno.env.get('APP_URL')}/accept-invite?token=${token}`
    
    // Esempio con Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourcompany.com',
        to: email,
        subject: `Invito a unirsi a ${company_name}`,
        html: `
          <h1>Benvenuto!</h1>
          <p>Sei stato invitato a unirti a <strong>${company_name}</strong> sulla piattaforma HACCP Manager.</p>
          <p><a href="${inviteUrl}">Clicca qui per accettare l'invito</a></p>
          <p>Questo link scadrà tra 7 giorni.</p>
        `,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error(`Email sending failed: ${await emailResponse.text()}`)
    }

    return new Response(
      JSON.stringify({ success: true, email }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### Step 3: Deploy Edge Function

```bash
supabase functions deploy send-invite-email
```

### Step 4: Configurare Variabili Ambiente

Nel Supabase Dashboard → Edge Functions → Secrets:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
APP_URL=https://your-app.vercel.app
```

---

## 🔧 Integrazione nel Codice

### Aggiornare `src/services/auth/inviteService.ts`

Modificare la funzione `sendInviteEmail()`:

```typescript
export const sendInviteEmail = async (
  token: string,
  email: string,
  company_name: string
): Promise<void> => {
  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: { token, email, company_name }
    })

    if (error) throw error

    console.log('✅ Email inviata con successo:', data)
    toast.success(`Email di invito inviata a ${email}`)
  } catch (error) {
    console.error('❌ Errore invio email:', error)
    throw new Error('Impossibile inviare l\'email di invito')
  }
}
```

### Aggiornare StaffManagement

```typescript
const handleSendInvite = async (staffMember: StaffMember) => {
  // ... validazioni ...

  try {
    setSendingInviteFor(staffMember.id)
    
    // 1. Create invite token
    const invite = await createInviteToken({
      email: staffMember.email,
      company_id: companyId,
      role: staffMember.role as any,
      staff_id: staffMember.id,
      expires_in_days: 7,
    })

    // 2. Send email via Edge Function (PRODUZIONE)
    await sendInviteEmail(
      invite.token,
      staffMember.email,
      currentCompany.name // Passa company name
    )

    toast.success(`Invito inviato a ${staffMember.name}`)
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 📊 Servizi Email Consigliati

### 1. **Resend** (Consigliato)
- ✅ Free tier: 100 email/giorno
- ✅ Semplice da integrare
- ✅ Ottimo per development e produzione
- 🔗 https://resend.com

### 2. **SendGrid**
- ✅ Free tier: 100 email/giorno
- ✅ Enterprise-ready
- 🔗 https://sendgrid.com

### 3. **Mailgun**
- ✅ Free tier: 5000 email/mese
- ✅ Buona deliverability
- 🔗 https://mailgun.com

---

## 🧪 Testing

### Development (Manual)
1. Crea invito in StaffManagement
2. Copia token da database (`invite_tokens` table)
3. Apri manualmente: `http://localhost:5173/accept-invite?token=YOUR_TOKEN`

### Production (Automated)
1. Edge Function invia email automaticamente
2. Utente clicca link nell'email
3. AcceptInvitePage valida token e crea account

---

## 📝 Checklist Deployment

- [ ] Creare Edge Function `send-invite-email`
- [ ] Configurare Resend API key
- [ ] Testare invio email in staging
- [ ] Aggiornare `sendInviteEmail()` nel codice
- [ ] Deploy Edge Function su Supabase
- [ ] Configurare secrets (RESEND_API_KEY, APP_URL)
- [ ] Test end-to-end in produzione

---

## 🎯 Priorità

**Per ora** (Development): ✅ OK - inviti manuali funzionano
**Per produzione**: 🚧 REQUIRED - implementare Edge Function

---

**Last Updated:** 2025-01-09
**Status:** Development-ready, Production pending Edge Function

