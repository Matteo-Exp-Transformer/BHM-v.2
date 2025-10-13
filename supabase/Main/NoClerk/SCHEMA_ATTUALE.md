# 📊 SCHEMA DATABASE ATTUALE - BHM v.2
**Progetto**: Business HACCP Manager v2
**Data**: 13 Ottobre 2025
**Versione**: 1.7.0
**Database**: Supabase PostgreSQL
**Branch**: NoClerk

---

## 🎯 PANORAMICA

Questo documento descrive lo schema database completo dell'applicazione BHM v.2 dopo la migrazione a Supabase Auth.

### 📋 Statistiche Schema

- **Tabelle totali**: 22 tabelle (+1 product_expiry_completions) 🆕
- **Tabelle core**: 10 (companies, departments, staff, products, conservation_points, tasks, maintenance_tasks, events, notes, non_conformities)
- **Tabelle auth**: 5 (company_members, user_sessions, user_profiles, invite_tokens, audit_logs)
- **Tabelle shopping**: 2 (shopping_lists, shopping_list_items)
- **Tabelle tracking**: 3 (user_activity_logs, task_completions, product_expiry_completions) 🆕
- **Tabelle supporto**: 2 (product_categories, temperature_readings)
- **Tabelle configurazione**: 1 (company_calendar_settings)
- **Relazioni**: 45+ foreign keys (+2 per department_id) 🆕
- **Indici**: 72+ per performance (+4 nuovi) 🆕
- **Funzioni RLS**: 9 helper functions (+1 auto_expire_products) 🆕
- **Policies RLS**: 79+ policies (+3 per product_expiry_completions) 🆕

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
| `staff_count` | INTEGER | NOT NULL, CHECK (>=0) | - | Numero dipendenti |
| `email` | VARCHAR | NOT NULL | - | Email contatto |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- ← `departments.company_id`
- ← `staff.company_id`
- ← `products.company_id`
- ← `conservation_points.company_id`
- ← `tasks.company_id`
- ← `task_completions.company_id`
- ← `company_calendar_settings.company_id` ✨ NEW (1:1 relation)
- ← `company_members.company_id`
- ← `user_sessions.active_company_id`
- ← `user_activity_logs.company_id`
- ← `audit_logs.company_id`
- ← `shopping_lists.company_id`
- ← `events.company_id`
- ← `notes.company_id`
- ← `non_conformities.company_id`

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
| `company_id` | UUID | FK → companies | - | Azienda associata (nullable) |
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
| `session_start` | TIMESTAMPTZ | NOT NULL | `now()` | Inizio sessione |
| `session_end` | TIMESTAMPTZ | - | - | Fine sessione (NULL se ancora attiva) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Sessione attiva |
| `ip_address` | INET | - | - | Indirizzo IP |
| `user_agent` | TEXT | - | - | Browser/device info |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione sessione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Constraints**:
- UNIQUE su `user_id` → Un utente può avere una sola sessione attiva

**Relazioni**:
- → `auth.users.id`
- → `companies.id`
- ← `user_activity_logs.session_id`

**Indici**:
- `idx_user_sessions_user_id` su `user_id`
- `idx_user_sessions_company_id` su `active_company_id`
- `idx_user_sessions_active` su `(user_id, active_company_id)`

**Note**: Quando un utente fa login, viene creata/aggiornata la sua sessione con l'azienda di default. Può poi cambiare azienda usando `switch_active_company()`. I campi `session_start`, `session_end` e `is_active` permettono di tracciare la durata delle sessioni per analisi e sicurezza.

---

#### `invite_tokens`
**Descrizione**: Token per invitare nuovi membri

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco token |
| `token` | VARCHAR | NOT NULL, UNIQUE | - | Token di invito (UUID generato) |
| `email` | VARCHAR | NOT NULL | - | Email destinatario |
| `company_id` | UUID | FK → companies | - | Azienda che invita (nullable) |
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

#### `user_activity_logs`
**Descrizione**: Log attività utenti per tracciamento e analytics

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco log |
| `user_id` | UUID | NOT NULL, FK → auth.users | - | Utente che ha eseguito l'attività |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di riferimento |
| `session_id` | UUID | FK → user_sessions | - | Sessione associata |
| `activity_type` | VARCHAR | NOT NULL, CHECK | - | Tipo attività |
| `activity_data` | JSONB | - | `'{}'` | Dati aggiuntivi attività |
| `entity_type` | VARCHAR | CHECK | - | Tipo entità coinvolta (opzionale) |
| `entity_id` | UUID | - | - | ID entità coinvolta |
| `timestamp` | TIMESTAMPTZ | NOT NULL | `now()` | Data/ora attività |
| `ip_address` | INET | - | - | Indirizzo IP |
| `user_agent` | TEXT | - | - | Browser/device info |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione record |

**Valori Enum - activity_type**:
- `session_start` - Inizio sessione
- `session_end` - Fine sessione
- `task_completed` - Task completato
- `product_added` - Prodotto aggiunto
- `product_updated` - Prodotto modificato
- `product_deleted` - Prodotto eliminato
- `shopping_list_created` - Lista spesa creata
- `shopping_list_updated` - Lista spesa modificata
- `shopping_list_completed` - Lista spesa completata
- `department_created` - Reparto creato
- `staff_added` - Staff aggiunto
- `conservation_point_created` - Punto conservazione creato
- `maintenance_task_created` - Task manutenzione creato
- `temperature_reading_added` - Temperatura rilevata
- `note_created` - Nota creata
- `non_conformity_reported` - Non conformità segnalata
- `page_view` - Visualizzazione pagina
- `export_data` - Esportazione dati

**Valori Enum - entity_type**:
- `maintenance_task` - Task di manutenzione
- `generic_task` - Task generico
- `product` - Prodotto
- `shopping_list` - Lista spesa
- `department` - Reparto
- `staff` - Dipendente
- `conservation_point` - Punto conservazione
- `temperature_reading` - Rilevazione temperatura
- `note` - Nota
- `non_conformity` - Non conformità

**Relazioni**:
- → `auth.users.id`
- → `companies.id`
- → `user_sessions.id` (opzionale)

**Indici**:
- `idx_user_activity_logs_user_id` su `(user_id, created_at DESC)`
- `idx_user_activity_logs_company_id` su `(company_id, created_at DESC)`
- `idx_user_activity_logs_session_id` su `session_id`
- `idx_user_activity_logs_activity_type` su `(company_id, activity_type, created_at DESC)`
- `idx_user_activity_logs_entity` su `(entity_type, entity_id)`

**Note**: Questa tabella traccia tutte le attività degli utenti per analisi comportamentali, reporting e audit non-HACCP. A differenza di `audit_logs` (focalizzata su compliance HACCP), questa tabella cattura anche attività generiche come navigazione e visualizzazioni pagina.

**Utilizzo**:
- **Analytics**: Capire quali funzioni sono più utilizzate
- **User behavior**: Tracciare pattern di utilizzo
- **Security**: Monitorare attività sospette
- **Reporting**: Generare report di utilizzo

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
- ← `task_completions.task_id`

**Indici**:
- `idx_tasks_company_id` su `company_id`
- `idx_tasks_department_id` su `department_id`
- `idx_tasks_conservation_point_id` su `conservation_point_id`
- `idx_tasks_staff_id` su `assigned_to_staff_id`
- `idx_tasks_status` su `(company_id, status)`
- `idx_tasks_next_due` su `next_due`

---

#### `task_completions`
**Descrizione**: Storico completamenti task (tracciamento esecuzioni)

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | `gen_random_uuid()` | ID univoco completamento |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda di appartenenza |
| `task_id` | UUID | NOT NULL, FK → tasks | - | Task completato |
| `completed_by` | UUID | FK → auth.users | - | Utente che ha completato |
| `completed_by_name` | TEXT | - | - | Nome completo utente (cached da auth.users metadata) |
| `completed_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data/ora completamento |
| `period_start` | TIMESTAMPTZ | NOT NULL | - | Inizio periodo di riferimento |
| `period_end` | TIMESTAMPTZ | NOT NULL | - | Fine periodo di riferimento |
| `notes` | TEXT | - | - | Note sul completamento |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione record |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `companies.id`
- → `tasks.id`
- → `auth.users.id` (opzionale)

**Indici**:
- `idx_task_completions_company_id` su `company_id`
- `idx_task_completions_task_id` su `task_id`
- `idx_task_completions_completed_by` su `completed_by`
- `idx_task_completions_completed_at` su `completed_at DESC`
- `idx_task_completions_period` su `(task_id, period_start, period_end)`
- `idx_task_completions_lookup` su `(company_id, task_id, completed_at DESC)`

**Note**:
Questa tabella mantiene uno storico completo di tutti i completamenti dei task ricorrenti. A differenza del campo `status` in `tasks` (che mostra lo stato attuale), questa tabella permette di:
- Tracciare **chi** ha completato il task e **quando**
- Associare ogni completamento a un **periodo specifico** (es. settimana 1-7 gennaio)
- Mantenere **note specifiche** per ogni esecuzione
- Generare **report storici** di compliance HACCP
- Analizzare **pattern di completamento** nel tempo

**Workflow tipico**:
1. Task ricorrente con `frequency = 'weekly'`
2. Utente completa il task → crea record in `task_completions`
3. Sistema aggiorna `tasks.next_due` per la prossima settimana
4. Record in `task_completions` rimane come prova di esecuzione per audit

**Calcolo period_start e period_end** (implementato in `useGenericTasks.ts`):
- **daily**: Giorno corrente → `period_start`: oggi 00:00, `period_end`: oggi 23:59
- **weekly**: Settimana corrente (lunedì-domenica) → `period_start`: lunedì 00:00, `period_end`: domenica 23:59
- **monthly**: Mese corrente → `period_start`: 1° giorno 00:00, `period_end`: ultimo giorno 23:59
- **annually/annual**: Anno corrente → `period_start`: 1 gen 00:00, `period_end`: 31 dic 23:59

**Verifica Completamento in Calendario** (implementato in `useAggregatedEvents.ts`):
```typescript
// Un evento è completato se la sua data cade nel periodo [period_start, period_end]
const isCompletedInPeriod = completions?.some(c => {
  if (c.task_id !== task.id) return false
  const eventTime = eventDate.getTime()
  const completionStart = c.period_start.getTime()
  const completionEnd = c.period_end.getTime()
  return eventTime >= completionStart && eventTime <= completionEnd
})
```

**Esempio**:
```sql
-- Task: "Pulizia frigorifero" (settimanale)
-- Completato da Mario il 8 Gennaio per la settimana 1-7 Gennaio
INSERT INTO task_completions (
  company_id, 
  task_id, 
  completed_by, 
  period_start, 
  period_end, 
  notes
) VALUES (
  'company-uuid',
  'task-uuid',
  'mario-user-uuid',
  '2025-01-01',
  '2025-01-07',
  'Frigorifero pulito e sanificato, temperatura corretta'
);
```

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
| `status` | VARCHAR | CHECK | `'draft'` | Status: 'draft', 'sent', 'completed', 'cancelled' |
| `notes` | TEXT | - | - | Note aggiuntive |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Valori Enum**:
- `status`: 'draft', 'sent', 'completed', 'cancelled'

**Relazioni**:
- → `companies.id`
- ← `shopping_list_items.shopping_list_id`

**Indici**:
- `idx_shopping_lists_company_id` su `company_id`
- `idx_shopping_lists_created_by` su `created_by`
- `idx_shopping_lists_is_template` su `is_template`
- `idx_shopping_lists_status` su `(company_id, status)`

**Note**: Il campo `status` permette di tracciare lo stato della lista dalla bozza all'invio al fornitore fino al completamento. `is_completed` è mantenuto per backward compatibility ma è preferibile usare `status = 'completed'`.

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
| `is_completed` | BOOLEAN | NOT NULL | `false` | Elemento completato (acquisto ricevuto) |
| `added_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data aggiunta |
| `completed_at` | TIMESTAMPTZ | - | - | Data completamento |
| `is_checked` | BOOLEAN | NOT NULL | `false` | Elemento selezionato/spuntato (nella UI) |
| `checked_at` | TIMESTAMPTZ | - | - | Data selezione |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione record |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data ultimo aggiornamento |

**Relazioni**:
- → `shopping_lists.id`
- → `products.id` (opzionale)

**Indici**:
- `idx_shopping_list_items_list_id` su `shopping_list_id`
- `idx_shopping_list_items_product_id` su `product_id`
- `idx_shopping_list_items_checked` su `(shopping_list_id, is_checked)`

**Note**: 
- `is_checked` e `checked_at` permettono agli utenti di spuntare gli elementi durante la spesa senza segnarli come completati
- `is_completed` e `completed_at` indicano l'effettivo completamento dell'acquisto (es. quando il prodotto è ricevuto in magazzino)
- Workflow tipico: utente spunta item (`is_checked = true`) → riceve merce → segna completato (`is_completed = true`)

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
  ├─→ user_sessions ────────├─→ departments ←──┐ Many-to-Many
  │      ↓                  │                  │ via array
  ├─→ user_activity_logs    ├─→ staff ─────────┘ department_assignments[]
  │                         │
  ├─→ user_profiles         ├─→ product_categories
  │                         │
  ├─→ invite_tokens         ├─→ conservation_points
  │                         │      ↓
  ├─→ audit_logs            │      ├─→ temperature_readings
  │                         │      └─→ maintenance_tasks
  └─→ task_completions      │
                            ├─→ products
                            ├─→ tasks ────────────┐
                            │      ↓              │
                            │      └─→ task_completions (storico)
                            │
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
- `tasks` → `task_completions` = **One-to-Many** (un task ha molti completamenti storici)
  - `tasks` mantiene lo stato attuale del task
  - `task_completions` mantiene lo storico di tutte le esecuzioni
  - Fondamentale per compliance HACCP e audit trail
- **Differenza tra tabelle di log**:
  - `audit_logs` → modifiche dati critiche per compliance HACCP
  - `user_activity_logs` → attività utente generiche per analytics
  - `task_completions` → storico esecuzioni task per tracciabilità HACCP

---

## 📊 STATISTICHE UTILIZZO STORAGE

### Stima Dimensioni Medie (per 100 aziende)

| Tabella | Record Stimati | Dimensione Media Record | Dimensione Totale |
|---------|----------------|-------------------------|-------------------|
| `companies` | 100 | 500 B | 50 KB |
| `departments` | 400 | 300 B | 120 KB |
| `staff` | 1,000 | 1 KB | 1 MB |
| `company_members` | 1,200 | 200 B | 240 KB |
| `user_sessions` | 100 | 300 B | 30 KB |
| `products` | 50,000 | 2 KB | 100 MB |
| `conservation_points` | 500 | 800 B | 400 KB |
| `temperature_readings` | 500,000 | 150 B | 75 MB |
| `tasks` | 5,000 | 1.5 KB | 7.5 MB |
| `task_completions` | 250,000 | 400 B | 100 MB |
| `maintenance_tasks` | 2,000 | 2 KB | 4 MB |
| `shopping_lists` | 3,000 | 500 B | 1.5 MB |
| `shopping_list_items` | 30,000 | 400 B | 12 MB |
| `audit_logs` | 100,000 | 1 KB | 100 MB |
| `user_activity_logs` | 500,000 | 500 B | 250 MB |

**Totale stimato**: ~650 MB per 100 aziende

**Note**:
- `task_completions` cresce con ogni esecuzione task (stimato ~50 completamenti/task in 1 anno)
- `user_activity_logs` cresce rapidamente con l'utilizzo attivo (ogni interazione viene tracciata)
- Si consiglia pulizia periodica di `user_activity_logs` dopo 6 mesi
- `task_completions`, `temperature_readings` e `audit_logs` devono essere mantenuti più a lungo per compliance HACCP (2+ anni)

---

## 🔧 MANUTENZIONE DATABASE

### Query di Pulizia Consigliate

```sql
-- Rimuovi user activity logs > 6 mesi (per GDPR e performance)
DELETE FROM user_activity_logs 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Rimuovi task completions > 2 anni (requisito HACCP compliance)
-- ATTENZIONE: Verificare requisiti legali specifici prima di eseguire
DELETE FROM task_completions 
WHERE completed_at < NOW() - INTERVAL '2 years';

-- Rimuovi temperature readings > 2 anni (allineato a requisito HACCP)
DELETE FROM temperature_readings 
WHERE recorded_at < NOW() - INTERVAL '2 years';

-- Rimuovi audit logs > 3 anni (conservazione estesa per audit critici)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '3 years';

-- Rimuovi invite tokens scaduti e usati
DELETE FROM invite_tokens 
WHERE used_at IS NOT NULL 
  AND used_at < NOW() - INTERVAL '30 days';

-- Rimuovi sessioni inattive > 30 giorni
DELETE FROM user_sessions 
WHERE is_active = false 
  AND session_end < NOW() - INTERVAL '30 days';
```

**⚠️ IMPORTANTE - Compliance HACCP**:
Le tabelle critiche per la compliance HACCP sono:
- `task_completions` - **2+ anni** (prova di esecuzione attività)
- `temperature_readings` - **2+ anni** (controllo catena del freddo)
- `audit_logs` - **3+ anni** (tracciabilità modifiche dati)

Verificare sempre con il consulente HACCP i tempi di conservazione specifici per il settore e la normativa locale prima di eliminare dati.

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

**Versione Schema**: 1.7.0  
**Ultimo Aggiornamento**: 13 Ottobre 2025  
**Stato**: ✅ Schema verificato e allineato con database Supabase  
**Compliance**: ✅ 100% allineamento con SQL schema attuale  
**Sistema Multi-Tenant**: ✅ Implementato con prevenzione duplicate company  
**Sistema Calendario**: ✅ Configurazione completa con contatore giorni lavorativi  
**Sistema Filtri**: ✅ Filtri calendario avanzati con reparto, stato e tipo 🆕

---

## 📝 CHANGELOG

### v1.7.0 - 13 Ottobre 2025

**🔍 Nuovo Sistema Filtri Calendario**
- ✅ **Filtri per Reparto** - Filtra eventi per reparto assegnato
  - Aggiunto campo `department_id` (opzionale) a `tasks` e `maintenance_tasks`
  - Solo reparti con eventi vengono mostrati nei filtri
  - Eventi senza reparto vengono nascosti quando filtri reparto attivi
  
- ✅ **Filtri per Stato** - 4 stati possibili
  - `to_complete`: Da completare (oggi, non completato)
  - `completed`: Completato (oggi, completato)
  - `overdue`: In ritardo (fino a 7 giorni fa, non completato)
  - `future`: Eventi futuri (da domani in poi)
  
- ✅ **Filtri per Tipo** - 3 tipi di eventi
  - `generic_task`: Mansioni/Attività generiche
  - `maintenance`: Manutenzioni (temperature, sanitization, defrosting)
  - `product_expiry`: Scadenze prodotti

**📦 Gestione Scadenze Prodotti**
- ✅ **Nuova tabella `product_expiry_completions`** - Traccia completamenti scadenze
  - Campi: `id`, `company_id`, `product_id`, `completed_by`, `completed_at`, `action`, `notes`
  - Actions: `expired` (consumato/cucinato) o `waste` (smaltito)
  - 3 RLS policies: SELECT, INSERT, DELETE (entro 24h per chi ha completato)
  - Trigger auto-update per `updated_at`
  
- ✅ **Function `auto_expire_products()`** - Scade automaticamente prodotti
  - Update status da `active` a `expired` per prodotti con `expiry_date < today`
  - Può essere chiamata da cron job o manualmente
  
- ✅ **Stati Prodotto aggiornati**
  - Rimosso stato `consumed` (merged con `expired`)
  - Stati finali: `active`, `expired`, `waste`

**🎨 UI Componenti**
- ✅ **Campo Reparto in form task** - `GenericTaskForm.tsx`
  - Dropdown "Reparto (opzionale)" con lista reparti attivi
  - Validazione e gestione errori Radix UI
  - Salvataggio `department_id` nel database
  
- ✅ **Nuovo componente `NewCalendarFilters.tsx`**
  - 3 sezioni filtri interattive
  - Chips per stati e tipi
  - Multi-select per reparti
  - Info box con spiegazione logica filtri cumulativi
  - Badge count filtri attivi
  - Pulsante Reset

**🔧 TypeScript Interfaces**
- ✅ **Nuovo file `src/types/calendar-filters.ts`**
  - `CalendarFilters` interface
  - `EventStatus` type con 4 stati
  - `EventType` type con 3 tipi
  - Utility functions: `calculateEventStatus()`, `determineEventType()`, `doesEventPassFilters()`
  - Labels, icone e colori per UI
  
- ✅ **Aggiornato `src/types/inventory.ts`**
  - Nuova interface `ProductExpiryCompletion`
  - Stati prodotto semplificati

**📊 Database Indices**
- `idx_tasks_department_id` su `tasks(department_id)`
- `idx_maintenance_tasks_department_id` su `maintenance_tasks(department_id)`
- `idx_product_expiry_completions_company_id` su `product_expiry_completions(company_id)`
- `idx_product_expiry_completions_product_id` su `product_expiry_completions(product_id)`
- `idx_product_expiry_completions_completed_by` su `product_expiry_completions(completed_by)`
- `idx_product_expiry_completions_completed_at` su `product_expiry_completions(completed_at DESC)`

**🚧 In Progress**
- ⏳ Integrazione `useAggregatedEvents` con nuova logica stati
- ⏳ Componente `ProductExpiryModal` per gestione scadenze UI
- ⏳ Sostituzione filtri legacy con `NewCalendarFilters`
- ⏳ Logica filtri cumulativi in `CalendarPage`

---

### v1.6.0 - 12 Ottobre 2025

**📅 Sistema Calendario Completato**
- ✅ **Contatore giorni lavorativi** - Calcolo automatico nell'onboarding Step 7
  - Mostra giorni totali, chiusure settimanali, chiusure programmate
  - Calcolo intelligente: evita doppi conteggi (chiusure programmate in giorni già chiusi)
  - UI visuale con percentuale apertura annuale e barra progressiva
  - Formula esplicativa: `Totali - Settimanali - Programmati = Lavorativi`
  
**🔒 RLS Policies Calendario**
- ✅ **Policies SELECT complete** - Visualizzazione dati post-onboarding
  - Policy `"Users can view company calendar settings"` per lettura
  - Policy `"Allow insert calendar settings"` per inserimento durante onboarding
  - Policy `"Users can update company calendar settings"` per modifiche
  - Tutte le tabelle core (companies, departments, staff, tasks, products, etc.) hanno policies SELECT

**🎨 UI Miglioramenti**
- ✅ **Step 7 - Calendario** aggiunto a StepNavigator
  - Icon Calendar da lucide-react
  - Descrizione: "Configura orari, chiusure e giorni lavorativi"
  - Fix TypeError per navigazione corretta
  
**🐛 Bug Fix**
- ✅ **Risolto problema dati non visibili** post-onboarding
  - Causa: Mancavano policies SELECT su tabelle principali
  - Fix: Aggiunte 8+ policies per visualizzazione dati
  - Trigger audit_logs disabilitati temporaneamente per cleanup company duplicate

**📚 Documentazione**
- ✅ Script `DEBUG_DATI_NON_VISIBILI.sql` per troubleshooting
  - Verifica dati salvati
  - Controllo policies RLS
  - Fix rapido per associazione utente-company

---

### v1.5.0 - 12 Ottobre 2025

**🎯 Sistema Multi-Company e Prevenzione Duplicate**
- ✅ **Implementato sistema DevCompanyHelper** - Previene creazione di company duplicate durante sviluppo
  - Utility `devCompanyHelper.ts` per ancorare sempre la stessa company
  - Integrazione in `onboardingHelpers.ts` per riutilizzo automatico company
  - Comandi console per gestione facile: `setDevCompany()`, `showDevCompanyInfo()`, etc.

**👥 Logica Primo Membro Admin nell'Onboarding**
- ✅ **Step 3 (Staff) ora riconosce automaticamente il primo membro come admin**
  - Email precompilata automaticamente con l'utente loggato (readonly)
  - Ruolo fisso "Amministratore" per primo membro (non modificabile)
  - Badge "👤 Tu (Admin)" visibile nel primo membro
  - Pulsante elimina nascosto per primo membro
  - `prefillOnboarding()` ora async - sostituisce primo staff con dati utente corrente

**📧 Inviti Automatici Migliorati**
- ✅ **Sistema NON genera più invito per il primo membro** (già registrato)
  - Generazione inviti salta indice 0 dell'array staff
  - Console log chiaro: "⏭️ Primo membro (utente corrente) saltato"
  - Inviti generati solo per membri da indice 1 in poi

**🔗 Collegamento Staff ↔ Company Members**
- ✅ **Primo staff member automaticamente collegato a company_member**
  - Dopo inserimento staff, aggiorna `company_members.staff_id` per utente corrente
  - Garantisce relazione bidirezionale `auth.users ↔ staff`

**📚 Documentazione Sviluppo**
- ✅ Creati script SQL per reset completo database
- ✅ Guide dettagliate per testing flusso completo (3 utenti, 1 azienda)
- ✅ Strategia sviluppo per evitare company duplicate

---

### v1.4.0 - 12 Ottobre 2025

**✨ Nuove Funzionalità - Task Completions**
- ✅ **Aggiunto campo `completed_by_name` a `task_completions`** - Memorizza il nome completo dell'utente
  - Cache del nome utente da `auth.users.user_metadata` per performance
  - Evita join complessi con auth.users ad ogni query
  - Tipo: TEXT (nullable)

**🔒 Sicurezza - Ripristino Task**
- ✅ Solo l'utente che ha completato una mansione può ripristinarla
- ✅ Messaggio di errore informativo per utenti non autorizzati
- ✅ Validazione lato UI e backend

**📊 UI Migliorata**
- ✅ Visualizzazione Nome e Cognome invece di ID utente nei log
- ✅ Formato: "Mario Rossi" o email se nome non disponibile
- ✅ Log di completamento con timestamp e utente in formato user-friendly

---

### v1.3.0 - 11 Ottobre 2025

**✨ Nuova Funzionalità - Storico Task**
- ✅ **Aggiunta tabella `task_completions`** - Storico completo di tutti i completamenti task
  - Traccia **chi**, **quando** e **per quale periodo** ogni task è stato completato
  - Note specifiche per ogni esecuzione
  - Fondamentale per **compliance HACCP** e audit trail
  - Permette report storici e analisi pattern di completamento

**🔧 Modifiche Relazioni**
- ✅ `tasks` ora ha relazione **One-to-Many** con `task_completions`
- ✅ Aggiornato diagramma ER per includere `task_completions`

**📊 Statistiche Aggiornate**
- Tabelle totali: 19 → **20 tabelle**
- Tabelle tracking: 1 → **2 tabelle** (aggiunti `task_completions`)
- Storage stimato: 550 MB → **650 MB** (per 100 aziende)
- Foreign keys: 40+ → **42+**
- Indici: 60+ → **65+**

**🔧 Manutenzione Database**
- ✅ Aggiunta query pulizia per `task_completions` (2+ anni retention per HACCP)
- ✅ Aggiornate linee guida compliance HACCP per conservazione dati

---

### v1.2.0 - 11 Ottobre 2025

**✨ Aggiunte**
- ✅ Aggiunta tabella `user_activity_logs` per tracciamento attività utenti
- ✅ Campi `status` e `notes` aggiunti a `shopping_lists`
- ✅ Campi `is_checked` e `checked_at` aggiunti a `shopping_list_items`
- ✅ Campi `session_start`, `session_end`, `is_active`, `ip_address`, `user_agent` aggiunti a `user_sessions`

**🔧 Modifiche**
- ✅ `companies.staff_count`: CHECK constraint aggiornato da `>0` a `>=0`
- ✅ `company_members.company_id`: ora nullable
- ✅ `invite_tokens.company_id`: ora nullable

**📊 Statistiche Aggiornate**
- Tabelle totali: 14 → **19 tabelle**
- Storage stimato: 290 MB → **550 MB** (per 100 aziende)
- Foreign keys: 35+ → **40+**
- Indici: 50+ → **60+**

