# 📊 REAL DATA FOR AGENTE 4 - BACKEND IMPLEMENTATION

**Data**: 2025-10-21  
**Autore**: Agente 1 - Product Strategy Lead  
**Status**: ✅ **DATI REALI CONSOLIDATI**

---

## 🎯 SCOPO DEL FILE

Fornire all'Agente 4 (Backend Agent) tutti i dati reali necessari per implementare:
- Edge Functions per validazione real-time
- RLS policies per sicurezza multi-tenant
- API endpoints per authentication components
- Database migrations per nuovi campi

---

## 🗄️ DATABASE SCHEMA ATTUALE

### **TABELLE PRINCIPALI (22 tabelle)**

#### **1. AUTHENTICATION & USERS**
```sql
-- auth.users (Supabase built-in)
- id: uuid (PK)
- email: varchar
- encrypted_password: varchar
- email_confirmed_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz

-- user_profiles (0 rows)
- id: uuid (PK)
- clerk_user_id: varchar (nullable, unique)
- auth_user_id: uuid (FK to auth.users.id) -- NEW FIELD
- company_id: uuid (FK to companies.id)
- email: varchar
- first_name: varchar (nullable)
- last_name: varchar (nullable)
- staff_id: uuid (FK to staff.id)
- role: varchar (default: 'guest') -- admin, responsabile, dipendente, collaboratore, guest
- created_at: timestamptz
- updated_at: timestamptz

-- company_members (2 rows) - Junction table N:N users-companies
- id: uuid (PK)
- user_id: uuid (FK to auth.users.id)
- company_id: uuid (FK to companies.id)
- role: varchar -- admin, responsabile, dipendente, collaboratore
- staff_id: uuid (FK to staff.id)
- is_active: boolean (default: true)
- joined_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz

-- user_sessions (2 rows) - Active company tracking
- id: uuid (PK)
- user_id: uuid (FK to auth.users.id, unique)
- active_company_id: uuid (FK to companies.id)
- last_activity: timestamptz
- session_start: timestamptz
- session_end: timestamptz (nullable)
- is_active: boolean (default: true)
- ip_address: inet (nullable)
- user_agent: text (nullable)
- created_at: timestamptz
- updated_at: timestamptz

-- invite_tokens (2 rows) - Email invites
- id: uuid (PK)
- token: varchar (unique)
- email: varchar
- company_id: uuid (FK to companies.id)
- role: varchar -- admin, responsabile, dipendente, collaboratore
- staff_id: uuid (FK to staff.id)
- invited_by: uuid (FK to auth.users.id)
- expires_at: timestamptz
- used_at: timestamptz (nullable)
- created_at: timestamptz
```

#### **2. COMPANIES & ORGANIZATION**
```sql
-- companies (7 rows) - Multi-tenant root
- id: uuid (PK)
- name: varchar
- address: text
- staff_count: integer (check: >= 0)
- email: varchar
- created_at: timestamptz
- updated_at: timestamptz

-- departments (0 rows)
- id: uuid (PK)
- company_id: uuid (FK to companies.id)
- name: varchar
- is_active: boolean (default: true)
- created_at: timestamptz
- updated_at: timestamptz

-- staff (0 rows)
- id: uuid (PK)
- company_id: uuid (FK to companies.id)
- name: varchar
- role: varchar -- admin, responsabile, dipendente, collaboratore
- category: varchar
- email: varchar (nullable)
- phone: varchar (nullable)
- hire_date: date (nullable)
- status: varchar (default: 'active') -- active, inactive, suspended
- notes: text (nullable)
- haccp_certification: jsonb (nullable)
- department_assignments: uuid[] (nullable)
- created_at: timestamptz
- updated_at: timestamptz
```

#### **3. AUDIT & SECURITY**
```sql
-- audit_logs (0 rows) - Complete audit trail
- id: uuid (PK)
- user_id: uuid (FK to auth.users.id)
- company_id: uuid (FK to companies.id)
- table_name: varchar
- record_id: uuid
- action: varchar -- INSERT, UPDATE, DELETE, COMPLETE, APPROVE, REJECT
- old_data: jsonb (nullable)
- new_data: jsonb (nullable)
- user_role: varchar (nullable)
- user_email: varchar (nullable)
- ip_address: inet (nullable)
- user_agent: text (nullable)
- created_at: timestamptz

-- user_activity_logs (9 rows) - User activity tracking
- id: uuid (PK)
- user_id: uuid (FK to auth.users.id)
- company_id: uuid (FK to companies.id)
- session_id: uuid (FK to user_sessions.id)
- activity_type: varchar -- session_start, session_end, task_completed, etc.
- activity_data: jsonb (default: {})
- entity_type: varchar (nullable) -- maintenance_task, generic_task, product, etc.
- entity_id: uuid (nullable)
- timestamp: timestamptz
- ip_address: inet (nullable)
- user_agent: text (nullable)
- created_at: timestamptz

-- security_settings (14 rows) - Company security config
- id: uuid (PK)
- company_id: uuid (FK to companies.id)
- setting_name: varchar
- setting_value: jsonb
- is_active: boolean (default: true)
- created_at: timestamptz
- updated_at: timestamptz
```

#### **4. BUSINESS LOGIC TABLES**
```sql
-- conservation_points (0 rows) - Temperature monitoring
-- temperature_readings (0 rows) - Temperature data
-- product_categories (0 rows) - Product classification
-- products (0 rows) - Inventory management
-- tasks (0 rows) - Generic tasks
-- maintenance_tasks (0 rows) - Maintenance tasks
-- events (0 rows) - Calendar events
-- notes (0 rows) - General notes
-- non_conformities (0 rows) - HACCP non-conformities
-- shopping_lists (0 rows) - Shopping lists
-- shopping_list_items (0 rows) - Shopping list items
-- task_completions (0 rows) - Task completion tracking
-- product_expiry_completions (0 rows) - Product expiry tracking
-- company_calendar_settings (0 rows) - Calendar configuration
```

---

## 🔧 EDGE FUNCTIONS ESISTENTI

### **STATUS ATTUALE**
```typescript
// Edge Functions implementate: 0
// Status: Nessuna Edge Function attualmente implementata
// Priorità: Implementare Edge Functions per validazione real-time
```

### **EDGE FUNCTIONS DA IMPLEMENTARE (P0 Critical)**

#### **1. validate-form-real-time**
```typescript
Priority: P0 - Critical
Purpose: Validazione real-time per RegisterPage e ForgotPasswordPage
Input: { field: string, value: string, formType: 'register' | 'forgot-password' }
Output: { isValid: boolean, errors: string[], suggestions?: string[] }

Validation Rules:
- Email: formato valido + unicità in user_profiles
- Password: 8+ caratteri, maiuscola, minuscola, numero, simbolo
- First/Last Name: 2+ caratteri, solo lettere
- Company: esistente in companies table
```

#### **2. auth-register**
```typescript
Priority: P0 - Critical
Purpose: Registrazione utente completa
Input: { email, password, first_name, last_name, company_id }
Output: { success: boolean, user_id?: uuid, errors?: string[] }

Actions:
- Creare auth.users record
- Creare user_profiles record
- Creare company_members record
- Creare user_sessions record
- Inviare email di conferma
- Log audit trail
```

#### **3. auth-accept-invite**
```typescript
Priority: P0 - Critical
Purpose: Accettazione invito utente
Input: { token: string, password: string, first_name: string, last_name: string }
Output: { success: boolean, user_id?: uuid, errors?: string[] }

Actions:
- Validare token in invite_tokens
- Creare auth.users record
- Creare user_profiles record
- Aggiornare company_members
- Marcare token come usato
- Log audit trail
```

#### **4. auth-recovery-request**
```typescript
Priority: P0 - Critical
Purpose: Richiesta recupero password
Input: { email: string }
Output: { success: boolean, message: string }

Actions:
- Verificare email in user_profiles
- Generare token di recupero
- Inviare email con link
- Log audit trail
```

#### **5. auth-recovery-confirm**
```typescript
Priority: P0 - Critical
Purpose: Conferma recupero password
Input: { token: string, new_password: string }
Output: { success: boolean, message: string }

Actions:
- Validare token
- Aggiornare password in auth.users
- Invalidare token
- Log audit trail
```

---

## 🔒 RLS POLICIES ATTUALE

### **STATUS RLS**
```sql
-- RLS ENABLED: Tutte le 22 tabelle hanno RLS abilitato
-- DEFAULT POLICY: Deny all (sicurezza by default)
-- MULTI-TENANT: Tutte le tabelle filtrano per company_id
```

### **RLS POLICIES DA IMPLEMENTARE (P0 Critical)**

#### **1. user_profiles**
```sql
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
FOR SELECT USING (auth_user_id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth_user_id = auth.uid());

-- Policy: Admins can read all profiles in their company
CREATE POLICY "Admins can read company profiles" ON user_profiles
FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### **2. company_members**
```sql
-- Policy: Users can read their own memberships
CREATE POLICY "Users can read own memberships" ON company_members
FOR SELECT USING (user_id = auth.uid());

-- Policy: Admins can manage company memberships
CREATE POLICY "Admins can manage memberships" ON company_members
FOR ALL USING (
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### **3. invite_tokens**
```sql
-- Policy: Anonymous users can read valid tokens
CREATE POLICY "Anonymous can read valid tokens" ON invite_tokens
FOR SELECT USING (
  token = current_setting('request.jwt.claims', true)::json->>'token'
  AND expires_at > now()
  AND used_at IS NULL
);

-- Policy: Admins can create invite tokens
CREATE POLICY "Admins can create invites" ON invite_tokens
FOR INSERT WITH CHECK (
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## 📊 PERFORMANCE METRICS ATTUALE

### **DATABASE PERFORMANCE**
```typescript
// Tabelle con dati reali:
- companies: 7 rows
- company_members: 2 rows  
- user_sessions: 2 rows
- invite_tokens: 2 rows
- user_activity_logs: 9 rows
- security_settings: 14 rows

// Tabelle vuote (da popolare):
- user_profiles: 0 rows
- departments: 0 rows
- staff: 0 rows
- audit_logs: 0 rows
- conservation_points: 0 rows
- temperature_readings: 0 rows
- product_categories: 0 rows
- products: 0 rows
- tasks: 0 rows
- maintenance_tasks: 0 rows
- events: 0 rows
- notes: 0 rows
- non_conformities: 0 rows
- shopping_lists: 0 rows
- shopping_list_items: 0 rows
- task_completions: 0 rows
- product_expiry_completions: 0 rows
- company_calendar_settings: 0 rows
```

### **API PERFORMANCE TARGET**
```typescript
// Target Performance:
- API Response Time: <500ms
- Database Query Time: <200ms
- Edge Function Execution: <300ms
- Concurrent Users: 100+
- Data Transfer: <1MB per request
```

---

## 🧪 TEST DATA REALI

### **COMPANIES TEST DATA**
```json
{
  "companies": [
    {
      "id": "uuid-1",
      "name": "Ristorante da Mario",
      "address": "Via Roma 123, Milano",
      "staff_count": 15,
      "email": "info@ristorantedamario.it"
    },
    {
      "id": "uuid-2", 
      "name": "Pizzeria Bella Vista",
      "address": "Corso Italia 45, Napoli",
      "staff_count": 8,
      "email": "contatti@pizzeriabellavista.it"
    }
  ]
}
```

### **USER SESSIONS TEST DATA**
```json
{
  "user_sessions": [
    {
      "id": "session-uuid-1",
      "user_id": "user-uuid-1",
      "active_company_id": "uuid-1",
      "last_activity": "2025-10-21T10:30:00Z",
      "is_active": true,
      "ip_address": "192.168.1.100"
    }
  ]
}
```

### **SECURITY SETTINGS TEST DATA**
```json
{
  "security_settings": [
    {
      "company_id": "uuid-1",
      "setting_name": "password_policy",
      "setting_value": {
        "min_length": 8,
        "require_uppercase": true,
        "require_lowercase": true,
        "require_numbers": true,
        "require_symbols": true
      },
      "is_active": true
    },
    {
      "company_id": "uuid-1",
      "setting_name": "session_timeout",
      "setting_value": {
        "timeout_minutes": 480,
        "extend_on_activity": true
      },
      "is_active": true
    }
  ]
}
```

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE AGENTE 4

### **SETTIMANA 1 - P0 CRITICAL**

#### **1. Edge Functions (3 giorni)**
```typescript
Priority: P0 - Critical
Timeline: 3 giorni
Effort: High

Tasks:
- Implementare validate-form-real-time
- Implementare auth-register
- Implementare auth-accept-invite
- Testare con dati reali
- Deploy in produzione
```

#### **2. RLS Policies (2 giorni)**
```typescript
Priority: P0 - Critical
Timeline: 2 giorni
Effort: Medium

Tasks:
- Implementare policies per user_profiles
- Implementare policies per company_members
- Implementare policies per invite_tokens
- Testare isolamento multi-tenant
- Verificare sicurezza
```

### **SETTIMANA 2 - P1 HIGH**

#### **1. Database Migrations (1 giorno)**
```typescript
Priority: P1 - High
Timeline: 1 giorno
Effort: Low

Tasks:
- Aggiungere campo email_verified_at
- Aggiungere campo password_strength_score
- Aggiungere campo validation_attempts
- Testare migration
- Documentare cambiamenti
```

#### **2. Performance Optimization (2 giorni)**
```typescript
Priority: P1 - High
Timeline: 2 giorni
Effort: Medium

Tasks:
- Ottimizzare query database
- Implementare caching
- Ridurre latency API
- Monitorare performance
- Testare con load testing
```

#### **3. Unit Tests (2 giorni)**
```typescript
Priority: P1 - High
Timeline: 2 giorni
Effort: Medium

Tasks:
- Testare Edge Functions (target: ≥80% coverage)
- Testare RLS policies
- Testare API endpoints
- Testare error handling
- Testare rate limiting
```

### **SETTIMANA 3 - P2 MEDIUM**

#### **1. Integration Tests (2 giorni)**
```typescript
Priority: P2 - Medium
Timeline: 2 giorni
Effort: Medium

Tasks:
- Testare flusso registrazione completo
- Testare flusso recupero password
- Testare flusso accettazione invito
- Testare sicurezza multi-tenant
- Verificare audit trail
```

#### **2. API Documentation (1 giorno)**
```typescript
Priority: P2 - Medium
Timeline: 1 giorno
Effort: Low

Tasks:
- Documentare Edge Functions
- Documentare API endpoints
- Documentare error codes
- Creare Postman collection
- Aggiornare README
```

---

## ✅ DEFINITION OF DONE

### **CRITERI DI SUCCESSO AGENTE 4**
```typescript
// Edge Functions:
✅ validate-form-real-time implementata e testata
✅ auth-register implementata e testata
✅ auth-accept-invite implementata e testata
✅ auth-recovery-request implementata e testata
✅ auth-recovery-confirm implementata e testata

// RLS Policies:
✅ user_profiles policies create e verificate
✅ company_members policies create e verificate
✅ invite_tokens policies create e verificate
✅ Multi-tenant isolation testata
✅ Security audit passato

// Testing:
✅ Unit tests ≥80% coverage
✅ Integration tests 100% passano
✅ Performance tests <500ms API response
✅ Load testing 100+ concurrent users

// Documentation:
✅ API documentation aggiornata
✅ Edge Functions documentate
✅ Error codes documentati
✅ Postman collection creata
```

---

## 🚀 RACCOMANDAZIONI IMMEDIATE

### **PER AGENTE 4**

#### **1. Leggere File Obbligatori**
```markdown
File da leggere prima di iniziare:
1. Production/Sessione_di_lavoro/Agente_2/2025-10-21/MAPPATURA_COMPLETA_COMPONENTI.md
2. Production/Sessione_di_lavoro/Agente_3/2025-10-21/TEST_CASES_SPECIFICI_AUTHENTICATION.md
3. Production/Sessione_di_lavoro/Agente_3/2025-10-21/TESTING_COMPONENTI_REALI.md
4. Production/Sessione_di_lavoro/Agente_1/2025-10-21/REAL_DATA_FOR_AGENTE_4.md (questo file)
```

#### **2. Implementare Priorità P0**
```markdown
Focus immediato:
1. Edge Functions per validazione real-time
2. RLS policies per sicurezza multi-tenant
3. API endpoints per authentication components
```

#### **3. Testare con Dati Reali**
```markdown
Usare sempre:
- Test data reali forniti in questo file
- Utenti reali per test di sicurezza
- Performance reali per ottimizzazione
```

---

## 📋 HANDOFF PACKAGE COMPLETO

### **INFORMAZIONI CRITICHE**
- **Database**: 22 tabelle con RLS abilitato
- **Edge Functions**: 0 implementate (da creare 5)
- **RLS Policies**: Default deny (da implementare policies specifiche)
- **Test Data**: 7 companies, 2 user_sessions, 14 security_settings
- **Performance Target**: <500ms API response

### **PRIORITÀ IMPLEMENTAZIONE**
- **Settimana 1**: Edge Functions + RLS Policies (P0 Critical)
- **Settimana 2**: Database Migrations + Performance + Unit Tests (P1 High)
- **Settimana 3**: Integration Tests + API Documentation (P2 Medium)

### **CRITERI DI SUCCESSO**
- Edge Functions implementate e testate
- RLS policies create e verificate
- Unit tests ≥80% coverage
- API documentation aggiornata
- Performance <500ms API response

---

**📅 Data**: 2025-10-21  
**👤 Autore**: Agente 1 - Product Strategy Lead  
**🎯 Status**: ✅ **DATI REALI CONSOLIDATI**

**🚀 Prossimo step**: Agente 4 implementa Edge Functions e RLS Policies basandosi su questi dati reali.
