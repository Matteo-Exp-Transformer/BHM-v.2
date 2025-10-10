# 🔧 FIX AUTH & ONBOARDING - 2025-01-10

**Issue:** Utenti registrati in Supabase Auth non riescono a loggarsi perché manca record in `company_members`

**Status:** ✅ **FIXED - READY FOR TESTING**

---

## 🐛 PROBLEMA IDENTIFICATO

### Bug nel flusso di completamento onboarding:

**File:** `src/utils/onboardingHelpers.ts` (linea 876)

```typescript
// ❌ BUG: usava .update() invece di .insert()
.from('company_members')
.update({  // <-- Cercava di aggiornare record inesistente
  company_id: company.id,
  role: 'admin',
  is_active: true,
})
.eq('user_id', user.id)
```

**Risultato:**
- Utente registrato in `auth.users` ✅
- Company creata in `companies` ✅
- Record `company_members` NON creato ❌
- → Utente bloccato come "guest" → Accesso negato

---

## ✅ SOLUZIONI IMPLEMENTATE

### 1. **Fix Bug Company Members** ✅

**File:** `src/utils/onboardingHelpers.ts`

```typescript
// ✅ FIXED: usa .insert() per creare nuovo record
.from('company_members')
.insert({
  user_id: user.id,
  company_id: company.id,
  role: 'admin',
  staff_id: null,
  is_active: true,
})
```

---

### 2. **Nuovo OnboardingGuard Component** ✅

**File:** `src/components/OnboardingGuard.tsx`

Controlla automaticamente se utente ha una company:
- **Se NO** → Redirect automatico a `/onboarding`
- **Se SÌ** → Continua normalmente

**Flusso per nuovi utenti:**
```
1. Sign Up → Crea solo auth.users
2. Login → Entra nell'app
3. OnboardingGuard → Rileva NO company
4. Redirect automatico → /onboarding
5. Wizard completo → Crea company + company_members + dati
6. → Utente entra nell'app con la sua azienda
```

---

### 3. **Script SQL per Fix Account Admin** ✅

**File:** `database/scripts/fix_admin_account.sql`

Script per fixare manualmente l'account admin esistente:
1. Crea company "Admin Test Company"
2. Inserisce record in `company_members` (role: admin)
3. Crea `user_sessions` con active_company_id

---

## 📋 ISTRUZIONI PER L'UTENTE

### **STEP 1: Recupera il tuo User ID**

Apri la console del browser (F12) mentre sei sulla pagina dell'app e esegui:

```javascript
(await supabase.auth.getUser()).data.user.id
```

Copia l'UUID che appare (esempio: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

### **STEP 2: Esegui lo Script SQL**

1. Apri **Supabase Dashboard** → SQL Editor
2. Apri il file `database/scripts/fix_admin_account.sql`
3. **Sostituisci** `'YOUR_USER_ID_HERE'` con il tuo UUID (3 occorrenze)
4. Esegui lo script
5. Verifica output finale - dovresti vedere il tuo record con role='admin'

---

### **STEP 3: Test Account Admin**

1. Ricarica l'app (F5)
2. Login con le tue credenziali
3. ✅ Dovresti entrare direttamente in `/dashboard`
4. ✅ Hai accesso completo a tutte le funzionalità

---

### **STEP 4: Test Account Cliente (nuovo utente)**

1. **Sign Up** con email diversa (es: `cliente.test@example.com`)
2. **Login** con le nuove credenziali
3. ✅ Dovresti essere **rediretto automaticamente** a `/onboarding`
4. ✅ Completa wizard → crea azienda, staff, reparti...
5. ✅ Al completamento → redirect a `/dashboard` con tua azienda

---

## 🎯 NUOVO FLUSSO UTENTE

### **Per Admin (account esistente):**
```
Login → Dashboard immediato → Pieno controllo app
```

### **Per Cliente Test (nuovo utente):**
```
Sign Up → Login → OnboardingGuard rileva NO company 
→ Redirect /onboarding → Wizard completo 
→ Crea company + company_members 
→ Dashboard con propria azienda
```

---

## 📊 FILE MODIFICATI

### **1. Bug Fixes:**
- ✅ `src/utils/onboardingHelpers.ts` - Fix .update() → .insert()

### **2. Nuovi Components:**
- ✅ `src/components/OnboardingGuard.tsx` - Redirect automatico

### **3. Routing:**
- ✅ `src/App.tsx` - Integrato OnboardingGuard

### **4. Scripts:**
- ✅ `database/scripts/fix_admin_account.sql` - Fix account admin

---

## 🧪 TEST CHECKLIST

### **Admin Account (tuo account):**
- [ ] Recuperato user_id da console
- [ ] Eseguito script SQL con user_id corretto
- [ ] Login riuscito senza errori
- [ ] Accesso diretto a `/dashboard`
- [ ] Tutte le funzionalità accessibili

### **Cliente Test (nuovo account):**
- [ ] Sign Up completato
- [ ] Login riuscito
- [ ] Redirect automatico a `/onboarding`
- [ ] Wizard completato (tutti gli step)
- [ ] Company creata correttamente
- [ ] Record `company_members` creato
- [ ] Redirect a `/dashboard` dopo completamento
- [ ] Accesso alle funzionalità della propria azienda

---

## 🔍 VERIFICA DATABASE

Dopo il test, verifica che tutto sia corretto nel database:

```sql
-- Verifica account admin
SELECT 
  u.id as user_id,
  u.email,
  cm.role,
  c.name as company_name,
  us.active_company_id
FROM auth.users u
LEFT JOIN company_members cm ON cm.user_id = u.id
LEFT JOIN companies c ON c.id = cm.company_id
LEFT JOIN user_sessions us ON us.user_id = u.id
WHERE u.email = 'TUA_EMAIL_ADMIN@example.com';

-- Verifica account cliente test
SELECT 
  u.id as user_id,
  u.email,
  cm.role,
  c.name as company_name,
  us.active_company_id
FROM auth.users u
LEFT JOIN company_members cm ON cm.user_id = u.id
LEFT JOIN companies c ON c.id = cm.company_id
LEFT JOIN user_sessions us ON us.user_id = u.id
WHERE u.email = 'cliente.test@example.com';
```

**Output atteso:**
- Entrambi devono avere `role` non NULL
- Entrambi devono avere `company_name` non NULL
- Entrambi devono avere `active_company_id` non NULL

---

## 🎉 SUCCESSO

Se tutti i test passano:
- ✅ Bug fixato completamente
- ✅ Flusso admin → dashboard funzionante
- ✅ Flusso cliente → onboarding → dashboard funzionante
- ✅ Multi-tenancy corretto
- ✅ RLS policies rispettate

---

**Report generato:** 2025-01-10  
**Autore:** AI Assistant  
**Status:** ✅ READY FOR TESTING

