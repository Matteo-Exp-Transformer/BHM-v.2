# 📧 CONFIGURARE GMAIL SMTP - Guida Completa

## 🎯 PROBLEMA

```
Error sending confirmation email
```

**Causa**: SMTP non configurato correttamente o credenziali sbagliate.

---

## ✅ SOLUZIONE: Configurazione Gmail Corretta

### STEP 1: Genera App Password di Gmail

**⚠️ IMPORTANTE**: Non usare la tua password Gmail normale!

1. Vai su **Google Account**: https://myaccount.google.com

2. **Security** (Sicurezza) → **2-Step Verification**
   - Se non attiva → **Attivala ora** (obbligatorio per App Password)

3. Torna su **Security** → **App passwords** (Password per le app)
   - Link diretto: https://myaccount.google.com/apppasswords

4. **Crea nuova App Password**:
   - Nome: `Supabase BHM`
   - Clicca **Generate**

5. **COPIA LA PASSWORD** (formato: `abcd efgh ijkl mnop`)
   - ⚠️ Salvala subito! Non la vedrai più!
   - Es: `wxyz abcd efgh ijkl`

✅ **App Password generata!**

---

### STEP 2: Configura SMTP in Supabase

1. **Supabase Dashboard** → **Project Settings** → **Auth**

2. Scroll fino a **SMTP Settings**

3. **Abilita "Enable Custom SMTP"**

4. **Compila i campi ESATTAMENTE così**:

```
Sender name: Al Ritrovo SRL
Sender email: tua-email@gmail.com  ⚠️ STESSO EMAIL che hai usato per App Password

Host: smtp.gmail.com
Port number: 587
Username: tua-email@gmail.com  ⚠️ STESSO EMAIL

Password: wxyz abcd efgh ijkl  ⚠️ APP PASSWORD (non password Gmail!)
                              ⚠️ Copia SENZA SPAZI o con spazi (prova entrambi)
```

5. **Clicca "Save"**

✅ **SMTP configurato!**

---

### STEP 3: Test Invio Email

Vai su **Authentication** → **Users** → **Invite user**

Inserisci un'email di test (es. la tua) e clicca **Send invitation**.

**Controlla la casella email**:
- ✅ Se ricevi email → SMTP funziona!
- ❌ Se non ricevi → Verifica configurazione

---

### STEP 4: Verifica Configurazione

Se non funziona, **controlla i log**:

1. **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Cerca errori SMTP
3. Dettagli dell'errore ti diranno cosa sistemare

**Errori comuni**:
```
"Authentication failed" → Password sbagliata (ricontrolla App Password)
"Connection timeout" → Port sbagliata (usa 587, NON 465)
"Invalid email" → Sender email diversa da username
```

---

## 🔧 CONFIGURAZIONI ALTERNATIVE

### Opzione A: Gmail con TLS (Port 465)

```
Host: smtp.gmail.com
Port: 465
Username: tua-email@gmail.com
Password: [App Password]
Max Frequency: 1
```

### Opzione B: Outlook/Hotmail

```
Host: smtp-mail.outlook.com
Port: 587
Username: tua-email@outlook.com
Password: [tua password Outlook]
```

### Opzione C: SendGrid (Professionale)

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [SendGrid API Key]
```

**SendGrid**: 100 email/giorno gratis → https://sendgrid.com

---

## 🧪 TEST COMPLETO

Dopo la configurazione:

### Test 1: Via Dashboard

**Dashboard** → **Authentication** → **Users** → **Invite user**

Invita un email di test → Controlla casella

### Test 2: Via App

1. Riprova signup di Paolo
2. **Console dovrebbe mostrare**:
   ```
   🔐 Tentativo creazione account per: matteo.cavallaro.work@gmail.com
   📧 Opzioni signup: {...}
   📊 Risultato signup: {success: true, user_id: 'xxx'}
   ✅ Account Supabase creato: xxx
   ```

3. **Controlla la casella** `matteo.cavallaro.work@gmail.com`
   - Oggetto: "Confirm your email"
   - Mittente: Al Ritrovo SRL (o tua email)

---

## ⚠️ TROUBLESHOOTING

### Problema: "App Password non trovata"

**Causa**: 2-Step Verification non attiva

**Soluzione**:
1. https://myaccount.google.com/security
2. Abilita "2-Step Verification"
3. Riprova a creare App Password

---

### Problema: "Authentication failed"

**Causa**: Password sbagliata o spazi nella password

**Soluzione**:
1. Genera NUOVA App Password
2. Copia senza spazi: `wxyzabcdefghijkl` (tutto attaccato)
3. Oppure CON spazi: `wxyz abcd efgh ijkl`
4. Prova entrambi

---

### Problema: "Connection timeout"

**Causa**: Port sbagliata o firewall

**Soluzione**:
1. Usa Port **587** (TLS/STARTTLS)
2. Se non funziona, prova **465** (SSL)

---

### Problema: "Email non arriva"

**Verifica**:
1. Controlla **Spam/Posta indesiderata**
2. Attendi 1-2 minuti (a volte ritardo)
3. Verifica logs in Dashboard → Logs → Auth

---

## 🎯 CHECKLIST CONFIGURAZIONE

- [ ] 2-Step Verification attiva su Google
- [ ] App Password generata (16 caratteri)
- [ ] SMTP Settings in Supabase salvato
- [ ] Sender email = Username SMTP
- [ ] Port = 587
- [ ] Test invio da Dashboard funziona
- [ ] Email di test ricevuta

**Se tutto ✅ → Riprova signup!**

---

## 📊 VERIFICA CONFIGURAZIONE ATTUALE

Vai su **Supabase Dashboard** → **Settings** → **Auth**

Scroll fino a **SMTP Settings** e verifica:

```
✅ Enable Custom SMTP: ON
✅ Sender name: Al Ritrovo SRL
✅ Sender email: tua-email@gmail.com
✅ Host: smtp.gmail.com
✅ Port: 587
✅ Username: tua-email@gmail.com  (= Sender email)
✅ Password: [App Password 16 caratteri]
```

**Se tutto OK** → Clicca **"Send test email"** (se disponibile)

---

**Verifica la configurazione SMTP e fammi sapere se ricevi l'email di test!** 📧

