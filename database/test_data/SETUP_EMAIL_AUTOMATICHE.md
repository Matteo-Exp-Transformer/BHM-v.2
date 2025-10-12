# 📧 SETUP EMAIL AUTOMATICHE - Guida Completa

**Prerequisito**: Hai già configurato SMTP in Supabase ✅

---

## 🚀 DEPLOY EDGE FUNCTION (5 minuti)

### Step 1: Installa Supabase CLI

**Windows (PowerShell)**:
```bash
npm install -g supabase
```

Verifica installazione:
```bash
supabase --version
```

---

### Step 2: Login a Supabase

```bash
supabase login
```

**Cosa succede**:
- Si apre il browser
- Fai login con il tuo account Supabase
- CLI ottiene il token di autenticazione

✅ Vedrai: "Logged in successfully"

---

### Step 3: Trova il tuo Project ID

1. Vai su **Supabase Dashboard**
2. **Settings** → **General** → **Reference ID**
3. Copia il Project ID (es. `abcdefghijklmnopqrst`)

**📋 SALVA IL PROJECT ID**

---

### Step 4: Link il Progetto

```bash
supabase link --project-ref abcdefghijklmnopqrst
```

Sostituisci `abcdefghijklmnopqrst` con il tuo Project ID.

**Output**:
```
✓ Linked to project: abcdefghijklmnopqrst
```

---

### Step 5: Deploy Edge Function

```bash
supabase functions deploy send-invite-email
```

**Output atteso**:
```
Deploying Function...
  send-invite-email
✓ Deployed Function send-invite-email in 2.5s
  URL: https://abcdefghijklmnopqrst.supabase.co/functions/v1/send-invite-email
```

**📋 SALVA L'URL** (opzionale, il codice lo trova automaticamente)

✅ **Edge Function deployata!**

---

## ✅ VERIFICA FUNZIONAMENTO

### Test 1: Verifica Deploy

Vai su **Supabase Dashboard** → **Edge Functions**

Dovresti vedere:
```
✅ send-invite-email
   Status: Deployed
   Last deployed: Appena ora
```

---

### Test 2: Testa Invio Email

**Opzione A: Via Console Browser**

```javascript
// Apri console (F12) nell'app
const testInvite = {
  token: 'test-token-uuid',
  email: 'tua-email-test@gmail.com',  // ⚠️ USA LA TUA EMAIL
  role: 'admin',
  company_id: '205c56c7-30b5-4526-b064-bf998c562df3',
}

// Testa invio
const { data, error } = await supabase.functions.invoke('send-invite-email', {
  body: { inviteToken: testInvite }
})

console.log('Risultato:', { data, error })
```

**Controlla la tua casella email** → Dovresti ricevere l'email di invito!

---

**Opzione B: Completa Onboarding**

1. Completa l'onboarding di Paolo
2. Controlla la console → Dovrebbe mostrare:
   ```
   📧 Tentativo invio email a: matti169cava@libero.it
   ✅ Email inviata con successo tramite Edge Function!
   ```
3. **Controlla la casella** di `matti169cava@libero.it`

---

## 📝 PERSONALIZZA EMAIL TEMPLATE

### Step 1: Vai su Template

**Dashboard** → **Authentication** → **Email Templates** → **"Invite user"**

### Step 2: Usa Questo Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
      🍽️ Al Ritrovo SRL
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
      Business HACCP Manager
    </p>
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Benvenuto nel Team! 🎉
    </h2>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Ciao,<br><br>
      Sei stato invitato a far parte del nostro team come 
      <strong style="color: #667eea; text-transform: uppercase;">{{ .Data.role }}</strong>.
    </p>
    
    <!-- Info Box -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.8;">
        <strong style="color: #1f2937;">📧 Email Account:</strong> {{ .Email }}<br>
        <strong style="color: #1f2937;">👤 Ruolo Assegnato:</strong> {{ .Data.role }}<br>
        <strong style="color: #1f2937;">🏢 Azienda:</strong> Al Ritrovo SRL
      </p>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Clicca sul pulsante qui sotto per accettare l'invito e creare il tuo account:
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ .Data.invite_link }}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 50px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-size: 18px; 
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
        ✅ Accetta Invito
      </a>
    </div>
    
    <!-- Link Alternativo -->
    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 30px 0;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: bold;">
        💡 Il pulsante non funziona?
      </p>
      <p style="margin: 0; color: #78350f; font-size: 12px;">
        Copia e incolla questo link nel tuo browser:
      </p>
      <code style="background: white; padding: 10px; display: block; margin-top: 8px; word-break: break-all; border-radius: 4px; font-size: 11px; color: #374151; border: 1px solid #d1d5db;">{{ .Data.invite_link }}</code>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
        ⚠️ <strong>Importante:</strong><br>
        - Questo invito scadrà tra <strong>7 giorni</strong><br>
        - Se non hai richiesto questo invito, ignora questa email<br>
        - Per assistenza, contatta l'amministratore del sistema
      </p>
    </div>
    
  </div>
  
  <!-- Footer Esterno -->
  <div style="text-align: center; margin-top: 20px;">
    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
      © 2025 Al Ritrovo SRL - Business HACCP Manager
    </p>
  </div>
  
</body>
</html>
```

**Salva il template!**

---

### OPZIONE 2: Invio Manuale Batch (Per Testing Immediato)

Se non vuoi deployare ora, usa questa soluzione temporanea:

#### Script SQL per Generare Email Pronte

```sql
-- Genera testo email formattato per ogni invito
SELECT 
  email as destinatario,
  CONCAT(
    'Oggetto: Invito al Team - Al Ritrovo SRL',
    E'\n\n',
    'Ciao,',
    E'\n\n',
    'Sei stato invitato a far parte di Al Ritrovo SRL come ', UPPER(role), '.',
    E'\n\n',
    'Clicca qui per accettare l\'invito:',
    E'\n',
    'http://localhost:5173/accept-invite?token=', token,
    E'\n\n',
    'L\'invito scade il: ', expires_at::date,
    E'\n\n',
    'A presto!',
    E'\nTeam Al Ritrovo SRL'
  ) as testo_email
FROM public.invite_tokens
WHERE company_id IS NOT NULL
  AND used_at IS NULL
ORDER BY email;
```

**Copia il testo** e invialo manualmente via Gmail.

---

## 🧪 TEST COMPLETO INVIO AUTOMATICO

### Test Flow

1. **Paolo completa onboarding**
2. **Console log mostra**:
   ```
   📧 Tentativo invio email a: matti169cava@libero.it
   ✅ Email inviata con successo tramite Edge Function!
   📧 Dettagli invio: {...}
   ```

3. **Controlla casella email** di `matti169cava@libero.it`
   - Oggetto: "Invite to join Al Ritrovo SRL"
   - Mittente: tua-email-smtp@gmail.com
   - Corpo: Template personalizzato

4. **Clicca link nell'email** → Redirect a AcceptInvite page

✅ **Flusso completo automatico!**

---

## 🔧 TROUBLESHOOTING

### Problema: "Edge Function non trovata"

**Causa**: Function non deployata

**Soluzione**:
```bash
supabase functions deploy send-invite-email
```

---

### Problema: "Service role required"

**Causa**: Edge Function non ha le credenziali

**Soluzione**: Verifica che nel dashboard Supabase → Settings → API ci siano:
- `SUPABASE_URL` (auto)
- `SUPABASE_SERVICE_ROLE_KEY` (auto)

---

### Problema: "SMTP authentication failed"

**Causa**: Password Gmail errata o 2FA non configurato

**Soluzione**:
1. Vai su https://myaccount.google.com/apppasswords
2. Genera nuova "App Password"
3. Aggiorna in Supabase → Auth → SMTP Settings

---

### Problema: "Email non arrivano"

**Verifica**:
1. Controlla **Spam/Posta indesiderata**
2. Verifica SMTP settings in Supabase
3. Guarda i log della Edge Function:
   ```bash
   supabase functions logs send-invite-email
   ```

---

## 🎯 COMANDI RAPIDI

```bash
# Deploy function
supabase functions deploy send-invite-email

# Vedi log in tempo reale
supabase functions logs send-invite-email --follow

# Testa function localmente
supabase functions serve send-invite-email

# Lista tutte le functions
supabase functions list
```

---

## 📊 WORKFLOW FINALE

### Con Edge Function Deployata:

```
Paolo completa onboarding
  ↓
onboardingHelpers.ts genera inviti
  ↓
Per ogni invito chiama sendInviteEmail()
  ↓
sendInviteEmail() invoca Edge Function
  ↓
Edge Function usa Service Role + SMTP Gmail
  ↓
✅ Email inviata automaticamente!
```

### Senza Edge Function:

```
Paolo completa onboarding
  ↓
onboardingHelpers.ts genera inviti
  ↓
sendInviteEmail() fallisce (no Edge Function)
  ↓
Console mostra: "💡 Link invito manuale: http://..."
  ↓
❌ Recupero manuale necessario
```

---

## 🎯 RACCOMANDAZIONE

**Per ORA (Testing)**:
- ⏭️ **Salta il deploy** della Edge Function
- ✅ **Usa recupero manuale** dei link (più veloce)
- ✅ Testa il flusso completo

**Per FUTURO (Produzione)**:
- ✅ **Deploya Edge Function**
- ✅ **Testa invio automatico**
- ✅ **Personalizza template**

---

**Vuoi deployare ora o procedere con recupero manuale per il test?** 🚀

