# 🤖 MANUALE OPERATIVO MULTI-AGENT - USER ACTIVITY TRACKING

**Project:** Business HACCP Manager v.2
**Branch:** NoClerk → **feature/user-activity-tracking** (NEW BRANCH!)
**Date:** 2025-01-14
**Version:** 1.1

---

## 🎯 OBIETTIVO MISSIONE

Completare l'implementazione del sistema **User Activity Tracking Professionale** seguendo le specifiche dei documenti:
- `USER_TRACKING_PLANNING.md`
- `USER_TRACKING_TASKS.md`
- `SCHEMA_ATTUALE.md`

Il sistema deve tracciare **TUTTE** le attività utente nell'applicazione per:
- ✅ Compliance HACCP
- 📊 Analytics & Reporting
- 🔐 Security & Audit
- 📄 Export PDF strutturato

---

## ⚠️ REGOLE CRITICHE MULTI-AGENT - LEGGI PRIMA DI INIZIARE

### 🚫 DIVIETI ASSOLUTI MULTI-AGENT

1. **❌ MAI MODIFICARE CODICE DURANTE TEST/MAPPATURA**
   - Test identifica bug → documentare in tracking file
   - Modifiche solo in sessioni dedicate con utente
   - No fix "al volo" durante esecuzione test
   - Bug trovati vanno documentati, NON fixati durante test

2. **❌ NO COMMIT AUTOMATICI**
   - ✅ `git add` permesso
   - ❌ `git commit` solo con conferma utente
   - ❌ `git push` mai automatico
   - Solo il supervisore decide quando committare

3. **⏱️ MAX LOCK DURATION: 3 MINUTI**
   - Auto-scadenza dopo 3min
   - Heartbeat ogni 60s obbligatorio
   - Cleanup automatico lock stale
   - Timeout 10min → escalation emergenza

4. **❌ NO LAVORARE SU BRANCH NoClerk**
   - Creare nuovo branch: `feature/user-activity-tracking`
   - Merge su NoClerk solo dopo approvazione finale

## 🔑 CREDENZIALI TEST PRE-CONFIGURATE

### Account Admin Dev
- **Email:** matteo.cavallaro.work@gmail.com
- **Password:** cavallaro
- **Ruolo:** Admin (full permissions)
- **Company:** Auto-assegnata via devCompanyHelper

### ⚠️ Regole Utilizzo
- Uso **SOLO** in dev mode (localhost)
- **Logout obbligatorio** dopo ogni test session
- **NON modificare** email/password
- **NON usare** in produzione/staging

## 🗄️ CONFIGURAZIONE SUPABASE

### Connessione Database
```javascript
// File: .env.local (auto-creato da script)
VITE_SUPABASE_URL=https://tucqgcfrlzmwyfadiodo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4
```

### Company ID Dinamico
Gli agenti **NON devono hardcodare** il Company ID.
Usare sempre `devCompanyHelper`:

```javascript
// Prima di ogni test session
await devCompanyHelper.setDevCompanyFromCurrentUser();
// Oppure
const companyId = devCompanyHelper.getDevCompany();
```

## 🗄️ CONSULTAZIONE DATABASE OBBLIGATORIA

**CRITICO:** Prima di creare qualsiasi test JS, gli agenti DEVONO:

1. 🔍 **CONSULTARE SEMPRE il database Supabase reale** per verificare:
   - Schema tabelle correnti
   - Relazioni tra entità
   - Vincoli e validazioni esistenti
   - Dati di esempio reali

2. 📊 **Verificare compliance** con:
   - Struttura database attuale
   - Regole business implementate
   - Validazioni lato server
   - Tipi di dati corretti

3. 🎯 **Usare dati reali** per test:
   - Company ID effettivo dal database
   - User ID reali per test
   - Dati validi secondo schema attuale

**Esempio workflow database:**
```javascript
// Prima di creare test, consulta sempre:
// 1. Schema tabelle
const { data: tables } = await supabase
  .from('information_schema.tables')
  .select('table_name, column_name, data_type')
  .eq('table_schema', 'public');

// 2. Dati reali per test
const { data: companies } = await supabase
  .from('companies')
  .select('id, name, email')
  .limit(5);

// 3. Verifica vincoli
const { data: constraints } = await supabase
  .from('information_schema.check_constraints')
  .select('constraint_name, check_clause');
```

**Regole compliance:**
- ✅ SEMPRE consultare schema database prima di test
- ✅ Usare dati reali dal database per test
- ✅ Verificare vincoli e validazioni esistenti
- ✅ Testare con Company ID effettivo
- ❌ MAI usare dati mock senza verificare schema
- ❌ MAI assumere struttura database senza consultarla

### Setup Automatico Script
```javascript
// scripts/agent-setup.js
// Eseguito automaticamente prima dei test
import { devCompanyHelper } from '@/utils/devCompanyHelper'

async function setupAgentEnvironment() {
  // 1. Verifica connessione Supabase
  // 2. Login con credenziali test
  // 3. Ottieni Company ID
  // 4. Salva in localStorage
}
```

## 🎯 SISTEMA QUEUE MULTI-AGENT

### Pool Host Condivisi
- **Host 1 (3000):** Priorità Alta - Auth, UI Base, Form
- **Host 2 (3001):** Priorità Media - Logiche Business, Calendario
- **Host 3 (3002):** Emergenza - Navigazione, Admin, overflow

### Lock Atomici
- Directory: `.agent-locks/`
- File lock: `host-{port}.lock`
- Heartbeat: `agent-{id}.heartbeat`
- History: `lock-history.log`

### Workflow Queue
1. Agente richiede host
2. Tenta acquisire lock atomico
3. Se successo → esegue test
4. Se fallisce → entra in queue
5. Polling ogni 30s per host libero
6. Timeout 10min → escalation emergenza

## 🔍 ESPLORAZIONE PAGINE OBBLIGATORIA

**CRITICO:** Per ogni componente testato, gli agenti DEVONO:

1. ⬇️ **SCROLLA SEMPRE la pagina** dall'inizio alla fine
2. 🔄 **Esplora TUTTE le varianti** visibili
3. 📱 **Testa stati responsive** (desktop/mobile)
4. 🎯 **Identifica elementi nascosti** che appaiono dopo scroll
5. 📊 **Documenta layout completo** prima di testare

**Esempio workflow scroll:**
```javascript
// Prima di ogni test
await page.evaluate(() => window.scrollTo(0, 0)); // Top
await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // Bottom
await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2)); // Middle
```

**Regole scroll:**
- ✅ SEMPRE scrollare prima di testare
- ✅ Identificare TUTTI gli elementi visibili
- ✅ Testare varianti nascoste dopo scroll
- ❌ MAI testare senza scroll completo
- ❌ MAI assumere layout senza verificare

### ✅ APPROCCIO PRAGMATICO

1. **✅ ESPANDERE vs CREARE NUOVO**
   - **File ESISTE e funziona**: Espandere (es: useProducts.ts)
     - Prima leggere tutto il file
     - Capire pattern e convenzioni
     - Aggiungere nuove funzioni alla fine
   - **File NON ESISTE**: Creare nuovo (es: TransferProductModal.tsx)
     - Ma seguire pattern file simili esistenti
     - Usare stessi import e stili del codebase
   - **Quando decidere**:
     - File < 500 righe → espandere è OK
     - File > 500 righe → valutare se conviene separare
     - Se in dubbio → chiedere al supervisore

2. **✅ PIANIFICARE SE FILE GRANDE**
   - File > 500 righe → scrivere piano prima
   - Dividere in sottotask
   - Validare approccio con supervisore

3. **✅ GIT WORKFLOW**
   ```bash
   # Step 1: Creare branch (SOLO SE NON ESISTE)
   git checkout -b feature/user-activity-tracking

   # Step 2: Lavorare e aggiungere file
   git add file1.ts file2.tsx

   # Step 3: STOP - NO git commit
   # Aspettare supervisore per testing

   # Step 4: Dopo approvazione supervisore
   git commit -m "..."
   git push origin feature/user-activity-tracking

   # Step 5: Merge solo dopo testing completo
   git checkout NoClerk
   git merge feature/user-activity-tracking
   ```

---

## 👥 TEAM STRUCTURE - 3 AGENTI SPECIALIZZATI

### **AGENT 1: Backend Specialist** 🔧
**Nome:** `backend-tracking-agent`
**Responsabilità:**
- Implementare tracking mancante nei services esistenti
- Aggiungere product transfer tracking
- Completare auth session tracking
- Verificare compliance con database schema

**Files di competenza:**
- `src/services/activityTrackingService.ts` ✅
- `src/hooks/useAuth.ts` ✅
- `src/features/inventory/hooks/useProducts.ts` ⚠️ (transfer missing)
- `src/features/calendar/hooks/useGenericTasks.ts` ✅
- `src/features/conservation/hooks/useMaintenanceTasks.ts` ✅

---

### **AGENT 2: Frontend Specialist** 🎨
**Responsabilità:**
- Creare Product Transfer Modal & UI
- Creare Activity Tracking Admin Dashboard
- Implementare componenti di visualizzazione log
- Integrare con backend services

**Files da creare:**
- `src/features/inventory/components/TransferProductModal.tsx`
- `src/features/admin/pages/ActivityTrackingPage.tsx`
- `src/features/admin/components/ActivityLogTable.tsx`
- `src/features/admin/components/ActivityFilters.tsx`
- `src/features/admin/components/ActiveSessionsCard.tsx`
- `src/features/admin/components/ActivityStatisticsChart.tsx`

---

### **AGENT 3: Testing & Validation Specialist** ✅
**Responsabilità:**
- Testing completo di tutti i tracking
- Validazione conformità schema database
- Verifica performance (overhead < 50ms)
- Report finale con evidenze

**Test da eseguire:**
- Session tracking (login/logout)
- Product operations (CRUD + transfer)
- Task completions (generic + maintenance)
- Shopping list operations
- Activity queries & filters
- Export functionality

---

## 📋 TASK ALLOCATION

### **AGENT 1 - BACKEND TASKS** (Stima: 2-3h)

#### Task 1.1: Product Transfer Implementation ⭐ PRIORITÀ ALTA
**File:** `src/features/inventory/hooks/useProducts.ts`

```typescript
// AGGIUNGERE alla fine del file useProducts.ts

// Transfer product mutation
const transferProductMutation = useMutation({
  mutationFn: async ({
    productId,
    fromConservationPointId,
    toConservationPointId,
    transferReason,
    transferNotes,
    authorizedById,
  }: {
    productId: string
    fromConservationPointId: string
    toConservationPointId: string
    transferReason: string
    transferNotes?: string
    authorizedById: string
  }) => {
    if (!companyId || !user) throw new Error('No company or user')

    // 1. Get product details BEFORE update
    const product = products.find(p => p.id === productId)
    if (!product) throw new Error('Product not found')

    // 2. Get from/to conservation points with department info
    const { data: fromPoint } = await supabase
      .from('conservation_points')
      .select('id, name, department_id, departments(id, name)')
      .eq('id', fromConservationPointId)
      .single()

    const { data: toPoint } = await supabase
      .from('conservation_points')
      .select('id, name, department_id, departments(id, name)')
      .eq('id', toConservationPointId)
      .single()

    if (!fromPoint || !toPoint) throw new Error('Conservation points not found')

    // 3. Get authorized user info
    const { data: authorizedUser } = await supabase
      .from('staff')
      .select('id, name')
      .eq('id', authorizedById)
      .single()

    // 4. Update product location
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        conservation_point_id: toConservationPointId,
        department_id: toPoint.department_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw error

    // 5. Log transfer activity
    if (user?.id && companyId) {
      await activityTrackingService.logActivity(
        user.id,
        companyId,
        'product_transferred',
        {
          product_id: productId,
          product_name: product.name,
          from_conservation_point_id: fromConservationPointId,
          from_conservation_point_name: fromPoint.name,
          to_conservation_point_id: toConservationPointId,
          to_conservation_point_name: toPoint.name,
          from_department_id: fromPoint.department_id,
          from_department_name: (fromPoint.departments as any)?.name || 'N/A',
          to_department_id: toPoint.department_id,
          to_department_name: (toPoint.departments as any)?.name || 'N/A',
          quantity_transferred: product.quantity,
          unit: product.unit,
          transfer_reason: transferReason,
          transfer_notes: transferNotes || undefined,
          authorized_by_id: authorizedById,
          authorized_by_name: authorizedUser?.name || 'N/A',
        },
        {
          sessionId: sessionId || undefined,
          entityType: 'product',
          entityId: productId,
        }
      )
    }

    return transformProductRecord(updatedProduct)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.products(companyId || ''),
    })
    toast.success('Prodotto trasferito con successo')
  },
  onError: (error: Error) => {
    console.error('Error transferring product:', error)
    toast.error('Errore nel trasferimento del prodotto')
  },
})

// AGGIUNGERE al return statement:
return {
  // ... existing exports
  transferProduct: transferProductMutation.mutate,
  isTransferring: transferProductMutation.isPending,
}
```

**Verifiche:**
- [ ] Mutation creata correttamente
- [ ] Log activity con tutti i campi richiesti
- [ ] Toast notifications funzionanti
- [ ] Query invalidation corretta

---

#### Task 1.2: Verify Auth Session Tracking
**File:** `src/hooks/useAuth.ts`

**Verifiche:**
- [x] `startSession()` chiamato al login (FIXED ✅)
- [x] `endSession()` chiamato al logout (FIXED ✅)
- [x] `updateLastActivity()` ogni 5 minuti ✅
- [x] sessionId esposto nell'API ✅

**Status:** ✅ COMPLETATO - Bug fix applicato alle linee 138 e 304

---

#### Task 1.3: Add Missing Activity Types to Database
**File:** `database/migrations/005_user_activity_logs.sql`

**Verificare che activity_type CHECK constraint includa:**
```sql
CHECK (
  activity_type IN (
    'session_start',
    'session_end',
    'task_completed',
    'product_added',
    'product_updated',
    'product_deleted',
    'product_transferred', -- ⚠️ VERIFICARE SE PRESENTE
    'shopping_list_created',
    'shopping_list_updated',
    'shopping_list_completed',
    'department_created',
    'staff_added',
    'conservation_point_created',
    'maintenance_task_created',
    'temperature_reading_added',
    'note_created',
    'non_conformity_reported',
    'page_view',
    'export_data'
  )
)
```

**Se manca `product_transferred`:**
```sql
-- MIGRATION PATCH
ALTER TABLE user_activity_logs
DROP CONSTRAINT IF EXISTS user_activity_logs_activity_type_check;

ALTER TABLE user_activity_logs
ADD CONSTRAINT user_activity_logs_activity_type_check
CHECK (
  activity_type IN (
    -- tutti i tipi esistenti +
    'product_transferred'
  )
);
```

---

### **AGENT 2 - FRONTEND TASKS** (Stima: 4-5h)

#### Task 2.1: Create Transfer Product Modal ⭐ PRIORITÀ ALTA
**File:** `src/features/inventory/components/TransferProductModal.tsx`

```typescript
import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useProducts } from '../hooks/useProducts'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useAuth } from '@/hooks/useAuth'
import type { Product } from '@/types/inventory'

interface TransferProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function TransferProductModal({
  isOpen,
  onClose,
  product,
}: TransferProductModalProps) {
  const { user } = useAuth()
  const { transferProduct, isTransferring } = useProducts()
  const { conservationPoints = [] } = useConservationPoints()

  const [toConservationPointId, setToConservationPointId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferNotes, setTransferNotes] = useState('')

  // Filter out current conservation point
  const availablePoints = useMemo(() => {
    return conservationPoints.filter(
      point => point.id !== product?.conservation_point_id
    )
  }, [conservationPoints, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !toConservationPointId || !transferReason.trim()) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    if (!product.conservation_point_id) {
      alert('Il prodotto non ha un punto di conservazione di origine')
      return
    }

    try {
      await transferProduct({
        productId: product.id,
        fromConservationPointId: product.conservation_point_id,
        toConservationPointId,
        transferReason: transferReason.trim(),
        transferNotes: transferNotes.trim() || undefined,
        authorizedById: user?.id || '',
      })
      onClose()
      // Reset form
      setToConservationPointId('')
      setTransferReason('')
      setTransferNotes('')
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  if (!product) return null

  const fromPoint = conservationPoints.find(
    p => p.id === product.conservation_point_id
  )
  const toPoint = conservationPoints.find(p => p.id === toConservationPointId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trasferisci Prodotto: ${product.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Location */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">
            Posizione Attuale
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Punto:</span>{' '}
              {fromPoint?.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Reparto:</span>{' '}
              {product.department_name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Punto di Conservazione Destinazione *
          </label>
          <select
            value={toConservationPointId}
            onChange={e => setToConservationPointId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona destinazione...</option>
            {availablePoints.map(point => (
              <option key={point.id} value={point.id}>
                {point.name} - {point.department_name || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo Trasferimento *
          </label>
          <input
            type="text"
            value={transferReason}
            onChange={e => setTransferReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es: Richiesta chef per servizio cena"
            required
          />
        </div>

        {/* Transfer Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Aggiuntive (opzionale)
          </label>
          <textarea
            value={transferNotes}
            onChange={e => setTransferNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Aggiungi dettagli sul trasferimento..."
          />
        </div>

        {/* Preview Destination */}
        {toPoint && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              Destinazione Selezionata
            </h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Punto:</span> {toPoint.name}
              </p>
              <p>
                <span className="font-medium">Reparto:</span>{' '}
                {toPoint.department_name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Tipo:</span> {toPoint.type}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isTransferring}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isTransferring}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? 'Trasferimento...' : 'Conferma Trasferimento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

**Verifiche:**
- [ ] Modal si apre correttamente
- [ ] Form validation funzionante
- [ ] Dropdown punti conservazione filtrato (escluso quello corrente)
- [ ] Submit chiama `transferProduct()` con dati corretti
- [ ] Toast success/error mostrato

---

#### Task 2.2: Create Activity Tracking Admin Page
**File:** `src/features/admin/pages/ActivityTrackingPage.tsx`

**Struttura minima:**
```typescript
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  useActiveSessions,
  useCompanyActivities,
  useActivityStatistics,
} from '@/hooks/useActivityTracking'
import { ActivityLogTable } from '../components/ActivityLogTable'
import { ActivityFilters } from '../components/ActivityFilters'
import { ActiveSessionsCard } from '../components/ActiveSessionsCard'
import { ActivityStatisticsChart } from '../components/ActivityStatisticsChart'

export default function ActivityTrackingPage() {
  const { hasPermission, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState({
    startDate: undefined,
    endDate: undefined,
    userId: undefined,
    activityType: undefined,
  })

  // Permission check
  if (!hasPermission('canManageSettings')) {
    return (
      <div className="p-6">
        <p className="text-red-600">Accesso negato: solo amministratori</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Activity Tracking
          </h1>
          <p className="text-gray-600">
            Monitora attività utenti e sessioni attive
          </p>
        </div>
      </div>

      {/* Active Sessions */}
      <ActiveSessionsCard />

      {/* Filters */}
      <ActivityFilters filters={filters} onFiltersChange={setFilters} />

      {/* Activity Log Table */}
      <ActivityLogTable filters={filters} />

      {/* Statistics */}
      <ActivityStatisticsChart />
    </div>
  )
}
```

---

#### Task 2.3-2.6: Create Supporting Components
**Files:**
- `src/features/admin/components/ActivityLogTable.tsx`
- `src/features/admin/components/ActivityFilters.tsx`
- `src/features/admin/components/ActiveSessionsCard.tsx`
- `src/features/admin/components/ActivityStatisticsChart.tsx`

**Requisiti minimi:**
- Table: lista attività con colonne (timestamp, user, type, details)
- Filters: date range, user select, activity type
- Sessions: lista sessioni attive con durata
- Stats: conteggi per activity type (pie chart opzionale)

---

### **AGENT 3 - TESTING TASKS** (Stima: 2-3h)

#### Test Suite 1: Session Tracking
```bash
# TEST 1: Login Session Start
1. Logout completo dall'app
2. Login con credenziali valide
3. Verificare in DB:
   SELECT * FROM user_activity_logs
   WHERE activity_type = 'session_start'
   ORDER BY timestamp DESC LIMIT 1;
4. Verificare campi: user_id, session_id, activity_data.device_type

# TEST 2: Logout Session End
1. Click logout
2. Verificare in DB:
   SELECT * FROM user_activity_logs
   WHERE activity_type = 'session_end'
   ORDER BY timestamp DESC LIMIT 1;
3. Verificare activity_data.logout_type = 'manual'

# TEST 3: Last Activity Update
1. Login
2. Aspettare 6 minuti (trigger: ogni 5 min)
3. Verificare in DB:
   SELECT last_activity FROM user_sessions
   WHERE user_id = 'current-user-id';
4. last_activity deve essere aggiornato (< 1 min fa)
```

#### Test Suite 2: Product Operations
```bash
# TEST 4: Product Added
1. Vai in Inventario
2. Click "Aggiungi Prodotto"
3. Compila form: Nome, Categoria, Reparto, Quantità
4. Salva
5. Verificare in DB:
   SELECT * FROM user_activity_logs
   WHERE activity_type = 'product_added'
   ORDER BY timestamp DESC LIMIT 1;

# TEST 5: Product Updated
1. Modifica prodotto esistente
2. Cambia quantità
3. Salva
4. Verificare log 'product_updated' con activity_data.changes

# TEST 6: Product Deleted
1. Elimina un prodotto
2. Conferma
3. Verificare log 'product_deleted' con product_name

# TEST 7: Product Transferred (NEW!)
1. Click su prodotto
2. Click "Trasferisci"
3. Seleziona destinazione
4. Inserisci motivo
5. Conferma
6. Verificare in DB:
   SELECT * FROM user_activity_logs
   WHERE activity_type = 'product_transferred'
   ORDER BY timestamp DESC LIMIT 1;
7. Verificare tutti i campi: from/to points, departments, reason
```

#### Test Suite 3: Task Completions
```bash
# TEST 8: Generic Task Completed
1. Vai in Calendario
2. Click su mansione generica
3. Click "Completa"
4. Aggiungi note
5. Conferma
6. Verificare log 'task_completed' con entity_type='generic_task'

# TEST 9: Maintenance Task Completed
1. Vai in Punti Conservazione
2. Completa una manutenzione
3. Verificare log 'task_completed' con entity_type='maintenance_task'
```

#### Test Suite 4: Shopping Lists
```bash
# TEST 10: Shopping List Created
1. Vai in Inventario
2. Seleziona 3+ prodotti
3. Click "Genera Lista"
4. Inserisci nome
5. Conferma
6. Verificare log 'shopping_list_created'

# TEST 11: Shopping List Completed
1. Vai in Liste Spesa
2. Click su lista
3. Click "Completa Lista"
4. Conferma
5. Verificare log 'shopping_list_completed'
```

#### Test Suite 5: Performance
```bash
# TEST 12: Logging Overhead
1. Apri DevTools → Network
2. Completare un'azione (es: aggiungi prodotto)
3. Misurare tempo risposta
4. ✅ PASS se overhead < 50ms
5. ❌ FAIL se > 100ms → ottimizzare

# TEST 13: Query Performance
1. Aprire pgAdmin o Supabase SQL Editor
2. Eseguire:
   EXPLAIN ANALYZE
   SELECT * FROM user_activity_logs
   WHERE company_id = 'uuid'
   AND timestamp > now() - interval '7 days';
3. Verificare che usi indice idx_activity_company_id
```

#### Test Suite 6: Admin Dashboard
```bash
# TEST 14: Activity Tracking Page Access
1. Login come admin
2. Navigare a /admin/activity-tracking
3. ✅ Pagina carica correttamente
4. Login come dipendente
5. ✅ Mostra "Accesso negato"

# TEST 15: Active Sessions Display
1. Admin page
2. Verificare lista sessioni attive
3. Controllare: user name, duration, last activity

# TEST 16: Activity Log Table
1. Verificare tabella mostra attività
2. Applicare filtri (data, utente, tipo)
3. Verificare paginazione funzionante

# TEST 17: Export Functionality (se implementato)
1. Click "Export"
2. Verificare file CSV/PDF scaricato
3. Controllare contenuto corretto
```

---

## 📊 REPORT FINALE AGENT 3

**Template report:**
```markdown
# 🧪 TEST REPORT - User Activity Tracking

**Date:** YYYY-MM-DD
**Tester:** Agent 3
**Total Tests:** 17

## ✅ PASSED TESTS

### Session Tracking (3/3)
- [x] TEST 1: Login Session Start
- [x] TEST 2: Logout Session End
- [x] TEST 3: Last Activity Update

### Product Operations (4/4)
- [x] TEST 4: Product Added
- [x] TEST 5: Product Updated
- [x] TEST 6: Product Deleted
- [x] TEST 7: Product Transferred ⭐ NEW

### Task Completions (2/2)
- [x] TEST 8: Generic Task Completed
- [x] TEST 9: Maintenance Task Completed

### Shopping Lists (2/2)
- [x] TEST 10: Shopping List Created
- [x] TEST 11: Shopping List Completed

### Performance (2/2)
- [x] TEST 12: Logging Overhead < 50ms
- [x] TEST 13: Query Performance (using indexes)

### Admin Dashboard (4/4)
- [x] TEST 14: Page Access Control
- [x] TEST 15: Active Sessions Display
- [x] TEST 16: Activity Log Table
- [x] TEST 17: Export Functionality

## 🎯 SUMMARY
- **Total Tests:** 17
- **Passed:** 17
- **Failed:** 0
- **Success Rate:** 100%

## 📊 PERFORMANCE METRICS
- Average logging overhead: 35ms ✅
- Query response time: 120ms ✅
- Activity page load: 450ms ✅

## ✅ COMPLIANCE CHECK
- [x] All activity types logged correctly
- [x] JSONB structure matches planning
- [x] RLS policies enforced
- [x] No sensitive data in logs
- [x] Database schema compliance verified

## 🐛 ISSUES FOUND
(Lista bug trovati con severità e descrizione)

## 💡 RECOMMENDATIONS
(Suggerimenti miglioramenti)
```

---

## 🚀 EXECUTION SEQUENCE

### **Phase 0: Branch Setup (5 min)** ⚠️ OBBLIGATORIO
```bash
# Creare nuovo branch da NoClerk
git checkout NoClerk
git pull origin NoClerk
git checkout -b feature/user-activity-tracking
git push -u origin feature/user-activity-tracking
```

### **Phase 1: Setup (15 min)**
1. Tutti e 3 gli agent leggono:
   - `USER_TRACKING_PLANNING.md`
   - `USER_TRACKING_TASKS.md`
   - `SCHEMA_ATTUALE.md`
   - Questo manuale (incluse REGOLE CRITICHE!)

2. Agent 1 verifica database:
   ```sql
   SELECT * FROM user_activity_logs LIMIT 1;
   SELECT * FROM user_sessions LIMIT 1;
   ```

3. ⚠️ **CHECKPOINT CRITICO**: Ogni agent conferma di aver letto le REGOLE

### **Phase 2: Backend Implementation (2-3h)**
**Agent 1 lavora in parallelo su:**
1. Product transfer tracking (Task 1.1) - 45 min
   - ⚠️ PRIMA: Leggere `useProducts.ts` completamente
   - ⚠️ File è > 300 righe? Sì → OK, procedi con attenzione
   - Aggiungere mutation alla fine del file
   - NON modificare codice esistente
2. Verify auth session tracking (Task 1.2) - 15 min
   - Già fixato, solo verificare
3. Database migration check (Task 1.3) - 15 min

**Checkpoints:**
- [ ] git add file.ts (OK)
- [ ] ❌ NO git commit (aspettare supervisore)
- [ ] Test console.log per debugging
- [ ] Segnalare al supervisore quando finito

### **Phase 3: Frontend Implementation (4-5h)**
**Agent 2 lavora in parallelo su:**
1. TransferProductModal (Task 2.1) - 90 min
   - ⚠️ PRIMA: Leggere componenti modal esistenti (es: CreateShoppingListModal.tsx)
   - Seguire stesso pattern e stile
   - Usare stessi import (Modal, Button, Form components)
2. ActivityTrackingPage (Task 2.2) - 60 min
   - ⚠️ Creare file NUOVO (non esiste)
   - Seguire pattern pagine esistenti (DashboardPage, InventoryPage)
   - Usare layout coerente
3. Supporting components (Task 2.3-2.6) - 120 min
   - Ogni componente < 300 righe

**Checkpoints:**
- [ ] git add components (OK)
- [ ] ❌ NO git commit (aspettare supervisore)
- [ ] Screenshot UI per review
- [ ] Test manuale form validation
- [ ] Segnalare quando finito

### **Phase 4: Integration Testing (2-3h)**
**Agent 3 esegue test suite completa:**
1. Session Tracking (30 min)
2. Product Operations (45 min)
3. Task Completions (30 min)
4. Shopping Lists (30 min)
5. Performance (30 min)
6. Admin Dashboard (30 min)

**Checkpoints:**
- [ ] Screenshot evidenze test
- [ ] Log SQL queries
- [ ] Report finale completo

### **Phase 5: Supervisore Testing (1-2h)** ⚠️ FASE CRITICA
**Claude Code (Supervisore) testa tutto manualmente:**
1. Verifica codice Agent 1, 2, 3
2. Esegue testing UI completo
3. Verifica database logs
4. Performance check

**Se TUTTO OK:**
```bash
# Supervisore fa commit
git add .
git commit -m "feat: complete user activity tracking system

- Add product transfer tracking
- Create admin activity dashboard
- All tests passed (17/17)

🤖 Generated with Claude Code"

# Push branch
git push origin feature/user-activity-tracking
```

**Se CI SONO PROBLEMI:**
- Supervisore debugga e fixa
- Richiede modifiche agli agent
- Testing ripetuto fino a 100% OK

### **Phase 6: Merge to NoClerk (solo dopo approvazione utente)**
```bash
git checkout NoClerk
git merge feature/user-activity-tracking
git push origin NoClerk
```

---

## 🎯 SUCCESS CRITERIA

Il progetto è considerato **COMPLETATO** quando:

### Funzionalità ✅
- [x] Session tracking funzionante (login/logout)
- [ ] Product transfer tracking implementato
- [x] Task completions tracked
- [x] Shopping lists tracked
- [ ] Admin dashboard accessibile
- [ ] Activity log table funzionante

### Performance ✅
- [ ] Logging overhead < 50ms
- [ ] Query performance < 500ms
- [ ] Page load < 1s

### Qualità ✅
- [ ] Nessun console.error in produzione
- [ ] TypeScript strict mode compliant
- [ ] No any types (eccetto cast inevitabili)
- [ ] RLS policies verificate

### Testing ✅
- [ ] 17/17 test passed
- [ ] Report finale Agent 3 completo
- [ ] Screenshot evidenze forniti

---

## 🔐 SECURITY CHECKLIST

Prima del deploy finale verificare:
- [ ] Nessuna password o token nei log
- [ ] IP address anonimizzato (opzionale GDPR)
- [ ] RLS policies impediscono cross-company access
- [ ] Admin dashboard solo per admin
- [ ] Export dati include solo company propria

---

## 📞 COMMUNICATION PROTOCOL

**Agent 1 → Supervisore:**
```
"✅ Backend Task 1.1 completato. Product transfer API: transferProduct()
File modificato: src/features/inventory/hooks/useProducts.ts (linee 400-500)
git add eseguito. ASPETTO APPROVAZIONE per commit."
```

**Agent 2 → Supervisore:**
```
"✅ Frontend Task 2.1 completato. TransferProductModal creato.
File: src/features/inventory/components/TransferProductModal.tsx (280 righe)
git add eseguito. ASPETTO TESTING."
```

**Agent 3 → Supervisore:**
```
"📊 Test Suite 1-7 completati: 7/7 PASSED
Product transfer tracking verificato nel database.
Screenshot allegati. Report pronto."
```

**Supervisore → Utente:**
```
"✅ Implementazione completata dagli agenti
✅ Testing Agent 3: 17/17 passed
✅ Supervisore ha testato manualmente
⏸️ ASPETTO TUA APPROVAZIONE per commit e merge"
```

---

**Document Owner:** Claude Code
**Last Updated:** 2025-01-14
**Version:** 1.1 (Aggiornato con regole workflow)
**Status:** 🚀 Ready for Multi-Agent Execution
**Estimated Completion:** 8-11 hours total

---

## 🎯 FINAL NOTES

- ⚠️ **PRIORITÀ #1**: Leggere REGOLE CRITICHE prima di iniziare
- Gli agent devono lavorare in **parallelo** quando possibile
- ❌ **NESSUN COMMIT** finché supervisore non ha testato
- ✅ **git add** OK, **git commit** solo supervisore
- Agent 3 può iniziare testing backend anche se Agent 2 non ha finito UI
- **Claude Code supervisiona** e fa testing finale prima di commit
- 🌿 **Branch dedicato**: feature/user-activity-tracking
- 🔀 **Merge su NoClerk**: solo dopo approvazione utente finale

**Good luck, Team! 🚀**
