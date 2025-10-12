# 🚀 FLUSSO TEST COMPLETO - Da Zero a Tre Utenti

**Data**: 12 Ottobre 2025  
**Scopo**: Testare il flusso completo di creazione azienda e inviti  
**Durata stimata**: 15-20 minuti

---

## 📋 OVERVIEW DEL FLUSSO

```
RESET DATABASE
      ↓
CREA TOKEN per Paolo (Admin)
      ↓
Paolo accetta invito
      ↓
Paolo completa onboarding (con Precompila)
      ↓
Sistema genera inviti per Matteo ed Elena
      ↓
Matteo accetta → Entra come Responsabile
      ↓
Elena accetta → Entra come Dipendente
      ↓
✅ 3 Utenti, 1 Azienda, 5 Staff, 8 Reparti
```

---

## ⚠️ ATTENZIONE PRIMA DI INIZIARE

### 🔴 QUESTA OPERAZIONE È IRREVERSIBILE!

Verrà eliminato:
- ✂️ TUTTE le companies
- ✂️ TUTTI gli utenti (auth.users)
- ✂️ TUTTI i token di invito
- ✂️ TUTTI i dati (staff, departments, products, tasks, etc.)

### ✅ CHECKLIST PRE-RESET

- [ ] Ho fatto un BACKUP del database
- [ ] Sono in ambiente di SVILUPPO (non produzione)
- [ ] Ho salvato tutti i dati importanti
- [ ] Sono pronto a ricominciare da zero

**Se tutto OK, procedi! 👇**

---

## 🔥 FASE 1: RESET DATABASE (5 minuti)

### Step 1.1: Esegui lo script di reset

1. Apri **Supabase Dashboard** → **SQL Editor**
2. Apri il file: `FULL_DATABASE_RESET.sql`
3. **LEGGI ATTENTAMENTE** i commenti nello script
4. Clicca **Run** (esegui tutto lo script)

**Output atteso**:
```
🧹 Inizio pulizia database...
📦 Pulizia dati operativi...
✅ Dati operativi puliti
✅ Sessioni e profili puliti
✅ Company members puliti
✅ X token di invito eliminati
✅ X companies eliminate
✅ X utenti eliminati

🎉 DATABASE RESET COMPLETATO!

🎟️ TOKEN INVITO INIZIALE CREATO!
👤 Nome: Paolo Dettori (Admin)
📧 Email: matteo.cavallaro.work@gmail.com
🔗 LINK INVITO:
http://localhost:5173/accept-invite?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 1.2: Copia il link invito

**IMPORTANTE**: Copia e salva il link che appare nell'output!

```
http://localhost:5173/accept-invite?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Questo link serve per Paolo!**

### Step 1.3: Verifica reset

Esegui questa query per confermare:

```sql
-- Tutti dovrebbero essere 0
SELECT 
  (SELECT COUNT(*) FROM auth.users) as users,
  (SELECT COUNT(*) FROM public.companies) as companies,
  (SELECT COUNT(*) FROM public.staff) as staff,
  (SELECT COUNT(*) FROM public.departments) as departments;
```

**Output atteso**: `0, 0, 0, 0`

✅ **Se tutto è 0, procedi alla Fase 2!**

---

## 👤 FASE 2: PAOLO CREA AZIENDA (5 minuti)

### Step 2.1: Paolo apre il link invito

1. Apri il browser
2. Incolla il link invito salvato prima
3. Premi Enter

**Schermata attesa**: Form di registrazione

### Step 2.2: Paolo crea account

Compila il form:
- **Email**: `matteo.cavallaro.work@gmail.com` (precompilata)
- **Password**: Scegli una password sicura (es. `TestPass123!`)
- **Nome**: Paolo
- **Cognome**: Dettori

Clicca **"Crea Account"**

### Step 2.3: Conferma email (se richiesta)

⚠️ **Se Supabase richiede conferma email**:
- Vai su **Supabase Dashboard** → **Authentication** → **Users**
- Trova `matteo.cavallaro.work@gmail.com`
- Clicca **"..."** → **"Verify email"**

Poi fai login nell'app.

### Step 2.4: Paolo completa onboarding

Dopo il login, verrai reindirizzato all'**Onboarding Wizard**.

1. **Clicca "Precompila"** (bottone viola in alto)
   - Questo caricherà tutti i dati predefiniti

2. **Naviga attraverso gli step** (clicca "Avanti"):
   - ✅ Step 1: Business Info (Al Ritrovo SRL)
   - ✅ Step 2: Departments (8 reparti precaricati)
   - ✅ Step 3: Staff (5 dipendenti precaricati)
   - ✅ Step 4: Conservation Points
   - ✅ Step 5: Tasks
   - ✅ Step 6: Inventory
   - ✅ Step 7: Calendar Settings

3. **All'ultimo step**: Clicca **"Completa Configurazione"**

**Cosa succede dietro le quinte**:
```
✅ Company "Al Ritrovo SRL" creata
✅ 8 Reparti inseriti
✅ 5 Staff members inseriti (inclusi Matteo ed Elena)
✅ Punti conservazione creati
✅ Task e manutenzioni configurati
✅ Prodotti di esempio aggiunti
✅ Token invito generati per Matteo ed Elena
```

**Redirect**: Verrai portato alla Dashboard

✅ **Paolo è dentro l'azienda come Admin!**

---

## 📧 FASE 3: RECUPERA LINK INVITI (2 minuti)

Dopo che Paolo ha completato l'onboarding, il sistema ha generato automaticamente i token invito per Matteo ed Elena.

### Step 3.1: Trova i link inviti

Vai su **Supabase Dashboard** → **SQL Editor** ed esegui:

```sql
-- Trova tutti gli inviti pending
SELECT 
  email,
  role,
  CONCAT('http://localhost:5173/accept-invite?token=', token) as invite_link,
  expires_at::date as scade_il,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    WHEN expires_at < NOW() THEN '❌ Scaduto'
    ELSE '⏳ Pending'
  END as status
FROM public.invite_tokens
WHERE company_id IS NOT NULL  -- Escludi token iniziale
ORDER BY created_at DESC;
```

**Output atteso**:

| email | role | invite_link | scade_il | status |
|-------|------|-------------|----------|--------|
| matti169cava@libero.it | responsabile | http://localhost:5173/accept-invite?token=xxx | 2025-10-19 | ⏳ Pending |
| 0cavuz0@gmail.com | dipendente | http://localhost:5173/accept-invite?token=yyy | 2025-10-19 | ⏳ Pending |

### Step 3.2: Copia i 2 link

**Link 1 - Matteo (Responsabile)**:
```
http://localhost:5173/accept-invite?token=xxx
```

**Link 2 - Elena (Dipendente)**:
```
http://localhost:5173/accept-invite?token=yyy
```

📋 **Salva questi link!**

---

## 👨‍💼 FASE 4: MATTEO ACCETTA INVITO (3 minuti)

### Step 4.1: Matteo apre il suo link

1. Apri una **nuova finestra incognito** (per simulare un altro utente)
2. Incolla il link invito di Matteo
3. Premi Enter

### Step 4.2: Matteo crea account

Compila il form:
- **Email**: `matti169cava@libero.it` (precompilata)
- **Password**: Scegli una password (es. `TestPass123!`)
- **Nome**: Matteo
- **Cognome**: Cavallaro

Clicca **"Crea Account"**

### Step 4.3: Conferma email (se richiesta)

Come prima, verifica email manualmente dal dashboard Supabase se necessario.

### Step 4.4: Matteo fa login

Dopo la creazione account:
- Login automatico
- **Redirect alla Dashboard**

✅ **Matteo è dentro come Responsabile!**

**Verifica**:
- Guarda in alto a destra → Dovrebbe mostrare "Matteo Cavallaro"
- Badge ruolo: "Responsabile"
- Azienda attiva: "Al Ritrovo SRL"

---

## 👩‍💼 FASE 5: ELENA ACCETTA INVITO (3 minuti)

### Step 5.1: Elena apre il suo link

1. Apri un'**altra finestra incognito**
2. Incolla il link invito di Elena
3. Premi Enter

### Step 5.2: Elena crea account

Compila il form:
- **Email**: `0cavuz0@gmail.com` (precompilata)
- **Password**: Scegli una password (es. `TestPass123!`)
- **Nome**: Elena
- **Cognome**: Compagna

Clicca **"Crea Account"**

### Step 5.3: Elena fa login

Dopo la creazione:
- Login automatico
- **Redirect alla Dashboard**

✅ **Elena è dentro come Dipendente!**

**Verifica**:
- Nome in alto a destra: "Elena Compagna"
- Badge ruolo: "Dipendente"
- Azienda attiva: "Al Ritrovo SRL"

---

## ✅ FASE 6: VERIFICA FINALE (2 minuti)

### Step 6.1: Verifica utenti nel database

Vai su **Supabase Dashboard** → **SQL Editor**:

```sql
-- Vedi tutti gli utenti registrati
SELECT 
  u.email,
  u.created_at::date as registrato_il,
  cm.role,
  s.name as staff_name,
  c.name as company_name
FROM auth.users u
LEFT JOIN public.company_members cm ON cm.user_id = u.id
LEFT JOIN public.companies c ON c.id = cm.company_id
LEFT JOIN public.staff s ON s.id = cm.staff_id
ORDER BY cm.role DESC, u.email;
```

**Output atteso**:

| email | registrato_il | role | staff_name | company_name |
|-------|---------------|------|------------|--------------|
| matteo.cavallaro.work@gmail.com | 2025-10-12 | admin | Paolo Dettori | Al Ritrovo SRL |
| matti169cava@libero.it | 2025-10-12 | responsabile | Matteo Cavallaro | Al Ritrovo SRL |
| 0cavuz0@gmail.com | 2025-10-12 | dipendente | Elena Compagna | Al Ritrovo SRL |

### Step 6.2: Verifica azienda

```sql
-- Vedi dettagli azienda
SELECT 
  c.id,
  c.name,
  c.email,
  c.created_at::date as creata_il,
  (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) as reparti,
  (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) as staff_totale,
  (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id) as utenti_registrati
FROM public.companies c;
```

**Output atteso**:

| id | name | email | creata_il | reparti | staff_totale | utenti_registrati |
|----|------|-------|-----------|---------|--------------|-------------------|
| xxx | Al Ritrovo SRL | 000@gmail.com | 2025-10-12 | 8 | 5 | 3 |

### Step 6.3: Test nell'app

**Testa con Paolo (Admin)**:
1. Vai alla pagina **Staff**
2. Dovresti vedere tutti e 5 i dipendenti
3. Vai a **Reparti** → Dovresti vedere 8 reparti
4. Vai a **Calendario** → Dovresti vedere task precaricati

**Testa con Matteo (Responsabile)**:
1. Accedi con il suo account
2. Verifica che veda la stessa azienda
3. Dovrebbe avere permessi gestione staff/dipartimenti

**Testa con Elena (Dipendente)**:
1. Accedi con il suo account
2. Verifica che veda la stessa azienda
3. Permessi limitati (non può gestire staff)

---

## 🎯 CHECKLIST FINALE

Verifica che tutto sia OK:

- [ ] ✅ Database resettato (count = 0)
- [ ] ✅ Token iniziale Paolo creato
- [ ] ✅ Paolo ha creato account
- [ ] ✅ Paolo ha completato onboarding con "Precompila"
- [ ] ✅ Company "Al Ritrovo SRL" creata
- [ ] ✅ 8 Reparti inseriti
- [ ] ✅ 5 Staff inseriti (Matteo, Fabrizio, Paolo, Eddy, Elena)
- [ ] ✅ Token inviti per Matteo ed Elena generati
- [ ] ✅ Matteo ha accettato invito
- [ ] ✅ Elena ha accettato invito
- [ ] ✅ 3 utenti in auth.users
- [ ] ✅ 3 company_members nella stessa azienda
- [ ] ✅ Tutti e 3 vedono "Al Ritrovo SRL"

---

## 🎉 SUCCESSO!

Hai completato il flusso completo:

```
✅ 1 Azienda: Al Ritrovo SRL
✅ 3 Utenti registrati:
   - Paolo (Admin)
   - Matteo (Responsabile)
   - Elena (Dipendente)
✅ 5 Staff totali (3 con account, 2 senza: Fabrizio ed Eddy)
✅ 8 Reparti
✅ Punti conservazione configurati
✅ Task e manutenzioni attivi
```

---

## 🛠️ PROSSIMI PASSI (OPZIONALE)

### Configura Dev Company

Per evitare di ricreare company duplicate nei prossimi test:

```javascript
// Console browser (F12)
devCompanyHelper.setDevCompanyFromCurrentUser()
devCompanyHelper.showDevCompanyInfo()
```

### Genera inviti per Fabrizio ed Eddy

Se vuoi che anche loro abbiano un account:

```sql
-- Script per generare inviti
-- (modifica le email)
```

---

## 📝 NOTE FINALI

- **Email non inviate automaticamente**: Supabase free tier non ha SMTP configurato, quindi devi recuperare i link manualmente dal database
- **Conferma email**: In sviluppo puoi confermarle manualmente dal dashboard
- **Password**: Usa password sicure anche in test (minimo 6 caratteri)
- **Backup**: Ricorda sempre di fare backup prima di reset!

---

## 🐛 TROUBLESHOOTING

### Problema: "auth.users non si elimina"

**Soluzione**: Vai manualmente su Dashboard → Authentication → Users e elimina uno per uno.

### Problema: "Inviti non generati"

**Verifica**:
```sql
SELECT * FROM public.invite_tokens ORDER BY created_at DESC;
```

Se vuoti, genera manualmente usando lo script in `FULL_DATABASE_RESET.sql`.

### Problema: "Onboarding non mostra dati precompilati"

**Soluzione**: Verifica che hai cliccato "Precompila" (bottone viola). Altrimenti dovrai inserire i dati manualmente.

---

**Buon testing!** 🚀

