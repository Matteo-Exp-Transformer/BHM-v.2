# 🔍 DEBUG REPORT - Database & TypeScript Compatibility Analysis

**Data**: 2025-01-05
**Progetto**: BHM v.2 - Business HACCP Manager
**Analisi**: Schema database Supabase vs TypeScript Types

---

## ⚠️ PROBLEMI CRITICI RILEVATI

### 1. **TABELLA `products` - SCHEMA MANCANTE**

**Gravità**: 🔴 CRITICA

**Problema**:
```sql
CREATE TABLE public.products (
  -- VUOTO! Nessuna colonna definita
);
```

**Impatto**:
- Impossibile salvare prodotti nel database
- Hook `useProducts` fallback su mock data
- Scadenze prodotti NON possono essere tracciate

**Soluzione Richiesta**:
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
  expiry_date timestamp with time zone,  -- CRITICO per scadenze calendario
  quantity numeric,
  unit character varying,

  allergens text[], -- Array di allergeni
  label_photo_url character varying,
  notes text,
  status character varying NOT NULL DEFAULT 'active', -- active, expired, consumed, waste

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id),
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT products_conservation_point_id_fkey FOREIGN KEY (conservation_point_id) REFERENCES public.conservation_points(id)
);
```

---

### 2. **MISMATCH: `maintenance_tasks` - Campi Assegnazione**

**Gravità**: 🟠 ALTA

**Schema DB**:
```sql
CREATE TABLE public.maintenance_tasks (
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  kind USER-DEFINED NOT NULL,
  ...
);
```

**TypeScript Type** (`types/conservation.ts`):
```typescript
export interface MaintenanceTask {
  assigned_to?: string  // Staff member ID (SINGOLO)
  // ❌ MANCA: assignment_type
  // ❌ MANCA: assigned_category
  // ❌ MANCA: assigned_role
  type: MaintenanceType  // ❌ DB usa "kind"
}
```

**Problemi**:
1. **Campo `kind` vs `type`**: DB usa `kind`, TypeScript usa `type`
2. **Assegnazione multipla non gestita**:
   - DB ha `assignment_type` (categoria/ruolo/specifico)
   - TypeScript ha solo `assigned_to` come stringa singola
3. **Filtraggio user-based impossibile**: Manca struttura per assegnazione categoria/ruolo

**Soluzione**:
Opzione A - **Aggiornare DB per allinearsi a TypeScript** (consigliato):
```sql
ALTER TABLE public.maintenance_tasks
  RENAME COLUMN kind TO type;

ALTER TABLE public.maintenance_tasks
  DROP COLUMN assignment_type,
  DROP COLUMN assigned_to;

ALTER TABLE public.maintenance_tasks
  ADD COLUMN assigned_to_staff_id uuid REFERENCES public.staff(id),
  ADD COLUMN assigned_to_role character varying CHECK (assigned_to_role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  ADD COLUMN assigned_to_category character varying;

-- Almeno UNO dei tre deve essere NOT NULL
ALTER TABLE public.maintenance_tasks
  ADD CONSTRAINT check_assignment
  CHECK (
    (assigned_to_staff_id IS NOT NULL) OR
    (assigned_to_role IS NOT NULL) OR
    (assigned_to_category IS NOT NULL)
  );
```

Opzione B - **Aggiornare TypeScript per allinearsi a DB**:
```typescript
export interface MaintenanceTask {
  kind: MaintenanceType  // Rinominare da "type"
  assigned_to: string  // Può essere ID staff, categoria o ruolo
  assignment_type: 'staff' | 'role' | 'category'
}
```

**Raccomandazione**: Opzione A (modificare DB) - più flessibile e meglio per filtering

---

### 3. **MISMATCH: `tasks` - Schema Generico**

**Gravità**: 🟡 MEDIA

**Schema DB**:
```sql
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  frequency character varying NOT NULL,
  assigned_to character varying NOT NULL,
  assignment_type USER-DEFINED NOT NULL,
  ...
);
```

**TypeScript** (`types/onboarding.ts`):
```typescript
export interface GeneralTask {
  id: string
  name: string
  description?: string  // ❌ MANCA nel DB
  frequency: TaskFrequency
  departmentId?: DepartmentSummary['id']  // ❌ MANCA nel DB
  conservationPointId?: ConservationPoint['id']  // ❌ MANCA nel DB
  priority: TaskPriority  // ❌ MANCA nel DB
  estimatedDuration: number  // ❌ MANCA nel DB
  checklist: string[]  // ❌ MANCA nel DB
  requiredTools: string[]  // ❌ MANCA nel DB
  haccpCategory: HaccpTaskCategory  // ❌ MANCA nel DB
  responsibleStaffIds?: StaffMember['id'][]  // ❌ DIVERSO da assigned_to
  documentationUrl?: string  // ❌ MANCA nel DB
  validationNotes?: string  // ❌ MANCA nel DB
}
```

**Problemi**:
- Schema DB molto minimalista
- TypeScript ha molti campi extra non persistibili
- Impossibile salvare checklist, priority, etc.

**Soluzione**:
```sql
ALTER TABLE public.tasks
  ADD COLUMN description text,
  ADD COLUMN department_id uuid REFERENCES public.departments(id),
  ADD COLUMN conservation_point_id uuid REFERENCES public.conservation_points(id),
  ADD COLUMN priority character varying DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN estimated_duration integer DEFAULT 60,
  ADD COLUMN checklist text[],
  ADD COLUMN required_tools text[],
  ADD COLUMN haccp_category character varying,
  ADD COLUMN documentation_url character varying,
  ADD COLUMN validation_notes text,
  ADD COLUMN next_due timestamp with time zone,
  ADD COLUMN status character varying DEFAULT 'pending';

-- Rinominare per consistenza
ALTER TABLE public.tasks
  RENAME COLUMN assigned_to TO assigned_to_legacy;

-- Aggiungere nuovi campi assegnazione (come maintenance_tasks)
ALTER TABLE public.tasks
  ADD COLUMN assigned_to_staff_id uuid REFERENCES public.staff(id),
  ADD COLUMN assigned_to_role character varying,
  ADD COLUMN assigned_to_category character varying,
  ADD CONSTRAINT check_task_assignment
  CHECK (
    (assigned_to_staff_id IS NOT NULL) OR
    (assigned_to_role IS NOT NULL) OR
    (assigned_to_category IS NOT NULL)
  );
```

---

### 4. **MISMATCH: `staff` - Campi HACCP**

**Gravità**: 🟢 BASSA

**Schema DB**:
```sql
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  role character varying NOT NULL,
  category character varying NOT NULL,
  email character varying,
  -- ❌ MANCA: haccp_certification (oggetto JSON)
  -- ❌ MANCA: department_assignments (array)
  -- ❌ MANCA: phone
  -- ❌ MANCA: hire_date
  -- ❌ MANCA: status
  -- ❌ MANCA: notes
  ...
);
```

**TypeScript** (`hooks/useStaff.ts`):
```typescript
export interface StaffMember {
  id: string
  company_id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string
  email?: string | null
  phone?: string | null  // ❌ MANCA nel DB
  hire_date?: string | null  // ❌ MANCA nel DB
  status: 'active' | 'inactive' | 'suspended'  // ❌ MANCA nel DB
  notes?: string | null  // ❌ MANCA nel DB
  haccp_certification?: HaccpCertification | null  // ❌ MANCA nel DB (JSONB)
  department_assignments?: string[] | null  // ❌ MANCA nel DB
}
```

**Soluzione**:
```sql
ALTER TABLE public.staff
  ADD COLUMN phone character varying,
  ADD COLUMN hire_date date,
  ADD COLUMN status character varying DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  ADD COLUMN notes text,
  ADD COLUMN haccp_certification jsonb,  -- CRITICO per scadenze HACCP
  ADD COLUMN department_assignments uuid[];  -- Array di department IDs
```

---

### 5. **TABELLA `conservation_points` - Campi Mancanti**

**Gravità**: 🟡 MEDIA

**Schema DB**:
```sql
CREATE TABLE public.conservation_points (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  department_id uuid NOT NULL,
  name character varying NOT NULL,
  setpoint_temp numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  -- ❌ MANCA: product_categories (array)
  -- ❌ MANCA: is_blast_chiller (boolean)
  -- ❌ MANCA: status
  -- ❌ MANCA: maintenance_due
  ...
);
```

**TypeScript** (`types/conservation.ts`):
```typescript
export interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  setpoint_temp: number
  type: ConservationPointType
  product_categories: string[]  // ❌ MANCA nel DB
  status: ConservationStatus  // ❌ MANCA nel DB
  is_blast_chiller: boolean  // ❌ MANCA nel DB
  maintenance_due?: Date  // ❌ MANCA nel DB
}
```

**Soluzione**:
```sql
ALTER TABLE public.conservation_points
  ADD COLUMN product_categories text[],
  ADD COLUMN is_blast_chiller boolean DEFAULT false,
  ADD COLUMN status character varying DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  ADD COLUMN maintenance_due timestamp with time zone;
```

---

## ✅ COMPATIBILITÀ OK

### ✅ Tabelle Allineate

1. **`companies`**: ✅ Schema completo e compatibile
2. **`departments`**: ✅ Schema completo e compatibile
3. **`user_profiles`**: ✅ Include `staff_id` e `role` correttamente
4. **`temperature_readings`**: ✅ Schema compatibile
5. **`events`**: ✅ Schema base OK (ma poco usato - calendario usa altre fonti)

---

## 📊 NAMING CONVENTIONS - ANALISI

### ⚠️ Inconsistenze Rilevate

| DB Column | TypeScript Field | Status | Note |
|-----------|------------------|---------|------|
| `setpoint_temp` | `setpoint_temp` | ✅ OK | Consistente |
| `created_at` | `created_at` | ✅ OK | Consistente |
| `company_id` | `company_id` | ✅ OK | Consistente |
| **`kind`** | **`type`** | ❌ MISMATCH | `maintenance_tasks.kind` vs `MaintenanceTask.type` |
| **`assigned_to`** | **`assigned_to_staff_id`** | ❌ MISMATCH | Semantica diversa |
| `assignment_type` | *(mancante)* | ❌ MISSING | TypeScript non ha questo campo |

**Convenzione Consigliata**:
- **Database**: `snake_case` (es. `assigned_to_staff_id`)
- **TypeScript**: `snake_case` per fields DB, `camelCase` per computed (es. `fullName`)
- **Consistenza**: Usare SEMPRE lo stesso nome tra DB e TS per evitare confusione

---

## 🔧 HOOK ANALYSIS - Gestione Errori

### Hook con Fallback su Mock Data
Tutti gli hook hanno un pattern simile con try/catch e fallback:

```typescript
// ✅ PATTERN CORRETTO (già implementato)
queryFn: async () => {
  if (!companyId) {
    console.log('🔧 Using mock data - no company_id')
    return MOCK_DATA
  }

  try {
    const { data, error } = await supabase
      .from('table')
      .select()
      .eq('company_id', companyId)

    if (error) {
      console.error('DB Error:', error)
      return MOCK_DATA // Fallback
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return MOCK_DATA // Fallback
  }
}
```

**Hook con Mock Data Attivi**:
1. ✅ `useConservationPoints` - Fallback funzionante
2. ✅ `useMaintenanceTasks` - Usa solo mock data (DB non funziona)
3. ✅ `useProducts` - Fallback funzionante
4. ✅ `useCalendarEvents` - Fallback funzionante
5. ✅ `useStaff` - Query DB funzionante

---

## 🎯 PRIORITÀ INTERVENTI

### 🔴 Urgenti (Blocco funzionalità calendario)

1. **Completare schema `products`** - Senza questo, nessuna scadenza prodotti
2. **Modificare `maintenance_tasks`**:
   - Rinominare `kind` → `type`
   - Aggiungere campi assegnazione multipla
   - Aggiungere `next_due`, `priority`, `status`
3. **Aggiornare `staff`** - Aggiungere `haccp_certification` (JSONB) per scadenze HACCP

### 🟠 Importanti (Miglioramento funzionalità)

4. **Espandere `tasks`** - Aggiungere campi per checklist, priority, etc.
5. **Completare `conservation_points`** - Aggiungere array product_categories, status

### 🟢 Nice to Have

6. Aggiungere indici per performance
7. Aggiungere trigger per `updated_at` automatico
8. Validazione constraint più stringenti

---

## 📝 SQL MIGRATION SCRIPT

**Migrazione spostata in file dedicato**: `MIGRATION_SCHEMA_FIX.sql`

Eseguire lo script completo copiando e incollando l'intero contenuto del file `MIGRATION_SCHEMA_FIX.sql` nell'editor SQL di Supabase.

Lo script include:
- ✅ Creazione tabella `products` completa
- ✅ Aggiornamento `staff` con HACCP certification
- ✅ Fix `maintenance_tasks` (kind→type + assegnazione strutturata)
- ✅ Espansione `tasks` con campi mancanti
- ✅ Fix `conservation_points`
- ✅ Indici per performance
- ✅ Trigger per `updated_at` automatico
- ✅ Backup automatico prima delle modifiche

---

## ✅ PROSSIMI STEP

1. ✅ **Questo documento creato**
2. ⏳ **Eseguire migration SQL** su Supabase
3. ⏳ **Testare query dopo migration**
4. ⏳ **Commit delle modifiche**
5. ⏳ **Iniziare FASE 1 implementazione calendario**

---

**Fine Report Debug**
*Generato automaticamente da Claude Code*
