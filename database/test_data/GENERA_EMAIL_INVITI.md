# 📧 GENERAZIONE EMAIL INVITI

## 🎯 OPZIONI DISPONIBILI

### ✅ OPZIONE A: Recupero Manuale (per Testing)

**Più semplice per 2-3 utenti!**

#### Query Rapida

```sql
SELECT 
  email,
  role,
  CONCAT('http://localhost:5173/accept-invite?token=', token) as link,
  expires_at::date as scade_il
FROM public.invite_tokens
WHERE used_at IS NULL
ORDER BY role DESC, email;
```

**Output**:
```
matti169cava@libero.it | responsabile | http://localhost:5173/... | 2025-10-19
0cavuz0@gmail.com | dipendente | http://localhost:5173/... | 2025-10-19
```

**Poi**: 
- Copia i link
- Invia via WhatsApp, Telegram, Email manuale

---

### 🔧 OPZIONE B: SMTP Supabase (per Produzione)

**Configurazione Email Automatiche**

#### Step 1: Configura SMTP

1. **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**

2. **Abilita Custom SMTP**:

   **Gmail (esempio)**:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tua-email@gmail.com
   Password: [App Password]  ← Genera da Google Account
   Sender Email: tua-email@gmail.com
   Sender Name: Al Ritrovo SRL
   ```

   **Come ottenere App Password Gmail**:
   - Vai su https://myaccount.google.com/security
   - Abilita "2-Step Verification"
   - Vai su "App passwords"
   - Genera password per "Mail"
   - Copia la password (es. `abcd efgh ijkl mnop`)

   **Altri Provider**:
   - **Outlook**: smtp-mail.outlook.com:587
   - **Yahoo**: smtp.mail.yahoo.com:587
   - **SendGrid**: smtp.sendgrid.net:587

3. **Salva e Testa**

#### Step 2: Configura Template Email

1. **Auth** → **Email Templates** → **"Invite user"**

2. **Template Personalizzato**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">
      Business HACCP Manager
    </h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">
      Sei stato invitato! 🎉
    </h2>
    
    <p style="color: #4b5563; font-size: 16px;">
      Ciao,<br><br>
      Sei stato invitato a far parte di <strong style="color: #667eea;">Al Ritrovo SRL</strong> 
      come <strong>{{ .Data.role }}</strong>.
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        📧 Email: <strong>{{ .Email }}</strong><br>
        👤 Ruolo: <strong>{{ .Data.role }}</strong>
      </p>
    </div>
    
    <p style="color: #4b5563; font-size: 16px;">
      Clicca sul pulsante qui sotto per accettare l'invito e creare il tuo account:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .Data.invite_link }}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-size: 16px; 
                font-weight: bold;
                display: inline-block;">
        🎟️ Accetta Invito
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Oppure copia questo link nel tuo browser:<br>
      <code style="background: #f3f4f6; padding: 8px; display: block; margin-top: 8px; word-break: break-all; border-radius: 4px;">
        {{ .Data.invite_link }}
      </code>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      ⚠️ Questo invito scadrà tra 7 giorni.<br>
      Se non hai richiesto questo invito, ignora questa email.
    </p>
  </div>
  
</body>
</html>
```

3. **Salva**

✅ Ora quando il codice chiama `sendInviteEmail()`, l'email verrà inviata automaticamente!

---

### 🚀 OPZIONE C: Edge Function (già pronta!)

Hai già la function in `supabase/functions/send-invite-email/index.ts`!

#### Deploy Edge Function

```bash
# 1. Installa Supabase CLI (se non hai)
npm install -g supabase

# 2. Login
supabase login

# 3. Link al tuo progetto
supabase link --project-ref [YOUR_PROJECT_ID]

# 4. Deploy function
supabase functions deploy send-invite-email
```

**Trova PROJECT_ID**:
- Supabase Dashboard → Settings → General → Reference ID

#### Usa Edge Function nel Codice

Modifica `src/services/auth/inviteService.ts`:

```typescript
export const sendInviteEmail = async (invite: InviteToken): Promise<boolean> => {
  try {
    console.log('📧 Invio email tramite Edge Function...')
    
    // Chiama edge function
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: { inviteToken: invite }
    })

    if (error) {
      console.warn('⚠️ Edge Function fallita:', error.message)
      console.log('💡 Link manuale:', generateInviteURL(invite.token))
      return false
    }

    console.log('✅ Email inviata con successo!')
    return true
  } catch (error: any) {
    console.error('❌ Errore:', error.message)
    return false
  }
}
```

---

## 🎯 RACCOMANDAZIONE PER ORA

### Per il Testing di Oggi:

**USA OPZIONE A (Recupero Manuale)**

**Perché**:
- ✅ Zero configurazione
- ✅ Funziona subito
- ✅ Perfetto per 2-4 utenti
- ✅ Vedi esattamente i link

**Come**:

1. **Dopo onboarding Paolo**, esegui:
   ```sql
   SELECT 
     email,
     CONCAT('http://localhost:5173/accept-invite?token=', token) as link
   FROM invite_tokens
   WHERE company_id IS NOT NULL AND used_at IS NULL;
   ```

2. **Copia i 4 link** (Matteo, Elena, Fabrizio, Eddy)

3. **Invia manualmente**:
   - WhatsApp: "Ciao Matteo, ecco il link: http://..."
   - Email: Copia/incolla il link
   - SMS: Invia il link

---

### Per Produzione (Futuro):

**USA OPZIONE B (SMTP Supabase)** con template personalizzato

---

## 📝 SCRIPT HELPER - Copia Link Formattati

Questa query genera output già formattato per WhatsApp/Email:

```sql
SELECT 
  CONCAT(
    '📧 Ciao ', 
    SPLIT_PART(email, '@', 1), 
    '!',
    E'\n\nSei stato invitato a far parte di Al Ritrovo SRL come ', 
    UPPER(role),
    '.',
    E'\n\nClicca qui per accettare:',
    E'\n', 
    'http://localhost:5173/accept-invite?token=', 
    token,
    E'\n\n⚠️ Link valido fino al ', 
    expires_at::date,
    E'\n'
  ) as messaggio_da_inviare
FROM public.invite_tokens
WHERE company_id IS NOT NULL
  AND used_at IS NULL
ORDER BY email;
```

**Output**:
```
📧 Ciao matti169cava!

Sei stato invitato a far parte di Al Ritrovo SRL come RESPONSABILE.

Clicca qui per accettare:
http://localhost:5173/accept-invite?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

⚠️ Link valido fino al 2025-10-19
```

**Copia e incolla direttamente su WhatsApp!** 📱

---

## ⚡ QUICK START

**Per il tuo test di oggi**:

1. ✅ Hai già fatto reset
2. ⏳ Paolo accetta invito e completa onboarding
3. ⏳ Esegui questa query:
   ```sql
   SELECT CONCAT('http://localhost:5173/accept-invite?token=', token) 
   FROM invite_tokens WHERE email = 'matti169cava@libero.it';
   ```
4. ⏳ Copia link e invia a Matteo (te stesso)
5. ⏳ Apri link in incognito → Crea account Matteo
6. ⏳ Ripeti per Elena

**Fatto!** Nessuna configurazione email necessaria! 🎉

---

**Quale opzione preferisci? Per il test di oggi consiglio l'Opzione A (manuale)!** 😊
