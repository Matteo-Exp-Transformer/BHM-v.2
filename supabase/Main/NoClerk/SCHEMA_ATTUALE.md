# 📊 SCHEMA DATABASE ATTUALE - BHM v.2
**Progetto**: Business HACCP Manager v2  
**Data**: 10 Gennaio 2025  
**Versione**: 1.1.0  
**Database**: Supabase PostgreSQL  
**Branch**: NoClerk

---

## 🎯 PANORAMICA

Questo documento descrive lo schema database completo dell'applicazione BHM v.2 dopo la migrazione a Supabase Auth.

### 📋 Statistiche Schema

- **Tabelle totali**: 14 tabelle
- **Tabelle core**: 10 (companies, departments, staff, products, conservation_points, tasks, maintenance_tasks, events, notes, non_conformities)
- **Tabelle auth**: 4 (company_members, user_sessions, invite_tokens, audit_logs)
- **Tabelle shopping**: 2 (shopping_lists, shopping_list_items)
- **Relazioni**: 35+ foreign keys
- **Indici**: 50+ per performance
- **Funzioni RLS**: 8 helper functions
- **Policies RLS**: 72+ policies (pronte, non ancora attive)

---

## 🗂️ STRUTTURA TABELLE

### 1️⃣ **CORE - Gestione Aziende**

#### `companies`
**Descrizione**: Aziende registrate nel sistema (multi-tenant)

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco azienda |
| `name` | VARCHAR | NOT NULL | - | Nome azienda |
| `address` | TEXT | NOT NULL | - | Indirizzo completo |
| `staff_count` | INTEGER | NOT NULL, CHECK (>0) | - | Numero dipendenti |
| `email` | VARCHAR | NOT NULL | - | Email contatto |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- ← `departments.company_id`
- ← `staff.company_id`
- ← `products.company_id`
- ← `conservation_points.company_id`
- ← `tasks.company_id`
- ← `company_members.company_id`

**Trigger**: `update_companies_updated_at` (aggiorna `updated_at` automaticamente)

---

#### `departments`
**Descrizione**: Reparti/aree operative dell'azienda

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco reparto |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome reparto (es. Cucina, Sala) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Reparto attivo/disattivo |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`
- ← `conservation_points.department_id`
- ← `tasks.department_id`
- ↔ `staff.department_assignments[]` (Many-to-Many via array)

**Note Importante**:
- Un reparto può avere **più dipendenti** assegnati
- La relazione Staff ↔ Departments è **Many-to-Many** implementata tramite array `staff.department_assignments[]`
- Per ottenere tutti i dipendenti di un reparto: filtra `staff` dove `department_assignments` contiene il department_id
- Esempio onboarding: quando aggiungi uno staff, puoi assegnargli più reparti contemporaneamente

**Indici**:
- `idx_departments_company_id` su `company_id`
- `idx_departments_active` su `(company_id, is_active)`

---

#### `staff`
**Descrizione**: Dipendenti e collaboratori

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco dipendente |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome completo |
| `role` | VARCHAR | NOT NULL, CHECK | - | Ruolo: 'admin', 'responsabile', 'dipendente', 'collaboratore' |
| `category` | VARCHAR | NOT NULL | - | Categoria (es. Cuochi, Camerieri) |
| `email` | VARCHAR | - | - | Email personale |
| `phone` | VARCHAR | - | - | Telefono |
| `hire_date` | DATE | - | - | Data assunzione |
| `status` | VARCHAR | NOT NULL, CHECK | `'active'` | Status: 'active', 'inactive', 'suspended' |
| `notes` | TEXT | - | - | Note aggiuntive |
| `haccp_certification` | JSONB | - | - | Certificazione HACCP {level, expiry_date, issuing_authority, certificate_number} |
| `department_assignments` | UUID[] | - | `'{}'` | **IMPORTANTE**: Array di department IDs - Relazione Many-to-Many con departments |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `role`: 'admin', 'responsabile', 'dipendente', 'collaboratore'
- `status`: 'active', 'inactive', 'suspended'

**Relazioni**:
- → `companies.id`
- ↔ `departments.id[]` via `department_assignments` (Many-to-Many)
- ← `company_members.staff_id`
- ← `tasks.assigned_to_staff_id`
- ← `maintenance_tasks.assigned_to_staff_id`

**Note Importante - Department Assignments**:
- Un dipendente può essere assegnato a **più reparti** contemporaneamente
- Campo `department_assignments` contiene array di UUID dei reparti assegnati
- Esempio: `['uuid-cucina', 'uuid-sala']` = dipendente lavora sia in Cucina che in Sala
- Durante l'onboarding: seleziona tutti i reparti dove il dipendente opera
- Query staff per reparto: `WHERE department_assignments @> ARRAY['department-uuid']`

**Indici**:
- `idx_staff_company_id` su `company_id`
- `idx_staff_email` su `email`
- `idx_staff_role` su `(company_id, role)`
- `idx_staff_status` su `(company_id, status)`

---

### 2️⃣ **AUTH - Autenticazione Supabase**

#### `company_members`
**Descrizione**: Associazione utenti ↔ aziende (multi-tenant)

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco membership |
| `user_id` | UUID | NOT NULL, FK → auth.users | - | Utente Supabase Auth |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda associata |
| `role` | VARCHAR | NOT NULL, CHECK | - | Ruolo nell'azienda |
| `staff_id` | UUID | FK → staff | - | Link al record staff (opzionale) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Membership attiva |
| `joined_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data di ingresso |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione record |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `role`: 'admin', 'responsabile', 'dipendente', 'collaboratore'

**Constraints**:
- UNIQUE su `(user_id, company_id)` → Un utente può appartenere a un'azienda una sola volta

**Relazioni**:
- → `auth.users.id`
- → `companies.id`
- → `staff.id` (opzionale)

**Indici**:
- `idx_company_members_user_id` su `user_id`
- `idx_company_members_company_id` su `company_id`
- `idx_company_members_active` su `is_active WHERE is_active = true`
- `idx_company_members_lookup` su `(user_id, company_id, is_active)`

**Note**: Questa tabella sostituisce la logica di `user_profiles.company_id` permettendo a un utente di far parte di più aziende.

---

#### `user_sessions`
**Descrizione**: Sessioni utente con azienda attiva

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco sessione |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → auth.users | - | Utente Supabase Auth |
| `active_company_id` | UUID | FK → companies | - | Azienda attualmente selezionata |
| `last_activity` | TIMESTAMPTZ | NOT NULL | `now()` | Ultima attività |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione sessione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Constraints**:
- UNIQUE su `user_id` → Un utente può avere una sola sessione attiva

**Relazioni**:
- → `auth.users.id`
- → `companies.id`

**Indici**:
- `idx_user_sessions_user_id` su `user_id`
- `idx_user_sessions_company_id` su `active_company_id`
- `idx_user_sessions_active` su `(user_id, active_company_id)`

**Note**: Quando un utente fa login, viene creata/aggiornata la sua sessione con l'azienda di default. Può poi cambiare azienda usando `switch_active_company()`.

---

#### `invite_tokens`
**Descrizione**: Token per invitare nuovi membri

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco token |
| `token` | VARCHAR | NOT NULL, UNIQUE | - | Token di invito (UUID generato) |
| `email` | VARCHAR | NOT NULL | - | Email destinatario |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda che invita |
| `role` | VARCHAR | NOT NULL, CHECK | - | Ruolo assegnato |
| `staff_id` | UUID | FK → staff | - | Link al record staff (opzionale) |
| `invited_by` | UUID | FK → auth.users | - | Chi ha creato l'invito |
| `expires_at` | TIMESTAMPTZ | NOT NULL | - | Data scadenza token |
| `used_at` | TIMESTAMPTZ | CHECK | - | Data utilizzo (NULL se non usato) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |

**Valori Enum**:
- `role`: 'admin', 'responsabile', 'dipendente', 'collaboratore'

**Constraints**:
- CHECK: `used_at IS NULL OR used_at <= now()`
- CHECK: `expires_at > created_at`

**Relazioni**:
- → `companies.id`
- → `staff.id` (opzionale)
- → `auth.users.id`

**Indici**:
- `idx_invite_tokens_token` su `token`
- `idx_invite_tokens_email` su `email`
- `idx_invite_tokens_company` su `company_id`
- `idx_invite_tokens_expired` su `expires_at WHERE used_at IS NULL`

**Workflow**:
1. Admin crea invito → genera token, imposta expires_at (es. +7 giorni)
2. Email inviata al destinatario con link contenente token
3. Destinatario clicca link, crea account Supabase Auth
4. Sistema verifica token valido, crea record in `company_members`
5. Token marcato come usato (`used_at = now()`)

---

#### `audit_logs`
**Descrizione**: Log di audit per compliance HACCP

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco log |
| `user_id` | UUID | FK → auth.users | - | Utente che ha eseguito l'azione |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di riferimento |
| `table_name` | VARCHAR | NOT NULL | - | Nome tabella modificata |
| `record_id` | UUID | NOT NULL | - | ID del record modificato |
| `action` | VARCHAR | NOT NULL, CHECK | - | Tipo azione: 'INSERT', 'UPDATE', 'DELETE', 'COMPLETE', 'APPROVE', 'REJECT' |
| `old_data` | JSONB | - | - | Dati prima della modifica |
| `new_data` | JSONB | - | - | Dati dopo la modifica |
| `user_role` | VARCHAR | - | - | Ruolo utente al momento dell'azione |
| `user_email` | VARCHAR | - | - | Email utente |
| `ip_address` | INET | - | - | Indirizzo IP |
| `user_agent` | TEXT | - | - | Browser/device info |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data/ora azione |

**Valori Enum**:
- `action`: 'INSERT', 'UPDATE', 'DELETE', 'COMPLETE', 'APPROVE', 'REJECT'

**Relazioni**:
- → `auth.users.id` (opzionale, può essere NULL per azioni di sistema)
- → `companies.id`

**Indici**:
- `idx_audit_logs_company_id` su `(company_id, created_at DESC)`
- `idx_audit_logs_user_id` su `(user_id, created_at DESC)`
- `idx_audit_logs_table_name` su `(table_name, record_id)`
- `idx_audit_logs_created_at` su `created_at DESC`
- `idx_audit_logs_haccp` su `(company_id, table_name, action, created_at DESC)`

**Note**: I log di audit sono fondamentali per la compliance HACCP. Registrano tutte le operazioni critiche per la tracciabilità.

---

#### `user_profiles`
**Descrizione**: Profili utente (DEPRECATO, in fase di migrazione)

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco profilo |
| `clerk_user_id` | VARCHAR | UNIQUE | - | **DEPRECATO** - ID Clerk (vecchio sistema) |
| `auth_user_id` | UUID | FK → auth.users | - | **NUOVO** - ID Supabase Auth |
| `company_id` | UUID | FK → companies | - | **DEPRECATO** - Ora usa company_members |
| `email` | VARCHAR | NOT NULL | - | Email utente |
| `first_name` | VARCHAR | - | - | Nome |
| `last_name` | VARCHAR | - | - | Cognome |
| `staff_id` | UUID | FK → staff | - | Link al record staff |
| `role` | VARCHAR | NOT NULL, CHECK | `'guest'` | **DEPRECATO** - Ora usa company_members.role |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `role`: 'admin', 'responsabile', 'dipendente', 'collaboratore', 'guest'

**Relazioni**:
- → `auth.users.id`
- → `companies.id`
- → `staff.id`

**⚠️ STATO MIGRAZIONE**:
- ✅ `auth_user_id` aggiunto per Supabase Auth
- ⚠️ `clerk_user_id` mantenuto temporaneamente per backward compatibility
- ⚠️ `company_id` e `role` deprecati in favore di `company_members`
- 🔜 Questa tabella sarà rimossa nelle future versioni

**Piano di migrazione**:
1. ✅ Fase 1: Aggiunto `auth_user_id` (completato)
2. ⏳ Fase 2: Codice usa `company_members` per company_id e role (in corso)
3. 🔜 Fase 3: Rimuovere `clerk_user_id`, `company_id`, `role` (futuro)
4. 🔜 Fase 4: Rinominare tabella in `user_metadata` o rimuoverla (futuro)

---

### 3️⃣ **INVENTORY - Gestione Prodotti**

#### `product_categories`
**Descrizione**: Categorie prodotti alimentari

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco categoria |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome categoria (es. Latticini, Carne) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`
- ← `products.category_id`

**Indici**:
- `idx_product_categories_company_id` su `company_id`

---

#### `products`
**Descrizione**: Prodotti in inventario

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco prodotto |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome prodotto |
| `category_id` | UUID | FK → product_categories | - | Categoria prodotto |
| `department_id` | UUID | FK → departments | - | Reparto di stoccaggio |
| `conservation_point_id` | UUID | FK → conservation_points | - | Punto di conservazione |
| `barcode` | VARCHAR | - | - | Codice a barre |
| `sku` | VARCHAR | - | - | SKU interno |
| `supplier_name` | VARCHAR | - | - | Nome fornitore |
| `purchase_date` | DATE | - | - | Data acquisto |
| `expiry_date` | DATE | - | - | Data scadenza |
| `quantity` | NUMERIC | - | - | Quantità disponibile |
| `unit` | VARCHAR | - | - | Unità di misura (kg, litri, pz) |
| `allergens` | TEXT[] | - | `'{}'` | Array allergeni |
| `label_photo_url` | TEXT | - | - | URL foto etichetta |
| `notes` | TEXT | - | - | Note aggiuntive |
| `status` | VARCHAR | NOT NULL, CHECK | `'active'` | Status: 'active', 'expired', 'consumed', 'waste' |
| `compliance_status` | VARCHAR | CHECK | - | Compliance: 'compliant', 'warning', 'non_compliant' |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `status`: 'active', 'expired', 'consumed', 'waste'
- `compliance_status`: 'compliant', 'warning', 'non_compliant'
- `allergens`: Array di stringhe (es. ['glutine', 'latte', 'uova', 'soia', 'frutta_guscio', 'arachidi', 'pesce', 'crostacei'])

**Relazioni**:
- → `companies.id`
- → `product_categories.id`
- → `departments.id`
- → `conservation_points.id`
- ← `shopping_list_items.product_id`

**Indici**:
- `idx_products_company_id` su `company_id`
- `idx_products_category_id` su `category_id`
- `idx_products_department_id` su `department_id`
- `idx_products_conservation_point_id` su `conservation_point_id`
- `idx_products_status` su `(company_id, status)`
- `idx_products_expiry_date` su `expiry_date`
- `idx_products_barcode` su `barcode`

---

### 4️⃣ **CONSERVATION - Gestione Conservazione**

#### `conservation_points`
**Descrizione**: Punti di conservazione (frigoriferi, congelatori, ecc.)

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco punto |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `department_id` | UUID | FK → departments | - | Reparto di ubicazione |
| `name` | VARCHAR | NOT NULL | - | Nome punto (es. Frigo 1) |
| `setpoint_temp` | NUMERIC | NOT NULL | - | Temperatura target (°C) |
| `type` | VARCHAR | NOT NULL, CHECK | - | Tipo: 'ambient', 'fridge', 'freezer', 'blast' |
| `product_categories` | TEXT[] | - | `'{}'` | Categorie prodotti ammessi |
| `is_blast_chiller` | BOOLEAN | NOT NULL | `false` | È un abbattitore |
| `status` | VARCHAR | NOT NULL, CHECK | `'normal'` | Status: 'normal', 'warning', 'critical' |
| `maintenance_due` | TIMESTAMPTZ | - | - | Prossima manutenzione |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `type`: 'ambient', 'fridge', 'freezer', 'blast'
- `status`: 'normal', 'warning', 'critical'

**Constraints**:
- UNIQUE su `(company_id, name)`

**Relazioni**:
- → `companies.id`
- → `departments.id`
- ← `products.conservation_point_id`
- ← `temperature_readings.conservation_point_id`
- ← `maintenance_tasks.conservation_point_id`
- ← `tasks.conservation_point_id`

**Indici**:
- `idx_conservation_points_company_id` su `company_id`
- `idx_conservation_points_department_id` su `department_id`
- `idx_conservation_points_status` su `(company_id, status)`

**Range Temperature Consigliati**:
- `ambient`: 15-25°C (setpoint: 20°C)
- `fridge`: 0-8°C (setpoint: 4°C)
- `freezer`: -25 a -15°C (setpoint: -20°C)
- `blast`: -40 a 3°C (setpoint: -18°C)

---

#### `temperature_readings`
**Descrizione**: Rilevazioni temperatura

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco lettura |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `conservation_point_id` | UUID | NOT NULL, FK → conservation_points | - | Punto di conservazione |
| `temperature` | NUMERIC | NOT NULL | - | Temperatura rilevata (°C) |
| `recorded_at` | TIMESTAMPTZ | NOT NULL | - | Data/ora rilevazione |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data inserimento record |

**Relazioni**:
- → `companies.id`
- → `conservation_points.id`

**Indici**:
- `idx_temperature_readings_company_id` su `company_id`
- `idx_temperature_readings_point_id` su `conservation_point_id`
- `idx_temperature_readings_recorded_at` su `recorded_at DESC`
- `idx_temperature_readings_lookup` su `(conservation_point_id, recorded_at DESC)`

**Note**: Le letture vengono registrate manualmente o automaticamente (se integrato con sensori IoT).

---

### 5️⃣ **TASKS - Gestione Attività**

#### `tasks`
**Descrizione**: Attività generiche ricorrenti

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco task |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome task |
| `description` | TEXT | - | - | Descrizione dettagliata |
| `frequency` | VARCHAR | NOT NULL, CHECK | - | Frequenza: 'daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom' |
| `assigned_to` | VARCHAR | NOT NULL | - | Assegnato a (ruolo/staff/categoria) |
| `assignment_type` | VARCHAR | NOT NULL, CHECK | - | Tipo assegnazione: 'role', 'staff', 'category' |
| `assigned_to_staff_id` | UUID | FK → staff | - | ID staff specifico (se assignment_type='staff') |
| `assigned_to_role` | VARCHAR | - | - | Ruolo specifico (se assignment_type='role') |
| `assigned_to_category` | VARCHAR | - | - | Categoria staff (se assignment_type='category') |
| `department_id` | UUID | FK → departments | - | Reparto di riferimento |
| `conservation_point_id` | UUID | FK → conservation_points | - | Punto conservazione (opzionale) |
| `priority` | VARCHAR | NOT NULL, CHECK | `'medium'` | Priorità: 'low', 'medium', 'high', 'critical' |
| `estimated_duration` | INTEGER | - | `60` | Durata stimata (minuti) |
| `checklist` | TEXT[] | - | `'{}'` | Lista controlli da eseguire |
| `required_tools` | TEXT[] | - | `'{}'` | Strumenti necessari |
| `haccp_category` | VARCHAR | - | - | Categoria HACCP |
| `documentation_url` | TEXT | - | - | URL documentazione |
| `validation_notes` | TEXT | - | - | Note di validazione |
| `next_due` | TIMESTAMPTZ | - | - | Prossima scadenza |
| `status` | VARCHAR | NOT NULL, CHECK | `'pending'` | Status: 'pending', 'in_progress', 'completed', 'overdue', 'cancelled' |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `frequency`: 'daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom'
- `assignment_type`: 'role', 'staff', 'category'
- `priority`: 'low', 'medium', 'high', 'critical'
- `status`: 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'

**Relazioni**:
- → `companies.id`
- → `staff.id` (opzionale)
- → `departments.id` (opzionale)
- → `conservation_points.id` (opzionale)

**Indici**:
- `idx_tasks_company_id` su `company_id`
- `idx_tasks_department_id` su `department_id`
- `idx_tasks_conservation_point_id` su `conservation_point_id`
- `idx_tasks_staff_id` su `assigned_to_staff_id`
- `idx_tasks_status` su `(company_id, status)`
- `idx_tasks_next_due` su `next_due`

---

#### `maintenance_tasks`
**Descrizione**: Task di manutenzione per punti conservazione

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco manutenzione |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `conservation_point_id` | UUID | NOT NULL, FK → conservation_points | - | Punto di conservazione |
| `title` | VARCHAR | - | - | Titolo manutenzione |
| `description` | TEXT | - | - | Descrizione dettagliata |
| `type` | VARCHAR | NOT NULL, CHECK | - | Tipo: 'temperature', 'sanitization', 'defrosting' |
| `frequency` | VARCHAR | NOT NULL, CHECK | - | Frequenza: 'daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom' |
| `assigned_to` | VARCHAR | NOT NULL | - | Assegnato a |
| `assignment_type` | VARCHAR | NOT NULL, CHECK | - | Tipo: 'role', 'staff', 'category' |
| `assigned_to_staff_id` | UUID | FK → staff | - | Staff specifico |
| `assigned_to_role` | VARCHAR | - | - | Ruolo specifico |
| `assigned_to_category` | VARCHAR | - | - | Categoria staff |
| `priority` | VARCHAR | NOT NULL, CHECK | `'medium'` | Priorità |
| `status` | VARCHAR | NOT NULL, CHECK | `'scheduled'` | Status: 'scheduled', 'in_progress', 'completed', 'overdue', 'skipped' |
| `next_due` | TIMESTAMPTZ | - | - | Prossima scadenza |
| `estimated_duration` | INTEGER | - | `60` | Durata stimata (minuti) |
| `instructions` | TEXT[] | - | `'{}'` | Istruzioni operative |
| `checklist` | TEXT[] | - | `'{}'` | Lista controlli |
| `required_tools` | TEXT[] | - | `'{}'` | Strumenti necessari |
| `safety_notes` | TEXT[] | - | `'{}'` | Note di sicurezza |
| `completion_notes` | TEXT | - | - | Note di completamento |
| `completed_by` | UUID | - | - | Chi ha completato |
| `completed_at` | TIMESTAMPTZ | - | - | Quando completato |
| `last_completed` | TIMESTAMPTZ | - | - | Ultimo completamento |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `type`: 'temperature', 'sanitization', 'defrosting'
- `frequency`: 'daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom'
- `assignment_type`: 'role', 'staff', 'category'
- `priority`: 'low', 'medium', 'high', 'critical'
- `status`: 'scheduled', 'in_progress', 'completed', 'overdue', 'skipped'

**Relazioni**:
- → `companies.id`
- → `conservation_points.id`
- → `staff.id` (opzionale)

**Indici**:
- `idx_maintenance_tasks_company_id` su `company_id`
- `idx_maintenance_tasks_point_id` su `conservation_point_id`
- `idx_maintenance_tasks_staff_id` su `assigned_to_staff_id`
- `idx_maintenance_tasks_status` su `(company_id, status)`
- `idx_maintenance_tasks_next_due` su `next_due`

**Task Types Dettagli**:
- `temperature`: Rilevamento temperatura (durata media: 30 min)
- `sanitization`: Sanificazione completa (durata media: 120 min)
- `defrosting`: Sbrinamento (durata media: 60 min)

---

### 6️⃣ **HACCP - Compliance**

#### `events`
**Descrizione**: Eventi e scadenze

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco evento |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `title` | VARCHAR | NOT NULL | - | Titolo evento |
| `description` | TEXT | - | - | Descrizione |
| `start_date` | TIMESTAMPTZ | NOT NULL | - | Data/ora inizio |
| `end_date` | TIMESTAMPTZ | - | - | Data/ora fine (opzionale) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`

**Indici**:
- `idx_events_company_id` su `company_id`
- `idx_events_start_date` su `start_date DESC`

---

#### `notes`
**Descrizione**: Note e annotazioni

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoca nota |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `title` | VARCHAR | NOT NULL | - | Titolo nota |
| `content` | TEXT | NOT NULL | - | Contenuto |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`

**Indici**:
- `idx_notes_company_id` su `company_id`
- `idx_notes_created_at` su `created_at DESC`

---

#### `non_conformities`
**Descrizione**: Non conformità riscontrate

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoca NC |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `title` | VARCHAR | NOT NULL | - | Titolo non conformità |
| `description` | TEXT | NOT NULL | - | Descrizione dettagliata |
| `severity` | VARCHAR | NOT NULL, CHECK | - | Gravità: 'low', 'medium', 'high', 'critical' |
| `status` | VARCHAR | NOT NULL, CHECK | `'open'` | Status: 'open', 'in_progress', 'resolved', 'closed' |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `severity`: 'low', 'medium', 'high', 'critical'
- `status`: 'open', 'in_progress', 'resolved', 'closed'

**Relazioni**:
- → `companies.id`

**Indici**:
- `idx_non_conformities_company_id` su `company_id`
- `idx_non_conformities_severity` su `(company_id, severity)`
- `idx_non_conformities_status` su `(company_id, status)`

---

### 7️⃣ **SHOPPING - Liste Spesa**

#### `shopping_lists`
**Descrizione**: Liste della spesa

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoca lista |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `name` | VARCHAR | NOT NULL | - | Nome lista |
| `description` | TEXT | - | - | Descrizione |
| `created_by` | UUID | - | - | Chi ha creato (FK → auth.users) |
| `is_template` | BOOLEAN | NOT NULL | `false` | È un template riutilizzabile |
| `is_completed` | BOOLEAN | NOT NULL | `false` | Lista completata |
| `completed_at` | TIMESTAMPTZ | - | - | Data completamento |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`
- ← `shopping_list_items.shopping_list_id`

**Indici**:
- `idx_shopping_lists_company_id` su `company_id`
- `idx_shopping_lists_created_by` su `created_by`
- `idx_shopping_lists_is_template` su `is_template`

---

#### `shopping_list_items`
**Descrizione**: Elementi nelle liste spesa

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco elemento |
| `shopping_list_id` | UUID | NOT NULL, FK → shopping_lists | - | Lista di appartenenza |
| `product_id` | UUID | FK → products | - | Prodotto collegato (opzionale) |
| `product_name` | VARCHAR | NOT NULL | - | Nome prodotto |
| `category_name` | VARCHAR | NOT NULL | - | Categoria prodotto |
| `quantity` | NUMERIC | NOT NULL, CHECK (>0) | `1` | Quantità da acquistare |
| `unit` | VARCHAR | - | - | Unità di misura |
| `notes` | TEXT | - | - | Note aggiuntive |
| `is_completed` | BOOLEAN | NOT NULL | `false` | Elemento completato |
| `added_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data aggiunta |
| `completed_at` | TIMESTAMPTZ | - | - | Data completamento |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione record |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `shopping_lists.id`
- → `products.id` (opzionale)

**Indici**:
- `idx_shopping_list_items_list_id` su `shopping_list_id`
- `idx_shopping_list_items_product_id` su `product_id`

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Funzioni Helper Disponibili

```sql
-- Ottiene l'ID dell'azienda attiva dell'utente corrente
get_active_company_id() → UUID

-- Verifica se l'utente è membro di un'azienda
is_company_member(p_company_id UUID) → BOOLEAN

-- Verifica se l'utente ha ruolo gestionale (admin/responsabile)
has_management_role(p_company_id UUID) → BOOLEAN

-- Verifica se l'utente è admin
is_admin(p_company_id UUID) → BOOLEAN

-- Ottiene tutte le aziende dell'utente
get_user_companies() → TABLE(company_id, company_name, user_role, is_active)

-- Crea/aggiorna la sessione utente
ensure_user_session() → UUID

-- Cambia azienda attiva
switch_active_company(p_new_company_id UUID) → BOOLEAN

-- Verifica permessi specifici
has_permission(p_company_id UUID, p_permission VARCHAR) → BOOLEAN
```

### Permessi Disponibili

- `manage_staff` → Admin, Responsabile
- `manage_departments` → Admin, Responsabile
- `view_all_tasks` → Admin, Responsabile
- `manage_conservation` → Admin, Responsabile
- `export_data` → Solo Admin
- `manage_settings` → Solo Admin

---

## 📐 DIAGRAMMA ER (Testuale)

```
auth.users (Supabase)
  ↓
  ├─→ company_members ──→ companies
  │                         ↓
  ├─→ user_sessions         ├─→ departments ←──┐ Many-to-Many
  │                         │                  │ via array
  ├─→ invite_tokens         ├─→ staff ─────────┘ department_assignments[]
  │                         │
  └─→ audit_logs            ├─→ product_categories
                            ├─→ conservation_points
                            │      ↓
                            │      ├─→ temperature_readings
                            │      └─→ maintenance_tasks
                            │
                            ├─→ products
                            ├─→ tasks
                            ├─→ events
                            ├─→ notes
                            ├─→ non_conformities
                            └─→ shopping_lists
                                   ↓
                                   └─→ shopping_list_items
```

**Relazioni Chiave**:
- `staff.department_assignments[]` ↔ `departments.id` = **Many-to-Many** (un dipendente può lavorare in più reparti)
- Implementata tramite array PostgreSQL invece di tabella junction
- Esempio: Mario lavora sia in Cucina che in Sala → `department_assignments: ['uuid-cucina', 'uuid-sala']`

---

## 📊 STATISTICHE UTILIZZO STORAGE

### Stima Dimensioni Medie (per 100 aziende)

| Tabella | Record Stimati | Dimensione Media Record | Dimensione Totale |
|---------|----------------|-------------------------|-------------------|
| `companies` | 100 | 500 B | 50 KB |
| `departments` | 400 | 300 B | 120 KB |
| `staff` | 1,000 | 1 KB | 1 MB |
| `products` | 50,000 | 2 KB | 100 MB |
| `conservation_points` | 500 | 800 B | 400 KB |
| `temperature_readings` | 500,000 | 150 B | 75 MB |
| `tasks` | 5,000 | 1.5 KB | 7.5 MB |
| `maintenance_tasks` | 2,000 | 2 KB | 4 MB |
| `audit_logs` | 100,000 | 1 KB | 100 MB |

**Totale stimato**: ~290 MB per 100 aziende

---

## 🔧 MANUTENZIONE DATABASE

### Query di Pulizia Consiglia

te

```sql
-- Rimuovi temperature readings > 1 anno
DELETE FROM temperature_readings 
WHERE recorded_at < NOW() - INTERVAL '1 year';

-- Rimuovi audit logs > 2 anni
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Rimuovi invite tokens scaduti e usati
DELETE FROM invite_tokens 
WHERE used_at IS NOT NULL 
  AND used_at < NOW() - INTERVAL '30 days';
```

### Indici da Monitorare

```sql
-- Verifica utilizzo indici
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 📝 NOTE FINALI

### Convenzioni Nomi

- Tabelle: **snake_case** plurale (es. `product_categories`)
- Campi: **snake_case** (es. `created_at`)
- Foreign Keys: `[tabella]_id` (es. `company_id`)
- Indici: `idx_[tabella]_[campo]` (es. `idx_products_company_id`)
- Constraints: `[tabella]_[campo]_[tipo]` (es. `products_status_check`)

### Tipi Dati Standard

- **ID**: `UUID` con `gen_random_uuid()`
- **Date/Time**: `TIMESTAMPTZ` (include timezone)
- **Text**: `VARCHAR` per stringhe brevi, `TEXT` per lunghe
- **Boolean**: `BOOLEAN` con default esplicito
- **Numeri**: `INTEGER` per interi, `NUMERIC` per decimali
- **Array**: `TEXT[]` o `UUID[]` espliciti
- **JSON**: `JSONB` per dati strutturati

### Audit & Timestamp

Tutte le tabelle (eccetto join tables) hanno:
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Trigger `update_[table]_updated_at` aggiorna `updated_at` automaticamente.

---

**Versione Schema**: 1.1.0  
**Ultimo Aggiornamento**: 10 Gennaio 2025  
**Stato**: ✅ Schema verificato e allineato con database Supabase  
**Compliance**: ✅ 100% allineamento con SQL schema attuale

