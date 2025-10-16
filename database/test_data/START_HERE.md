# ⚡ START HERE - Reset e Test Completo

## 🎯 COSA FARAI

Resettare tutto il database e testare il flusso completo:
1. Paolo crea azienda
2. Matteo ed Elena vengono invitati automaticamente
3. Tutti e 3 accedono alla stessa azienda

**Tempo totale**: 15-20 minuti

---

## 🚀 ESECUZIONE RAPIDA

### 1️⃣ RESET DATABASE (SQL Editor)

```sql
-- Apri: database/test_data/FULL_DATABASE_RESET.sql
-- Oppure copia/incolla questo:
```

Esegui lo script `FULL_DATABASE_RESET.sql` in **Supabase SQL Editor**.

**Output finale**:
```
🔗 LINK INVITO (copia questo):
http://localhost:3000/accept-invite?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**📋 COPIA E SALVA IL LINK!**

---

### 2️⃣ PAOLO CREA AZIENDA (Browser)

1. **Avvia app**: `npm run dev`
2. **Apri il link** copiato
3. **Crea account**:
   - Email: `matteo.cavallaro.work@gmail.com`
   - Password: `TestPass123!` (o altra sicura)
   - Nome: Paolo
   - Cognome: Dettori

4. **Se chiede conferma email**:
   - Vai su **Supabase → Authentication → Users**
   - Trova l'utente → Clicca **"..."** → **"Verify email"**
   - Torna all'app e fai login

5. **Onboarding**:
   - Clicca **"Precompila"** (bottone viola)
   - Clicca **"Avanti"** su tutti gli step
   - All'ultimo step: **"Completa Configurazione"**

6. **Attendi**:
   - Creazione azienda
   - Generazione inviti automatici
   - Redirect a Dashboard

✅ **Paolo è dentro come Admin!**

---

### 3️⃣ RECUPERA LINK INVITI (SQL Editor)

Dopo che Paolo ha completato l'onboarding, esegui:

```sql
SELECT 
  email,
  role,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as invite_link,
  CASE 
    WHEN used_at IS NOT NULL THEN '✅ Usato'
    ELSE '⏳ Pending'
  END as status
FROM public.invite_tokens
WHERE company_id IS NOT NULL
ORDER BY created_at DESC;
```

**Output**:
```
matti169cava@libero.it | responsabile | http://localhost:3000/... | ⏳ Pending
0cavuz0@gmail.com | dipendente | http://localhost:3000/... | ⏳ Pending
```

**📋 COPIA I 2 LINK!**

---

### 4️⃣ MATTEO ACCETTA INVITO (Browser Incognito)

1. **Apri finestra incognito**
2. **Incolla link Matteo**
3. **Crea account**:
   - Email: `matti169cava@libero.it`
   - Password: `TestPass123!`
   - Nome: Matteo
   - Cognome: Cavallaro

4. **Login automatico** → Dashboard

✅ **Matteo è dentro come Responsabile!**

---

### 5️⃣ ELENA ACCETTA INVITO (Altra finestra incognito)

1. **Apri altra finestra incognito**
2. **Incolla link Elena**
3. **Crea account**:
   - Email: `0cavuz0@gmail.com`
   - Password: `TestPass123!`
   - Nome: Elena
   - Cognome: Compagna

4. **Login automatico** → Dashboard

✅ **Elena è dentro come Dipendente!**

---

## ✅ VERIFICA FINALE (SQL Editor)

```sql
-- Deve mostrare 3 utenti nella stessa azienda
SELECT 
  u.email,
  cm.role,
  s.name as staff_name,
  c.name as company_name
FROM auth.users u
JOIN public.company_members cm ON cm.user_id = u.id
JOIN public.companies c ON c.id = cm.company_id
JOIN public.staff s ON s.id = cm.staff_id
ORDER BY cm.role DESC;
```

**Output atteso**:

| email | role | staff_name | company_name |
|-------|------|------------|--------------|
| matteo.cavallaro.work@gmail.com | admin | Paolo Dettori | Al Ritrovo SRL |
| matti169cava@libero.it | responsabile | Matteo Cavallaro | Al Ritrovo SRL |
| 0cavuz0@gmail.com | dipendente | Elena Compagna | Al Ritrovo SRL |

---

## 🎉 SUCCESSO!

Hai completato il flusso:

```
✅ Database resettato
✅ 1 Azienda creata: Al Ritrovo SRL
✅ 3 Utenti registrati: Paolo, Matteo, Elena
✅ 5 Staff totali
✅ 8 Reparti configurati
✅ Tutti vedono la stessa azienda
```

---

## 🛠️ CONFIGURA DEV MODE (Opzionale)

Per evitare duplicate future:

```javascript
// Console browser (F12)
devCompanyHelper.setDevCompanyFromCurrentUser()
```

---

## 📁 FILE UTILI

| File | Quando usarlo |
|------|---------------|
| `FULL_DATABASE_RESET.sql` | Adesso! Reset completo |
| `FLUSSO_TEST_COMPLETO.md` | Guida dettagliata step-by-step |
| `START_HERE.md` | Questo file (quick start) |

---

## 🚨 SE QUALCOSA VA STORTO

**Problema**: auth.users non si elimina

**Soluzione**: Dashboard → Authentication → Users → Elimina manualmente

---

**Problema**: Inviti non generati automaticamente

**Soluzione**:
```sql
-- Genera manualmente per Matteo
INSERT INTO invite_tokens (token, email, company_id, role, expires_at)
SELECT gen_random_uuid()::text, 'matti169cava@libero.it', id, 'responsabile', NOW() + INTERVAL '7 days'
FROM companies WHERE name = 'Al Ritrovo SRL';

-- Genera per Elena
INSERT INTO invite_tokens (token, email, company_id, role, expires_at)
SELECT gen_random_uuid()::text, '0cavuz0@gmail.com', id, 'dipendente', NOW() + INTERVAL '7 days'
FROM companies WHERE name = 'Al Ritrovo SRL';
```

---

**Pronto? Inizia eseguendo `FULL_DATABASE_RESET.sql`!** 🚀

