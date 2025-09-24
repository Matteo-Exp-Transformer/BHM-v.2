# 🔐 CURSOR PROMPT: Implementazione Sistema Autorizzazioni HACCP

## 🎯 **OBIETTIVO IMMEDIATO**

Implementare sistema autorizzazioni role-based per HACCP Business Manager prima di procedere con le feature principali.

## 📋 **TASK SPECIFICO**

Implementa il sistema di autorizzazioni seguendo il documento "Sistema Autorizzazioni - Implementazione Veloce" con questi step:

### **STEP 1: Database Update (PRIORITÀ 1)**

Esegui questo SQL su Supabase per aggiungere colonne necessarie:

```sql
-- Aggiungi colonne alla tabella user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'guest';

-- Aggiungi colonna email alla tabella staff se non esiste
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON user_profiles(staff_id);
```

### **STEP 2: Implementazione Auth Hook (PRIORITÀ 1)**

Crea `src/hooks/useAuth.ts` con:

- Gestione ruoli: admin, responsabile, dipendente, collaboratore, guest
- Sistema permessi basato su ruolo
- Auto-linking email staff → user profile
- Query React Query per caching

### **STEP 3: Protected Route Component (PRIORITÀ 1)**

Crea `src/components/ProtectedRoute.tsx` con:

- Controllo autorizzazioni
- UI per utenti non autorizzati
- Loading states
- Permission-based e role-based protection

### **STEP 4: Aggiorna App.tsx (PRIORITÀ 1)**

Modifica routing per proteggere:

- `/gestione` - Solo admin/responsabile
- `/impostazioni` - Solo admin
- Altre route - Tutti gli utenti autorizzati

### **STEP 5: Test di Verifica (PRIORITÀ 1)**

Crea sistema di test per verificare:

- Login con email esistente in staff → assegnazione ruolo
- Login con email NON esistente → ruolo guest + blocco accesso
- Controllo permessi per diverse route
- UI corretta per utenti non autorizzati

## 🧪 **DATI DI TEST**

Usa questi dati per testing (crea manualmente in Supabase se necessario):

```sql
-- Inserisci company di test
INSERT INTO companies (id, name, address, staff_count, email) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Al Ritrovo SRL', 'Via centotrecento 1/1b Bologna 40128', 5, '000@gmail.com');

-- Inserisci staff di test con EMAIL
INSERT INTO staff (company_id, name, role, category, email) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Matteo Cavallaro', 'admin', 'Amministratore', 'METTI_QUI_TUA_EMAIL_VERA'),
('123e4567-e89b-12d3-a456-426614174000', 'Test User', 'dipendente', 'Banconisti', 'test@example.com');
```

## ⚠️ **CRITICAL REQUIREMENTS**

1. **Sicurezza**: Tutti i controlli devono essere a livello database (RLS) + frontend
2. **UX**: Loading states chiari e messaggi di errore user-friendly
3. **Performance**: Caching delle query user per evitare chiamate ripetute
4. **Consistency**: Seguire pattern esistenti nel codebase

## 🎯 **SUCCESS CRITERIA**

**Prima di procedere al prossimo step, verifica che:**

- [ ] Utente con email in staff → accede con ruolo corretto
- [ ] Utente con email NON in staff → bloccato con messaggio chiaro
- [ ] Route protette funzionano (gestione solo admin/responsabile)
- [ ] Performance accettabile (<2s per controllo autorizzazioni)
- [ ] UI responsiva su mobile
- [ ] No errori in console
- [ ] TypeScript errors risolti

## 📞 **SUPPORTO**

Consulta sempre:

- `TASKS.md` per milestone correnti
- `PLANNING.md` per architettura tecnica
- `Claude.md` per pattern di sviluppo
- Schema database in `supabase-schema.sql`

## ⏭️ **PROSSIMO STEP**

Solo DOPO aver verificato il funzionamento completo del sistema autorizzazioni, procederemo con l'implementazione del tab "Gestione" seguendo le istruzioni precedenti.

---

**IMPORTANTE: Non procedere con altre feature fino a conferma che sistema autorizzazioni funziona correttamente!**
