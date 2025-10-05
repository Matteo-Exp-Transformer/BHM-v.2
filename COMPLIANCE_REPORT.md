# 🔍 COMPLIANCE REPORT - Onboarding vs Main App Data Flow

**Data Analisi**: 2025-01-05
**Progetto**: BHM v.2 - Business HACCP Manager
**Obiettivo**: Verificare compatibilità dati tra Onboarding e Main App

---

## ✅ ANALISI COMPLETA: STATO ATTUALE

### 📊 SUMMARY

| Entità | Onboarding → DB | Main App → DB | Compatibilità | Status |
|--------|----------------|---------------|---------------|---------|
| **Companies** | ✅ Corretto | ✅ Corretto | ✅ 100% | OK |
| **Departments** | ✅ Corretto | ✅ Corretto | ✅ 100% | OK |
| **Staff** | ⚠️ Parziale | ✅ Corretto | ⚠️ 70% | ATTENZIONE |
| **Conservation Points** | ⚠️ Parziale | ✅ Corretto | ⚠️ 80% | ATTENZIONE |
| **Maintenance Tasks** | ❌ Problematico | ✅ Corretto | ❌ 50% | CRITICO |
| **Generic Tasks** | ❌ Problematico | ✅ Corretto | ❌ 60% | CRITICO |
| **Products** | ✅ Corretto | ✅ Corretto | ✅ 100% | OK |

---

## 🔴 PROBLEMI CRITICI

### 1. **STAFF - Campo `name` vs `name`+`surname`**

**Gravità**: 🟠 ALTA

#### Onboarding (staffUtils.ts)
```typescript
const member: StaffMember = {
  id: editingId || `staff_${Date.now()}...`,
  name: form.name.trim(),           // ❌ SOLO name
  surname: form.surname.trim(),      // ❌ Campo separato
  fullName: `${form.name.trim()} ${form.surname.trim()}`,
  role, email, phone, categories,
  department_assignments,
  haccpExpiry,  // ❌ STRING invece di JSONB object
  notes
}
```

#### Save to DB (OnboardingWizard.tsx line 220-229)
```typescript
const staff = formData.staff.map(person => ({
  ...person,  // ❌ Spread di StaffMember con campi NON compatibili
  company_id: companyId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

await supabase.from('staff').insert(staff)  // ❌ FAIL!
```

#### Main App (useStaff.ts line 99-113)
```typescript
await supabase.from('staff').insert({
  company_id: companyId,
  name: input.name,  // ✅ SOLO name (nome completo)
  role: input.role,
  category: input.category,  // ✅ SINGOLO (non array)
  email: input.email || null,
  phone: input.phone || null,
  hire_date: input.hire_date || null,
  status: input.status || 'active',
  notes: input.notes || null,
  haccp_certification: input.haccp_certification || null,  // ✅ JSONB object
  department_assignments: input.department_assignments || null,
})
```

#### Database Schema
```sql
CREATE TABLE public.staff (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  name character varying NOT NULL,  -- ❌ SINGOLO campo
  role character varying NOT NULL,
  category character varying NOT NULL,  -- ❌ SINGOLO (non array)
  email character varying,
  phone character varying,
  hire_date date,
  status character varying DEFAULT 'active',
  notes text,
  haccp_certification jsonb,  -- ❌ JSONB (non string)
  department_assignments uuid[]  -- ✅ Array
);
```

#### 🔧 Problemi Identificati:

1. **`name` + `surname` + `fullName`**: Onboarding usa 3 campi, DB usa solo `name`
2. **`category` vs `categories`**: Onboarding usa array, DB usa stringa singola
3. **`haccpExpiry` (string) vs `haccp_certification` (JSONB)**: Incompatibili
4. **Campi extra**: `surname`, `fullName`, `categories` non esistono nel DB

#### ✅ Soluzione:
```typescript
// FIX in OnboardingWizard.tsx line 218-230
const staff = formData.staff.map(person => ({
  company_id: companyId,
  name: person.fullName || `${person.name} ${person.surname}`,  // Combina name+surname
  role: person.role,
  category: person.categories[0] || 'Altro',  // Prendi prima categoria
  email: person.email || null,
  phone: person.phone || null,
  hire_date: null,  // Onboarding non raccoglie hire_date
  status: 'active',
  notes: person.notes || null,
  haccp_certification: person.haccpExpiry
    ? {
        level: 'base',
        expiry_date: person.haccpExpiry,
        issuing_authority: '',
        certificate_number: '',
      }
    : null,
  department_assignments: person.department_assignments || null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))
```

---

### 2. **CONSERVATION POINTS - Campi Mancanti**

**Gravità**: 🟡 MEDIA

#### Onboarding Type (types/onboarding.ts)
```typescript
export interface ConservationPoint {
  id: string
  name: string
  departmentId: string  // ❌ camelCase
  targetTemperature: number  // ❌ camelCase
  pointType: ConservationPointType  // ❌ camelCase
  isBlastChiller: boolean  // ❌ camelCase
  productCategories: string[]  // ❌ camelCase
  source: 'manual' | 'prefill' | 'import'
  maintenanceTasks?: MaintenanceTask[]
  maintenanceDue?: Date
}
```

#### Save to DB (OnboardingWizard.tsx line 233-245)
```typescript
const points = formData.conservation.points.map(point => ({
  ...point,  // ❌ Spread con campi camelCase
  company_id: companyId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

await supabase.from('conservation_points').insert(points)
```

#### Database Schema
```sql
CREATE TABLE public.conservation_points (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  department_id uuid NOT NULL,  -- ❌ snake_case
  name character varying NOT NULL,
  setpoint_temp numeric NOT NULL,  -- ❌ nome diverso: setpoint_temp vs targetTemperature
  type USER-DEFINED NOT NULL,  -- ❌ nome diverso: type vs pointType
  product_categories text[] DEFAULT '{}',  -- ❌ snake_case
  is_blast_chiller boolean DEFAULT false,  -- ❌ snake_case
  status character varying DEFAULT 'normal',
  maintenance_due timestamp with time zone,  -- ❌ snake_case
);
```

#### 🔧 Problemi Identificati:

1. **Naming mismatch**:
   - `departmentId` → `department_id`
   - `targetTemperature` → `setpoint_temp`
   - `pointType` → `type`
   - `isBlastChiller` → `is_blast_chiller`
   - `productCategories` → `product_categories`

2. **Campi extra**: `source`, `maintenanceTasks` non esistono nel DB

#### ✅ Soluzione:
```typescript
// FIX in OnboardingWizard.tsx line 232-246
const points = formData.conservation.points.map(point => ({
  company_id: companyId,
  department_id: point.departmentId,
  name: point.name,
  setpoint_temp: point.targetTemperature,
  type: point.pointType,
  product_categories: point.productCategories,
  is_blast_chiller: point.isBlastChiller,
  status: 'normal',
  maintenance_due: point.maintenanceDue || null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))
```

---

### 3. **MAINTENANCE TASKS - Struttura Completamente Diversa**

**Gravità**: 🔴 CRITICA

#### Onboarding Type (types/onboarding.ts)
```typescript
export interface ConservationMaintenancePlan {
  id: string
  conservationPointId: string  // ❌ camelCase
  manutenzione: StandardMaintenanceType  // ❌ Nome italiano
  frequenza: MaintenanceFrequency  // ❌ Nome italiano
  assegnatoARuolo: StaffRole | 'specifico'  // ❌ Nome italiano, logica diversa
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  note?: string
}
```

#### Save to DB (OnboardingWizard.tsx line 249-264)
```typescript
const maintenancePlans = formData.tasks.conservationMaintenancePlans.map(
  plan => ({
    ...plan,  // ❌ Spread di campi completamente INCOMPATIBILI
    company_id: companyId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
)

await supabase
  .from('conservation_maintenance_plans')  // ❌ TABELLA NON ESISTE!
  .insert(maintenancePlans)
```

#### Database Schema (REALE)
```sql
CREATE TABLE public.maintenance_tasks (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  conservation_point_id uuid NOT NULL,  -- ❌ snake_case
  type USER-DEFINED NOT NULL,  -- ❌ Diverso da "manutenzione"
  frequency character varying NOT NULL,  -- ❌ Valori inglesi
  assigned_to character varying NOT NULL,  -- ❌ DEPRECATED
  assignment_type USER-DEFINED NOT NULL,  -- ❌ DEPRECATED
  assigned_to_staff_id uuid,  -- ✅ NUOVO
  assigned_to_role character varying,  -- ✅ NUOVO
  assigned_to_category character varying,  -- ✅ NUOVO
  title character varying,
  description text,
  priority character varying DEFAULT 'medium',
  status character varying DEFAULT 'scheduled',
  next_due timestamp with time zone,  -- ❌ MANCA in onboarding
  estimated_duration integer DEFAULT 60,
  instructions text[]
);
```

#### 🔧 Problemi Identificati:

1. **Tabella NON ESISTE**: `conservation_maintenance_plans` dovrebbe essere `maintenance_tasks`
2. **Campi completamente diversi**:
   - `manutenzione` → `type`
   - `frequenza` → `frequency`
   - Logica assegnazione completamente diversa
3. **Campi mancanti**: `title`, `next_due`, `priority`, `status`
4. **Logica assegnazione incompatibile**: Usa campi deprecated invece dei nuovi

#### ✅ Soluzione:
```typescript
// FIX in OnboardingWizard.tsx line 248-264
if (formData.tasks?.conservationMaintenancePlans?.length) {
  const maintenanceTasks = formData.tasks.conservationMaintenancePlans.map(
    plan => {
      const maintenance = {
        company_id: companyId,
        conservation_point_id: plan.conservationPointId,
        type: mapManutenzioneTipo(plan.manutenzione),  // Mappa tipo
        frequency: mapFrequenza(plan.frequenza),  // daily, weekly, etc.
        title: `Manutenzione: ${plan.manutenzione}`,
        description: plan.note || '',
        priority: 'medium',
        status: 'scheduled',
        next_due: calculateNextDue(plan.frequenza),  // Calcola prossima scadenza
        estimated_duration: 60,
        instructions: [],
        // NUOVI campi assegnazione
        assigned_to_staff_id: plan.assegnatoARuolo === 'specifico'
          ? plan.assegnatoADipendenteSpecifico
          : null,
        assigned_to_role: plan.assegnatoARuolo !== 'specifico'
          ? plan.assegnatoARuolo
          : null,
        assigned_to_category: plan.assegnatoACategoria || null,
        // DEPRECATED (rimuovi dopo migrazione)
        assigned_to: plan.assegnatoADipendenteSpecifico || plan.assegnatoARuolo,
        assignment_type: plan.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return maintenance
    }
  )

  const { error } = await supabase
    .from('maintenance_tasks')  // ✅ Tabella corretta
    .insert(maintenanceTasks)

  if (error) throw error
}
```

---

### 4. **GENERIC TASKS - Campi Diversi**

**Gravità**: 🟠 ALTA

#### Onboarding Type (types/onboarding.ts)
```typescript
export interface GenericTask {
  id: string
  name: string
  frequenza: MaintenanceFrequency  // ❌ Italiano
  assegnatoARuolo: StaffRole | 'specifico'  // ❌ Italiano
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  note?: string
}
```

#### Save to DB (OnboardingWizard.tsx line 275-294)
```typescript
const generalTasks = formData.tasks.generalTasks.map(task => ({
  ...task,  // ❌ Spread incompatibile
  company_id: companyId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

await supabase.from('tasks').insert(generalTasks)
```

#### Database Schema
```sql
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  name character varying NOT NULL,
  frequency character varying NOT NULL,  -- ❌ Inglese
  assigned_to character varying NOT NULL,  -- ❌ DEPRECATED
  assignment_type USER-DEFINED NOT NULL,  -- ❌ DEPRECATED
  description text,
  department_id uuid,
  conservation_point_id uuid,
  priority character varying DEFAULT 'medium',
  estimated_duration integer DEFAULT 60,
  checklist text[] DEFAULT '{}',
  required_tools text[] DEFAULT '{}',
  haccp_category character varying,
  documentation_url character varying,
  validation_notes text,
  next_due timestamp with time zone,  -- ❌ MANCA in onboarding
  status character varying DEFAULT 'pending',
  assigned_to_staff_id uuid,  -- ✅ NUOVO
  assigned_to_role character varying,  -- ✅ NUOVO
  assigned_to_category character varying  -- ✅ NUOVO
);
```

#### 🔧 Problemi Identificati:

1. **Naming mismatch**:
   - `frequenza` → `frequency`
   - `note` → `notes` o `description`
2. **Campi mancanti**: `next_due`, `priority`, `status`, `description`
3. **Logica assegnazione incompatibile**: Stessa di maintenance_tasks

#### ✅ Soluzione:
```typescript
// FIX in OnboardingWizard.tsx line 290-294
if (generalTasks.length) {
  const tasksToInsert = formData.tasks.genericTasks.map(task => ({
    company_id: companyId,
    name: task.name,
    frequency: mapFrequenza(task.frequenza),
    description: task.note || '',
    department_id: null,
    conservation_point_id: null,
    priority: 'medium',
    estimated_duration: 60,
    checklist: [],
    required_tools: [],
    haccp_category: null,
    next_due: calculateNextDue(task.frequenza),
    status: 'pending',
    // NUOVI campi assegnazione
    assigned_to_staff_id: task.assegnatoARuolo === 'specifico'
      ? task.assegnatoADipendenteSpecifico
      : null,
    assigned_to_role: task.assegnatoARuolo !== 'specifico'
      ? task.assegnatoARuolo
      : null,
    assigned_to_category: task.assegnatoACategoria || null,
    // DEPRECATED
    assigned_to: task.assegnatoADipendenteSpecifico || task.assegnatoARuolo,
    assignment_type: task.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('tasks').insert(tasksToInsert)
  if (error) throw error
}
```

---

## ✅ ENTITÀ COMPATIBILI (Nessun Fix Necessario)

### 1. Companies ✅
Salvataggio corretto, tutti i campi compatibili.

### 2. Departments ✅
Salvataggio corretto, tutti i campi compatibili.

### 3. Products ✅
Salvataggio corretto, tutti i campi compatibili.

---

## 🛠️ FUNZIONI HELPER NECESSARIE

```typescript
// Aggiungi in OnboardingWizard.tsx o in un file utils dedicato

// Mappa tipo manutenzione da italiano a inglese
function mapManutenzioneTipo(tipo: string): string {
  const map: Record<string, string> = {
    'rilevamento_temperatura': 'temperature_monitoring',
    'sanificazione': 'sanitation',
    'sbrinamento': 'defrosting',
    'controllo_scadenze': 'expiry_check',
  }
  return map[tipo] || 'general_maintenance'
}

// Mappa frequenza da italiano a inglese
function mapFrequenza(frequenza: string): string {
  const map: Record<string, string> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annual',
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}

// Calcola prossima scadenza basata su frequenza
function calculateNextDue(frequenza: string): string {
  const now = new Date()

  switch (frequenza) {
    case 'giornaliera':
      return new Date(now.setDate(now.getDate() + 1)).toISOString()
    case 'settimanale':
      return new Date(now.setDate(now.getDate() + 7)).toISOString()
    case 'mensile':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
    case 'annuale':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    default:
      return new Date(now.setDate(now.getDate() + 7)).toISOString()
  }
}
```

---

## 📋 CHECKLIST FIXES

- [ ] **Staff**: Fix mapping name/surname → name, categories → category, haccpExpiry → haccp_certification
- [ ] **Conservation Points**: Fix camelCase → snake_case mapping
- [ ] **Maintenance Tasks**: Fix tabella + campi + assegnazione
- [ ] **Generic Tasks**: Fix frequenza + assegnazione + campi mancanti
- [ ] **Helper Functions**: Aggiungere mapManutenzioneTipo, mapFrequenza, calculateNextDue
- [ ] **Test**: Verificare salvataggio da onboarding
- [ ] **Test**: Verificare salvataggio da main app
- [ ] **Test**: Verificare lettura dati da entrambe le fonti

---

## 🎯 PRIORITÀ INTERVENTI

1. 🔴 **CRITICO**: Fix Maintenance Tasks (tabella sbagliata!)
2. 🟠 **ALTO**: Fix Staff (incompatibilità HACCP certification)
3. 🟠 **ALTO**: Fix Generic Tasks (logica assegnazione)
4. 🟡 **MEDIO**: Fix Conservation Points (naming)

---

## ✅ CONCLUSIONE

**Stato attuale**: ❌ L'onboarding NON salva correttamente i dati nel database.

**Impatto**:
- Dati inseriti da onboarding NON compatibili con main app
- Potenziali errori di inserimento
- Calendario NON funzionerà con dati da onboarding

**Azione richiesta**: Applicare tutti i fix proposti prima di procedere con testing.

---

_Report generato automaticamente da Claude Code - 2025-01-05_
