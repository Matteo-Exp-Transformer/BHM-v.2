# ⚡ ESEGUI QUESTO - Reset Completo

## 🎯 COSA FAI

Pulisci tutto il database e testi il flusso completo: Paolo crea azienda → invita Matteo ed Elena → tutti accedono.

---

## 1️⃣ RESET DATABASE (Supabase SQL Editor)

**Apri**: `database/test_data/FULL_DATABASE_RESET.sql`

**Clicca**: Run (esegui tutto)

**Output finale**:
```
🔗 LINK INVITO (copia questo):
http://localhost:3000/accept-invite?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**📋 SALVA IL LINK!**

---

## 2️⃣ PAOLO CREA AZIENDA (Browser)

1. `npm run dev` (avvia app)
2. Apri il link salvato
3. Crea account:
   - Email: `matteo.cavallaro.work@gmail.com`
   - Password: `TestPass123!`
4. Completa onboarding → **Clicca "Precompila"** → Avanti → Completa

**Console dovrebbe mostrare**:
```
✅ Invito creato per: matti169cava@libero.it (responsabile)
✅ Invito creato per: 0cavuz0@gmail.com (dipendente)
✅ Invito creato per: Fabri@gmail.com (admin)
✅ Invito creato per: Eddy@gmail.com (dipendente)
⏭️ Saltato invito per utente corrente: matteo.cavallaro.work@gmail.com
```

---

## 3️⃣ RECUPERA LINK INVITI (SQL Editor)

Dopo che Paolo completa l'onboarding:

```sql
SELECT 
  email,
  role,
  CONCAT('http://localhost:3000/accept-invite?token=', token) as link
FROM public.invite_tokens
WHERE company_id IS NOT NULL
ORDER BY role DESC;
```

**Copia i 2 link** per Matteo ed Elena (gli altri sono opzionali).

---

## 4️⃣ MATTEO ACCETTA (Finestra Incognito)

1. Incolla link Matteo
2. Crea account: `matti169cava@libero.it` + password
3. Login automatico → Dashboard

✅ **Matteo dentro come Responsabile**

---

## 5️⃣ ELENA ACCETTA (Altra finestra incognito)

1. Incolla link Elena
2. Crea account: `0cavuz0@gmail.com` + password
3. Login automatico → Dashboard

✅ **Elena dentro come Dipendente**

---

## ✅ VERIFICA (SQL Editor)

```sql
SELECT 
  u.email,
  cm.role,
  c.name
FROM auth.users u
JOIN company_members cm ON cm.user_id = u.id
JOIN companies c ON c.id = cm.company_id
ORDER BY cm.role DESC;
```

**Deve mostrare**:
```
matteo.cavallaro.work@gmail.com | admin | Al Ritrovo SRL
matti169cava@libero.it | responsabile | Al Ritrovo SRL
0cavuz0@gmail.com | dipendente | Al Ritrovo SRL
```

---

## 🎉 FATTO!

Hai:
- ✅ 1 Azienda
- ✅ 3 Utenti registrati
- ✅ 5 Staff totali
- ✅ 8 Reparti
- ✅ Tutto configurato e funzionante

---

## 🛠️ PROSSIMO PASSO (Opzionale)

Configura dev mode per evitare duplicate future:

```javascript
// Console browser (F12)
devCompanyHelper.setDevCompanyFromCurrentUser()
```

---

**Leggi `START_HERE.md` per guida più dettagliata!**

