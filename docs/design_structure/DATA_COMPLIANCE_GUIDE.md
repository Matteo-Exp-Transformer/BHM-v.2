# 📊 DATA COMPLIANCE GUIDE - Schema Supabase e Glossario

## 🎯 SCOPO DEL DOCUMENTO

Questo documento serve come riferimento unico per garantire la **compliance dei dati** tra:
- **Onboarding Wizard** (dati inseriti dall'utente)
- **Schema Database Supabase** (tabelle PostgreSQL)
- **Main App** (utilizzo dati nell'applicazione)

**Tutti gli agenti AI devono consultare questo documento prima di:**
- Inserire dati nel database
- Leggere dati dal database
- Modificare componenti che interagiscono con i dati
- Creare nuove funzionalità che utilizzano dati esistenti

---

## 📋 INDICE

1. [Glossario Completo](#glossario-completo)
2. [Mappature Campo per Campo](#mappature-campo-per-campo)
3. [Tabelle Database](#tabelle-database)
4. [Regole di Naming](#regole-di-naming)
5. [Esempi Pratici](#esempi-pratici)
6. [Checklist Compliance](#checklist-compliance)

---

## 📖 GLOSSARIO COMPLETO

### 🔤 CONVENZIONI DI NAMING

| Contesto | Convenzione | Esempio |
|----------|-------------|---------|
| **Database (Supabase)** | `snake_case` | `company_id`, `created_at`, `haccp_certification` |
| **TypeScript/React** | `camelCase` | `companyId`, `createdAt`, `haccpCertification` |
| **Componenti React** | `PascalCase` | `OnboardingWizard`, `StaffStep`, `ConservationPoint` |
| **Costanti** | `UPPER_SNAKE_CASE` | `MAX_TEMPERATURE`, `DEFAULT_FREQUENCY` |

### 🌐 LINGUA: ITALIANO vs INGLESE

#### **Onboarding (Italiano)** → **Database (Inglese)**

| Campo Onboarding (IT) | Campo Database (EN) | Tipo | Esempio |
|-----------------------|---------------------|------|---------|
| `frequenza` | `frequency` | string | `'giornaliera'` → `'daily'` |
| `manutenzione` | `type` | string | `'Sanificazione'` → `'sanitation'` |
| `assegnatoARuolo` | `assigned_to_role` | string | `'responsabile'` → `'responsabile'` |
| `assegnatoACategoria` | `assigned_to_category` | string | `'Cuochi'` → `'Cuochi'` |
| `assegnatoADipendenteSpecifico` | `assigned_to_staff_id` | uuid | `'abc-123'` → `'abc-123'` |
| `giorniCustom` | N/A (stored in frequency logic) | string[] | `['lunedi', 'giovedi']` |
| `note` | `description` | string | `'Pulizia completa'` |

---

## 🗂️ MAPPATURE CAMPO PER CAMPO

### 1️⃣ TABELLA: `companies`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | Auto-generato | `generateId()` | Primary key |
| `name` | varchar | `business.name` | Diretto | Nome azienda |
| `address` | varchar | `business.address` | Diretto | Indirizzo completo |
| `phone` | varchar | `business.phone` | Diretto | Telefono |
| `email` | varchar | `business.email` | Diretto | Email aziendale |
| `vat_number` | varchar | `business.vat_number` | Diretto | Partita IVA |
| `business_type` | varchar | `business.business_type` | Diretto | `'ristorante'`, `'bar'`, etc. |
| `established_date` | date | `business.established_date` | Diretto | Data fondazione |
| `license_number` | varchar | `business.license_number` | Diretto | Licenza commerciale |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp ultimo update |

**Esempio Mapping:**
```typescript
const company = {
  id: generateId(),
  name: formData.business.name,
  address: formData.business.address,
  phone: formData.business.phone,
  email: formData.business.email,
  vat_number: formData.business.vat_number,
  business_type: formData.business.business_type,
  established_date: formData.business.established_date,
  license_number: formData.business.license_number,
}
```

---

### 2️⃣ TABELLA: `departments`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `department.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `name` | varchar | `department.name` | Diretto | Nome reparto |
| `description` | varchar | `department.description` | Diretto | Descrizione |
| `is_active` | boolean | `department.is_active` | Diretto | Default: `true` |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**Esempio Mapping:**
```typescript
const departments = formData.departments.map(dept => ({
  id: dept.id,
  company_id: companyId,
  name: dept.name,
  description: dept.description,
  is_active: dept.is_active ?? true,
}))
```

---

### 3️⃣ TABELLA: `staff`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `staff.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `name` | varchar | `staff.fullName` o `staff.name + surname` | **COMBINARE** | ⚠️ IMPORTANTE |
| `role` | varchar | `staff.role` | Diretto | `'admin'`, `'responsabile'`, `'dipendente'` |
| `category` | varchar | `staff.categories[0]` | **PRENDERE PRIMO** | ⚠️ Da array a singolo |
| `email` | varchar | `staff.email` | Diretto | Email dipendente |
| `phone` | varchar | `staff.phone` | Diretto | Telefono |
| `hire_date` | date | `staff.hire_date` | Diretto | Data assunzione |
| `status` | varchar | `staff.status` | Diretto | Default: `'active'` |
| `haccp_certification` | jsonb | `staff.haccpExpiry` | **CONVERTIRE** | ⚠️ String → JSONB |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**⚠️ CONVERSIONI CRITICHE:**

**1. Nome (name + surname → name):**
```typescript
// ONBOARDING ha name E surname separati
const staff = formData.staff.map(person => ({
  name: person.fullName || `${person.name} ${person.surname}`, // ✅ COMBINARE
}))
```

**2. Categoria (categories[] → category):**
```typescript
// ONBOARDING ha array di categorie, DB vuole singola stringa
const staff = formData.staff.map(person => ({
  category: Array.isArray(person.categories)
    ? person.categories[0] || 'Altro' // ✅ PRENDERE PRIMO
    : person.category
}))
```

**3. HACCP Certification (string → JSONB):**
```typescript
// ONBOARDING ha solo data scadenza come string
const staff = formData.staff.map(person => ({
  haccp_certification: person.haccpExpiry
    ? {
        level: 'base',
        expiry_date: person.haccpExpiry, // ✅ String ISO date
        issuing_authority: '',
        certificate_number: '',
      }
    : null
}))
```

**Esempio Mapping Completo:**
```typescript
const staff = formData.staff.map(person => ({
  id: person.id,
  company_id: companyId,
  name: person.fullName || `${person.name} ${person.surname}`,
  role: person.role,
  category: Array.isArray(person.categories)
    ? person.categories[0] || 'Altro'
    : person.category,
  email: person.email,
  phone: person.phone,
  hire_date: person.hire_date,
  status: person.status || 'active',
  haccp_certification: person.haccpExpiry
    ? {
        level: 'base',
        expiry_date: person.haccpExpiry,
        issuing_authority: '',
        certificate_number: '',
      }
    : null,
}))
```

---

### 4️⃣ TABELLA: `conservation_points`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `point.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `department_id` | uuid | `point.departmentId` | Diretto | Foreign key |
| `name` | varchar | `point.name` | Diretto | Nome punto |
| `type` | varchar | `point.pointType` | **RINOMINA** | ⚠️ `pointType` → `type` |
| `setpoint_temp` | numeric | `point.targetTemperature` | **RINOMINA** | ⚠️ `targetTemperature` → `setpoint_temp` |
| `product_categories` | text[] | `point.productCategories` | Diretto | Array categorie prodotti |
| `is_blast_chiller` | boolean | `point.isBlastChiller` | Diretto | Default: `false` |
| `status` | varchar | `'normal'` | Sempre | Default: `'normal'` |
| `maintenance_due` | timestamptz | `point.maintenanceDue` | Diretto | Prossima manutenzione |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**⚠️ CONVERSIONI CRITICHE:**

**1. camelCase → snake_case:**
```typescript
const points = formData.conservation.points.map(point => ({
  department_id: point.departmentId,        // ✅ camelCase → snake_case
  setpoint_temp: point.targetTemperature,   // ✅ Rinomina campo
  type: point.pointType,                    // ✅ Rinomina campo
  is_blast_chiller: point.isBlastChiller,   // ✅ camelCase → snake_case
}))
```

**Esempio Mapping Completo:**
```typescript
const points = formData.conservation.points.map(point => ({
  id: point.id,
  company_id: companyId,
  department_id: point.departmentId,
  name: point.name,
  type: point.pointType,
  setpoint_temp: point.targetTemperature,
  product_categories: point.productCategories || [],
  is_blast_chiller: point.isBlastChiller || false,
  status: 'normal',
  maintenance_due: point.maintenanceDue || null,
}))
```

---

### 5️⃣ TABELLA: `maintenance_tasks`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `task.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `conservation_point_id` | uuid | `task.conservationPointId` | Diretto | Foreign key |
| `type` | varchar | `task.manutenzione` | **TRADURRE IT→EN** | ⚠️ Usa `mapManutenzioneTipo()` |
| `frequency` | varchar | `task.frequenza` | **TRADURRE IT→EN** | ⚠️ Usa `mapFrequenza()` |
| `title` | varchar | Auto-generato | `"Manutenzione: " + tipo` | Titolo task |
| `description` | text | `task.note` | Diretto | Descrizione task |
| `next_due` | timestamptz | Calcolato | `calculateNextDue()` | ⚠️ Auto-calcolare |
| `priority` | varchar | `'medium'` | Default | `'low'`, `'medium'`, `'high'`, `'critical'` |
| `status` | varchar | `'pending'` | Default | `'pending'`, `'completed'`, `'overdue'` |
| `assigned_to_staff_id` | uuid | `task.assegnatoADipendenteSpecifico` | Condizionale | Solo se assegnato a specifico |
| `assigned_to_role` | varchar | `task.assegnatoARuolo` | Condizionale | Solo se NON specifico |
| `assigned_to_category` | varchar | `task.assegnatoACategoria` | Diretto | Categoria staff |
| `estimated_duration` | int | `60` | Default | Minuti stimati |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**⚠️ FUNZIONI DI MAPPATURA OBBLIGATORIE:**

**1. mapManutenzioneTipo (Italiano → Inglese):**
```typescript
const mapManutenzioneTipo = (tipo: string): string => {
  const map: Record<string, string> = {
    'Rilevamento Temperatura': 'temperature_monitoring',
    'Sanificazione': 'sanitation',
    'Sbrinamento': 'defrosting',
    'Controllo Scadenze': 'expiry_check',
  }
  return map[tipo] || 'general_maintenance'
}
```

**2. mapFrequenza (Italiano → Inglese):**
```typescript
const mapFrequenza = (frequenza: string): string => {
  const map: Record<string, string> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annual',
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}
```

**3. calculateNextDue (Calcola prossima scadenza):**
```typescript
const calculateNextDue = (frequenza: string): string => {
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

**4. Logica Assegnazione (chi esegue il task):**
```typescript
const maintenanceTasks = formData.tasks.conservationMaintenancePlans.map(plan => ({
  // Se assegnato a dipendente specifico
  assigned_to_staff_id: plan.assegnatoARuolo === 'specifico'
    ? plan.assegnatoADipendenteSpecifico
    : null,

  // Se assegnato a ruolo generico
  assigned_to_role: plan.assegnatoARuolo !== 'specifico'
    ? plan.assegnatoARuolo
    : null,

  // Categoria sempre presente
  assigned_to_category: plan.assegnatoACategoria || null,
}))
```

**Esempio Mapping Completo:**
```typescript
const maintenanceTasks = formData.tasks.conservationMaintenancePlans.map(plan => ({
  id: plan.id,
  company_id: companyId,
  conservation_point_id: plan.conservationPointId,
  type: mapManutenzioneTipo(plan.manutenzione),
  frequency: mapFrequenza(plan.frequenza),
  title: `Manutenzione: ${plan.manutenzione}`,
  description: plan.note || '',
  next_due: calculateNextDue(plan.frequenza),
  priority: 'medium',
  status: 'pending',
  assigned_to_staff_id: plan.assegnatoARuolo === 'specifico'
    ? plan.assegnatoADipendenteSpecifico
    : null,
  assigned_to_role: plan.assegnatoARuolo !== 'specifico'
    ? plan.assegnatoARuolo
    : null,
  assigned_to_category: plan.assegnatoACategoria || null,
  estimated_duration: 60,
}))

// ⚠️ TABELLA CORRETTA: maintenance_tasks (NON conservation_maintenance_plans)
await supabase.from('maintenance_tasks').insert(maintenanceTasks)
```

---

### 6️⃣ TABELLA: `tasks` (Mansioni Generiche)

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `task.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `name` | varchar | `task.name` | Diretto | Nome task |
| `frequency` | varchar | `task.frequenza` | **TRADURRE** | Usa `mapFrequenza()` |
| `description` | text | `task.note` | Diretto | Descrizione |
| `priority` | varchar | `'medium'` | Default | `'low'`, `'medium'`, `'high'`, `'critical'` |
| `status` | varchar | `'pending'` | Default | `'pending'`, `'completed'`, `'overdue'` |
| `next_due` | timestamptz | Calcolato | `calculateNextDue()` | Auto-calcolare |
| `assigned_to_staff_id` | uuid | `task.assegnatoADipendenteSpecifico` | Condizionale | Solo se specifico |
| `assigned_to_role` | varchar | `task.assegnatoARuolo` | Condizionale | Solo se NON specifico |
| `assigned_to_category` | varchar | `task.assegnatoACategoria` | Diretto | Categoria staff |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**Esempio Mapping Completo:**
```typescript
const genericTasks = formData.tasks.genericTasks.map(task => ({
  id: task.id,
  company_id: companyId,
  name: task.name,
  frequency: mapFrequenza(task.frequenza),
  description: task.note || '',
  priority: 'medium',
  status: 'pending',
  next_due: calculateNextDue(task.frequenza),
  assigned_to_staff_id: task.assegnatoARuolo === 'specifico'
    ? task.assegnatoADipendenteSpecifico
    : null,
  assigned_to_role: task.assegnatoARuolo !== 'specifico'
    ? task.assegnatoARuolo
    : null,
  assigned_to_category: task.assegnatoACategoria || null,
}))

await supabase.from('tasks').insert(genericTasks)
```

---

### 7️⃣ TABELLA: `products`

| Campo Database | Tipo | Onboarding Field | Mapping Function | Note |
|----------------|------|------------------|------------------|------|
| `id` | uuid | `product.id` | `generateId()` | Primary key |
| `company_id` | uuid | `companyId` | Da context | Foreign key |
| `department_id` | uuid | `product.department_id` | Diretto | Foreign key |
| `conservation_point_id` | uuid | `product.conservation_point_id` | Diretto | Foreign key |
| `name` | varchar | `product.name` | Diretto | Nome prodotto |
| `category` | varchar | `product.category` | Diretto | Categoria prodotto |
| `quantity` | numeric | `product.quantity` | Diretto | Quantità |
| `unit` | varchar | `product.unit` | Diretto | Unità misura |
| `supplier_name` | varchar | `product.supplierName` | Diretto | Nome fornitore |
| `purchase_date` | date | `product.purchaseDate` | Diretto | Data acquisto |
| `expiry_date` | date | `product.expiryDate` | Diretto | Data scadenza |
| `status` | varchar | `product.status` | Diretto | `'active'`, `'expired'`, `'consumed'` |
| `allergens` | text[] | `product.allergens` | Diretto | Array allergeni |
| `created_at` | timestamptz | Auto | `new Date()` | Timestamp creazione |
| `updated_at` | timestamptz | Auto | `new Date()` | Timestamp update |

**Esempio Mapping Completo:**
```typescript
const products = formData.inventory.products.map(product => ({
  id: product.id,
  company_id: companyId,
  department_id: product.department_id,
  conservation_point_id: product.conservation_point_id,
  name: product.name,
  category: product.category,
  quantity: product.quantity,
  unit: product.unit,
  supplier_name: product.supplierName,
  purchase_date: product.purchaseDate,
  expiry_date: product.expiryDate,
  status: product.status || 'active',
  allergens: product.allergens || [],
}))

await supabase.from('products').insert(products)
```

---

## 🔧 REGOLE DI NAMING

### ✅ REGOLE GENERALI

1. **Database Fields**: SEMPRE `snake_case`
   ```typescript
   // ✅ CORRETTO
   company_id, created_at, haccp_certification

   // ❌ SBAGLIATO
   companyId, createdAt, haccpCertification
   ```

2. **TypeScript/React**: SEMPRE `camelCase`
   ```typescript
   // ✅ CORRETTO
   const companyId = '...'
   const createdAt = new Date()

   // ❌ SBAGLIATO
   const company_id = '...'
   const created_at = new Date()
   ```

3. **Componenti React**: SEMPRE `PascalCase`
   ```typescript
   // ✅ CORRETTO
   <OnboardingWizard />
   <StaffStep />

   // ❌ SBAGLIATO
   <onboardingWizard />
   <staffStep />
   ```

4. **Costanti**: SEMPRE `UPPER_SNAKE_CASE`
   ```typescript
   // ✅ CORRETTO
   const MAX_TEMPERATURE = 8
   const DEFAULT_FREQUENCY = 'weekly'

   // ❌ SBAGLIATO
   const maxTemperature = 8
   const defaultFrequency = 'weekly'
   ```

### 🔄 CONVERSIONI COMUNI

| Onboarding (IT) | Database (EN) | Funzione |
|-----------------|---------------|----------|
| `frequenza: 'giornaliera'` | `frequency: 'daily'` | `mapFrequenza()` |
| `frequenza: 'settimanale'` | `frequency: 'weekly'` | `mapFrequenza()` |
| `frequenza: 'mensile'` | `frequency: 'monthly'` | `mapFrequenza()` |
| `frequenza: 'annuale'` | `frequency: 'annual'` | `mapFrequenza()` |
| `manutenzione: 'Sanificazione'` | `type: 'sanitation'` | `mapManutenzioneTipo()` |
| `manutenzione: 'Sbrinamento'` | `type: 'defrosting'` | `mapManutenzioneTipo()` |
| `targetTemperature` | `setpoint_temp` | Diretto |
| `pointType` | `type` | Diretto |
| `departmentId` | `department_id` | Diretto |

---

## 💡 ESEMPI PRATICI

### Esempio 1: Salvare Staff da Onboarding

```typescript
// ❌ SBAGLIATO - Salva dati così come sono nell'onboarding
const staff = formData.staff
await supabase.from('staff').insert(staff) // ERRORE!

// ✅ CORRETTO - Mappa tutti i campi
const staff = formData.staff.map(person => ({
  id: person.id,
  company_id: companyId,
  name: person.fullName || `${person.name} ${person.surname}`, // Combina
  role: person.role,
  category: Array.isArray(person.categories)
    ? person.categories[0] || 'Altro'
    : person.category, // Da array a singolo
  email: person.email,
  phone: person.phone,
  haccp_certification: person.haccpExpiry
    ? {
        level: 'base',
        expiry_date: person.haccpExpiry,
        issuing_authority: '',
        certificate_number: '',
      }
    : null, // String a JSONB
}))
await supabase.from('staff').insert(staff)
```

### Esempio 2: Salvare Maintenance Tasks

```typescript
// ❌ SBAGLIATO - Usa nomi italiani e tabella sbagliata
const tasks = formData.tasks.conservationMaintenancePlans
await supabase.from('conservation_maintenance_plans').insert(tasks) // ERRORE!

// ✅ CORRETTO - Traduce tutto e usa tabella corretta
const maintenanceTasks = formData.tasks.conservationMaintenancePlans.map(plan => ({
  id: plan.id,
  company_id: companyId,
  conservation_point_id: plan.conservationPointId,
  type: mapManutenzioneTipo(plan.manutenzione), // IT → EN
  frequency: mapFrequenza(plan.frequenza), // IT → EN
  title: `Manutenzione: ${plan.manutenzione}`,
  next_due: calculateNextDue(plan.frequenza), // Calcola
  assigned_to_staff_id: plan.assegnatoARuolo === 'specifico'
    ? plan.assegnatoADipendenteSpecifico
    : null,
  assigned_to_role: plan.assegnatoARuolo !== 'specifico'
    ? plan.assegnatoARuolo
    : null,
  assigned_to_category: plan.assegnatoACategoria || null,
}))
await supabase.from('maintenance_tasks').insert(maintenanceTasks) // Tabella corretta
```

### Esempio 3: Leggere Staff dal Database

```typescript
// Query database
const { data: staffData } = await supabase
  .from('staff')
  .select('*')
  .eq('company_id', companyId)

// ✅ CORRETTO - Converti da snake_case a camelCase per React
const staff = staffData.map(person => ({
  id: person.id,
  companyId: person.company_id, // snake_case → camelCase
  fullName: person.name, // DB ha solo name
  role: person.role,
  category: person.category, // Singolo (non array)
  email: person.email,
  phone: person.phone,
  hireDate: person.hire_date,
  haccpExpiry: person.haccp_certification?.expiry_date, // JSONB → string
  createdAt: person.created_at,
}))
```

---

## ✅ CHECKLIST COMPLIANCE

Prima di salvare dati nel database, verifica:

### 📝 NAMING
- [ ] Tutti i campi database usano `snake_case`
- [ ] Tutti i campi TypeScript usano `camelCase`
- [ ] Tutti i componenti usano `PascalCase`

### 🔄 CONVERSIONI
- [ ] `name + surname` → `name` combinati
- [ ] `categories[]` → `category` primo elemento
- [ ] `haccpExpiry` string → `haccp_certification` JSONB
- [ ] `targetTemperature` → `setpoint_temp`
- [ ] `pointType` → `type`
- [ ] `departmentId` → `department_id`
- [ ] `frequenza` IT → `frequency` EN (usa `mapFrequenza()`)
- [ ] `manutenzione` IT → `type` EN (usa `mapManutenzioneTipo()`)

### 🎯 TABELLE CORRETTE
- [ ] Staff → `staff` (non `employees`)
- [ ] Maintenance → `maintenance_tasks` (non `conservation_maintenance_plans`)
- [ ] Generic Tasks → `tasks`
- [ ] Conservation Points → `conservation_points`

### 📅 CALCOLI AUTO
- [ ] `next_due` calcolato con `calculateNextDue()`
- [ ] `created_at` = `new Date()`
- [ ] `updated_at` = `new Date()`

### 🔑 FOREIGN KEYS
- [ ] `company_id` presente in tutte le tabelle
- [ ] `department_id` valido e esistente
- [ ] `conservation_point_id` valido quando richiesto
- [ ] `assigned_to_staff_id` valido quando specifico

---

## 🎯 QUICK REFERENCE

### Funzioni Helper Essenziali

```typescript
// 1. Genera ID unico
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 2. Mappa frequenza IT → EN
const mapFrequenza = (freq: string) => ({
  'giornaliera': 'daily',
  'settimanale': 'weekly',
  'mensile': 'monthly',
  'annuale': 'annual',
}[freq] || 'weekly')

// 3. Mappa tipo manutenzione IT → EN
const mapManutenzioneTipo = (tipo: string) => ({
  'Rilevamento Temperatura': 'temperature_monitoring',
  'Sanificazione': 'sanitation',
  'Sbrinamento': 'defrosting',
  'Controllo Scadenze': 'expiry_check',
}[tipo] || 'general_maintenance')

// 4. Calcola prossima scadenza
const calculateNextDue = (freq: string) => {
  const now = new Date()
  const map = {
    'giornaliera': 1,
    'settimanale': 7,
    'mensile': 30,
    'annuale': 365,
  }
  const days = map[freq] || 7
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}
```

---

## 📚 RIFERIMENTI

- **Schema Database**: `supabase/migrations/MIGRATION_SCHEMA_FIX.sql`
- **Mapping Onboarding**: `src/components/OnboardingWizard.tsx` (funzione `saveAllDataToSupabase`)
- **Prefill Data**: `src/utils/onboardingHelpers.ts` (funzione `getPrefillData`)
- **Type Definitions**: `src/types/onboarding.ts`

---

## 🗓️ APPENDICE: COMPONENTI CALENDARIO

### Componenti Implementati (2025-01-05)

#### Generatori Automatici Eventi

##### **haccpDeadlineGenerator.ts**
```typescript
generateHaccpDeadlineEvents(staff[], companyId, userId, config?)
```
- Warning days: [90, 60, 30, 14, 7]
- Critical threshold: 7 giorni
- Eventi: overdue (scaduto), critical (<7d), warning (altri)

##### **temperatureCheckGenerator.ts**
```typescript
generateTemperatureCheckEvents(conservationPoints[], companyId, userId, options?)
```
- Genera 90 giorni future
- Frequenza: daily (fridge/blast), weekly (freezer)
- Max 100 eventi per punto

##### **recurrenceScheduler.ts**
```typescript
calculateNextOccurrences(startDate, pattern, count)
expandRecurringEvent(startDate, pattern, rangeStart, rangeEnd)
calculateNextDue(currentDate, frequency, customDays?)
```
- Frequenze: daily/weekly/monthly/yearly/custom
- Supporto customDays: ['lunedi', 'giovedi', etc.]

#### Hooks

##### **useCalendarAlerts.ts**
```typescript
const { alerts, alertCount, criticalCount, dismissAlert } = useCalendarAlerts(events)
```
- Severity: critical (overdue | <24h), high (<72h), medium (<144h)
- LocalStorage: 'calendar-dismissed-alerts'
- Helper: `useAlertBadge(events)` per badge count

#### Componenti UI

##### **EventBadge.tsx**
```typescript
<EventBadge assignedTo="Cuochi" type="category" size="sm" />
```
- Icons: ChefHat (Cuochi), UtensilsCrossed (Camerieri), Store (Banconisti), Shield (Admin)
- Colori pastello per categorie/ruoli

##### **CalendarFilters.tsx**
```typescript
<CalendarFilters onFilterChange={setFilters} initialFilters={...} />
```
- Filtri: eventTypes[], priorities[], statuses[]
- LocalStorage: 'calendar-filters'
- Collapsible sections con reset

##### **CalendarLegend.tsx**
```typescript
<CalendarLegend showPriority showEventType defaultExpanded={false} />
```
- Priorità: 🔴 Critico, 🟠 Alta, 🟡 Media, 🔵 Bassa, 🟢 Completato
- Tipi: 🔧 Manutenzione, 📋 Mansioni, 🌡️ Temperatura, 📜 HACCP, 📦 Prodotti

##### **ViewSelector.tsx**
```typescript
const [view, setView] = useCalendarView('month')
<ViewSelector currentView={view} onChange={setView} />
```
- Views: month/week/day
- LocalStorage: 'calendar-view-preference'
- Icons: Calendar, CalendarDays, CalendarClock

### Integrazione CalendarPage

```typescript
import { ViewSelector, CalendarFilters, CalendarLegend, useCalendarAlerts } from '@/features/calendar/components'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'

const { events, sources } = useAggregatedEvents()
const { alerts, alertCount } = useCalendarAlerts(events)
```

**Sources disponibili**:
- `maintenance` - Task manutenzione
- `haccpExpiry` - Scadenze HACCP staff
- `productExpiry` - Scadenze prodotti
- `haccpDeadlines` - Warning scadenze HACCP (90/60/30/14/7d)
- `temperatureChecks` - Controlli temperatura generati

---

_Ultima modifica: 2025-01-05 (Aggiunta Appendice Calendario)_
_Versione: 1.1_
_Autore: AI Assistant_
