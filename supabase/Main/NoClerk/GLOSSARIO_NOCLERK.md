# 📖 GLOSSARIO NoClerk - TypeScript ↔ Database
**Progetto**: Business HACCP Manager v.2  
**Versione**: 1.0.0 (Post-migrazione Supabase Auth)  
**Data**: 9 Gennaio 2025

---

## 🎯 SCOPO DEL DOCUMENTO

Questo glossario garantisce la **compliance perfetta** tra:
- ✅ Interfacce TypeScript frontend
- ✅ Schema database Supabase
- ✅ Query Supabase client
- ✅ RLS Policies
- ✅ Funzioni helper

**Regola d'oro**: Ogni modifica allo schema database DEVE essere riflessa qui e viceversa.

---

## 📋 INDICE

1. [Interfacce TypeScript Complete](#1-interfacce-typescript-complete)
2. [Enum Types Reference](#2-enum-types-reference)
3. [Mapping Campi Database → TypeScript](#3-mapping-campi-database--typescript)
4. [Query Patterns Comuni](#4-query-patterns-comuni)
5. [RLS Helper Functions](#5-rls-helper-functions)
6. [Migration Guide: Clerk → Supabase Auth](#6-migration-guide-clerk--supabase-auth)
7. [Validation Rules](#7-validation-rules)
8. [Best Practices](#8-best-practices)
9. [Features Recenti](#9-features-recenti)
10. [Pulsanti e Controlli UI](#10-pulsanti-e-controlli-ui)

---

## 1. INTERFACCE TYPESCRIPT COMPLETE

### 1.1 AUTH & MULTI-TENANT

#### `CompanyMember`
```typescript
// Tabella: company_members
export interface CompanyMember {
  id: string                    // UUID
  user_id: string              // UUID → auth.users.id
  company_id: string           // UUID → companies.id
  role: StaffRole              // CHECK: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  staff_id: string | null      // UUID → staff.id (opzionale)
  is_active: boolean           // DEFAULT: true
  joined_at: Date              // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

// Form per creazione
export interface CreateCompanyMemberInput {
  user_id: string
  company_id: string
  role: StaffRole
  staff_id?: string
}

// Form per aggiornamento
export interface UpdateCompanyMemberInput {
  role?: StaffRole
  staff_id?: string | null
  is_active?: boolean
}
```

#### `UserSession`
```typescript
// Tabella: user_sessions
export interface UserSession {
  id: string                    // UUID
  user_id: string              // UUID → auth.users.id (UNIQUE)
  active_company_id: string | null  // UUID → companies.id
  last_activity: Date          // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

// Helper per switch company
export interface SwitchCompanyInput {
  new_company_id: string
}
```

#### `InviteToken`
```typescript
// Tabella: invite_tokens
export interface InviteToken {
  id: string                    // UUID
  token: string                // VARCHAR UNIQUE
  email: string                // VARCHAR
  company_id: string           // UUID → companies.id
  role: StaffRole              // CHECK enum
  staff_id: string | null      // UUID → staff.id
  invited_by: string | null    // UUID → auth.users.id
  expires_at: Date             // TIMESTAMPTZ
  used_at: Date | null         // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
}

// Form per creazione invito
export interface CreateInviteInput {
  email: string
  company_id: string
  role: StaffRole
  staff_id?: string
  expires_in_days?: number     // Default: 7
}

// Workflow types
export interface AcceptInviteInput {
  token: string
  password: string             // Per creazione account
  first_name?: string
  last_name?: string
}
```

#### `AuditLog`
```typescript
// Tabella: audit_logs
export interface AuditLog {
  id: string                    // UUID
  user_id: string | null       // UUID → auth.users.id
  company_id: string           // UUID → companies.id
  table_name: string           // VARCHAR
  record_id: string            // UUID
  action: AuditAction          // CHECK enum
  old_data: Record<string, any> | null  // JSONB
  new_data: Record<string, any> | null  // JSONB
  user_role: string | null     // VARCHAR
  user_email: string | null    // VARCHAR
  ip_address: string | null    // INET → convertito in string
  user_agent: string | null    // TEXT
  created_at: Date             // TIMESTAMPTZ
}

// Form per creazione log
export interface CreateAuditLogInput {
  table_name: string
  record_id: string
  action: AuditAction
  old_data?: Record<string, any>
  new_data?: Record<string, any>
}
```

#### `UserProfile` ⚠️ DEPRECATO
```typescript
// Tabella: user_profiles (IN FASE DI MIGRAZIONE)
export interface UserProfile {
  id: string                    // UUID
  clerk_user_id: string | null // VARCHAR UNIQUE (DEPRECATO)
  auth_user_id: string | null  // UUID → auth.users.id (NUOVO)
  company_id: string | null    // UUID → companies.id (DEPRECATO - usa company_members)
  email: string                // VARCHAR
  first_name: string | null    // VARCHAR
  last_name: string | null     // VARCHAR
  staff_id: string | null      // UUID → staff.id
  role: StaffRole              // CHECK enum (DEPRECATO - usa company_members.role)
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

// ⚠️ NOTA: Questa interfaccia sarà rimossa nelle prossime versioni
// Usa invece CompanyMember per gestire ruoli e aziende
```

---

### 1.2 CORE ENTITIES

#### `Company`
```typescript
// Tabella: companies
export interface Company {
  id: string                    // UUID
  name: string                 // VARCHAR
  address: string              // TEXT
  staff_count: number          // INTEGER CHECK (>0)
  email: string                // VARCHAR
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateCompanyInput {
  name: string
  address: string
  staff_count: number
  email: string
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string
}
```

#### `Department`
```typescript
// Tabella: departments
export interface Department {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  is_active: boolean           // BOOLEAN DEFAULT true
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateDepartmentInput {
  name: string
  is_active?: boolean          // Default: true
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  id: string
}
```

#### `StaffMember`
```typescript
// Tabella: staff
export interface StaffMember {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  role: StaffRole              // CHECK enum
  category: string             // VARCHAR
  email: string | null         // VARCHAR
  phone: string | null         // VARCHAR
  hire_date: string | null     // DATE → string 'YYYY-MM-DD'
  status: StaffStatus          // CHECK enum, DEFAULT 'active'
  notes: string | null         // TEXT
  haccp_certification: HaccpCertification | null  // JSONB
  department_assignments: string[]  // UUID[] → **IMPORTANTE**: Many-to-Many con departments
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

// ⚠️ NOTA IMPORTANTE: Department Assignments
// - Un dipendente può lavorare in MULTIPLI reparti (es. Cucina + Sala)
// - department_assignments è un array di UUID dei reparti assegnati
// - Durante l'onboarding, seleziona tutti i reparti dove opera il dipendente
// - Esempi: ['uuid-cucina', 'uuid-sala', 'uuid-magazzino']

// JSONB structure
export interface HaccpCertification {
  level: 'base' | 'advanced'
  expiry_date: string          // ISO date string
  issuing_authority: string
  certificate_number: string
}

export interface CreateStaffInput {
  name: string
  role: StaffRole
  category: string
  email?: string
  phone?: string
  hire_date?: string           // 'YYYY-MM-DD'
  status?: StaffStatus
  notes?: string
  haccp_certification?: HaccpCertification
  department_assignments?: string[]
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  id: string
}
```

---

### 1.3 CONSERVATION & TEMPERATURE

#### `ConservationPoint`
```typescript
// Tabella: conservation_points
export interface ConservationPoint {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  department_id: string | null // UUID → departments.id
  name: string                 // VARCHAR
  setpoint_temp: number        // NUMERIC → Temperatura target in °C
  type: ConservationPointType  // CHECK enum
  product_categories: string[] // TEXT[] → array di nomi categorie
  is_blast_chiller: boolean    // BOOLEAN DEFAULT false
  status: ConservationStatus   // CHECK enum, DEFAULT 'normal'
  maintenance_due: Date | null // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateConservationPointInput {
  name: string
  department_id?: string
  setpoint_temp: number
  type: ConservationPointType
  product_categories?: string[]
  is_blast_chiller?: boolean
}

export interface UpdateConservationPointInput extends Partial<CreateConservationPointInput> {
  id: string
  status?: ConservationStatus
  maintenance_due?: Date | null
}
```

#### `TemperatureReading`
```typescript
// Tabella: temperature_readings
export interface TemperatureReading {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  conservation_point_id: string // UUID → conservation_points.id
  temperature: number          // NUMERIC → Temperatura in °C
  recorded_at: Date            // TIMESTAMPTZ → Quando è stata rilevata
  created_at: Date             // TIMESTAMPTZ → Quando è stata inserita nel DB
}

export interface CreateTemperatureReadingInput {
  conservation_point_id: string
  temperature: number
  recorded_at?: Date           // Default: now()
}

// Computed interface per visualizzazione
export interface TemperatureReadingWithStatus extends TemperatureReading {
  conservation_point?: ConservationPoint
  status: TemperatureStatus    // Calcolato: 'compliant' | 'warning' | 'critical'
  deviation: number            // Differenza da setpoint_temp
}
```

---

### 1.4 INVENTORY

#### `ProductCategory`
```typescript
// Tabella: product_categories
export interface ProductCategory {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateProductCategoryInput {
  name: string
}

export interface UpdateProductCategoryInput extends Partial<CreateProductCategoryInput> {
  id: string
}
```

#### `Product`
```typescript
// Tabella: products
export interface Product {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  category_id: string | null   // UUID → product_categories.id
  department_id: string | null // UUID → departments.id
  conservation_point_id: string | null  // UUID → conservation_points.id
  barcode: string | null       // VARCHAR
  sku: string | null           // VARCHAR
  supplier_name: string | null // VARCHAR
  purchase_date: string | null // DATE → 'YYYY-MM-DD'
  expiry_date: string | null   // DATE → 'YYYY-MM-DD'
  quantity: number | null      // NUMERIC
  unit: string | null          // VARCHAR (es. 'kg', 'litri', 'pz')
  allergens: string[]          // TEXT[] → ['glutine', 'latte', ...]
  label_photo_url: string | null  // TEXT
  notes: string | null         // TEXT
  status: ProductStatus        // CHECK enum, DEFAULT 'active'
  compliance_status: ComplianceStatus | null  // CHECK enum
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateProductInput {
  name: string
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  barcode?: string
  sku?: string
  supplier_name?: string
  purchase_date?: string       // 'YYYY-MM-DD'
  expiry_date?: string         // 'YYYY-MM-DD'
  quantity?: number
  unit?: string
  allergens?: string[]
  label_photo_url?: string
  notes?: string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
  status?: ProductStatus
  compliance_status?: ComplianceStatus
}
```

---

### 1.5 TASKS & MAINTENANCE

#### `Task`
```typescript
// Tabella: tasks
export interface Task {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  description: string | null   // TEXT
  frequency: TaskFrequency     // CHECK enum
  assigned_to: string          // VARCHAR → Valore generico
  assignment_type: AssignmentType  // CHECK enum
  assigned_to_staff_id: string | null  // UUID → staff.id
  assigned_to_role: string | null      // VARCHAR
  assigned_to_category: string | null  // VARCHAR
  department_id: string | null         // UUID → departments.id
  conservation_point_id: string | null // UUID → conservation_points.id
  priority: PriorityLevel      // CHECK enum, DEFAULT 'medium'
  estimated_duration: number   // INTEGER → Minuti, DEFAULT 60
  checklist: string[]          // TEXT[]
  required_tools: string[]     // TEXT[]
  haccp_category: string | null  // VARCHAR
  documentation_url: string | null  // TEXT
  validation_notes: string | null   // TEXT
  next_due: Date | null        // TIMESTAMPTZ
  status: TaskStatus           // CHECK enum, DEFAULT 'pending'
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

#### `TaskCompletion`
```typescript
// Tabella: task_completions
export interface TaskCompletion {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  task_id: string              // UUID → tasks.id ON DELETE CASCADE
  completed_by: string | null  // UUID → auth.users.id
  completed_at: Date           // TIMESTAMPTZ DEFAULT now()
  period_start: Date           // TIMESTAMPTZ NOT NULL
  period_end: Date             // TIMESTAMPTZ NOT NULL
  notes: string | null         // TEXT
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

// Period Tracking:
// - daily: giorno corrente (00:00 - 23:59)
// - weekly: settimana corrente (lunedì 00:00 - domenica 23:59)
// - monthly: mese corrente (1° giorno 00:00 - ultimo giorno 23:59)
// - annually: anno corrente (1 gen 00:00 - 31 dic 23:59)

export interface CompleteTaskInput {
  taskId: string
  notes?: string
}

export interface CreateTaskInput {
  name: string
  description?: string
  frequency: TaskFrequency
  assigned_to_role?: string
  assigned_to_staff_id?: string
  assigned_to_category?: string
  department_id?: string
  conservation_point_id?: string
  priority?: PriorityLevel
  estimated_duration?: number
  checklist?: string[]
  required_tools?: string[]
  haccp_category?: string
  documentation_url?: string
  validation_notes?: string
  next_due?: Date
  start_date?: string  // Data di inizio in formato ISO (YYYY-MM-DD) - Se specificata, l'attività parte da questa data
  end_date?: string    // Data di fine in formato ISO (YYYY-MM-DD) - Limita espansione eventi a questa data
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
  status?: TaskStatus
}

export interface CompleteTaskInput {
  taskId: string
  notes?: string
}
```

#### `MaintenanceTask`
```typescript
// Tabella: maintenance_tasks
export interface MaintenanceTask {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  conservation_point_id: string  // UUID → conservation_points.id
  title: string | null         // VARCHAR
  description: string | null   // TEXT
  type: MaintenanceType        // CHECK enum
  frequency: MaintenanceFrequency  // CHECK enum
  assigned_to: string          // VARCHAR
  assignment_type: AssignmentType  // CHECK enum
  assigned_to_staff_id: string | null  // UUID → staff.id
  assigned_to_role: string | null      // VARCHAR
  assigned_to_category: string | null  // VARCHAR
  priority: PriorityLevel      // CHECK enum, DEFAULT 'medium'
  status: MaintenanceStatus    // CHECK enum, DEFAULT 'scheduled'
  next_due: Date | null        // TIMESTAMPTZ
  estimated_duration: number   // INTEGER → Minuti, DEFAULT 60
  instructions: string[]       // TEXT[]
  checklist: string[]          // TEXT[]
  required_tools: string[]     // TEXT[]
  safety_notes: string[]       // TEXT[]
  completion_notes: string | null  // TEXT
  completed_by: string | null  // UUID → user ID (non FK in schema)
  completed_at: Date | null    // TIMESTAMPTZ
  last_completed: Date | null  // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateMaintenanceTaskInput {
  conservation_point_id: string
  title?: string
  description?: string
  type: MaintenanceType
  frequency: MaintenanceFrequency
  assigned_to_role?: string
  assigned_to_staff_id?: string
  assigned_to_category?: string
  priority?: PriorityLevel
  next_due?: Date
  estimated_duration?: number
  instructions?: string[]
  checklist?: string[]
  required_tools?: string[]
  safety_notes?: string[]
}

export interface UpdateMaintenanceTaskInput extends Partial<CreateMaintenanceTaskInput> {
  id: string
  status?: MaintenanceStatus
}

export interface CompleteMaintenanceInput {
  id: string
  completion_notes?: string
  completed_at?: Date          // Default: now()
  next_due?: Date              // Calcola prossima scadenza
}
```

---

### 1.6 HACCP & COMPLIANCE

#### `Event`
```typescript
// Tabella: events
export interface Event {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  title: string                // VARCHAR
  description: string | null   // TEXT
  start_date: Date             // TIMESTAMPTZ
  end_date: Date | null        // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateEventInput {
  title: string
  description?: string
  start_date: Date
  end_date?: Date
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string
}
```

#### `Note`
```typescript
// Tabella: notes
export interface Note {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  title: string                // VARCHAR
  content: string              // TEXT
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateNoteInput {
  title: string
  content: string
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: string
}
```

#### `NonConformity`
```typescript
// Tabella: non_conformities
export interface NonConformity {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  title: string                // VARCHAR
  description: string          // TEXT
  severity: SeverityLevel      // CHECK enum
  status: NonConformityStatus  // CHECK enum, DEFAULT 'open'
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateNonConformityInput {
  title: string
  description: string
  severity: SeverityLevel
  status?: NonConformityStatus  // Default: 'open'
}

export interface UpdateNonConformityInput extends Partial<CreateNonConformityInput> {
  id: string
}
```

---

### 1.7 SHOPPING LISTS

#### `ShoppingList`
```typescript
// Tabella: shopping_lists
export interface ShoppingList {
  id: string                    // UUID
  company_id: string           // UUID → companies.id
  name: string                 // VARCHAR
  description: string | null   // TEXT
  created_by: string | null    // UUID → auth.users.id (⚠️ non FK nello schema)
  is_template: boolean         // BOOLEAN DEFAULT false
  is_completed: boolean        // BOOLEAN DEFAULT false
  completed_at: Date | null    // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateShoppingListInput {
  name: string
  description?: string
  is_template?: boolean        // Default: false
}

export interface UpdateShoppingListInput extends Partial<CreateShoppingListInput> {
  id: string
  is_completed?: boolean
  completed_at?: Date | null
}
```

#### `ShoppingListItem`
```typescript
// Tabella: shopping_list_items
export interface ShoppingListItem {
  id: string                    // UUID
  shopping_list_id: string     // UUID → shopping_lists.id
  product_id: string | null    // UUID → products.id
  product_name: string         // VARCHAR
  category_name: string        // VARCHAR
  quantity: number             // NUMERIC CHECK (>0), DEFAULT 1
  unit: string | null          // VARCHAR
  notes: string | null         // TEXT
  is_completed: boolean        // BOOLEAN DEFAULT false
  added_at: Date               // TIMESTAMPTZ
  completed_at: Date | null    // TIMESTAMPTZ
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface CreateShoppingListItemInput {
  shopping_list_id: string
  product_id?: string
  product_name: string
  category_name: string
  quantity?: number            // Default: 1
  unit?: string
  notes?: string
}

export interface UpdateShoppingListItemInput extends Partial<Omit<CreateShoppingListItemInput, 'shopping_list_id'>> {
  id: string
  is_completed?: boolean
  completed_at?: Date | null
}
```

---

## 2. ENUM TYPES REFERENCE

### 2.1 Staff & Roles

```typescript
// Ruoli staff/utenti (usato in staff.role, company_members.role, user_profiles.role)
export type StaffRole = 
  | 'admin'           // Amministratore completo
  | 'responsabile'    // Responsabile/Manager
  | 'dipendente'      // Dipendente standard
  | 'collaboratore'   // Collaboratore esterno

// Status staff (usato in staff.status)
export type StaffStatus = 
  | 'active'          // Attivo
  | 'inactive'        // Inattivo
  | 'suspended'       // Sospeso

// Categorie staff predefinite (staff.category)
export const STAFF_CATEGORIES = [
  'Amministratore',
  'Banconisti',
  'Cuochi',
  'Camerieri',
  'Social & Media Manager',
  'Addetto alle Pulizie',
  'Magazziniere',
  'Altro',
] as const

export type StaffCategory = typeof STAFF_CATEGORIES[number]
```

### 2.2 Conservation & Temperature

```typescript
// Tipi punti di conservazione (conservation_points.type)
export type ConservationPointType = 
  | 'ambient'         // Temperatura ambiente (15-25°C)
  | 'fridge'          // Frigorifero (0-8°C)
  | 'freezer'         // Congelatore (-25 a -15°C)
  | 'blast'           // Abbattitore (-40 a 3°C)

// Status punti conservazione (conservation_points.status)
export type ConservationStatus = 
  | 'normal'          // Tutto normale
  | 'warning'         // Attenzione richiesta
  | 'critical'        // Situazione critica

// Status temperature (calcolato, non in DB)
export type TemperatureStatus = 
  | 'compliant'       // Conforme (entro tolleranza)
  | 'warning'         // Warning (vicino ai limiti)
  | 'critical'        // Critico (fuori limiti)
```

### 2.3 Tasks & Maintenance

```typescript
// Frequenze task (tasks.frequency, maintenance_tasks.frequency)
export type TaskFrequency = 
  | 'daily'           // Giornaliera
  | 'weekly'          // Settimanale
  | 'monthly'         // Mensile
  | 'quarterly'       // Trimestrale
  | 'biannually'      // Semestrale
  | 'annually'        // Annuale
  | 'annual'          // Annuale (alias)
  | 'as_needed'       // Al bisogno
  | 'custom'          // Personalizzata

// Tipo assegnazione (tasks.assignment_type, maintenance_tasks.assignment_type)
export type AssignmentType = 
  | 'role'            // Assegnato a un ruolo
  | 'staff'           // Assegnato a persona specifica
  | 'category'        // Assegnato a categoria

// Priorità (tasks.priority, maintenance_tasks.priority)
export type PriorityLevel = 
  | 'low'             // Bassa
  | 'medium'          // Media
  | 'high'            // Alta
  | 'critical'        // Critica

// Status task generici (tasks.status)
export type TaskStatus = 
  | 'pending'         // In attesa
  | 'in_progress'     // In corso
  | 'completed'       // Completato
  | 'overdue'         // Scaduto
  | 'cancelled'       // Annullato

// Status manutenzioni (maintenance_tasks.status)
export type MaintenanceStatus = 
  | 'scheduled'       // Programmato
  | 'in_progress'     // In corso
  | 'completed'       // Completato
  | 'overdue'         // Scaduto
  | 'skipped'         // Saltato

// Tipi manutenzione (maintenance_tasks.type)
export type MaintenanceType = 
  | 'temperature'     // Rilevamento temperatura
  | 'sanitization'    // Sanificazione
  | 'defrosting'      // Sbrinamento

// Alias per backward compatibility
export type MaintenanceFrequency = TaskFrequency
```

### 2.4 Products & Inventory

```typescript
// Status prodotti (products.status)
export type ProductStatus = 
  | 'active'          // Attivo
  | 'expired'         // Scaduto
  | 'consumed'        // Consumato
  | 'waste'           // Scarto

// Compliance status (products.compliance_status)
export type ComplianceStatus = 
  | 'compliant'       // Conforme
  | 'warning'         // Warning
  | 'non_compliant'   // Non conforme

// Allergeni comuni (products.allergens[])
export const ALLERGENS = [
  'glutine',
  'latte',
  'uova',
  'soia',
  'frutta_guscio',
  'arachidi',
  'pesce',
  'crostacei',
  'molluschi',
  'sedano',
  'senape',
  'sesamo',
  'lupini',
  'anidride_solforosa',
] as const

export type Allergen = typeof ALLERGENS[number]
```

### 2.5 HACCP & Audit

```typescript
// Severità non conformità (non_conformities.severity)
export type SeverityLevel = 
  | 'low'             // Bassa
  | 'medium'          // Media
  | 'high'            // Alta
  | 'critical'        // Critica

// Status non conformità (non_conformities.status)
export type NonConformityStatus = 
  | 'open'            // Aperta
  | 'in_progress'     // In gestione
  | 'resolved'        // Risolta
  | 'closed'          // Chiusa

// Azioni audit log (audit_logs.action)
export type AuditAction = 
  | 'INSERT'          // Inserimento
  | 'UPDATE'          // Modifica
  | 'DELETE'          // Eliminazione
  | 'COMPLETE'        // Completamento
  | 'APPROVE'         // Approvazione
  | 'REJECT'          // Rifiuto
```

---

## 3. MAPPING CAMPI DATABASE → TYPESCRIPT

### 3.1 Tipi PostgreSQL → TypeScript

| PostgreSQL | TypeScript | Note |
|------------|------------|------|
| `UUID` | `string` | Convertito automaticamente da Supabase |
| `VARCHAR` | `string` | - |
| `TEXT` | `string` | - |
| `INTEGER` | `number` | - |
| `NUMERIC` | `number` | Decimal convertito in number |
| `BOOLEAN` | `boolean` | - |
| `TIMESTAMPTZ` | `Date` | Convertito automaticamente da Supabase |
| `DATE` | `string` | Formato: 'YYYY-MM-DD' |
| `JSONB` | `Record<string, any>` o interfaccia specifica | - |
| `TEXT[]` | `string[]` | Array di stringhe |
| `UUID[]` | `string[]` | Array di UUID (stringhe) |
| `INET` | `string` | Indirizzo IP come stringa |

### 3.2 NULL vs Undefined

**Regola generale**:
- Database `NULL` → TypeScript `null`
- Campi opzionali in input → TypeScript `undefined` o omesso

**Esempio**:
```typescript
// Database
interface ProductFromDB {
  barcode: string | null  // Campo può essere NULL in DB
}

// Input Form
interface CreateProductInput {
  barcode?: string        // Campo opzionale (può essere undefined o omesso)
}

// Quando mandi a Supabase
const input: CreateProductInput = { name: "Test" }
// barcode sarà undefined → Supabase lo converte in NULL

// Quando ricevi da Supabase
const product: ProductFromDB = await supabase.from('products').select('*').single()
// product.barcode sarà null (non undefined)
```

### 3.3 Date Handling

```typescript
// DATE fields (purchase_date, expiry_date, hire_date)
// Database: DATE (solo data, no ora)
// TypeScript: string formato 'YYYY-MM-DD'

// Esempio:
interface Product {
  expiry_date: string | null  // '2025-12-31'
}

// Conversione da Date a string
const dateToDBFormat = (date: Date): string => {
  return date.toISOString().split('T')[0]  // '2025-12-31'
}

// Conversione da string a Date (per display)
const dbFormatToDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00')  // Evita timezone issues
}

// TIMESTAMPTZ fields (created_at, updated_at, recorded_at)
// Database: TIMESTAMPTZ (data + ora + timezone)
// TypeScript: Date

// Supabase converte automaticamente:
// DB → JS: string ISO → Date object
// JS → DB: Date object → string ISO
```

### 3.4 Array Fields

```typescript
// TEXT[] fields
interface Staff {
  department_assignments: string[]  // UUID[]
}

// Query Supabase con array
const { data } = await supabase
  .from('staff')
  .select('*')
  .contains('department_assignments', [departmentId])  // Contiene almeno un ID

// Update array
await supabase
  .from('staff')
  .update({ 
    department_assignments: [...existingDepts, newDeptId] 
  })
  .eq('id', staffId)
```

---

## 4. QUERY PATTERNS COMUNI

### 4.1 Auth & Multi-Tenant Queries

#### Get User Companies
```typescript
// Ottiene tutte le aziende dell'utente autenticato
const getUserCompanies = async () => {
  const { data, error } = await supabase
    .rpc('get_user_companies')  // RLS helper function
  
  return data  // [{company_id, company_name, user_role, is_active}]
}
```

#### Get Active Company
```typescript
// Ottiene l'azienda attiva dell'utente
const getActiveCompany = async () => {
  const { data: session } = await supabase
    .from('user_sessions')
    .select('active_company_id, companies(*)') 
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .single()
  
  return session?.companies
}
```

#### Switch Company
```typescript
// Cambia azienda attiva
const switchCompany = async (newCompanyId: string) => {
  const { data, error } = await supabase
    .rpc('switch_active_company', { p_new_company_id: newCompanyId })
  
  if (error) throw error
  return data  // true se successo
}
```

#### Check User Role in Company
```typescript
// Verifica ruolo utente in un'azienda specifica
const getUserRoleInCompany = async (companyId: string) => {
  const { data } = await supabase
    .rpc('get_user_role_for_company', { p_company_id: companyId })
  
  return data as StaffRole | null
}
```

#### Create Invite
```typescript
// Crea un invito per nuovo membro
const createInvite = async (input: CreateInviteInput) => {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (input.expires_in_days || 7))
  
  const { data, error } = await supabase
    .from('invite_tokens')
    .insert({
      token,
      email: input.email,
      company_id: input.company_id,
      role: input.role,
      staff_id: input.staff_id,
      invited_by: (await supabase.auth.getUser()).data.user?.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Invia email con link: `/accept-invite?token=${token}`
  return data
}
```

#### Accept Invite
```typescript
// Accetta invito e crea account
const acceptInvite = async (input: AcceptInviteInput) => {
  // 1. Verifica token valido
  const { data: invite } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', input.token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (!invite) throw new Error('Token non valido o scaduto')
  
  // 2. Crea account Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: invite.email,
    password: input.password,
    options: {
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
      }
    }
  })
  
  if (signUpError) throw signUpError
  
  // 3. Crea company_member
  await supabase
    .from('company_members')
    .insert({
      user_id: authData.user!.id,
      company_id: invite.company_id,
      role: invite.role,
      staff_id: invite.staff_id,
    })
  
  // 4. Marca invito come usato
  await supabase
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)
  
  return authData.user
}
```

---

### 4.2 Product Queries

#### Get Products with Relations
```typescript
// Ottiene prodotti con categorie, reparti e punti conservazione
const getProductsWithRelations = async (companyId: string) => {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      department:departments(*),
      conservation_point:conservation_points(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  
  return data
}
```

#### Get Expiring Products
```typescript
// Prodotti in scadenza entro X giorni
const getExpiringProducts = async (companyId: string, daysAhead = 7) => {
  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  const futureDateStr = futureDate.toISOString().split('T')[0]
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .gte('expiry_date', today)
    .lte('expiry_date', futureDateStr)
    .order('expiry_date', { ascending: true })
  
  return data
}
```

---

### 4.3 Temperature Queries

#### Get Latest Temperature Readings
```typescript
// Ultime letture per ogni punto di conservazione
const getLatestTemperatures = async (companyId: string) => {
  const { data } = await supabase
    .from('temperature_readings')
    .select(`
      *,
      conservation_point:conservation_points(*)
    `)
    .eq('company_id', companyId)
    .order('recorded_at', { ascending: false })
  
  // Raggruppa per conservation_point_id e prendi la più recente
  const latestByPoint = data?.reduce((acc, reading) => {
    if (!acc[reading.conservation_point_id]) {
      acc[reading.conservation_point_id] = reading
    }
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(latestByPoint || {})
}
```

#### Get Temperature Trends
```typescript
// Trend temperature ultime 24 ore
const getTemperatureTrends = async (
  conservationPointId: string,
  hours = 24
) => {
  const since = new Date()
  since.setHours(since.getHours() - hours)
  
  const { data } = await supabase
    .from('temperature_readings')
    .select('*')
    .eq('conservation_point_id', conservationPointId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })
  
  return data
}
```

---

### 4.4 Task & Completion Queries

#### Get Overdue Tasks
```typescript
// Task scaduti
const getOverdueTasks = async (companyId: string) => {
  const now = new Date().toISOString()
  
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)
    .in('status', ['pending', 'in_progress'])
    .lt('next_due', now)
    .order('next_due', { ascending: true })
  
  return data
}
```

#### Get Tasks for User
```typescript
// Task assegnati all'utente corrente
const getTasksForCurrentUser = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Ottieni company_member per sapere ruolo e staff_id
  const { data: member } = await supabase
    .from('company_members')
    .select('role, staff_id')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .single()

  if (!member) return []

  // Query task in base all'assegnazione
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)
    .or(`
      and(assignment_type.eq.staff,assigned_to_staff_id.eq.${member.staff_id}),
      and(assignment_type.eq.role,assigned_to_role.eq.${member.role})
    `)
    .order('next_due', { ascending: true })

  return tasks
}
```

#### Complete Task
```typescript
// Completa un task per il periodo corrente
const completeTask = async (input: CompleteTaskInput, companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  // Trova task per determinare periodo
  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', input.taskId)
    .eq('company_id', companyId)
    .single()

  if (!task) throw new Error('Task non trovato')

  // Calcola period_start e period_end in base a frequency
  const now = new Date()
  let period_start: Date
  let period_end: Date

  switch (task.frequency) {
    case 'daily':
      period_start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      period_end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      break
    case 'weekly':
      const dayOfWeek = now.getDay() || 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - (dayOfWeek - 1))
      period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
      break
    case 'monthly':
      period_start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      period_end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'annually':
    case 'annual':
      period_start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
      period_end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      break
    default:
      period_start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      period_end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  }

  // Insert task completion
  const { data, error } = await supabase
    .from('task_completions')
    .insert({
      company_id: companyId,
      task_id: input.taskId,
      completed_by: user.id,
      period_start: period_start.toISOString(),
      period_end: period_end.toISOString(),
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get Task Completions
```typescript
// Ottieni completamenti di un task
const getTaskCompletions = async (taskId: string, companyId: string) => {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('company_id', companyId)
    .eq('task_id', taskId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data
}
```

#### Check if Task Completed in Period
```typescript
// Verifica se task è completato per un periodo specifico
const isTaskCompletedInPeriod = (
  eventDate: Date,
  completions: TaskCompletion[]
): boolean => {
  return completions.some(c => {
    const eventTime = eventDate.getTime()
    const completionStart = c.period_start.getTime()
    const completionEnd = c.period_end.getTime()
    return eventTime >= completionStart && eventTime <= completionEnd
  })
}
```

---

### 4.5 Staff & Departments Queries

#### Get Staff by Department
```typescript
// Ottiene tutti i dipendenti assegnati a un reparto specifico
const getStaffByDepartment = async (departmentId: string) => {
  const { data, error } = await supabase
    .from('staff')
    .select(`
      *,
      departments:department_assignments
    `)
    .contains('department_assignments', [departmentId])
    .eq('status', 'active')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data
}
```

#### Get Departments for Staff Member
```typescript
// Ottiene tutti i reparti assegnati a un dipendente
const getDepartmentsForStaff = async (staffId: string) => {
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  if (!staff?.department_assignments?.length) return []
  
  // Ottieni i dettagli dei reparti
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .in('id', staff.department_assignments)
    .order('name', { ascending: true })
  
  return departments
}
```

#### Assign Staff to Department (Onboarding)
```typescript
// Assegna dipendente a uno o più reparti durante l'onboarding
const assignStaffToDepartments = async (
  staffId: string,
  departmentIds: string[]
) => {
  const { data, error } = await supabase
    .from('staff')
    .update({ 
      department_assignments: departmentIds,
      updated_at: new Date().toISOString()
    })
    .eq('id', staffId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

#### Add Department to Staff (Update)
```typescript
// Aggiungi un nuovo reparto a uno staff esistente
const addDepartmentToStaff = async (
  staffId: string,
  newDepartmentId: string
) => {
  // 1. Ottieni department_assignments attuali
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  if (!staff) throw new Error('Staff non trovato')
  
  // 2. Aggiungi nuovo department se non già presente
  const currentDepts = staff.department_assignments || []
  if (currentDepts.includes(newDepartmentId)) {
    return staff // Già assegnato
  }
  
  // 3. Update con nuovo array
  const { data, error } = await supabase
    .from('staff')
    .update({ 
      department_assignments: [...currentDepts, newDepartmentId],
      updated_at: new Date().toISOString()
    })
    .eq('id', staffId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

#### Remove Department from Staff
```typescript
// Rimuovi un reparto da uno staff
const removeDepartmentFromStaff = async (
  staffId: string,
  departmentIdToRemove: string
) => {
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  if (!staff) throw new Error('Staff non trovato')
  
  const updatedDepts = (staff.department_assignments || [])
    .filter(id => id !== departmentIdToRemove)
  
  const { data, error } = await supabase
    .from('staff')
    .update({ 
      department_assignments: updatedDepts,
      updated_at: new Date().toISOString()
    })
    .eq('id', staffId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

#### Get Staff with Departments (Join Query)
```typescript
// Ottiene staff con i dettagli completi dei reparti assegnati
const getStaffWithDepartments = async (companyId: string) => {
  const { data: staffList } = await supabase
    .from('staff')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
  
  if (!staffList) return []
  
  // Per ogni staff, ottieni i reparti
  const staffWithDepartments = await Promise.all(
    staffList.map(async (staff) => {
      if (!staff.department_assignments?.length) {
        return { ...staff, departments: [] }
      }
      
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name, is_active')
        .in('id', staff.department_assignments)
      
      return { ...staff, departments: departments || [] }
    })
  )
  
  return staffWithDepartments
}
```

#### Count Staff per Department (Stats)
```typescript
// Conta quanti dipendenti sono assegnati a ogni reparto
const getStaffCountByDepartment = async (companyId: string) => {
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('company_id', companyId)
  
  if (!departments) return []
  
  const counts = await Promise.all(
    departments.map(async (dept) => {
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .contains('department_assignments', [dept.id])
      
      return {
        department_id: dept.id,
        department_name: dept.name,
        staff_count: staff?.length || 0,
      }
    })
  )
  
  return counts
}
```

#### React Query Hook for Staff with Departments
```typescript
// Hook React Query per gestire staff con reparti
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useStaffWithDepartments = (companyId: string) => {
  return useQuery({
    queryKey: ['staff-with-departments', companyId],
    queryFn: () => getStaffWithDepartments(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minuti
  })
}

export const useAssignDepartments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, departmentIds }: {
      staffId: string
      departmentIds: string[]
    }) => assignStaffToDepartments(staffId, departmentIds),
    onSuccess: (_, variables) => {
      // Invalida cache staff
      queryClient.invalidateQueries(['staff-with-departments'])
      queryClient.invalidateQueries(['staff', variables.staffId])
      toast.success('Reparti assegnati con successo')
    },
    onError: (error) => {
      console.error('Errore assegnazione reparti:', error)
      toast.error('Impossibile assegnare i reparti')
    }
  })
}

// Uso nel componente:
// const { data: staff } = useStaffWithDepartments(companyId)
// const { mutate: assignDepts } = useAssignDepartments()
// assignDepts({ staffId: 'xxx', departmentIds: ['dept1', 'dept2'] })
```

#### React Query Hook for Calendar Tasks
```typescript
// Hook per task generici con completamenti
export const useGenericTasks = (companyId: string) => {
  return useQuery({
    queryKey: ['generic-tasks', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook per completamenti task
export const useTaskCompletions = (companyId: string) => {
  return useQuery({
    queryKey: ['task-completions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('company_id', companyId)

      if (error) throw error
      return data
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minuti (più frequente)
  })
}

// Mutation per completare task
export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, notes, companyId }: CompleteTaskInput & { companyId: string }) =>
      completeTask({ taskId, notes }, companyId),
    onSuccess: (_, variables) => {
      // Invalida tutte le query calendario
      queryClient.invalidateQueries(['generic-tasks', variables.companyId])
      queryClient.invalidateQueries(['task-completions', variables.companyId])
      queryClient.invalidateQueries(['calendar-events', variables.companyId])
      queryClient.invalidateQueries(['macro-category-events'])
      toast.success('Mansione completata')
    },
    onError: (error) => {
      console.error('Errore completamento task:', error)
      toast.error('Impossibile completare la mansione')
    }
  })
}

// Uso nei componenti:
// const { data: tasks } = useGenericTasks(companyId)
// const { data: completions } = useTaskCompletions(companyId)
// const { mutate: complete } = useCompleteTask()
// complete({ taskId: 'xxx', notes: 'Done', companyId })
```

---

### 4.6 Audit Log Queries

#### Create Audit Log
```typescript
// Registra azione in audit log
const createAuditLog = async (
  input: CreateAuditLogInput,
  companyId: string
) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user?.id)
    .eq('company_id', companyId)
    .single()
  
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user?.id,
      company_id: companyId,
      table_name: input.table_name,
      record_id: input.record_id,
      action: input.action,
      old_data: input.old_data,
      new_data: input.new_data,
      user_role: member?.role,
      user_email: user?.email,
    })
}
```

#### Get Audit Trail
```typescript
// Storico modifiche di un record
const getRecordAuditTrail = async (
  tableName: string,
  recordId: string
) => {
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })
  
  return data
}
```

---

## 5. RLS HELPER FUNCTIONS

### 5.1 Funzioni Disponibili

```typescript
// Tutte le funzioni RLS disponibili nel database

// 1. get_active_company_id()
// Ritorna: UUID | NULL
// Uso: Ottiene l'azienda attiva dell'utente corrente
const activeCompanyId = await supabase.rpc('get_active_company_id')

// 2. is_company_member(p_company_id UUID)
// Ritorna: BOOLEAN
// Uso: Verifica se utente è membro dell'azienda
const isMember = await supabase.rpc('is_company_member', { 
  p_company_id: companyId 
})

// 3. has_management_role(p_company_id UUID)
// Ritorna: BOOLEAN
// Uso: Verifica se utente ha ruolo admin o responsabile
const canManage = await supabase.rpc('has_management_role', { 
  p_company_id: companyId 
})

// 4. is_admin(p_company_id UUID)
// Ritorna: BOOLEAN
// Uso: Verifica se utente è admin
const isAdmin = await supabase.rpc('is_admin', { 
  p_company_id: companyId 
})

// 5. get_user_companies()
// Ritorna: TABLE(company_id, company_name, user_role, is_active)
// Uso: Ottiene tutte le aziende dell'utente
const companies = await supabase.rpc('get_user_companies')

// 6. ensure_user_session()
// Ritorna: UUID
// Uso: Crea o aggiorna sessione utente, ritorna company_id attivo
const companyId = await supabase.rpc('ensure_user_session')

// 7. switch_active_company(p_new_company_id UUID)
// Ritorna: BOOLEAN
// Uso: Cambia azienda attiva
const success = await supabase.rpc('switch_active_company', { 
  p_new_company_id: newCompanyId 
})

// 8. has_permission(p_company_id UUID, p_permission VARCHAR)
// Ritorna: BOOLEAN
// Uso: Verifica permesso specifico
const canExport = await supabase.rpc('has_permission', {
  p_company_id: companyId,
  p_permission: 'export_data'
})
```

### 5.2 Permessi Disponibili

```typescript
export type Permission =
  | 'manage_staff'          // Gestire staff (admin, responsabile)
  | 'manage_departments'    // Gestire reparti (admin, responsabile)
  | 'view_all_tasks'        // Vedere tutti i task (admin, responsabile)
  | 'manage_conservation'   // Gestire conservazione (admin, responsabile)
  | 'export_data'           // Esportare dati (solo admin)
  | 'manage_settings'       // Gestire impostazioni (solo admin)

// Esempio utilizzo nel codice
const checkPermission = async (permission: Permission) => {
  const companyId = await supabase.rpc('get_active_company_id')
  const { data } = await supabase.rpc('has_permission', {
    p_company_id: companyId,
    p_permission: permission
  })
  return data as boolean
}

// Hook React
export const usePermission = (permission: Permission) => {
  const [hasPermission, setHasPermission] = useState(false)
  
  useEffect(() => {
    checkPermission(permission).then(setHasPermission)
  }, [permission])
  
  return hasPermission
}
```

---

## 6. MIGRATION GUIDE: CLERK → SUPABASE AUTH

### 6.1 Mapping Clerk → Supabase

| Clerk | Supabase Auth | Note |
|-------|---------------|------|
| `user.id` | `auth.users.id` | UUID invece di stringa custom |
| `user.emailAddresses[0].emailAddress` | `user.email` | Direttamente accessibile |
| `user.firstName` | `user.user_metadata.first_name` | Metadati personalizzati |
| `user.lastName` | `user.user_metadata.last_name` | Metadati personalizzati |
| `useUser()` | `useAuth()` (custom hook) | Hook personalizzato |
| `SignIn` component | `supabase.auth.signInWithPassword()` | Funzione JS |
| `SignUp` component | `supabase.auth.signUp()` | Funzione JS |
| `UserButton` | Custom component | Da implementare |

### 6.2 Codice Prima (con Clerk)

```typescript
// VECCHIO CODICE CON CLERK ❌
import { useUser } from '@clerk/clerk-react'

export const useAuth = () => {
  const { user, isLoaded } = useUser()
  const companyId = user?.publicMetadata?.company_id
  const role = user?.publicMetadata?.role
  
  return { user, companyId, role, isLoading: !isLoaded }
}

// Query prodotti
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', companyId)  // ⚠️ Usa company_id da Clerk metadata
```

### 6.3 Codice Dopo (con Supabase Auth)

```typescript
// NUOVO CODICE CON SUPABASE AUTH ✅
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [companyId, setCompanyId] = useState(null)
  const [role, setRole] = useState(null)
  
  useEffect(() => {
    // 1. Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    
    // 2. Get active company and role
    supabase.rpc('ensure_user_session').then((compId) => {
      setCompanyId(compId)
      
      // Get role from company_members
      supabase
        .from('company_members')
        .select('role')
        .eq('user_id', user?.id)
        .eq('company_id', compId)
        .single()
        .then(({ data }) => setRole(data?.role))
    })
  }, [])
  
  return { user, companyId, role, isLoading: !user || !companyId }
}

// Query prodotti - NESSUN CAMBIAMENTO! RLS gestisce company_id automaticamente
const { data } = await supabase
  .from('products')
  .select('*')
  // RLS filtra automaticamente per company_id attivo ✅
```

### 6.4 Passi Migrazione

1. **Rimuovi dipendenze Clerk**
```bash
npm uninstall @clerk/clerk-react
```

2. **Aggiungi Supabase Auth**
```bash
npm install @supabase/supabase-js
```

3. **Aggiorna useAuth hook**
- Usa `supabase.auth.getUser()` invece di `useUser()`
- Usa `company_members` per ottenere ruolo
- Usa `user_sessions` per ottenere company_id attivo

4. **Rimuovi clerk_user_id da query**
```typescript
// PRIMA ❌
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('clerk_user_id', user.id)

// DOPO ✅
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('auth_user_id', user.id)
```

5. **Usa company_members invece di user_profiles**
```typescript
// PRIMA ❌
const { data } = await supabase
  .from('user_profiles')
  .select('company_id, role')
  .eq('auth_user_id', user.id)
  .single()

// DOPO ✅
const { data } = await supabase
  .from('company_members')
  .select('company_id, role')
  .eq('user_id', user.id)
  .eq('is_active', true)
```

6. **Implementa Multi-Company Support**
```typescript
// Prima: un utente → un'azienda
const companyId = user.publicMetadata.company_id

// Dopo: un utente → più aziende
const { data: companies } = await supabase.rpc('get_user_companies')
const activeCompanyId = await supabase.rpc('get_active_company_id')
```

---

## 7. VALIDATION RULES

### 7.1 Required Fields per Tabella

```typescript
// Campi OBBLIGATORI (NOT NULL senza DEFAULT)
const REQUIRED_FIELDS = {
  companies: ['name', 'address', 'staff_count', 'email'],
  departments: ['company_id', 'name'],
  staff: ['company_id', 'name', 'role', 'category'],
  products: ['company_id', 'name'],
  conservation_points: ['company_id', 'name', 'setpoint_temp', 'type'],
  temperature_readings: ['company_id', 'conservation_point_id', 'temperature', 'recorded_at'],
  tasks: ['company_id', 'name', 'frequency', 'assigned_to', 'assignment_type'],
  maintenance_tasks: ['company_id', 'conservation_point_id', 'type', 'frequency', 'assigned_to', 'assignment_type'],
  events: ['company_id', 'title', 'start_date'],
  notes: ['company_id', 'title', 'content'],
  non_conformities: ['company_id', 'title', 'description', 'severity'],
  shopping_lists: ['company_id', 'name'],
  shopping_list_items: ['shopping_list_id', 'product_name', 'category_name'],
  company_members: ['user_id', 'company_id', 'role'],
  user_sessions: ['user_id'],
  invite_tokens: ['token', 'email', 'company_id', 'role', 'expires_at'],
  user_profiles: ['email'],
}
```

### 7.2 Constraint Checks

```typescript
// Validazione PRIMA di INSERT/UPDATE

// Esempio: Staff Count > 0
if (companyData.staff_count <= 0) {
  throw new Error('staff_count deve essere maggiore di 0')
}

// Esempio: Quantity > 0 in shopping_list_items
if (itemData.quantity <= 0) {
  throw new Error('quantity deve essere maggiore di 0')
}

// Esempio: expires_at > created_at in invite_tokens
if (inviteData.expires_at <= new Date()) {
  throw new Error('expires_at deve essere nel futuro')
}

// Esempio: Role valido
const VALID_ROLES: StaffRole[] = ['admin', 'responsabile', 'dipendente', 'collaboratore']
if (!VALID_ROLES.includes(staffData.role)) {
  throw new Error('Role non valido')
}
```

### 7.3 Validation Helpers

```typescript
// Helper per validare enum
export const validateEnum = <T extends string>(
  value: string,
  validValues: readonly T[],
  fieldName: string
): T => {
  if (!validValues.includes(value as T)) {
    throw new Error(
      `${fieldName} deve essere uno di: ${validValues.join(', ')}`
    )
  }
  return value as T
}

// Uso:
const role = validateEnum(inputRole, STAFF_CATEGORIES, 'role')

// Helper per validare date
export const validateDateString = (
  dateStr: string,
  fieldName: string
): string => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) {
    throw new Error(`${fieldName} deve essere nel formato YYYY-MM-DD`)
  }
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} non è una data valida`)
  }
  
  return dateStr
}

// Helper per validare email
export const validateEmail = (email: string): string => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    throw new Error('Email non valida')
  }
  return email.toLowerCase()
}

// Helper per validare UUID
export const validateUUID = (uuid: string, fieldName: string): string => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!regex.test(uuid)) {
    throw new Error(`${fieldName} deve essere un UUID valido`)
  }
  return uuid
}
```

---

## 8. BEST PRACTICES

### 8.1 Query Optimization

```typescript
// ✅ DO: Seleziona solo i campi necessari
const { data } = await supabase
  .from('products')
  .select('id, name, expiry_date')
  .eq('company_id', companyId)

// ❌ DON'T: Select *  quando non necessario
const { data } = await supabase
  .from('products')
  .select('*')  // Carica tutti i campi anche se non servono
```

```typescript
// ✅ DO: Usa relazioni con select specifici
const { data } = await supabase
  .from('products')
  .select('id, name, category:product_categories(id, name)')
  .eq('company_id', companyId)

// ❌ DON'T: Fetch separati quando puoi usare join
const { data: products } = await supabase.from('products').select('*')
const { data: categories } = await supabase.from('product_categories').select('*')
// Poi fai join manualmente in JS
```

### 8.2 Error Handling

```typescript
// ✅ DO: Gestisci errori specifici
try {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  
  if (error) {
    // Check error codes specifici
    if (error.code === '23505') {  // Unique violation
      throw new Error('Prodotto già esistente')
    }
    if (error.code === '23503') {  // Foreign key violation
      throw new Error('Categoria non trovata')
    }
    throw error
  }
  
  return data
} catch (err) {
  console.error('Errore creazione prodotto:', err)
  toast.error('Impossibile creare il prodotto')
}

// ❌ DON'T: Ignora gli errori
const { data } = await supabase.from('products').insert(productData)
// Non controlli se c'è error!
```

### 8.3 Tipo Safety

```typescript
// ✅ DO: Usa interfacce TypeScript
interface Product {
  id: string
  name: string
  status: ProductStatus
}

const { data } = await supabase
  .from('products')
  .select('id, name, status')
  .returns<Product[]>()  // Type-safe!

// ❌ DON'T: Usa any
const { data } = await supabase
  .from('products')
  .select('*')  // data è any
```

### 8.4 Transazioni

```typescript
// ✅ DO: Usa transazioni per operazioni multiple
const createProductWithCategory = async (input: CreateProductInput) => {
  // Se categoria non esiste, creala
  let categoryId = input.category_id
  
  if (!categoryId && input.categoryName) {
    const { data: category } = await supabase
      .from('product_categories')
      .insert({ name: input.categoryName, company_id })
      .select('id')
      .single()
    
    categoryId = category?.id
  }
  
  // Poi crea prodotto
  const { data } = await supabase
    .from('products')
    .insert({ ...input, category_id: categoryId })
    .select()
    .single()
  
  return data
}

// Nota: Supabase non ha transazioni native, ma puoi usare RPC con funzioni SQL
```

### 8.5 Caching con React Query

```typescript
// ✅ DO: Usa React Query per caching automatico
export const useProducts = (companyId: string) => {
  return useQuery({
    queryKey: ['products', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,  // Cache 5 minuti
  })
}

// Invalidazione dopo mutazione
const createProduct = useMutation({
  mutationFn: async (input: CreateProductInput) => {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['products', companyId])
  }
})
```

### 8.6 RLS Considerations

```typescript
// ✅ DO: Fidati di RLS per filtrare per company_id
// Non serve passare company_id esplicitamente se RLS è attivo
const { data } = await supabase
  .from('products')
  .select('*')
  // RLS filtra automaticamente per active_company_id ✅

// ❌ DON'T: Non duplicare logica RLS nel codice
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', companyId)  // Ridondante se RLS attivo
```

---

## 9. FEATURES RECENTI

### 9.1 Sistema Onboarding con Primo Membro Admin (2025-10-12)

**Feature:** Logica migliorata per riconoscimento automatico del primo admin nell'onboarding.

#### Flusso Implementato

**1. Token Invito Iniziale:**
```sql
-- Primo admin riceve token con company_id = NULL
INSERT INTO invite_tokens (email, role, company_id)
VALUES ('admin@example.com', 'admin', NULL);  -- NULL = creerà azienda
```

**2. Accettazione Invito:**
```typescript
// AcceptInvitePage mostra:
// - Email: admin@example.com (dal token, readonly)
// - Ruolo: ADMIN (dal token, badge)
// Utente inserisce: nome, cognome, password
```

**3. Step 3 - Staff (Onboarding):**

**Comportamento Automatico:**
- Se `staffMembers.length === 0` → Email precompilata con `user.email`
- Ruolo fisso: "Amministratore" (readonly)
- UI mostra: "👤 Primo Membro: Amministratore (Tu)"

**Con "Precompila":**
```typescript
// Sostituisce primo staff con utente corrente
data.staff[0] = {
  name: user.user_metadata.first_name,
  surname: user.user_metadata.last_name,
  email: user.email,  // Email utente loggato
  role: 'admin',      // Sempre admin
}
```

**4. Completamento Onboarding:**

**Salvataggio Staff:**
```typescript
// Inserisce tutti gli staff
const insertedStaff = await supabase.from('staff').insert(staff)

// Collega primo staff a company_member
await supabase
  .from('company_members')
  .update({ staff_id: insertedStaff[0].id })
  .eq('user_id', currentUser.id)
  .eq('company_id', companyId)
```

**Generazione Inviti:**
```typescript
// SALTA indice 0 (utente corrente)
for (let i = 1; i < formData.staff.length; i++) {
  await createInviteToken({
    email: formData.staff[i].email,
    company_id: companyId,
    role: formData.staff[i].role,
  })
}

// Console log:
// ⏭️ Primo membro (utente corrente) saltato: admin@example.com
// ✅ Invito creato per: user2@example.com (responsabile)
// ✅ Invito creato per: user3@example.com (dipendente)
```

#### UI Features

**StaffStep.tsx - Primo Membro:**
- Badge "👤 Tu (Admin)" visibile
- Sfondo blu chiaro con bordo blu
- Email readonly (sfondo blu, disabilitato)
- Ruolo readonly (mostrato come testo "Amministratore")
- Pulsante elimina nascosto (mostra "🔒 Non eliminabile")

**Messaggi Contestuali:**
- Primo membro: "La tua email è già precompilata..."
- Altri membri: "Il sistema invierà automaticamente un'email di invito..."

#### Componenti Modificati

1. **StaffStep.tsx**: 
   - Hook `useAuth` per ottenere utente loggato
   - Effect precompilazione email/ruolo primo membro
   - Campi readonly per primo membro
   - UI condizionale con badge e blocchi

2. **onboardingHelpers.ts**:
   - `prefillOnboarding()` ora async
   - Sostituisce dinamicamente primo staff con utente corrente
   - Generazione inviti salta indice 0
   - Collegamento `staff_id` a `company_members`

3. **OnboardingWizard.tsx**:
   - Handler "Precompila" aggiornato ad async

#### Database Relations

**Prima** (v1.4.0):
```
auth.users → company_members
  ↓              ↓
  ?         staff_id: NULL  ← No collegamento
```

**Dopo** (v1.5.0):
```
auth.users → company_members → staff (primo membro)
  ↓              ↓                ↓
user_id    staff_id: [ID]   role: admin ✅
                            email: [user.email]
```

#### Query Pattern

**Ottenere staff member dell'utente loggato:**
```typescript
const { data: myStaffRecord } = await supabase
  .from('company_members')
  .select(`
    staff_id,
    staff:staff_id (
      id,
      name,
      email,
      role,
      category,
      department_assignments
    )
  `)
  .eq('user_id', user.id)
  .eq('company_id', companyId)
  .single()

// myStaffRecord.staff contiene i dati completi dello staff member
```

**Verificare se utente è primo admin:**
```sql
SELECT 
  cm.user_id = s.email as is_first_admin,
  s.name,
  cm.role
FROM company_members cm
JOIN staff s ON s.id = cm.staff_id
WHERE cm.user_id = '[USER_ID]'
  AND cm.company_id = '[COMPANY_ID]';
```

---

### 9.2 Sistema DevCompanyHelper (2025-10-12)

**Feature:** Utility per sviluppo che previene creazione di company duplicate.

#### Problema Risolto

**Prima:**
```
Ogni onboarding → NUOVA company creata
Reset + Onboarding × 10 = 10 company duplicate ❌
```

**Dopo:**
```
Dev company impostata → SEMPRE riutilizzata
Reset + Onboarding × 10 = 1 company (la stessa) ✅
```

#### Utility Functions

**File**: `src/utils/devCompanyHelper.ts`

```typescript
// Imposta dev company manualmente
devCompanyHelper.setDevCompany('company-uuid')

// Imposta automaticamente da utente corrente
devCompanyHelper.setDevCompanyFromCurrentUser()

// Trova migliore company (più completa)
devCompanyHelper.findBestDevCompany()

// Mostra info dev company attuale
devCompanyHelper.showDevCompanyInfo()

// Verifica se dev company è attiva
devCompanyHelper.hasDevCompany()  // → true/false

// Ottieni ID dev company
devCompanyHelper.getDevCompany()  // → 'uuid' | null

// Rimuovi dev company (torna al normale)
devCompanyHelper.clearDevCompany()

// Usa in onboarding (interno)
devCompanyHelper.getCompanyIdForOnboarding()
```

#### Integrazione Onboarding

**File**: `src/utils/onboardingHelpers.ts`

```typescript
// Logica in completeOnboarding()
if (hasDevCompany()) {
  companyId = await getCompanyIdForOnboarding()
  // → Riutilizza company esistente invece di crearne una nuova
  toast.info('🛠️ Modalità sviluppo: riutilizzo company esistente')
}
```

#### Storage

**LocalStorage Key**: `bhm-dev-company-id`

```javascript
// Salvato in localStorage
localStorage.setItem('bhm-dev-company-id', 'company-uuid')

// Persiste tra refresh e sessioni
// Rimuovi solo esplicitamente con clearDevCompany()
```

#### Workflow Sviluppo

**Setup Iniziale (una volta):**
```javascript
// Console browser (F12)
devCompanyHelper.findBestDevCompany()
devCompanyHelper.setDevCompanyFromCurrentUser()
```

**Durante Sviluppo:**
- Reset dati operativi liberamente
- Onboarding multipli senza preoccupazioni
- Company sempre la stessa ✅

**Prima di Produzione:**
```javascript
devCompanyHelper.clearDevCompany()  // Disattiva dev mode
```

#### Script SQL Supporto

**File**: `database/test_data/cleanup_duplicate_companies.sql`

Elimina company duplicate manualmente:
```sql
-- Trova migliore company
SELECT id, name, 
  (COUNT departments + COUNT staff + ...) as score
FROM companies
WHERE name = 'Al Ritrovo SRL'
ORDER BY score DESC LIMIT 1;

-- Elimina duplicate
DELETE FROM companies 
WHERE name = 'Al Ritrovo SRL' 
AND id != '[BEST_COMPANY_ID]';
```

---

---

### 9.3 Flusso Inviti Migliorato (2025-10-12)

**Feature:** Sistema inviti con riconoscimento automatico primo admin e prevenzione duplicati.

#### Workflow Completo

**Step 1: Generazione Token Iniziale**
```sql
-- Admin sistema genera token per primo admin
INSERT INTO invite_tokens (email, role, company_id)
VALUES ('first.admin@company.com', 'admin', NULL);
-- company_id = NULL → Primo admin, creerà azienda
```

**Step 2: Primo Admin Accetta Invito**
```typescript
// AcceptInvitePage:
// 1. Valida token
const validation = await validateInviteToken(token)

// 2. Crea account Supabase Auth
const { data: authData } = await supabase.auth.signUp({
  email: invite.email,
  password: formData.password,
  options: {
    data: {
      first_name: formData.first_name,
      last_name: formData.last_name,
    }
  }
})

// 3. Crea company_member (senza company_id ancora)
await supabase.from('company_members').insert({
  user_id: authData.user.id,
  company_id: null,  // Sarà impostato durante onboarding
  role: 'admin',
})

// 4. Marca token come usato
await supabase
  .from('invite_tokens')
  .update({ used_at: now() })
  .eq('id', invite.id)
```

**Step 3: Onboarding - Creazione Azienda**
```typescript
// onboardingHelpers.ts - completeOnboarding()

// 1. Crea company
const { data: company } = await supabase
  .from('companies')
  .insert({ name: 'Al Ritrovo SRL', ... })

// 2. Aggiorna company_member
await supabase
  .from('company_members')
  .update({ company_id: company.id })
  .eq('user_id', user.id)

// 3. Inserisce staff (primo = utente corrente)
const staff = formData.staff.map((person, index) => ({
  ...person,
  email: index === 0 ? user.email : person.email,  // Primo = user email
  role: index === 0 ? 'admin' : person.role,       // Primo = admin
}))

const insertedStaff = await supabase.from('staff').insert(staff)

// 4. Collega primo staff a company_member
await supabase
  .from('company_members')
  .update({ staff_id: insertedStaff[0].id })
  .eq('user_id', user.id)

// 5. Genera inviti per altri membri (da indice 1)
for (let i = 1; i < formData.staff.length; i++) {
  await createInviteToken({
    email: formData.staff[i].email,
    company_id: company.id,
    role: formData.staff[i].role,
  })
}
```

**Step 4: Altri Membri Accettano Inviti**
```typescript
// Stesso flusso di Step 2, ma:
// - company_id è già presente nel token
// - user_session creata automaticamente con active_company_id
// - staff_id collegato se presente nell'invito
```

#### Database State Progression

**Dopo Reset:**
```
auth.users: 0
companies: 0
company_members: 0
invite_tokens: 1 (token per primo admin, company_id = NULL)
staff: 0
```

**Dopo Primo Admin Accetta:**
```
auth.users: 1 (primo admin)
companies: 0
company_members: 1 (user_id, company_id = NULL, role = admin)
invite_tokens: 1 (used_at = NOW())
staff: 0
```

**Dopo Onboarding Completato:**
```
auth.users: 1
companies: 1 (Al Ritrovo SRL)
company_members: 1 (company_id aggiornato, staff_id collegato)
invite_tokens: 5 (1 usato + 4 pending per altri membri)
staff: 5 (tutti inseriti)
```

**Dopo Altri Membri Accettano:**
```
auth.users: 3 (o più)
companies: 1
company_members: 3 (tutti con staff_id)
invite_tokens: 5 (tutti used_at != NULL)
staff: 5
```

#### Script SQL Utilities

**Reset Completo**: `database/test_data/FULL_DATABASE_RESET.sql`
```sql
-- Elimina tutto e genera token per primo admin
DO $$
BEGIN
  -- Pulisce tutto
  DELETE FROM companies CASCADE;
  DELETE FROM auth.users;
  
  -- Genera token iniziale
  INSERT INTO invite_tokens (email, role, company_id)
  VALUES ('first.admin@company.com', 'admin', NULL);
END $$;
```

**Cleanup Duplicate**: `database/test_data/cleanup_duplicate_companies.sql`
```sql
-- Trova migliore company
SELECT id FROM companies WHERE name = 'Al Ritrovo SRL'
ORDER BY (SELECT COUNT(*) FROM staff WHERE company_id = companies.id) DESC
LIMIT 1;

-- Elimina duplicate
DELETE FROM companies 
WHERE name = 'Al Ritrovo SRL' 
AND id != '[BEST_ID]';
```

---

### 9.4 Data di Inizio Task Generici (2025-01-12)

**Feature:** Campo "Assegna Data di Inizio" per nuove attività generiche.

#### Interfacce Aggiornate

```typescript
// CreateGenericTaskInput aggiornato
export interface CreateGenericTaskInput {
  name: string
  frequency: GenericTask['frequency']
  assigned_to_role: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  note?: string
  custom_days?: string[]
  start_date?: string  // NUOVO: Data di inizio in formato ISO (YYYY-MM-DD)
  end_date?: string    // NUOVO: Data di fine in formato ISO (YYYY-MM-DD)
}
```

#### Logica

**Default (campo vuoto):**
- `start_date` non specificato → task inizia da oggi
- `calculateNextDue` usa `new Date()` come base

**Custom (campo compilato):**
- `start_date` specificato (es. '2025-10-18') → task inizia da quella data
- `calculateNextDue` usa `new Date(start_date)` come base

**Validazione:**
- Data non può essere retroattiva (solo oggi o futuro)
- Validazione HTML: `<input type="date" min="oggi" />`
- Validazione JS: confronto date normalizzate

#### Componenti Modificati

1. **GenericTaskForm.tsx**: Campo "Assegna Data di Inizio" con validazione
2. **CalendarPage.tsx**: Passa `start_date` al handler
3. **useGenericTasks.ts**: `calculateNextDue` accetta parametro `startDate`
4. **useMacroCategoryEvents.ts**: Usa `next_due` invece di `created_at` per data inizio

#### Query Pattern

```typescript
// Creazione task con data inizio
const { data, error } = await supabase
  .from('tasks')
  .insert({
    company_id: companyId,
    name: 'Pulizia cucina',
    frequency: 'weekly',
    assigned_to: 'dipendente',
    assignment_type: 'role',
    next_due: new Date('2025-10-18').toISOString(), // Data di inizio custom
  })
  .select()
  .single()
```

#### Impatto Database

- **Nessuna migrazione richiesta**: usa campo esistente `next_due`
- Campo `next_due` rappresenta la prima occorrenza del task
- Per task ricorrenti, espansione parte da `next_due` (se presente) o `created_at` (fallback)

---

### 9.2 Intervallo Date e Anno Lavorativo (2025-01-12)

**Feature:** Intervallo date per task e espansione automatica fino a fine anno lavorativo.

#### Interfacce Aggiornate

```typescript
// CreateGenericTaskInput con end_date
export interface CreateGenericTaskInput {
  name: string
  frequency: GenericTask['frequency']
  assigned_to_role: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  note?: string
  custom_days?: string[]
  start_date?: string  // Data di inizio
  end_date?: string    // NUOVO: Data di fine (limita espansione)
}

// GenericTaskFormData con dataFine
interface GenericTaskFormData {
  name: string
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  dataInizio?: string
  dataFine?: string    // NUOVO: Data di fine intervallo
  note?: string
}
```

#### Logica

**1. Intervallo Date Personalizzato:**
- Utente può specificare `start_date` e `end_date`
- Eventi generati SOLO in questo intervallo
- Esempio: dal 02/08/2025 al 03/09/2025

**2. Espansione fino a Anno Lavorativo:**
- Se `end_date` non specificato → espansione fino a `fiscal_year_end`
- Se `end_date` specificato → usa il minimo tra `end_date` e `fiscal_year_end`
- Se calendario non configurato → fallback a +90 giorni

**3. Serializzazione end_date:**
```typescript
// Storage in description
if (input.end_date) {
  payload.description = payload.description 
    ? `${payload.description}\n[END_DATE:${input.end_date}]`
    : `[END_DATE:${input.end_date}]`
}

// Estrazione con regex
function extractEndDate(description?: string): Date | null {
  if (!description) return null
  const match = description.match(/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/)
  return match ? new Date(match[1]) : null
}
```

#### Validazioni

**Data Fine:**
```typescript
// Deve essere successiva a data inizio
if (formData.dataFine) {
  const endDate = new Date(formData.dataFine)
  const startDate = formData.dataInizio ? new Date(formData.dataInizio) : new Date()
  
  if (endDate <= startDate) {
    throw new Error('La data di fine deve essere successiva alla data di inizio')
  }
}
```

**Input HTML:**
```html
<input 
  type="date" 
  min={formData.dataInizio || today} 
  value={formData.dataFine}
/>
```

#### Componenti Modificati

1. **GenericTaskForm.tsx**: Campo "Assegna Data di Fine" con validazione dinamica
2. **CalendarPage.tsx**: Passa `end_date` e carica `fiscal_year_end` da settings
3. **useGenericTasks.ts**: Serializza `end_date` in `description`
4. **useMacroCategoryEvents.ts**: `extractEndDate()` helper, espansione con `fiscalYearEnd`
5. **useAggregatedEvents.ts**: `expandRecurringTask()` con logica priorità date
6. **Calendar.tsx**: Passa `fiscal_year_end` a `useMacroCategoryEvents()`

#### Algoritmo Espansione

```typescript
// 1. Data inizio
const startDate = task.next_due ?? task.created_at

// 2. Estrai end_date se presente
const taskEndDate = extractEndDate(task.description)

// 3. Determina data finale (PRIORITÀ)
let endDate: Date
if (fiscalYearEnd) {
  if (taskEndDate) {
    endDate = min(taskEndDate, fiscalYearEnd)  // Più restrittivo
  } else {
    endDate = fiscalYearEnd
  }
} else if (taskEndDate) {
  endDate = taskEndDate
} else {
  endDate = addDays(now, 90)  // Fallback
}

// 4. Genera eventi ricorrenti
while (currentDate <= endDate) {
  events.push(createEvent(currentDate))
  currentDate = addInterval(currentDate, frequency)
}
```

#### Query Pattern

```typescript
// Creazione task con intervallo
const { data } = await supabase
  .from('tasks')
  .insert({
    company_id: companyId,
    name: 'Mansione estiva',
    frequency: 'weekly',
    assigned_to: 'dipendente',
    assignment_type: 'role',
    next_due: new Date('2025-06-01').toISOString(),  // Inizio
    description: '[END_DATE:2025-08-31]',             // Fine (serializzato)
  })
  .select()
  .single()

// Risultato: eventi dal 1 giugno al 31 agosto 2025
```

#### Casi d'Uso

**Caso 1: Attività Stagionale**
```
Mansione: "Servizio estivo"
Data Inizio: 01/06/2025
Data Fine: 30/09/2025
→ Attività visibile SOLO nei mesi estivi
```

**Caso 2: Progetto Temporaneo**
```
Mansione: "Ristrutturazione cucina"
Data Inizio: 15/02/2025
Data Fine: 15/03/2025
→ Attività visibile solo durante il mese di ristrutturazione
```

**Caso 3: Attività Annuale Standard**
```
Mansione: "Pulizia settimanale"
Data Inizio: (vuota - usa oggi)
Data Fine: (vuota)
Anno Lavorativo: 01/01/2025 - 31/12/2025
→ Attività da oggi fino al 31/12/2025
```

#### Impatto Database

- **Nessuna migrazione richiesta**: usa campo esistente `description` per serializzare `end_date`
- **Formato serializzazione**: `[END_DATE:YYYY-MM-DD]` aggiunto in fondo alla description
- **Parsing**: Regex `/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/` estrae la data
- **Compatibilità**: Task senza `[END_DATE:]` usano fiscal_year_end o +90 giorni

---

## 10. SISTEMA CALENDARIO AZIENDALE

### 10.1 Configurazione Calendario (Onboarding Step 7)

**Tabella:** `company_calendar_settings`

```typescript
export interface CompanyCalendarSettings {
  id: string                    // UUID
  company_id: string           // UUID → companies.id (UNIQUE)
  fiscal_year_start: string    // DATE formato 'YYYY-MM-DD'
  fiscal_year_end: string      // DATE formato 'YYYY-MM-DD'
  closure_dates: string[]      // DATE[] - Array di date chiusura
  open_weekdays: number[]      // INTEGER[] - Giorni apertura (0=dom, 6=sab)
  business_hours: BusinessHours // JSONB - Orari per giorno settimana
  is_configured: boolean       // DEFAULT false
  created_at: Date             // TIMESTAMPTZ
  updated_at: Date             // TIMESTAMPTZ
}

export interface BusinessHours {
  [weekday: string]: TimeSlot[] // '0' to '6'
}

export interface TimeSlot {
  open: string   // 'HH:MM' formato 24h
  close: string  // 'HH:MM' formato 24h
}
```

### 10.2 Contatore Giorni Lavorativi

**Feature:** Calcolo automatico giorni lavorativi nell'anno fiscale

#### Interfaccia Calcolo
```typescript
interface WorkingDaysStats {
  totalDays: number                // Giorni totali anno fiscale
  weeklyClosureDays: number        // Giorni chiusura settimanale
  programmedClosureDays: number    // Chiusure programmate (smart count)
  programmedClosureDaysTotal: number // Totale chiusure (include quelle in giorni già chiusi)
  workingDays: number              // Giorni lavorativi effettivi
  closedWeekdaysNames: string[]    // ['Domenica', 'Lunedì', ...]
}
```

#### Formula Calcolo
```typescript
// 1. Giorni totali
const totalDays = Math.round(
  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
) + 1

// 2. Chiusure settimanali (es. tutte le domeniche)
const closedWeekdays = [0,1,2,3,4,5,6].filter(day => !open_weekdays.includes(day))
let weeklyClosureDays = 0
for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
  if (closedWeekdays.includes(date.getDay())) weeklyClosureDays++
}

// 3. Chiusure programmate (SMART: no doppi conteggi)
let programmedClosureDays = 0
for (const closureDate of closure_dates) {
  const dayOfWeek = new Date(closureDate).getDay()
  // Conta SOLO se cade in giorno normalmente aperto
  if (!closedWeekdays.includes(dayOfWeek)) {
    programmedClosureDays++
  }
}

// 4. Risultato finale
const workingDays = totalDays - weeklyClosureDays - programmedClosureDays
```

#### Esempio Pratico
```
Anno Fiscale: 01/01/2025 - 31/12/2025
Giorni Apertura: Lun-Sab (chiuso Domenica)
Chiusure Programmate:
  - 25 Dicembre (Natale) → cade Giovedì → CONTATO
  - 1 Gennaio (Capodanno) → cade Mercoledì → CONTATO
  - 15 Agosto (Ferragosto) → cade Domenica → NON CONTATO (già chiuso)

Calcolo:
  365 giorni totali
  - 52 domeniche (settimanali)
  - 2 chiusure programmate (escluso Ferragosto)
  = 311 giorni lavorativi
```

### 10.3 Query Patterns

#### Salvataggio Configurazione
```typescript
const { data, error } = await supabase
  .from('company_calendar_settings')
  .insert({
    company_id: companyId,
    fiscal_year_start: '2025-01-01',
    fiscal_year_end: '2025-12-31',
    closure_dates: ['2025-12-25', '2025-01-01', '2025-08-15'],
    open_weekdays: [1,2,3,4,5,6], // Lun-Sab
    business_hours: {
      '1': [{ open: '09:00', close: '22:00' }],
      '2': [{ open: '09:00', close: '22:00' }],
      // ... altri giorni
    },
    is_configured: true,
  })
  .select()
  .single()
```

#### Lettura Configurazione
```typescript
const { data: calendarSettings } = await supabase
  .from('company_calendar_settings')
  .select('*')
  .eq('company_id', companyId)
  .single()

// Verifica se configurato
if (!calendarSettings?.is_configured) {
  // Redirect a configurazione
}
```

### 10.4 RLS Policies Calendario

```sql
-- Visualizzazione
CREATE POLICY "Users can view company calendar settings"
ON company_calendar_settings FOR SELECT
USING (is_company_member(company_id));

-- Inserimento (onboarding)
CREATE POLICY "Allow insert calendar settings"
ON company_calendar_settings FOR INSERT
WITH CHECK (true);

-- Aggiornamento
CREATE POLICY "Users can update company calendar settings"
ON company_calendar_settings FOR UPDATE
USING (is_company_member(company_id));
```

### 10.5 Componenti UI

**File:** `src/components/onboarding-steps/CalendarConfigStep.tsx`

**Sezioni:**
1. **Anno Fiscale** - Date picker inizio/fine
2. **Giorni Apertura** - Toggle per ogni giorno settimana
3. **Chiusure Programmate** - Gestione date chiusura (singole/periodi)
4. **Orari Lavorativi** - Time slots per ogni giorno aperto
5. **Contatore Giorni Lavorativi** - Box riepilogo con statistiche

**Contatore UI:**
```jsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50">
  {/* Header con icona calendario */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* 4 Card: Totali, Settimanali, Programmati, Lavorativi */}
  </div>
  {/* Formula esplicativa */}
  {/* Barra percentuale apertura */}
</div>
```

### 10.6 Validazioni

```typescript
// Anno fiscale
if (fiscal_year_end <= fiscal_year_start) {
  throw new Error('La data di fine deve essere successiva alla data di inizio')
}

// Giorni apertura (almeno 1)
if (open_weekdays.length === 0) {
  throw new Error('Devi selezionare almeno un giorno di apertura')
}

// Orari per ogni giorno aperto
for (const weekday of open_weekdays) {
  if (!business_hours[weekday] || business_hours[weekday].length === 0) {
    throw new Error(`Mancano gli orari per ${getWeekdayName(weekday)}`)
  }
}

// Time slots validi
for (const slot of business_hours[weekday]) {
  if (slot.close <= slot.open) {
    throw new Error('Orario chiusura deve essere dopo apertura')
  }
}
```

### 10.7 Utilities

**File:** `src/utils/calendarUtils.ts`

```typescript
// Conversione weekday number → nome
export function getWeekdayName(weekday: number): string {
  const names = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  return names[weekday]
}

// Formattazione date per display
export function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Validazione anno fiscale
export function validateFiscalYear(start: string, end: string): string | null {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  if (endDate <= startDate) {
    return 'La data di fine deve essere successiva alla data di inizio'
  }
  
  const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
  if (diffDays < 180) {
    return 'L\'anno fiscale deve durare almeno 6 mesi'
  }
  if (diffDays > 730) {
    return 'L\'anno fiscale non può superare i 2 anni'
  }
  
  return null
}
```

### 10.8 Default Configuration

```typescript
export const DEFAULT_CALENDAR_CONFIG: CalendarConfigInput = {
  fiscal_year_start: `${new Date().getFullYear()}-01-01`,
  fiscal_year_end: `${new Date().getFullYear()}-12-31`,
  closure_dates: [],
  open_weekdays: [1, 2, 3, 4, 5, 6], // Lunedì-Sabato
  business_hours: {
    '1': [{ open: '09:00', close: '22:00' }],
    '2': [{ open: '09:00', close: '22:00' }],
    '3': [{ open: '09:00', close: '22:00' }],
    '4': [{ open: '09:00', close: '22:00' }],
    '5': [{ open: '09:00', close: '22:00' }],
    '6': [{ open: '09:00', close: '22:00' }],
  },
}
```

---

## 🎯 CHECKLIST COMPLIANCE

Usa questa checklist per verificare la compliance del codice:

```typescript
// ✅ Per ogni nuova interfaccia TypeScript:
[ ] Controlla che i campi corrispondano esattamente allo schema database
[ ] Usa i tipi corretti (Date, string, number, boolean)
[ ] Gestisci null vs undefined correttamente
[ ] Definisci enum types corrispondenti ai CHECK constraints
[ ] Aggiungi JSDoc per documentare campi complessi

// ✅ Per ogni nuova query Supabase:
[ ] Seleziona solo i campi necessari (evita SELECT *)
[ ] Gestisci errori con try/catch
[ ] Usa React Query per caching quando possibile
[ ] Verifica che RLS sia attivo per la tabella
[ ] Testa la query con dati reali

// ✅ Per ogni nuova mutation:
[ ] Valida input prima di INSERT/UPDATE
[ ] Gestisci constraint violations
[ ] Invalida cache React Query dopo successo
[ ] Registra azione in audit_logs se rilevante
[ ] Testa rollback in caso di errore

// ✅ Per ogni nuovo componente:
[ ] Usa interfacce TypeScript per props
[ ] Gestisci stati di loading/error
[ ] Mostra feedback utente (toast, spinner)
[ ] Verifica permessi utente quando necessario
[ ] Testa con dati vuoti, normali, ed edge cases
```

---

## 📚 RIFERIMENTI RAPIDI

### Collegamenti Utili

- **Schema Database**: `NoClerk/SCHEMA_ATTUALE.md`
- **Setup Manuale**: `SUPABASE_MANUAL_SETUP.md`
- **Istruzioni Setup**: `ISTRUZIONI_SETUP_NUOVO_PROGETTO.md`
- **File SQL Completo**: `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`
- **RLS Functions**: `database/functions/rls_helpers.sql`
- **Migration 001**: `database/migrations/001_supabase_auth_setup.sql`

### Query Cheat Sheet

```sql
-- Verifica RLS attivo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Lista tutte le policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Verifica company_id attivo
SELECT get_active_company_id();

-- Lista aziende utente
SELECT * FROM get_user_companies();

-- Verifica ruolo
SELECT get_user_role_for_company('[company-id]');
```

---

---

## 10. PULSANTI E CONTROLLI UI

### 10.1 ONBOARDING WIZARD - PULSANTI DEV

#### **DevButtons Component** (`src/components/DevButtons.tsx`)
```typescript
// Raggruppamento: Header dell'OnboardingWizard
// Posizione: Sopra il navigatore degli step
// Visibilità: Solo in modalità sviluppo (DEV)

interface DevButtonsProps {
  onPrefillOnboarding: () => void      // Pulsante "Precompila"
  onResetOnboarding: () => void        // Pulsante "Reset Onboarding" 
  onCompleteOnboarding: () => void     // Pulsante "Completa Onboarding"
  isDevMode: boolean                   // Visibilità condizionale
}
```

#### **Pulsanti Specifici:**
1. **"Precompila"** 
   - Funzione: `handlePrefillOnboarding`
   - Icona: `FileText`
   - Colore: Verde (`text-green-600`, `border-green-200`)

2. **"Completa Onboarding"** ⭐ *[PULSANTE PRINCIPALE]*
   - Funzione: `handleCompleteOnboarding`
   - Icona: `CheckCircle`
   - Colore: Blu (`text-blue-600`, `border-blue-200`)
   - **Log Debug**: `🔵 [DevButtons] CLICK su "Completa Onboarding"`

3. **"Reset Onboarding"**
   - Funzione: `handleResetOnboarding`
   - Icona: `RotateCcw`
   - Colore: Arancione (`text-orange-600`, `border-orange-200`)

### 10.2 NAVIGAZIONE ONBOARDING

#### **Pulsante "Salta"** (Header Wizard)
- Posizione: Top-right dell'header
- Funzione: `handleSkipOnboarding`
- Icona: `X`
- Colore: Grigio (`text-gray-600`, `border-gray-300`)

#### **Pulsante "Avanti"** (Step Navigator)
- Posizione: Footer di ogni step
- Funzione: `completeOnboardingFromWizard` (ultimo step)
- **Log Debug**: `🟣 [OnboardingWizard] completeOnboardingFromWizard CHIAMATO`

### 10.3 HEADER NAVIGAZIONE PRINCIPALE

#### **HeaderButtons Component** (`src/components/HeaderButtons.tsx`)
```typescript
// Raggruppamento: Top navigation bar
// Posizione: Sopra il contenuto principale
// Visibilità: Sempre visibile

interface HeaderButtonsProps {
  // Pulsanti di debug/sviluppo
  onSyncHost?: () => void              // "Sync Host"
  onResetManual?: () => void           // "Reset Man."
  onResetOnboarding?: () => void       // "Reset Onb."
  onResetAllData?: () => void          // "All Data"
  onResetTotAndUsers?: () => void      // "Tot+Utenti"
  onPrefillOnboarding?: () => void     // "Prefill"
  onCompleteOnboarding?: () => void    // "Complete" ⭐
}
```

### 10.4 MAPPING FUNZIONI → PULSANTI

| **Funzione** | **Pulsante UI** | **Posizione** | **Componente** |
|--------------|-----------------|---------------|----------------|
| `completeOnboarding()` | "Completa Onboarding" | Header Wizard | `DevButtons` |
| `completeOnboarding()` | "Complete" | Top Nav | `HeaderButtons` |
| `completeOnboardingFromWizard()` | "Avanti" | Step Footer | `OnboardingWizard` |
| `handlePrefillOnboarding()` | "Precompila" | Header Wizard | `DevButtons` |
| `handleResetOnboarding()` | "Reset Onboarding" | Header Wizard | `DevButtons` |
| `handleSkipOnboarding()` | "Salta" | Header Wizard | `OnboardingWizard` |

### 10.5 LOG DEBUG PATTERN

#### **Struttura Log Completa:**
```typescript
// 1. Click Detection
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔵 [DevButtons] CLICK su "Completa Onboarding"')
console.log('📍 Sorgente: DevButtons nell\'OnboardingWizard')
console.log('⏰ Timestamp:', new Date().toISOString())

// 2. Function Call
console.log('🟢 [OnboardingWizard] handleCompleteOnboarding CHIAMATO')
console.log('📊 CompanyId ricevuto:', companyId || 'NULL')

// 3. Core Function
console.log('🔵 [completeOnboarding] FUNZIONE PRINCIPALE AVVIATA')
console.log('📥 Parametri ricevuti:', { companyIdParam, formDataParam })
```

---

**Versione Glossario**: 1.5.0  
**Ultimo Aggiornamento**: 9 Gennaio 2025  
**Stato**: ✅ Produzione Ready  
**Maintainer**: Dev Team BHM v.2

