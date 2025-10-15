# 📋 REPORT VERIFICA SCHEMA SQL - BHM v.2
**Data**: 9 Gennaio 2025  
**File Analizzato**: `supabase/Attuale schema SQL.sql`  
**Scopo**: Verificare che lo schema SQL rispecchi perfettamente lo stato attuale del codice

---

## ✅ STATO GENERALE

Lo schema SQL `Attuale schema SQL.sql` è **PARZIALMENTE ALLINEATO** con il codice attuale. Presenta alcune **discrepanze critiche** e **campi mancanti** che devono essere corretti prima di utilizzarlo per ricreare il database in un nuovo progetto Supabase.

---

## 📊 TABELLE ANALIZZATE

### 1. ✅ **companies** - CORRETTO
**Schema SQL** (righe 4-13):
```sql
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  address text NOT NULL,
  staff_count integer NOT NULL CHECK (staff_count > 0),
  email character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
```

**Utilizzo nel codice**: 
- Usato in `useAuth.ts` per il campo `company_id` in `user_profiles`
- Tutti i campi sono presenti e corretti
- ✅ **ALLINEATO**

---

### 2. ⚠️ **departments** - CORRETTO
**Schema SQL** (righe 31-40):
```sql
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/management/hooks/useDepartments.ts`
```typescript
interface Department {
  id: string
  company_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

- ✅ **ALLINEATO** - Tutti i campi corrispondono

---

### 3. ⚠️ **staff** - PARZIALMENTE CORRETTO
**Schema SQL** (righe 177-194):
```sql
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  role character varying NOT NULL,
  category character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email character varying,
  phone character varying,
  hire_date date,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying]::text[])),
  notes text,
  haccp_certification jsonb,
  department_assignments ARRAY,
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/management/hooks/useStaff.ts`
```typescript
interface StaffMember {
  id: string
  company_id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string
  email?: string | null
  phone?: string | null
  hire_date?: string | null
  status: 'active' | 'inactive' | 'suspended'
  notes?: string | null
  haccp_certification?: HaccpCertification | null
  department_assignments?: string[] | null
  created_at: string
  updated_at: string
}
```

**⚠️ PROBLEMI**:
- ❌ **department_assignments**: Lo schema dice `ARRAY` ma dovrebbe essere `TEXT[]` o `UUID[]`
- ⚠️ Il tipo `role` dovrebbe avere un CHECK constraint per garantire solo i valori: 'admin', 'responsabile', 'dipendente', 'collaboratore'
- ⚠️ Il tipo `category` dovrebbe avere un CHECK constraint per i valori consentiti

**RACCOMANDAZIONI**:
```sql
-- Correggere il campo department_assignments
ALTER TABLE staff ALTER COLUMN department_assignments TYPE UUID[];

-- Aggiungere CHECK constraint per role
ALTER TABLE staff ADD CONSTRAINT staff_role_check 
  CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore'));
```

---

### 4. ❌ **tasks** - DISCREPANZE CRITICHE
**Schema SQL** (righe 195-224):
```sql
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  frequency character varying NOT NULL,
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  department_id uuid,
  conservation_point_id uuid,
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying]::text[])),
  estimated_duration integer DEFAULT 60,
  checklist ARRAY DEFAULT '{}'::text[],
  required_tools ARRAY DEFAULT '{}'::text[],
  haccp_category character varying,
  documentation_url character varying,
  validation_notes text,
  next_due timestamp with time zone,
  status character varying DEFAULT 'pending'::character varying,
  assigned_to_staff_id uuid,
  assigned_to_role character varying,
  assigned_to_category character varying,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_department_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT tasks_conservation_point_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT tasks_staff_fkey FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id),
  CONSTRAINT tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/calendar/hooks/useGenericTasks.ts`
```typescript
interface GenericTask {
  id: string
  company_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'annual' | 'as_needed' | 'custom'
  assigned_to: string
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  assignment_type?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration?: number
  next_due?: Date
  status: string
  created_at: Date
  updated_at: Date
}
```

**❌ PROBLEMI CRITICI**:
1. ❌ **assignment_type**: Nello schema è `USER-DEFINED NOT NULL`, ma dovrebbe essere `VARCHAR` con valori 'role' | 'staff' | 'category'
2. ❌ **frequency**: Manca CHECK constraint per validare i valori consentiti
3. ❌ **status**: Manca CHECK constraint per validare i valori ('pending', 'completed', 'overdue', ecc.)
4. ⚠️ **checklist** e **required_tools**: Dovrebbero essere `TEXT[]` invece di `ARRAY`

**RACCOMANDAZIONI**:
```sql
-- Correggere assignment_type
ALTER TABLE tasks ALTER COLUMN assignment_type TYPE VARCHAR;
ALTER TABLE tasks ADD CONSTRAINT tasks_assignment_type_check 
  CHECK (assignment_type IN ('role', 'staff', 'category'));

-- Aggiungere CHECK constraint per frequency
ALTER TABLE tasks ADD CONSTRAINT tasks_frequency_check 
  CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom'));

-- Aggiungere CHECK constraint per status
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled'));

-- Correggere i campi array
ALTER TABLE tasks ALTER COLUMN checklist TYPE TEXT[];
ALTER TABLE tasks ALTER COLUMN required_tools TYPE TEXT[];
```

---

### 5. ⚠️ **maintenance_tasks** - PROBLEMI MODERATI
**Schema SQL** (righe 53-77):
```sql
CREATE TABLE public.maintenance_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  conservation_point_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  frequency character varying NOT NULL,
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  assigned_to_staff_id uuid,
  assigned_to_role character varying,
  assigned_to_category character varying,
  title character varying,
  description text,
  priority character varying DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying]::text[])),
  status character varying DEFAULT 'scheduled'::character varying CHECK (status::text = ANY (ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'overdue'::character varying, 'skipped'::character varying]::text[])),
  next_due timestamp with time zone,
  estimated_duration integer DEFAULT 60,
  instructions ARRAY,
  CONSTRAINT maintenance_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT maintenance_tasks_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT maintenance_tasks_staff_fkey FOREIGN KEY (assigned_to_staff_id) REFERENCES public.staff(id)
);
```

**Utilizzo nel codice**: `src/types/conservation.ts`
```typescript
interface MaintenanceTask {
  id: string
  company_id: string
  conservation_point_id: string
  title: string
  description?: string
  type: MaintenanceType  // 'temperature' | 'sanitization' | 'defrosting'
  frequency: MaintenanceFrequency
  estimated_duration: number
  last_completed?: Date
  next_due: Date
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'
  checklist?: string[]
  required_tools?: string[]
  safety_notes?: string[]
  completion_notes?: string
  completed_by?: string
  completed_at?: Date
  created_at: Date
  updated_at: Date
}
```

**❌ PROBLEMI**:
1. ❌ **type** e **assignment_type**: Marcati come `USER-DEFINED` ma dovrebbero essere `VARCHAR` con CHECK constraints
2. ❌ **instructions**: Dovrebbe essere `TEXT[]` invece di `ARRAY`
3. ⚠️ **Campi mancanti nel DB**: `checklist`, `required_tools`, `safety_notes`, `completion_notes`, `completed_by`, `completed_at`, `last_completed`

**RACCOMANDAZIONI**:
```sql
-- Correggere i tipi
ALTER TABLE maintenance_tasks ALTER COLUMN type TYPE VARCHAR;
ALTER TABLE maintenance_tasks ADD CONSTRAINT maintenance_tasks_type_check 
  CHECK (type IN ('temperature', 'sanitization', 'defrosting'));

ALTER TABLE maintenance_tasks ALTER COLUMN assignment_type TYPE VARCHAR;
ALTER TABLE maintenance_tasks ADD CONSTRAINT maintenance_tasks_assignment_type_check 
  CHECK (assignment_type IN ('role', 'staff', 'category'));

ALTER TABLE maintenance_tasks ALTER COLUMN instructions TYPE TEXT[];

-- Aggiungere campi mancanti
ALTER TABLE maintenance_tasks ADD COLUMN checklist TEXT[];
ALTER TABLE maintenance_tasks ADD COLUMN required_tools TEXT[];
ALTER TABLE maintenance_tasks ADD COLUMN safety_notes TEXT[];
ALTER TABLE maintenance_tasks ADD COLUMN completion_notes TEXT;
ALTER TABLE maintenance_tasks ADD COLUMN completed_by UUID REFERENCES user_profiles(id);
ALTER TABLE maintenance_tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE maintenance_tasks ADD COLUMN last_completed TIMESTAMP WITH TIME ZONE;
```

---

### 6. ✅ **events** - CORRETTO
**Schema SQL** (righe 41-52):
```sql
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/shared/hooks/useEvents.ts`
- ✅ **ALLINEATO** - Tutti i campi corrispondono perfettamente

---

### 7. ✅ **notes** - CORRETTO
**Schema SQL** (righe 101-110):
```sql
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/shared/hooks/useNotes.ts`
- ✅ **ALLINEATO** - Tutti i campi corrispondono

---

### 8. ⚠️ **non_conformities** - TIPO ENUM PROBLEMATICO
**Schema SQL** (righe 89-100):
```sql
CREATE TABLE public.non_conformities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  severity USER-DEFINED NOT NULL,
  status USER-DEFINED DEFAULT 'open'::status_type,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT non_conformities_pkey PRIMARY KEY (id),
  CONSTRAINT non_conformities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/features/shared/hooks/useNonConformities.ts`
```typescript
type NonConformitySeverity = 'low' | 'medium' | 'high' | 'critical'
type NonConformityStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
```

**❌ PROBLEMI**:
1. ❌ **severity** e **status**: Marcati come `USER-DEFINED` ma il tipo ENUM `status_type` non è definito nel file
2. ⚠️ Manca la definizione degli ENUM types

**RACCOMANDAZIONI**:
```sql
-- Creare gli ENUM types prima della tabella
CREATE TYPE severity_type AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE status_type AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Oppure usare VARCHAR con CHECK constraints
ALTER TABLE non_conformities ALTER COLUMN severity TYPE VARCHAR;
ALTER TABLE non_conformities ADD CONSTRAINT non_conformities_severity_check 
  CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE non_conformities ALTER COLUMN status TYPE VARCHAR;
ALTER TABLE non_conformities ADD CONSTRAINT non_conformities_status_check 
  CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));
```

---

### 9. ⚠️ **conservation_points** - TIPO ENUM PROBLEMATICO
**Schema SQL** (righe 14-30):
```sql
CREATE TABLE public.conservation_points (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  department_id uuid NOT NULL,
  name character varying NOT NULL,
  setpoint_temp numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  product_categories ARRAY DEFAULT '{}'::text[],
  is_blast_chiller boolean DEFAULT false,
  status character varying DEFAULT 'normal'::character varying CHECK (status::text = ANY (ARRAY['normal'::character varying, 'warning'::character varying, 'critical'::character varying]::text[])),
  maintenance_due timestamp with time zone,
  CONSTRAINT conservation_points_pkey PRIMARY KEY (id),
  CONSTRAINT conservation_points_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT conservation_points_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
```

**Utilizzo nel codice**: `src/types/conservation.ts`
```typescript
type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'
type ConservationStatus = 'normal' | 'warning' | 'critical'
```

**❌ PROBLEMI**:
1. ❌ **type**: Marcato come `USER-DEFINED` ma dovrebbe avere un CHECK constraint o ENUM
2. ⚠️ **product_categories**: Correttamente `ARRAY` ma dovrebbe essere specificato come `TEXT[]`

**RACCOMANDAZIONI**:
```sql
-- Correggere il tipo
ALTER TABLE conservation_points ALTER COLUMN type TYPE VARCHAR;
ALTER TABLE conservation_points ADD CONSTRAINT conservation_points_type_check 
  CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast'));

-- Specificare meglio product_categories
ALTER TABLE conservation_points ALTER COLUMN product_categories TYPE TEXT[];
```

---

### 10. ⚠️ **products** - CAMPO MANCANTE
**Schema SQL** (righe 120-146):
```sql
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  category_id uuid,
  department_id uuid,
  conservation_point_id uuid,
  barcode character varying,
  sku character varying,
  supplier_name character varying,
  purchase_date timestamp with time zone,
  expiry_date timestamp with time zone,
  quantity numeric,
  unit character varying,
  allergens ARRAY DEFAULT '{}'::text[],
  label_photo_url character varying,
  notes text,
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'expired'::character varying, 'consumed'::character varying, 'waste'::character varying]::text[])),
  compliance_status character varying CHECK (compliance_status::text = ANY (ARRAY['compliant'::character varying, 'warning'::character varying, 'non_compliant'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id),
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT products_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id)
);
```

**Utilizzo nel codice**: `src/types/inventory.ts`
```typescript
interface Product {
  id: string
  company_id: string
  name: string
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  barcode?: string
  sku?: string
  supplier_name?: string
  purchase_date?: Date
  expiry_date?: Date
  quantity?: number
  unit?: string
  allergens: AllergenType[]
  label_photo_url?: string
  notes?: string
  status: 'active' | 'expired' | 'consumed' | 'waste'
  compliance_status?: 'compliant' | 'warning' | 'non_compliant'
  created_at: Date
  updated_at: Date
}
```

**⚠️ PROBLEMI**:
1. ⚠️ **allergens**: Dovrebbe essere `TEXT[]` invece di `ARRAY`
2. ✅ Gli altri campi sono allineati

**RACCOMANDAZIONI**:
```sql
-- Specificare meglio allergens
ALTER TABLE products ALTER COLUMN allergens TYPE TEXT[];
```

---

### 11. ✅ **product_categories** - CORRETTO
**Schema SQL** (righe 111-119):
```sql
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**Utilizzo nel codice**: `src/types/inventory.ts`
- ✅ **ALLINEATO** - Tutti i campi base corrispondono
- ⚠️ **NOTA**: Il codice TypeScript ha campi aggiuntivi (`color`, `description`, `conservation_rules`) non presenti nello schema SQL, ma questi potrebbero essere calcolati o aggiunti in futuro

---

### 12. ✅ **temperature_readings** - CORRETTO (ma schema diverso da COMPLETE-DATABASE-SETUP.sql)
**Schema SQL** (righe 225-235):
```sql
CREATE TABLE public.temperature_readings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  conservation_point_id uuid NOT NULL,
  temperature numeric NOT NULL,
  recorded_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT temperature_readings_pkey PRIMARY KEY (id),
  CONSTRAINT temperature_readings_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id),
  CONSTRAINT temperature_readings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
```

**⚠️ NOTA IMPORTANTE**: 
Il file `database/COMPLETE-DATABASE-SETUP.sql` ha una versione **DIVERSA** di questa tabella con campi aggiuntivi:
- `target_temperature`
- `tolerance_range_min`
- `tolerance_range_max`
- `status`
- `recorded_by`
- `method`
- `notes`
- `photo_evidence`

**Utilizzo nel codice**: `src/types/conservation.ts`
```typescript
interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  recorded_at: Date
  created_at: Date
  conservation_point?: ConservationPoint
}
```

**✅ ALLINEATO con lo schema base**, ma **NON ALLINEATO** con `COMPLETE-DATABASE-SETUP.sql`

---

### 13. ✅ **shopping_lists** - CORRETTO
**Schema SQL** (righe 164-176):
```sql
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  created_by uuid,
  is_template boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_lists_pkey PRIMARY KEY (id)
);
```

**Utilizzo nel codice**: `src/types/inventory.ts`
- ✅ **ALLINEATO** - Tutti i campi corrispondono
- ⚠️ **NOTA**: Manca il foreign key constraint per `created_by` → dovrebbe referenziare `user_profiles(id)`

**RACCOMANDAZIONI**:
```sql
ALTER TABLE shopping_lists 
  ADD CONSTRAINT shopping_lists_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES user_profiles(id);
```

---

### 14. ✅ **shopping_list_items** - CORRETTO
**Schema SQL** (righe 147-163):
```sql
CREATE TABLE public.shopping_list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL,
  product_id uuid,
  product_name character varying NOT NULL,
  category_name character varying NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit character varying,
  notes text,
  is_completed boolean DEFAULT false,
  added_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_list_items_pkey PRIMARY KEY (id),
  CONSTRAINT shopping_list_items_shopping_list_id_fkey FOREIGN KEY (shopping_list_id) REFERENCES public.shopping_lists(id)
);
```

**Utilizzo nel codice**: `src/types/inventory.ts`
```typescript
interface ShoppingListItem {
  id: string
  product_id?: string
  product_name: string
  quantity?: number
  unit?: string
  category?: string
  notes?: string
  is_purchased: boolean  // ⚠️ Diverso da is_completed
  created_at: Date
}
```

**⚠️ PROBLEMI**:
1. ⚠️ Il codice usa `is_purchased` mentre lo schema ha `is_completed` - **DISCREPANZA DI NOMENCLATURA**
2. ⚠️ Il codice non ha `category_name` come campo obbligatorio ma lo schema sì

**RACCOMANDAZIONI**:
- Decidere se usare `is_completed` o `is_purchased` e allineare codice e schema

---

### 15. ❌ **user_profiles** - CAMPO DEPRECATO
**Schema SQL** (righe 236-250):
```sql
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  clerk_user_id character varying NOT NULL UNIQUE,
  company_id uuid,
  email character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  staff_id uuid,
  role character varying DEFAULT 'guest'::character varying,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT fk_user_profiles_staff FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);
```

**Utilizzo nel codice**: `src/hooks/useAuth.ts`
```typescript
interface UserProfile {
  id: string
  clerk_user_id: string
  company_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  staff_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}
```

**❌ PROBLEMI CRITICI**:
1. ❌ **clerk_user_id**: L'app sta migrando da Clerk a Supabase Auth, quindi questo campo diventerà **DEPRECATO**
2. ⚠️ **role**: Dovrebbe avere un CHECK constraint per garantire solo i valori consentiti

**RACCOMANDAZIONI**:
```sql
-- Aggiungere CHECK constraint per role
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore', 'guest'));

-- Per la migrazione futura da Clerk a Supabase Auth:
-- 1. Rinominare clerk_user_id in auth_user_id
-- 2. Modificare il tipo per supportare UUID di Supabase Auth
ALTER TABLE user_profiles RENAME COLUMN clerk_user_id TO auth_user_id;
ALTER TABLE user_profiles ALTER COLUMN auth_user_id TYPE UUID USING auth_user_id::uuid;
```

---

### 16. ⚠️ **maintenance_tasks_backup** - TABELLA DA RIMUOVERE
**Schema SQL** (righe 78-88):
```sql
CREATE TABLE public.maintenance_tasks_backup (
  id uuid,
  company_id uuid,
  conservation_point_id uuid,
  kind USER-DEFINED,
  frequency character varying,
  assigned_to character varying,
  assignment_type USER-DEFINED,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

**❌ PROBLEMA CRITICO**:
- ❌ Questa è una **tabella di backup temporanea** che **NON DOVREBBE** essere inclusa nello schema definitivo
- ❌ Non ha chiavi primarie, foreign keys o constraints

**RACCOMANDAZIONI**:
```sql
-- RIMUOVERE questa tabella dallo schema
DROP TABLE IF EXISTS maintenance_tasks_backup;
```

---

## 🔍 TABELLE MANCANTI NEL FILE SQL

Confrontando con `database/COMPLETE-DATABASE-SETUP.sql`, le seguenti tabelle **NON sono presenti** nel file `Attuale schema SQL.sql`:

### ❌ **maintenance_completions**
Questa tabella è presente in `COMPLETE-DATABASE-SETUP.sql` ma **MANCA** in `Attuale schema SQL.sql`

```sql
CREATE TABLE maintenance_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  maintenance_task_id UUID NOT NULL,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  temperature_value DECIMAL(5,2),
  checklist_completed TEXT[] DEFAULT '{}',
  photo_evidence TEXT[],
  next_due_date TIMESTAMP WITH TIME ZONE,
  -- Foreign keys
  CONSTRAINT fk_completion_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_task FOREIGN KEY (maintenance_task_id) REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_user FOREIGN KEY (completed_by) REFERENCES user_profiles(id)
);
```

**⚠️ QUESTA TABELLA È NECESSARIA** per il funzionamento del sistema di manutenzione.

---

## 📌 PROBLEMI RICORRENTI

### 1. **Tipo `USER-DEFINED`**
Il problema più frequente è l'uso di `USER-DEFINED` per molti campi. Questo indica che:
- Lo schema è stato esportato da un database esistente che usa ENUM types
- Gli ENUM types non sono stati inclusi nel file SQL
- **Soluzione**: Sostituire con `VARCHAR` + CHECK constraints o creare gli ENUM types

### 2. **Tipo `ARRAY` generico**
Molti campi sono definiti come `ARRAY` senza specificare il tipo:
- `product_categories ARRAY`
- `allergens ARRAY`
- `checklist ARRAY`
- `required_tools ARRAY`
- `department_assignments ARRAY`
- `instructions ARRAY`

**Soluzione**: Specificare sempre `TEXT[]` o `UUID[]` a seconda del contenuto

### 3. **Mancanza di CHECK constraints**
Molti campi VARCHAR che dovrebbero avere valori limitati non hanno CHECK constraints:
- `role` in `staff`
- `category` in `staff`
- `frequency` in `tasks`
- `status` in varie tabelle

---

## 🎯 RACCOMANDAZIONI FINALI

### ✅ Azioni Immediate Prima di Usare lo Schema

1. **Rimuovere la tabella di backup**:
   ```sql
   -- NON includere maintenance_tasks_backup
   ```

2. **Aggiungere la tabella mancante**:
   ```sql
   -- Includere maintenance_completions da COMPLETE-DATABASE-SETUP.sql
   ```

3. **Correggere tutti i campi `USER-DEFINED`**:
   - Creare gli ENUM types necessari, oppure
   - Sostituire con VARCHAR + CHECK constraints

4. **Specificare il tipo per tutti gli ARRAY**:
   ```sql
   -- Cambiare ARRAY in TEXT[] o UUID[]
   ```

5. **Aggiungere CHECK constraints mancanti**:
   - `staff.role`
   - `staff.category`
   - `tasks.frequency`
   - `tasks.status`
   - `tasks.assignment_type`
   - `maintenance_tasks.type`
   - `maintenance_tasks.assignment_type`
   - `conservation_points.type`
   - `user_profiles.role`

6. **Allineare nomenclatura**:
   - Decidere tra `is_completed` vs `is_purchased` in `shopping_list_items`

7. **Preparare la migrazione Clerk → Supabase Auth**:
   - Pianificare la rinomina di `clerk_user_id` in `auth_user_id`
   - Modificare il tipo da VARCHAR a UUID

---

## 📊 SCHEMA CORRETTO GENERATO

Vuoi che generi uno schema SQL completamente corretto e pronto all'uso per il nuovo progetto Supabase?

**Opzioni**:
1. **Schema Minimale**: Include solo le correzioni critiche
2. **Schema Completo**: Include tutte le correzioni + campi aggiuntivi da COMPLETE-DATABASE-SETUP.sql
3. **Schema con Migrazione**: Include tutto + script per migrare da Clerk a Supabase Auth

---

## ✅ CONCLUSIONE

Lo schema SQL `Attuale schema SQL.sql` ha bisogno di **correzioni significative** prima di poter essere usato per ricreare il database. I problemi principali sono:

1. ❌ Tipi `USER-DEFINED` non definiti
2. ❌ Campi `ARRAY` senza tipo specificato
3. ❌ Mancanza di CHECK constraints
4. ❌ Tabella `maintenance_completions` mancante
5. ❌ Tabella `maintenance_tasks_backup` da rimuovere
6. ⚠️ Discrepanze minori di nomenclatura

**Raccomandazione**: Utilizzare `database/COMPLETE-DATABASE-SETUP.sql` come base e integrare le correzioni sopra indicate.

