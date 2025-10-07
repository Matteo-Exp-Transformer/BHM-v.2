# Supabase Schema Mapping - HACCP Business Manager

Questo documento descrive il mapping tra i dati dell'onboarding e lo schema effettivo di Supabase.

**Ultima verifica:** 2025-10-06
**Status:** ✅ Verificato e funzionante

## Note Importanti

### RLS (Row-Level Security)
- ⚠️ **RLS è stato DISABILITATO** su tutte le tabelle per permettere l'integrazione con Clerk Auth
- La sicurezza è gestita a livello applicazione tramite filtri `company_id`
- Vedi `RLS_SOLUTION.md` per dettagli sulla soluzione adottata

### Onboarding Completion
- ❌ La tabella `companies` **NON ha** i campi `onboarding_completed` e `onboarding_completed_at`
- ✅ Lo stato di completamento è tracciato in **localStorage**:
  - `onboarding-completed`: 'true'
  - `onboarding-completed-at`: timestamp ISO

---

## Tabelle Database

### 1. `companies`

**Campi disponibili:**
- `id` (uuid, PK)
- `name` (varchar) ✅
- `address` (text) ✅
- `staff_count` (integer) ✅
- `email` (varchar) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `BusinessInfoData`:**
```typescript
// OnboardingData.business -> companies table
{
  name: formData.business.name,           // ✅ DISPONIBILE
  address: formData.business.address,     // ✅ DISPONIBILE
  email: formData.business.email,         // ✅ DISPONIBILE
  staff_count: formData.staff.length,     // ✅ DISPONIBILE (calcolare dal conteggio staff)
  updated_at: new Date().toISOString()
}

// ❌ CAMPI NON DISPONIBILI nello schema Supabase:
// - phone (non esiste nella tabella)
// - vat_number (non esiste nella tabella)
// - business_type (non esiste nella tabella)
// - established_date (non esiste nella tabella)
// - license_number (non esiste nella tabella)
// - onboarding_completed (non esiste - usa localStorage)
// - onboarding_completed_at (non esiste - usa localStorage)
```

---

### 2. `departments`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `is_active` (boolean) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `DepartmentSummary[]`:**
```typescript
// OnboardingData.departments -> departments table
departments.map(dept => ({
  id: dept.id,                            // ✅ Generato da frontend
  company_id: companyId,                  // ✅ Da passare come parametro
  name: dept.name,                        // ✅ DISPONIBILE
  is_active: dept.is_active ?? true,      // ✅ DISPONIBILE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// ❌ CAMPO NON SALVATO (solo frontend):
// - description (non esiste nella tabella)
```

---

### 3. `staff`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `role` (varchar) ✅
- `category` (varchar) ✅
- `email` (varchar) ✅
- `phone` (varchar) ✅
- `hire_date` (date) ✅
- `status` (varchar) ✅ CHECK: 'active', 'inactive', 'suspended'
- `notes` (text) ✅
- `haccp_certification` (jsonb) ✅
- `department_assignments` (array) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `StaffMember[]`:**
```typescript
// OnboardingData.staff -> staff table
staff.map(person => ({
  company_id: companyId,                                    // ✅ Da passare
  name: person.fullName || `${person.name} ${person.surname}`, // ✅ DISPONIBILE
  role: person.role,                                        // ✅ DISPONIBILE (admin, responsabile, dipendente, collaboratore)
  category: Array.isArray(person.categories)
    ? person.categories[0] || 'Altro'
    : person.category,                                      // ✅ DISPONIBILE (prendere il primo)
  email: person.email || null,                              // ✅ DISPONIBILE
  phone: person.phone || null,                              // ✅ DISPONIBILE
  hire_date: null,                                          // ⚠️ Non presente in StaffMember
  status: 'active',                                         // ✅ Default
  notes: person.notes || null,                              // ✅ DISPONIBILE
  haccp_certification: person.haccpExpiry ? {
    level: 'base',
    expiry_date: person.haccpExpiry,
    issuing_authority: '',
    certificate_number: ''
  } : null,                                                 // ✅ DISPONIBILE (mappare da haccpExpiry)
  department_assignments: person.department_assignments,     // ✅ DISPONIBILE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

### 4. `conservation_points`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `department_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `setpoint_temp` (numeric) ✅
- `type` (enum) ✅ CHECK: 'ambient', 'fridge', 'freezer', 'blast'
- `product_categories` (array) ✅
- `is_blast_chiller` (boolean) ✅
- `status` (varchar) ✅ CHECK: 'normal', 'warning', 'critical'
- `maintenance_due` (timestamp) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `ConservationPoint[]`:**
```typescript
// OnboardingData.conservation.points -> conservation_points table
points.map(point => ({
  company_id: companyId,                          // ✅ Da passare
  department_id: point.departmentId,              // ✅ DISPONIBILE
  name: point.name,                               // ✅ DISPONIBILE
  setpoint_temp: point.targetTemperature,         // ✅ DISPONIBILE (rinominare da targetTemperature)
  type: point.pointType,                          // ✅ DISPONIBILE (pointType -> type)
  product_categories: point.productCategories || [], // ✅ DISPONIBILE
  is_blast_chiller: point.isBlastChiller || false,   // ✅ DISPONIBILE
  status: 'normal',                               // ✅ Default
  maintenance_due: point.maintenanceDue || null,  // ✅ DISPONIBILE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

### 5. `maintenance_tasks`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `conservation_point_id` (uuid, FK) ✅
- `type` (enum) ✅
- `frequency` (varchar) ✅
- `title` (varchar) ✅
- `description` (text) ✅
- `priority` (varchar) ✅ CHECK: 'low', 'medium', 'high', 'critical'
- `status` (varchar) ✅ CHECK: 'scheduled', 'in_progress', 'completed', 'overdue', 'skipped'
- `next_due` (timestamp) ✅
- `estimated_duration` (integer) ✅
- `instructions` (array) ✅
- `assigned_to` (varchar) ✅
- `assignment_type` (enum) ✅
- `assigned_to_staff_id` (uuid, FK) ✅
- `assigned_to_role` (varchar) ✅
- `assigned_to_category` (varchar) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `ConservationMaintenancePlan[]`:**
```typescript
// OnboardingData.tasks.conservationMaintenancePlans -> maintenance_tasks table

// Helper functions
const mapManutenzioneTipo = (tipo: string): string => {
  const map: Record<string, string> = {
    'rilevamento_temperatura': 'temperature_monitoring',
    'sanificazione': 'sanitation',
    'sbrinamento': 'defrosting',
    'controllo_scadenze': 'expiry_check'
  }
  return map[tipo] || 'general_maintenance'
}

const mapFrequenza = (frequenza: string): string => {
  const map: Record<string, string> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annual',
    'custom': 'custom'
  }
  return map[frequenza] || 'weekly'
}

const calculateNextDue = (frequenza: string): string => {
  const now = new Date()
  switch (frequenza) {
    case 'giornaliera': return new Date(now.setDate(now.getDate() + 1)).toISOString()
    case 'settimanale': return new Date(now.setDate(now.getDate() + 7)).toISOString()
    case 'mensile': return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
    case 'annuale': return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    default: return new Date(now.setDate(now.getDate() + 7)).toISOString()
  }
}

// Mapping
conservationMaintenancePlans.map(plan => ({
  company_id: companyId,                                    // ✅ Da passare
  conservation_point_id: plan.conservationPointId,          // ✅ DISPONIBILE
  type: mapManutenzioneTipo(plan.manutenzione),            // ✅ MAPPARE (IT -> EN)
  frequency: mapFrequenza(plan.frequenza),                  // ✅ MAPPARE (IT -> EN)
  title: `Manutenzione: ${plan.manutenzione}`,             // ✅ Generare
  description: plan.note || '',                             // ✅ DISPONIBILE
  priority: 'medium',                                       // ✅ Default
  status: 'scheduled',                                      // ✅ Default
  next_due: calculateNextDue(plan.frequenza),              // ✅ CALCOLARE
  estimated_duration: 60,                                   // ✅ Default (minuti)
  instructions: [],                                         // ✅ Default vuoto
  assigned_to_staff_id: plan.assegnatoARuolo === 'specifico'
    ? plan.assegnatoADipendenteSpecifico
    : null,                                                 // ✅ DISPONIBILE
  assigned_to_role: plan.assegnatoARuolo !== 'specifico'
    ? plan.assegnatoARuolo
    : null,                                                 // ✅ DISPONIBILE
  assigned_to_category: plan.assegnatoACategoria || null,   // ✅ DISPONIBILE
  assigned_to: plan.assegnatoADipendenteSpecifico
    || plan.assegnatoARuolo
    || '',                                                  // ✅ DISPONIBILE
  assignment_type: plan.assegnatoARuolo === 'specifico'
    ? 'staff'
    : 'role',                                               // ✅ MAPPARE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

### 6. `tasks`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `description` (text) ✅
- `frequency` (varchar) ✅
- `department_id` (uuid, FK) ✅
- `conservation_point_id` (uuid, FK) ✅
- `priority` (varchar) ✅ CHECK: 'low', 'medium', 'high', 'critical'
- `estimated_duration` (integer) ✅
- `checklist` (array) ✅
- `required_tools` (array) ✅
- `haccp_category` (varchar) ✅
- `next_due` (timestamp) ✅
- `status` (varchar) ✅
- `assigned_to` (varchar) ✅
- `assignment_type` (enum) ✅
- `assigned_to_staff_id` (uuid, FK) ✅
- `assigned_to_role` (varchar) ✅
- `assigned_to_category` (varchar) ✅
- `documentation_url` (varchar) ✅
- `validation_notes` (text) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `GenericTask[]`:**
```typescript
// OnboardingData.tasks.genericTasks -> tasks table
genericTasks.map(task => ({
  company_id: companyId,                                    // ✅ Da passare
  name: task.name,                                          // ✅ DISPONIBILE
  frequency: mapFrequenza(task.frequenza),                  // ✅ MAPPARE (IT -> EN)
  description: task.note || '',                             // ✅ DISPONIBILE
  department_id: null,                                      // ⚠️ Null per task generici
  conservation_point_id: null,                              // ⚠️ Null per task generici
  priority: 'medium',                                       // ✅ Default
  estimated_duration: 60,                                   // ✅ Default
  checklist: [],                                            // ✅ Default vuoto
  required_tools: [],                                       // ✅ Default vuoto
  haccp_category: null,                                     // ⚠️ Non presente in GenericTask
  next_due: calculateNextDue(task.frequenza),              // ✅ CALCOLARE
  status: 'pending',                                        // ✅ Default
  assigned_to_staff_id: task.assegnatoARuolo === 'specifico'
    ? task.assegnatoADipendenteSpecifico
    : null,                                                 // ✅ DISPONIBILE
  assigned_to_role: task.assegnatoARuolo !== 'specifico'
    ? task.assegnatoARuolo
    : null,                                                 // ✅ DISPONIBILE
  assigned_to_category: task.assegnatoACategoria || null,   // ✅ DISPONIBILE
  assigned_to: task.assegnatoADipendenteSpecifico
    || task.assegnatoARuolo
    || '',                                                  // ✅ DISPONIBILE
  assignment_type: task.assegnatoARuolo === 'specifico'
    ? 'staff'
    : 'role',                                               // ✅ MAPPARE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

### 7. `product_categories`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `ProductCategory[]`:**
```typescript
// OnboardingData.inventory.categories -> product_categories table
categories.map(category => ({
  id: category.id,                        // ✅ Generato da frontend
  company_id: companyId,                  // ✅ Da passare
  name: category.name,                    // ✅ DISPONIBILE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// ❌ CAMPI NON SALVATI (solo frontend):
// - color
// - description
// - conservationRules (minTemp, maxTemp, maxStorageDays, requiresBlastChilling)
```

---

### 8. `products`

**Campi disponibili:**
- `id` (uuid, PK)
- `company_id` (uuid, FK) ✅
- `name` (varchar) ✅
- `category_id` (uuid, FK) ✅
- `department_id` (uuid, FK) ✅
- `conservation_point_id` (uuid, FK) ✅
- `barcode` (varchar) ✅
- `sku` (varchar) ✅
- `supplier_name` (varchar) ✅
- `purchase_date` (timestamp) ✅
- `expiry_date` (timestamp) ✅
- `quantity` (numeric) ✅
- `unit` (varchar) ✅
- `allergens` (array) ✅
- `label_photo_url` (varchar) ✅
- `notes` (text) ✅
- `status` (varchar) ✅ CHECK: 'active', 'expired', 'consumed', 'waste'
- `compliance_status` (varchar) ✅ CHECK: 'compliant', 'warning', 'non_compliant'
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Mapping da `InventoryProduct[]`:**
```typescript
// OnboardingData.inventory.products -> products table
products.map(product => ({
  id: product.id,                                 // ✅ Generato da frontend
  company_id: companyId,                          // ✅ Da passare
  name: product.name,                             // ✅ DISPONIBILE
  category_id: product.categoryId || null,        // ✅ DISPONIBILE
  department_id: product.departmentId || null,    // ✅ DISPONIBILE
  conservation_point_id: product.conservationPointId || null, // ✅ DISPONIBILE
  barcode: product.barcode || null,               // ✅ DISPONIBILE
  sku: product.sku || null,                       // ✅ DISPONIBILE
  supplier_name: product.supplierName || null,    // ✅ DISPONIBILE
  purchase_date: product.purchaseDate || null,    // ✅ DISPONIBILE
  expiry_date: product.expiryDate || null,        // ✅ DISPONIBILE
  quantity: product.quantity || null,             // ✅ DISPONIBILE
  unit: product.unit || null,                     // ✅ DISPONIBILE
  allergens: product.allergens || [],             // ✅ DISPONIBILE
  label_photo_url: product.labelPhotoUrl || null, // ✅ DISPONIBILE
  notes: product.notes || null,                   // ✅ DISPONIBILE
  status: product.status || 'active',             // ✅ DISPONIBILE
  compliance_status: product.complianceStatus || null, // ✅ DISPONIBILE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

## Riassunto Problemi Comuni

### ❌ Campi NON presenti in Supabase (non salvare):

**companies:**
- `phone` (salvare altrove o ignorare)
- `vat_number` (salvare altrove o ignorare)
- `business_type` (salvare altrove o ignorare)
- `established_date` (salvare altrove o ignorare)
- `license_number` (salvare altrove o ignorare)

**departments:**
- `description` (solo frontend)

**product_categories:**
- `color` (solo frontend)
- `description` (solo frontend)
- `conservationRules` (solo frontend)

### ⚠️ Campi da MAPPARE o CALCOLARE:

**conservation_points:**
- `targetTemperature` → `setpoint_temp`
- `pointType` → `type`

**maintenance_tasks / tasks:**
- `manutenzione` (IT) → `type` (EN): usare `mapManutenzioneTipo()`
- `frequenza` (IT) → `frequency` (EN): usare `mapFrequenza()`
- `assegnatoARuolo` → `assignment_type`: 'specifico' → 'staff', altri → 'role'
- Calcolare `next_due` in base a `frequenza`

**staff:**
- `fullName` o `name + surname` → `name`
- `categories[0]` → `category` (prendere solo il primo)
- `haccpExpiry` → `haccp_certification` (convertire in oggetto JSON)

---

## Ordine di Inserimento (per rispettare le Foreign Keys)

1. ✅ `companies` (già esistente, aggiornare)
2. ✅ `departments` (dipende da companies)
3. ✅ `staff` (dipende da companies)
4. ✅ `conservation_points` (dipende da companies, departments)
5. ✅ `maintenance_tasks` (dipende da companies, conservation_points, staff)
6. ✅ `tasks` (dipende da companies, departments, conservation_points, staff)
7. ✅ `product_categories` (dipende da companies)
8. ✅ `products` (dipende da companies, product_categories, departments, conservation_points)

---

## Note Importanti

1. **UUID Generation**: Generare gli UUID sul frontend con `crypto.randomUUID()` o `uuid` library per mantenere consistenza tra relazioni
2. **Timestamps**: Sempre usare `new Date().toISOString()` per `created_at` e `updated_at`
3. **Array Fields**: Assicurarsi che gli array siano sempre inizializzati (es: `[]` invece di `null`)
4. **Enum Checks**: Rispettare i valori CHECK constraint (es: status, priority, type)
5. **Foreign Keys**: Inserire prima le tabelle parent, poi quelle child
6. **Null vs Default**: Preferire valori di default quando possibile per evitare errori

---

## Validazione Pre-Insert

Prima di inserire i dati, validare:
- ✅ `company_id` esiste e non è null
- ✅ `department_id` esiste quando richiesto
- ✅ `staff_id` esiste quando referenziato
- ✅ Enum values sono validi (type, status, priority, etc.)
- ✅ Array fields sono array validi (non null, non undefined)
- ✅ Timestamps sono in formato ISO

---

## 🔧 Fix Applicati Durante Debug (2025-10-06)

### 1. Conservation Points ID Mapping ✅
**Problema:** Foreign key constraint error su `maintenance_tasks.conservation_point_id`

**Root Cause:** Gli ID dei conservation points usati nei maintenance tasks erano quelli temporanei del form, non quelli reali generati dal database.

**Soluzione applicata in `onboardingHelpers.ts:851-889`:**
```typescript
// Ottieni gli ID reali dopo INSERT
const { data: insertedPoints, error } = await supabase
  .from('conservation_points')
  .insert(points)
  .select('id, name')  // ✅ Richiedi gli ID reali

// Crea mappa per conversione ID
const conservationPointsIdMap = new Map<string, string>()
formData.conservation.points.forEach((point, index) => {
  if (insertedPoints[index]) {
    conservationPointsIdMap.set(point.id, insertedPoints[index].id)
  }
})

// Usa la mappa per convertire gli ID nei maintenance tasks
const realId = conservationPointsIdMap.get(plan.conservationPointId)
```

### 2. Companies Table - Campi Inesistenti ❌
**Problema:** Errore 400 quando si cercava di aggiornare `onboarding_completed` e `onboarding_completed_at`

**Root Cause:** Questi campi NON esistono nello schema Supabase companies table

**Soluzione applicata in `onboardingHelpers.ts:1103-1106` e `OnboardingWizard.tsx:161-164`:**
```typescript
// ❌ PRIMA (sbagliato):
await supabase
  .from('companies')
  .update({
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  })

// ✅ DOPO (corretto):
localStorage.setItem('onboarding-completed', 'true')
localStorage.setItem('onboarding-completed-at', new Date().toISOString())
```

### 3. RLS (Row-Level Security) Disabilitato ⚠️
**Problema:** Errori 401/406 su tutte le operazioni dopo aver abilitato RLS

**Root Cause:** RLS policies richiedono Supabase Auth JWT, ma l'app usa Clerk Auth

**Soluzione:** Disabilitato RLS su tutte le tabelle (vedi `RLS_SOLUTION.md`)
- File SQL: `supabase/rls-simplified.sql`
- Sicurezza garantita a livello applicazione con filtri `company_id`

---

## ✅ Status Finale Onboarding

**Data ultimo test:** 2025-10-06
**Risultato:** ✅ **COMPLETATO CON SUCCESSO**

### Operazioni Verificate:
1. ✅ Insert `companies` (update di record esistente)
2. ✅ Insert `departments` (4 reparti di default)
3. ✅ Insert `staff` (membri del team con certificazioni HACCP)
4. ✅ Insert `conservation_points` con `.select()` per ottenere ID reali
5. ✅ Insert `maintenance_tasks` usando ID mapping
6. ✅ Insert `tasks` generici
7. ✅ Insert `product_categories` (4 categorie)
8. ✅ Insert `products` (6 prodotti sample)
9. ✅ Salvataggio completion status in localStorage

### Dati di Test Inseriti:
- **Departments:** 4 (Cucina, Sala, Magazzino, Amministrazione)
- **Staff:** Variabile (da onboarding form)
- **Conservation Points:** Variabile (da onboarding form)
- **Maintenance Tasks:** Variabile (basato su conservation points)
- **Product Categories:** 4 (Carni, Pesce, Latticini, Verdure)
- **Products:** 6 (sample products)

---

## 🔄 Reset & Purge System

### Reset App Function

**File:** `src/utils/onboardingHelpers.ts:653`

La funzione `resetApp()` ora include purge completo:

**Operazioni eseguite:**
1. ✅ Ottiene `company_id` da `user_profiles`
2. ✅ Chiama `supabase.rpc('purge_company_data')` per eliminare dati DB
3. ✅ Pulisce localStorage + sessionStorage
4. ✅ Svuota cache React Query (`window.queryClient.clear()`)
5. ✅ Hard reload della pagina

### Database Purge Function

**File:** `supabase/purge-company-data.sql`

Funzione SQL `purge_company_data(p_company_id uuid)` che:
- Elimina tutti i dati di una company in ordine FK-safe
- Gestisce 15 tabelle con dipendenze
- Restituisce statistiche JSON dei record eliminati
- **NON elimina** `companies` né `user_profiles`

**Ordine eliminazione (rispetta FK):**
1. `temperature_readings`
2. `shopping_list_items`
3. `products`
4. `maintenance_tasks`, `tasks`
5. `events`, `notes`, `non_conformities`
6. `shopping_lists`
7. `product_categories`
8. `conservation_points`
9. `UPDATE user_profiles SET staff_id = NULL`
10. `staff`
11. `departments`
12. *(opzionale)* `maintenance_tasks_backup`

**Utilizzo:**
```sql
SELECT purge_company_data('c47b8b25-7257-4db3-a94c-d1693ff53cc5');
```

**Documentazione completa:** Vedi `RESET_APP_GUIDE.md`

---

## 📚 Documentazione Correlata

- **`SUPABASE_SCHEMA_MAPPING.md`** (questo file) - Mapping dati onboarding → DB
- **`MAPPING_COMPLIANCE_REPORT.md`** - Audit report compliance schema
- **`RLS_SOLUTION.md`** - Soluzione RLS con Clerk Auth
- **`RESET_APP_GUIDE.md`** - Guida completa reset app & database

---

**Documento aggiornato da:** Claude Code
**Versione:** 2.1
**Ultimo aggiornamento:** 2025-10-06
**Modifiche v2.1:** Aggiunto sistema reset & purge completo
**Prossimi aggiornamenti:** Quando cambiano gli schemi Supabase
