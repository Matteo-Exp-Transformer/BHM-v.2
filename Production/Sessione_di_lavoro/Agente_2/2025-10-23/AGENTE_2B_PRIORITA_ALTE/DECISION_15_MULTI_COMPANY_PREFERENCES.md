# DECISION IMPLEMENTATION - MULTI-COMPANY PREFERENCES

**Decisione**: 15 - Multi-Company Preferences - Creare tabella user_preferences
**Priorità**: Alta
**Agente**: 2B
**Status**: In corso
**Data inizio**: 2025-10-23
**Tempo stimato**: 2 ore

---

## 🔧 IMPLEMENTAZIONE

### **File Modificati**
- **File**: Database migration
- **Tipo modifica**: Aggiunta
- **Motivazione**: Creare tabella user_preferences per preferenze utente

### **Modifiche Apportate**
```sql
-- NUOVA TABELLA: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

### **File Modificati**
- **File**: `src/hooks/useAuth.ts`
- **Tipo modifica**: Modifica
- **Motivazione**: Utilizzare preferenze utente per selezione azienda

### **Modifiche Apportate**
```typescript
// PRIMA (selezione azienda semplice)
const activeCompanyId = companies[0].company_id

// DOPO (selezione azienda con preferenze)
// Check se user ha preferenza impostata
const { data: userPrefs } = await supabase
  .from('user_preferences')
  .select('preferred_company_id')
  .eq('user_id', user.id)
  .single()

const activeCompanyId = userPrefs?.preferred_company_id || companies[0].company_id
```

### **Dipendenze**
- **Dipende da**: Nessuna
- **Blocca**: Nessuna
- **Conflitti**: Nessuno

---

## 🧪 TEST E VALIDAZIONE

### **Test Funzionali**
- **Test**: Verifica creazione tabella user_preferences
- **Risultato**: Da eseguire
- **Output**: Da verificare
- **Note**: Testare creazione e utilizzo preferenze

### **Test Funzionali**
- **Test**: Verifica selezione azienda con preferenze
- **Risultato**: Da eseguire
- **Output**: Da verificare
- **Note**: Testare logica preferenze utente

---

## 📚 AGGIORNAMENTO DOCUMENTAZIONE

### **File Aggiornati**
- **File**: Documentazione database schema
- **Tipo aggiornamento**: Aggiunta
- **Contenuto**: Nuova tabella user_preferences

---

## 🔄 HANDOFF E COORDINAMENTO

### **Prossimo Agente**
- **Agente**: Coordinamento
- **Decisione**: Completata
- **Dipendenze**: Nessuna
- **Note**: Pronto per decisione successiva

---

**Status**: ⏳ **IN CORSO**  
**Prossimo**: Implementazione e test
