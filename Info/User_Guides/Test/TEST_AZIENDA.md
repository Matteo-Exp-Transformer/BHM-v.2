# 🧪 Test Creazione Azienda e Dipendenti

## Test Manuale Senza Email (DISPONIBILE ORA)

### Passo 1: Reset App
```javascript
// Nella console del browser (F12)
window.resetApp()
```

### Passo 2: Registrati come Admin
1. Vai su http://localhost:3001/sign-up
2. Crea account con email: `admin@tuaazienda.com`
3. Completa registrazione Clerk

### Passo 3: Onboarding
1. Verrai reindirizzato a `/onboarding`
2. **Step 1 - Business Info:**
   - Nome azienda: "La Mia Pizzeria"
   - Indirizzo: "Via Roma 1, Milano"
   - Email: "admin@tuaazienda.com"
   - Numero dipendenti: 5

3. **Step 2 - Reparti:**
   - Aggiungi: "Cucina", "Sala", "Magazzino"

4. **Step 3 - Staff:** ⚠️ IMPORTANTE
   - Aggiungi dipendenti CON EMAIL:
     ```
     Nome: Mario Rossi
     Email: mario@tuaazienda.com
     Ruolo: Cuoco
     Categoria: Cucina
     ```
     ```
     Nome: Luca Bianchi
     Email: luca@tuaazienda.com
     Ruolo: Cameriere
     Categoria: Sala
     ```

5. **Step 4-6:** Completa altri step (opzionale)

### Passo 4: Logout
1. Click sul tuo nome in alto a destra
2. Logout

### Passo 5: Test Accesso Dipendente
1. Vai su http://localhost:3001/sign-up
2. Registrati con: `mario@tuaazienda.com`
3. Login
4. ✅ Vedrai automaticamente:
   - Ruolo: `dipendente`
   - Company: "La Mia Pizzeria"
   - Permessi limitati

### Passo 6: Verifica Ruoli
```javascript
// Console browser (da loggato come Mario)
console.log('Ruolo:', window.userRole)
console.log('Permessi:', window.permissions)
```

---

## Test Automatico (SUPER VELOCE)

### Metodo A: Precompilazione
```javascript
// Console browser
window.prefillOnboarding()  // Carica dati esempio
window.completeOnboarding() // Salva su Supabase

// Poi registrati con una delle email dello staff precompilato
```

### Metodo B: Script SQL Diretto
```sql
-- Esegui in Supabase SQL Editor
-- 1. Crea azienda
INSERT INTO companies (name, email, address, staff_count)
VALUES ('Test Pizzeria', 'test@pizzeria.com', 'Via Test 1', 5)
RETURNING id;

-- 2. Crea staff (usa l'id azienda sopra)
INSERT INTO staff (company_id, name, email, role, category)
VALUES
  ('UUID_AZIENDA', 'Test User', 'testuser@pizzeria.com', 'dipendente', 'cucina');

-- 3. Registrati con Clerk usando testuser@pizzeria.com
-- → Link automatico!
```

---

## Verifica Sistema

### Check Database
```sql
-- Verifica company
SELECT * FROM companies;

-- Verifica staff
SELECT * FROM staff;

-- Verifica user_profiles (dopo registrazione)
SELECT * FROM user_profiles;
```

### Check Console
```javascript
// Da loggato
console.log(window.userRole)      // 'admin' o 'dipendente'
console.log(window.companyId)     // UUID azienda
console.log(window.permissions)   // Lista permessi
```

---

## Limitazioni Attuali (senza email)

❌ **Non funziona:**
- Invio email automatico a dipendenti
- Link di invito con token
- Notifiche via email

✅ **Funziona:**
- Registrazione manuale con stessa email
- Link automatico staff → user_profile
- Sistema ruoli e permessi
- Onboarding completo
- Tutto il resto dell'app

---

## Prossimo Step: Sistema Email

Per implementare invio email automatico serve:
1. Account Resend (gratuito: 100 email/giorno)
2. Implementare `inviteService.ts`
3. Template email con link magico
4. 2-3 ore di sviluppo

Vuoi che implementi il sistema email completo?
