# Glossario Calendario - Business HACCP Manager

## Indice
1. [Panoramica Sistema](#panoramica-sistema)
2. [Architettura Database](#architettura-database)
3. [Configurazione Calendario](#configurazione-calendario)
4. [Tipi di Eventi](#tipi-di-eventi)
5. [Sistema di Completamento Task](#sistema-di-completamento-task)
6. [Logiche di Visualizzazione](#logiche-di-visualizzazione)
7. [Macro Categorie](#macro-categorie)
8. [Attività in Ritardo](#attività-in-ritardo)
9. [File e Componenti Principali](#file-e-componenti-principali)
10. [Hook e Utilities](#hook-e-utilities)
11. [Troubleshooting](#troubleshooting)

---

## Panoramica Sistema

Il sistema calendario di Business HACCP Manager è un calendario unificato che aggrega eventi da diverse fonti:
- **Manutenzioni** (maintenance_tasks)
- **Attività Generiche** (tasks)
- **Scadenze Prodotti** (products)
- **Scadenze HACCP** (staff - haccp_certification)
- **Alert HACCP** (generati dinamicamente)
- **Controlli Temperatura** (conservation_points)

### Modalità di Visualizzazione
1. **Modalità Standard**: Eventi individuali mostrati separatamente
2. **Modalità Macro Categorie**: Eventi aggregati per categoria con count

---

## Architettura Database

### Tabelle Principali

#### `company_calendar_settings` (Configurazione Calendario)
```sql
CREATE TABLE company_calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year_start DATE NOT NULL,
  fiscal_year_end DATE NOT NULL,
  closure_dates DATE[] DEFAULT '{}',
  open_weekdays INTEGER[] DEFAULT '{1,2,3,4,5,6}',
  business_hours JSONB NOT NULL DEFAULT '{}',
  is_configured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id) -- Relazione 1:1
)
```

**Campi:**
- `fiscal_year_start/end`: Anno lavorativo - calendario mostra eventi solo in questo range
- `closure_dates`: Array di date chiusura (ferie, festività) in formato YYYY-MM-DD
- `open_weekdays`: Array giorni settimana aperti (0=Domenica, 6=Sabato)
- `business_hours`: JSONB - orari apertura per ogni giorno
  ```json
  {
    "1": [{"open": "09:00", "close": "22:00"}],
    "2": [{"open": "08:00", "close": "12:30"}, {"open": "16:00", "close": "20:00"}]
  }
  ```
- `is_configured`: Flag per verificare se calendario è stato configurato

**RLS Policies:**
- SELECT: `is_company_member(company_id)`
- INSERT: `is_admin(company_id)` + no duplicati
- UPDATE: `has_management_role(company_id)` + company_id immutabile
- DELETE: `is_admin(company_id)`

**Audit:**
- Trigger automatico registra tutte le modifiche in `audit_logs`

---

## Configurazione Calendario

### Onboarding - Step 7

**Componente:** `CalendarConfigStep.tsx`

#### Campi Configurazione

**1. Anno Lavorativo**
- Data Inizio (fiscal_year_start)
- Data Fine (fiscal_year_end)
- Validazione: fine > inizio, min 30 giorni, max 2 anni

**2. Giorni Apertura Settimanali**
- Toggle buttons per ogni giorno (0-6)
- Almeno 1 giorno obbligatorio
- Default: [1,2,3,4,5,6] (Lun-Sab)

**3. Giorni di Chiusura**
- **Modalità Giorno Singolo**: Seleziona una singola data
- **Modalità Periodo**: Seleziona dal-al, genera tutte le date automaticamente
- Date visualizzate come badge removibili
- Validazione: date dentro anno lavorativo

**4. Orari di Apertura**
- Per ogni giorno aperto configurabile 1-2 fasce orarie
- Input `type="time"` in formato HH:mm
- Validazione: ora fine > ora inizio, no sovrapposizioni
- Esempio: 09:00-22:00 oppure 08:00-12:30 · 16:00-20:00

#### UI/UX

**Toggle Giorni Chiusura:**
```typescript
<button onClick={() => setClosureType('single')}>Giorno Singolo</button>
<button onClick={() => setClosureType('period')}>Periodo</button>
```

**Period Input:**
- Due date picker (Dal/Al)
- Generazione automatica tutte le date nel range
- Evita duplicati

**Business Hours:**
- Card per ogni giorno aperto
- Pulsante "Aggiungi fascia" (max 2)
- Rimozione fascia se > 1

### Configurazione Post-Onboarding

**Accesso:**
- CalendarPage → Se non configurato → Overlay con pulsante "Configura Calendario"
- Modal `CalendarConfigModal` con form completo

**Hook:** `useCalendarSettings`
```typescript
const {
  settings,           // CompanyCalendarSettings | null
  isLoading,
  isConfigured,      // () => boolean
  saveSettings,      // (input: CalendarConfigInput) => void
  isDateOpen,        // (date: Date) => boolean
  getBusinessHours,  // (date: Date) => BusinessHourSlot[] | null
  isWithinFiscalYear // (date: Date) => boolean
} = useCalendarSettings()
```

### Visualizzazione nel Calendario

**Overlay Non Configurato:**
```typescript
{!isConfigured() && (
  <div className="absolute inset-0 bg-gray-100 bg-opacity-90 z-10">
    <div className="text-center">
      <Settings className="h-8 w-8" />
      <h3>Calendario Non Configurato</h3>
      <button onClick={() => setShowConfigModal(true)}>
        Configura Calendario
      </button>
    </div>
  </div>
)}
```

**Orari nell'Header Colonna:**
- Font-size: 13px (ingrandito per leggibilità)
- Font-weight: 700 (bold)
- Badge blu sopra il nome giorno
- Esempio: "09:00-12:30 · 16:00-20:00"

**Giorni Chiusura (closure_dates):**
- Sfondo: gradiente azzurro (linear-gradient #e0f2fe → #bae6fd)
- Icona: 🏖️ centrata (font-size: 48px, opacity: 0.6)
- Decorazioni: gradienti radiali giallo/blu

**Giorni Non Lavorativi (non in open_weekdays):**
- Sfondo: normale bianco (come altri giorni)
- NO icona spiaggia
- NO orari mostrati

**Filtro Eventi:**
- Eventi fuori `fiscal_year` nascosti
- `validRange` di FullCalendar impostato automaticamente

---

#### `tasks` (Attività Generiche/Mansioni)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT, -- 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'annual' | 'as_needed' | 'custom'
  assigned_to TEXT,
  assigned_to_role TEXT,
  assigned_to_category TEXT,
  assigned_to_staff_id UUID,
  assignment_type TEXT, -- 'role' | 'staff' | 'category'
  priority TEXT, -- 'low' | 'medium' | 'high' | 'critical'
  estimated_duration INTEGER, -- minuti
  next_due TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

#### `task_completions` (Completamenti Task)
```sql
CREATE TABLE task_completions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL, -- Inizio periodo di validità
  period_end TIMESTAMPTZ NOT NULL,   -- Fine periodo di validità
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

**Logica period_start/period_end:**
- **Daily**: Giorno corrente (00:00 - 23:59)
- **Weekly**: Settimana corrente (lunedì 00:00 - domenica 23:59)
- **Monthly**: Mese corrente (1° giorno 00:00 - ultimo giorno 23:59)
- **Annually**: Anno corrente (1 gen 00:00 - 31 dic 23:59)

#### `maintenance_tasks` (Manutenzioni)
```sql
-- Simile a tasks ma specifica per manutenzioni
-- Include: conservation_point_id, title, instructions[]
```

#### `products` (Prodotti con Scadenze)
```sql
-- Campi rilevanti:
-- expiry_date, status, department_id, conservation_point_id
```

---

## Tipi di Eventi

### CalendarEvent Interface
```typescript
interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  type: 'maintenance' | 'general_task' | 'temperature_reading' | 'custom'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: 'maintenance' | 'general_task' | 'training' | 'inventory' | 'meeting' | 'temperature_reading' | 'custom'
  sourceId: string // ID originale nel database sorgente
  assigned_to: string[]
  recurring: boolean
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  metadata: {
    task_id?: string
    maintenance_id?: string
    product_id?: string
    staff_id?: string
    conservation_point_id?: string
    assigned_to_role?: string
    assigned_to_category?: string
    assigned_to_staff_id?: string
    notes?: string
    [key: string]: any
  }
  extendedProps: {
    status: CalendarEvent['status']
    priority: CalendarEvent['priority']
    assignedTo: string[]
    metadata: any
    isCompletedInPeriod?: boolean
    period_start?: Date
    period_end?: Date
  }
}
```

---

## Sistema di Completamento Task

### Flusso Completamento

1. **Utente clicca "Completa" su una mansione/manutenzione**
   - Location: `MacroCategoryModal.tsx` o `EventDetailsModal.tsx`

2. **Chiamata a `completeTask` mutation**
   - File: `src/features/calendar/hooks/useGenericTasks.ts`
   - Funzione: `completeTaskMutation`

3. **Calcolo period_start e period_end**
   ```typescript
   // Per task settimanale
   const dayOfWeek = now.getDay() || 7 // 0=domenica -> 7
   const monday = new Date(now)
   monday.setDate(now.getDate() - (dayOfWeek - 1))
   period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
   const sunday = new Date(monday)
   sunday.setDate(monday.getDate() + 6)
   period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
   ```

4. **Insert in task_completions**
   ```typescript
   await supabase.from('task_completions').insert({
     company_id: companyId,
     task_id: taskId,
     completed_by: user.id,
     period_start: period_start.toISOString(),
     period_end: period_end.toISOString(),
     notes: notes
   })
   ```

5. **Invalidazione Query**
   - `['calendar-events', companyId]`
   - `['generic-tasks', companyId]`
   - `['task-completions', companyId]`
   - `['macro-category-events']`

6. **Ricaricamento Eventi**
   - `useAggregatedEvents` ricarica i completamenti
   - Ogni evento viene verificato contro i completamenti
   - Se `eventTime` cade in `[period_start, period_end]` → `status = 'completed'`

### Verifica Completamento

**File: `useAggregatedEvents.ts` - Funzione `convertGenericTaskToEvent`**

```typescript
const isCompletedInPeriod = completions?.some(c => {
  if (c.task_id !== task.id) return false

  const completionStart = c.period_start.getTime()
  const completionEnd = c.period_end.getTime()
  const eventTime = startDate.getTime()

  return eventTime >= completionStart && eventTime <= completionEnd
}) ?? false

const status = isCompletedInPeriod ? 'completed' :
               startDate < new Date() ? 'overdue' : 'pending'
```

---

## Logiche di Visualizzazione

### Eventi Ricorrenti - Espansione

**Task/Manutenzioni ricorrenti vengono espanse in multiple occorrenze:**

```typescript
// File: useAggregatedEvents.ts - expandRecurringTask
const startDate = startOfDay(new Date(task.created_at))
const endDate = endOfDay(addDays(new Date(), 90)) // 90 giorni nel futuro

let currentDate = startDate
while (currentDate <= endDate) {
  events.push(convertToEvent(task, currentDate))

  switch (frequency) {
    case 'daily': currentDate = addDays(currentDate, 1); break
    case 'weekly': currentDate = addWeeks(currentDate, 1); break
    case 'monthly': currentDate = addMonths(currentDate, 1); break
    case 'quarterly': currentDate = addMonths(currentDate, 3); break
    case 'biannually': currentDate = addMonths(currentDate, 6); break
    case 'annually': currentDate = addMonths(currentDate, 12); break
  }
}
```

**Ogni occorrenza ha un ID univoco:**
```typescript
const eventId = occurrenceDate
  ? `generic-task-${task.id}-${startDate.toISOString().split('T')[0]}`
  : `generic-task-${task.id}`
```

### Filtri Eventi

**File: `CalendarPage.tsx`**

```typescript
const displayEvents = filteredEvents.filter(event => {
  const typeMatch = activeFilters.eventTypes.includes(event.type)
  const priorityMatch = activeFilters.priorities.includes(event.priority)
  const statusMatch = activeFilters.statuses.includes(event.status)

  return typeMatch && priorityMatch && statusMatch
})
```

### Count Sources

**I count escludono eventi completati:**

```typescript
sources: {
  maintenance: maintenanceEvents.filter(e => e.status !== 'completed').length,
  genericTasks: genericTaskEvents.filter(e => e.status !== 'completed').length,
  haccpExpiry: haccpExpiryEvents.length,
  productExpiry: productExpiryEvents.length,
  haccpDeadlines: haccpDeadlineEvents.length,
  temperatureChecks: temperatureEvents.length,
  custom: 0
}
```

---

## Macro Categorie

### Tipi Macro Categorie
```typescript
type MacroCategory = 'maintenance' | 'generic_tasks' | 'product_expiry'
```

### Aggregazione Eventi

**File: `useMacroCategoryEvents.ts`**

```typescript
// 1. Carica task completions
const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])

// 2. Espandi task ricorrenti con logica completamento
const genericTaskItems = genericTasks.flatMap(task =>
  expandTaskWithCompletions(task, taskCompletions)
)

// 3. Aggrega per data e categoria
eventsByDateAndCategory.forEach((categoryMap, dateKey) => {
  categoryMap.forEach((items, category) => {
    const activeItems = items.filter(i => i.status !== 'completed')
    result.push({
      date: dateKey,
      category,
      count: activeItems.length, // ← Solo eventi NON completati
      items: items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    })
  })
})
```

### Rendering Macro Categorie

**File: `Calendar.tsx` - eventContent**

```typescript
if (useMacroCategories && extendedProps?.type === 'macro_category') {
  // Caso 1: Tutto completato (count = 0)
  if (extendedProps.count === 0) {
    return (
      <div className="fc-event-all-completed">
        <span className="fc-event-checkmark">✓</span>
      </div>
    )
  }

  // Caso 2: Eventi attivi (count > 0)
  return (
    <div className="fc-event-content-custom">
      <span className="fc-event-type-icon">
        {extendedProps.category === 'maintenance' && '🔧'}
        {extendedProps.category === 'generic_tasks' && '📋'}
        {extendedProps.category === 'product_expiry' && '📦'}
      </span>
      <span className="fc-event-title">{event.title}</span>
      <span className="fc-event-count-badge">({extendedProps.count})</span>
    </div>
  )
}
```

### MacroCategoryModal

**Sezioni:**
1. **Attività Attive** - `activeItems = items.filter(i => i.status !== 'completed')`
2. **Attività Completate** - `completedItems = items.filter(i => i.status === 'completed')`

**Pulsante Completa:**
- Visibile solo per `category === 'generic_tasks'` o `category === 'maintenance'`
- Usa `metadata.taskId` per ottenere l'ID originale del task
- Dopo completamento: reload pagina per aggiornare UI

---

## Attività in Ritardo

### Calcolo Eventi in Ritardo

**File: `CalendarPage.tsx`**

```typescript
const overdueEvents = useMemo(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)

  return displayEvents.filter(event => {
    // Escludi eventi completati
    if (event.status === 'completed') return false

    const eventDate = new Date(event.start)
    eventDate.setHours(0, 0, 0, 0)
    // Eventi dell'ultima settimana (7 giorni) prima di oggi
    return eventDate >= oneWeekAgo && eventDate < now
  })
}, [displayEvents])
```

### Visibilità Sezione "Attività in Ritardo"

```typescript
const shouldShowOverdueSection = useMemo(() => {
  // Nessun evento in ritardo → nascondi
  if (overdueEvents.length === 0) return false

  // Nessuna data selezionata → mostra (default)
  if (!selectedCalendarDate) return true

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const selectedDate = new Date(selectedCalendarDate)
  selectedDate.setHours(0, 0, 0, 0)

  // Data futura selezionata → nascondi
  // Data passata/oggi selezionata → mostra
  return selectedDate <= now
}, [overdueEvents.length, selectedCalendarDate])
```

**Regole:**
- ✅ Eventi mostrati SOLO se nell'ultima settimana (7 giorni prima di oggi)
- ✅ Eventi completati esclusi dal count
- ✅ Sezione nascosta se utente seleziona data futura nel calendario
- ✅ Count "In Ritardo" nascosto in tutte le sezioni quando `shouldShowOverdueSection = false`
- ✅ MacroCategoryModal nasconde count "In Ritardo" per date future

**Locations count "In Ritardo":**
1. Overview Stats box (riga ~264): Condizionale con `shouldShowOverdueSection`
2. Sezione "Urgenti" (riga ~352): Condizionale con `shouldShowOverdueSection`
3. Sezione "Attività in Ritardo" (riga ~372): Condizionale con `shouldShowOverdueSection`
4. MacroCategoryModal (header): Calcola `isFutureDate` e nascondi se vero

---

## File e Componenti Principali

### Struttura Directory
```
src/features/calendar/
├── CalendarPage.tsx              # Pagina principale
├── Calendar.tsx                  # Componente FullCalendar
├── EventDetailsModal.tsx         # Modal dettagli evento singolo
├── components/
│   ├── MacroCategoryModal.tsx    # Modal macro categoria
│   ├── FilterPanel.tsx           # Filtri calendario
│   ├── QuickActions.tsx          # Azioni rapide evento
│   ├── GenericTaskForm.tsx       # Form creazione task
│   ├── ViewSelector.tsx          # Selettore vista calendario
│   └── HorizontalCalendarFilters.tsx
├── hooks/
│   ├── useAggregatedEvents.ts    # Aggrega eventi da tutte le fonti
│   ├── useGenericTasks.ts        # CRUD tasks + completamenti
│   ├── useMacroCategoryEvents.ts # Eventi aggregati per macro categoria
│   ├── useFilteredEvents.ts      # Filtri eventi
│   ├── useCalendarAlerts.ts      # Sistema alert
│   └── useCalendarView.ts        # Gestione vista
└── utils/
    ├── eventTransform.ts         # Trasformazione eventi → FullCalendar
    ├── haccpDeadlineGenerator.ts # Genera scadenze HACCP
    └── temperatureCheckGenerator.ts
```

### File Chiave

#### `CalendarPage.tsx`
**Responsabilità:**
- Orchestrazione generale calendario
- Gestione filtri e viste
- Pannello laterale statistiche
- Sezione "Attività in Ritardo"
- Form creazione task generici

**Stati importanti:**
```typescript
const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
const [activeFilters, setActiveFilters] = useState({...})
```

**Three Overview Cards (Bottom Grid):**
```typescript
// 1. Eventi in Ritardo (ultima settimana, non completati)
const overdueEvents = displayEvents.filter(event => {
  if (event.status === 'completed') return false
  const eventDate = new Date(event.start)
  return eventDate >= oneWeekAgo && eventDate < now
})

// 2. Eventi di Oggi (oggi, non completati)
const todayEvents = displayEvents.filter(event => {
  const eventDate = new Date(event.start)
  return eventDate >= today && eventDate < tomorrow && event.status !== 'completed'
})

// 3. Eventi di Domani (domani, tutti)
const tomorrowEvents = displayEvents.filter(event => {
  const eventDate = new Date(event.start)
  return eventDate >= tomorrow && eventDate < dayAfterTomorrow
})
```

#### `useAggregatedEvents.ts`
**Responsabilità:**
- Carica eventi da TUTTE le fonti
- Carica task completions da `task_completions`
- Espande task/manutenzioni ricorrenti
- Applica logica completamento per ogni occorrenza
- Calcola count per fonte (escludendo completati)

**Funzioni chiave:**
```typescript
expandRecurringTask(task, companyId, userId, type, completions?)
convertGenericTaskToEvent(task, companyId, userId, occurrenceDate?, completions?)
convertMaintenanceTaskToEvent(task, companyId, userId, occurrenceDate?)
```

#### `useMacroCategoryEvents.ts`
**Responsabilità:**
- Carica eventi solo per macro categorie
- Carica task completions
- Espande task ricorrenti con completamenti
- Aggrega per data e categoria
- **Count basato su activeItems** (status !== 'completed')

**Funzioni chiave:**
```typescript
expandTaskWithCompletions(task, completions)
convertGenericTaskToItem(task, dueDate, completions)
```

#### `useGenericTasks.ts`
**Responsabilità:**
- CRUD operations su tabella `tasks`
- Completamento task → insert in `task_completions`
- Calcolo period_start/period_end basato su frequenza
- Fetch completamenti per task specifico

**Mutations:**
```typescript
createTaskMutation
deleteTaskMutation
completeTaskMutation ← Gestisce completamento
```

#### `MacroCategoryModal.tsx`
**Responsabilità:**
- Mostra lista eventi per categoria e data
- Separa activeItems e completedItems
- Pulsante "Completa" per mansioni/manutenzioni
- Due sezioni: Attive e Completate
- Nasconde count "In Ritardo" per date future

**Logica completamento:**
```typescript
const taskId = item.metadata.taskId || item.id // ID originale task
completeTask({ taskId }, {
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
    await queryClient.invalidateQueries({ queryKey: ['task-completions'] })
    await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })
    window.location.reload() // Force reload per aggiornare UI
  }
})
```

**Logica visibilità "In Ritardo":**
```typescript
const now = new Date()
now.setHours(0, 0, 0, 0)
const selectedDate = new Date(date)
selectedDate.setHours(0, 0, 0, 0)
const isFutureDate = selectedDate > now

const overdueItems = items.filter(i => i.status === 'overdue')
const shouldShowOverdue = overdueItems.length > 0 && !isFutureDate
```

---

## Hook e Utilities

### React Query Keys

```typescript
// useGenericTasks
['generic-tasks', companyId]
['task-completions', companyId]

// useAggregatedEvents
['calendar-events', companyId]

// useMacroCategoryEvents
['macro-category-events']

// useMaintenanceTasks
['maintenance-tasks', companyId]
```

### Invalidazione Query dopo Completamento

**Ordine esecuzione:**
1. Insert in `task_completions`
2. Invalidate queries (triggers refetch automatico React Query)
3. `useAggregatedEvents` ricarica completions
4. Eventi ri-processati con nuovi status
5. UI aggiornata

**NOTA:** Attualmente si fa `window.location.reload()` per garantire aggiornamento completo.

---

## Troubleshooting

### Problema: Task completata non scompare subito

**Possibili cause:**
1. Query non invalidate correttamente
2. Cache React Query non aggiornata
3. Completamento salvato ma evento non ri-processato

**Debug:**
```typescript
// 1. Verifica completamento salvato
const { data } = await supabase
  .from('task_completions')
  .select('*')
  .eq('task_id', taskId)

// 2. Verifica query invalidate
console.log('Invalidating queries...')
await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })

// 3. Verifica evento status
const event = events.find(e => e.metadata.task_id === taskId)
console.log('Event status:', event.status)
console.log('isCompletedInPeriod:', event.extendedProps.isCompletedInPeriod)
```

### Problema: Count macro categoria non aggiornato

**Possibili cause:**
1. `useMacroCategoryEvents` non ricarica completions
2. Filtro `status !== 'completed'` non applicato

**Debug:**
```typescript
// File: useMacroCategoryEvents.ts
console.log('Task completions loaded:', taskCompletions.length)

// Nella funzione aggregazione:
const activeItems = items.filter(i => i.status !== 'completed')
console.log('Active items:', activeItems.length, 'Total items:', items.length)
```

### Problema: Eventi in ritardo mostrati anche per date future

**Verifica:**
```typescript
// CalendarPage.tsx
console.log('Selected date:', selectedCalendarDate)
console.log('Should show overdue:', shouldShowOverdueSection)
console.log('Overdue events count:', overdueEvents.length)
```

**Check locations:**
- Overview Stats (riga ~264)
- Sezione Urgenti (riga ~352)
- Sezione Attività in Ritardo (riga ~372)

### Problema: Task ricorrente non espanso correttamente

**Debug espansione:**
```typescript
// useAggregatedEvents.ts - expandRecurringTask
console.log('Expanding task:', task.name, 'Frequency:', task.frequency)
console.log('Start date:', startDate, 'End date:', endDate)
console.log('Generated events:', events.length)
```

### Problema: Period_start/period_end errati

**Verifica calcolo:**
```typescript
// useGenericTasks.ts - completeTaskMutation
console.log('Task frequency:', task.frequency)
console.log('Period start:', period_start)
console.log('Period end:', period_end)
console.log('Current date:', now)
```

---

## Database Compliance Checklist

### Pre-Deployment
- [ ] Migrazione `008_task_completions.sql` eseguita
- [ ] Tabella `tasks` ha colonne: `frequency`, `assigned_to_*`, `priority`, `estimated_duration`, `next_due`
- [ ] RLS policies configurate per `task_completions`
- [ ] Foreign keys: `task_completions.task_id` → `tasks.id` ON DELETE CASCADE

### Query Patterns
```sql
-- Carica task con completions
SELECT t.*,
  json_agg(tc.*) as completions
FROM tasks t
LEFT JOIN task_completions tc ON tc.task_id = t.id
WHERE t.company_id = $1
GROUP BY t.id

-- Verifica completamento per periodo
SELECT * FROM task_completions
WHERE task_id = $1
  AND period_start <= $2
  AND period_end >= $2
```

---

## Features Implementate

### ✅ Core Features
- [x] Calendario unificato multi-fonte
- [x] Eventi ricorrenti (daily, weekly, monthly, annually)
- [x] Macro categorie con aggregazione eventi
- [x] Sistema completamento task con period tracking
- [x] Filtri avanzati (tipo, priorità, status)
- [x] Modal dettagli evento
- [x] Modal macro categoria con sezioni Attive/Completate
- [x] Checkmark verde per giorni completati
- [x] Count esclusione eventi completati

### ✅ Configurazione Calendario
- [x] Tabella `company_calendar_settings` con RLS multi-tenant
- [x] Step 7 onboarding per configurazione iniziale
- [x] Anno lavorativo (fiscal_year_start/end) con validazione
- [x] Giorni apertura settimanali (open_weekdays) con toggle UI
- [x] Giorni chiusura programmata (closure_dates):
  - [x] Modalità Giorno Singolo
  - [x] Modalità Periodo (genera automaticamente date nel range)
  - [x] Badge removibili per ogni data
- [x] Orari apertura (business_hours JSONB):
  - [x] 1-2 fasce orarie per giorno
  - [x] Input type="time" con validazione
  - [x] Display nell'header colonna calendario
- [x] Modal post-onboarding per modifica configurazione
- [x] Overlay "Configura Calendario" se non configurato
- [x] Hook `useCalendarSettings` con helper functions
- [x] Utility functions (calendarUtils.ts) per validazione
- [x] Visualizzazione orari: font 13px bold nell'header
- [x] Giorni chiusura: sfondo azzurro + 🏖️ emoji
- [x] Giorni non lavorativi: sfondo normale (no emoji)
- [x] Audit logging automatico per modifiche configurazione
- [x] Validazione completa (fiscal year, weekdays, hours, closures)
- [x] Integrazione con onboardingHelpers per salvataggio
- [x] Documentazione completa in SCHEMA_ATTUALE.md

### ✅ Attività in Ritardo
- [x] Calcolo eventi in ritardo ultima settimana (7 giorni)
- [x] Sezione dedicata "Attività in Ritardo"
- [x] Nascondere sezione/count per date future selezionate
- [x] Esclusione eventi completati dal count
- [x] Nascondere count in MacroCategoryModal per date future

### ✅ Overview Cards
- [x] Card "Eventi in Ritardo" (ultima settimana, non completati)
- [x] Card "Eventi di Oggi" (oggi, non completati)
- [x] Card "Eventi di Domani" (domani, tutti)
- [x] Dati reali da database
- [x] Layout griglia orizzontale (3 card)

### ✅ Completamento Task
- [x] Pulsante "Completa" in MacroCategoryModal
- [x] Pulsante "Completa" in EventDetailsModal
- [x] Period-based tracking (daily/weekly/monthly/annually)
- [x] Invalidazione automatica query
- [x] Status "completed" basato su completions
- [x] Separazione UI Attive vs Completate

### ✅ Data di Inizio Task Generici
- [x] Campo "Assegna Data di Inizio" nel form creazione task
- [x] Validazione: data non può essere retroattiva (solo oggi o futuro)
- [x] Logica default: se campo vuoto, task inizia da oggi
- [x] Logica custom: se compilato, task inizia dalla data specificata
- [x] Input type="date" con attributo `min` per bloccare date passate
- [x] Validazione JavaScript per doppio controllo
- [x] Messaggio errore: "La data di inizio non può essere nel passato"
- [x] Integrazione con `calculateNextDue` per usare `start_date`
- [x] Correzione `useMacroCategoryEvents` per usare `next_due` invece di `created_at`

### ✅ Intervallo Date e Anno Lavorativo
- [x] Campo "Assegna Data di Fine" per specificare intervallo date
- [x] Validazione: data fine > data inizio
- [x] Input `min` dinamico basato su data inizio
- [x] end_date serializzato in description con formato `[END_DATE:YYYY-MM-DD]`
- [x] Helper function `extractEndDate()` per deserializzare
- [x] Espansione eventi fino a `fiscal_year_end` invece di +90 giorni fissi
- [x] Logica priorità: taskEndDate vs fiscalYearEnd (usa il minimo)
- [x] Fallback a +90 giorni se calendario non configurato
- [x] `useAggregatedEvents` accetta parametro `fiscalYearEnd`
- [x] `useMacroCategoryEvents` accetta parametro `fiscalYearEnd`
- [x] `expandRecurringTask` gestisce tutte le combinazioni date
- [x] Testo helper: "anno lavorativo" invece di "anno fiscale"
- [x] Uniformità colori domeniche nel calendario (fix CSS)

### 🔄 In Progress / Future
- [ ] Click su task in "Attività in Ritardo" → apre modal
- [ ] Notifiche push per task in scadenza
- [ ] Esportazione calendario (iCal, Google Calendar)
- [ ] Template task ricorrenti predefiniti
- [ ] Report completamento task (analytics)

---

## Gestione Date Task: Inizio, Fine e Anno Lavorativo

### Feature 1: Campo "Assegna Data di Inizio"

**Implementata:** 2025-01-12

#### Descrizione
Permette all'utente di specificare una data di inizio personalizzata per le nuove attività generiche. Se non specificata, l'attività inizia dalla data odierna (default).

#### Componenti Modificati

##### 1. GenericTaskForm.tsx
```typescript
interface GenericTaskFormData {
  // ... altri campi
  dataInizio?: string // Data di inizio in formato ISO (YYYY-MM-DD)
}

// Campo form
<Input
  type="date"
  value={formData.dataInizio ?? ''}
  onChange={e => updateField({ dataInizio: e.target.value })}
  min={new Date().toISOString().split('T')[0]} // Blocca date passate
  aria-invalid={Boolean(errors.dataInizio)}
/>

// Validazione
if (formData.dataInizio) {
  const selectedDate = new Date(formData.dataInizio)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  selectedDate.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    newErrors.dataInizio = 'La data di inizio non può essere nel passato'
  }
}
```

##### 2. CalendarPage.tsx
```typescript
const handleCreateGenericTask = (taskData: any) => {
  createTask({
    // ... altri campi
    start_date: taskData.dataInizio, // Passa data di inizio opzionale
  })
}
```

##### 3. useGenericTasks.ts
```typescript
export interface CreateGenericTaskInput {
  // ... altri campi
  start_date?: string // Data di inizio in formato ISO (YYYY-MM-DD)
}

// Funzione calculateNextDue aggiornata
const calculateNextDue = (frequency: string, customDays?: string[], startDate?: string): Date => {
  // Se viene fornita una data di inizio, usala come base, altrimenti usa oggi
  const baseDate = startDate ? new Date(startDate) : new Date()
  
  switch (frequency) {
    case 'giornaliera':
      // Se c'è una start_date usa quella, altrimenti domani
      if (startDate) return baseDate
      baseDate.setDate(baseDate.getDate() + 1)
      break
    // ... altri casi
  }
  
  return baseDate
}

// Mutation
const next_due = calculateNextDue(input.frequency, input.custom_days, input.start_date)
```

##### 4. useMacroCategoryEvents.ts
```typescript
function expandTaskWithCompletions(
  task: GenericTask,
  completions: TaskCompletion[]
): MacroCategoryItem[] {
  // ... 
  
  // FIX: Usa next_due se disponibile (data di inizio impostata dall'utente), 
  // altrimenti usa created_at
  const startDate = task.next_due ? new Date(task.next_due) : new Date(task.created_at)
  const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  
  // ... espansione eventi
}
```

#### Comportamento

**Scenario 1: Campo vuoto (default)**
- Utente non compila "Assegna Data di Inizio"
- Sistema usa data odierna come punto di partenza
- `next_due` viene calcolato da oggi

**Scenario 2: Data futura specificata**
- Utente seleziona data futura (es. 18 ottobre)
- Sistema usa quella data come `next_due`
- Eventi ricorrenti iniziano da quella data

**Scenario 3: Tentativo data passata**
- Utente cerca di selezionare data passata
- HTML input con `min` blocca la selezione
- Se bypassato, validazione JS mostra errore
- Form non può essere inviato

#### Validazioni

**Validazione HTML:**
```html
<input type="date" min="2025-01-12" />
```

**Validazione JavaScript:**
```typescript
// Confronta date normalizzate (senza ore)
const selectedDate = new Date(formData.dataInizio)
const today = new Date()
today.setHours(0, 0, 0, 0)
selectedDate.setHours(0, 0, 0, 0)

if (selectedDate < today) {
  throw new Error('La data di inizio non può essere nel passato')
}
```

#### UI/UX

**Posizionamento:**
- Dopo campo "Frequenza"
- Prima campo "Ruolo"
- Occupa 1 colonna nel grid a 2 colonne

**Label:**
```
Assegna Data di Inizio
```

**Testo Helper:**
```
Opzionale - Se non specificata, l'attività inizia da oggi
```

**Messaggio Errore:**
```
La data di inizio non può essere nel passato
```

---

### Feature 2: Intervallo Date e Espansione Anno Lavorativo

**Implementata:** 2025-01-12

#### Descrizione
Permette di specificare un intervallo di date per task/manutenzioni e di espandere automaticamente gli eventi ricorrenti fino alla fine dell'anno lavorativo configurato.

#### 1. Campo "Assegna Data di Fine"

**Posizionamento:**
- Dopo "Assegna Data di Inizio"
- Prima "Ruolo"
- Grid a 2 colonne

**Input:**
```typescript
<Input
  type="date"
  value={formData.dataFine ?? ''}
  onChange={e => updateField({ dataFine: e.target.value })}
  min={formData.dataInizio || new Date().toISOString().split('T')[0]}
  placeholder="Lascia vuoto per fine anno lavorativo"
  aria-invalid={Boolean(errors.dataFine)}
/>
```

**Testo Helper:**
```
Opzionale - Se non specificata, l'attività prosegue fino a fine anno lavorativo
```

**Validazione:**
```typescript
if (formData.dataFine) {
  const endDate = new Date(formData.dataFine)
  const startDate = formData.dataInizio ? new Date(formData.dataInizio) : new Date()
  
  if (endDate <= startDate) {
    newErrors.dataFine = 'La data di fine deve essere successiva alla data di inizio'
  }
}
```

#### 2. Serializzazione end_date

**Storage:**
```typescript
// In useGenericTasks.ts - createTaskMutation
if (input.end_date) {
  payload.description = payload.description 
    ? `${payload.description}\n[END_DATE:${input.end_date}]`
    : `[END_DATE:${input.end_date}]`
}
```

**Deserializzazione:**
```typescript
// Helper function
function extractEndDate(description?: string): Date | null {
  if (!description) return null
  const match = description.match(/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/)
  return match ? new Date(match[1]) : null
}
```

#### 3. Logica Espansione Eventi

**Priorità Decisionale:**

```typescript
function expandRecurringTask(
  task,
  companyId,
  userId,
  type,
  completions?,
  fiscalYearEnd?
) {
  // 1. Data inizio: usa next_due (se presente) o created_at
  const startDate = task.next_due 
    ? new Date(task.next_due) 
    : new Date(task.created_at)
  
  // 2. Estrai end_date dalla description (se presente)
  const taskEndDate = extractEndDate(task.description)
  
  // 3. Determina data finale
  let endDate: Date
  if (fiscalYearEnd) {
    if (taskEndDate) {
      // Usa il minimo tra end_date e fiscal_year_end
      endDate = taskEndDate < fiscalYearEnd ? taskEndDate : fiscalYearEnd
    } else {
      // Usa fiscal_year_end
      endDate = fiscalYearEnd
    }
  } else if (taskEndDate) {
    // Usa end_date se non c'è fiscal_year_end
    endDate = taskEndDate
  } else {
    // Fallback: +90 giorni
    endDate = addDays(new Date(), 90)
  }
  
  // 4. Genera eventi ricorrenti da startDate a endDate
  // ...
}
```

#### 4. Integrazione con Calendario

**CalendarPage.tsx:**
```typescript
const { settings: calendarSettings } = useCalendarSettings()
const { events: aggregatedEvents } = useAggregatedEvents(
  calendarSettings?.fiscal_year_end 
    ? new Date(calendarSettings.fiscal_year_end) 
    : undefined
)
```

**Calendar.tsx:**
```typescript
const { events: macroCategoryEvents } = useMacroCategoryEvents(
  calendarSettings?.fiscal_year_end 
    ? new Date(calendarSettings.fiscal_year_end) 
    : undefined
)
```

#### Scenari di Utilizzo

**Scenario A: Solo Data Inizio**
```
Input:
- Data Inizio: 15/03/2025
- Data Fine: (vuota)
- Anno Lavorativo: 01/01/2025 - 31/12/2025

Risultato:
→ Eventi dal 15/03/2025 al 31/12/2025
```

**Scenario B: Intervallo Completo**
```
Input:
- Data Inizio: 01/05/2025
- Data Fine: 31/08/2025
- Anno Lavorativo: 01/01/2025 - 31/12/2025

Risultato:
→ Eventi dal 01/05/2025 al 31/08/2025 (rispetta intervallo utente)
```

**Scenario C: Data Fine oltre Anno Lavorativo**
```
Input:
- Data Inizio: 01/11/2025
- Data Fine: 31/03/2026
- Anno Lavorativo: 01/01/2025 - 31/12/2025

Risultato:
→ Eventi dal 01/11/2025 al 31/12/2025 (limitato da anno lavorativo)
```

**Scenario D: Calendario Non Configurato**
```
Input:
- Data Inizio: 12/01/2025
- Data Fine: (vuota)
- Anno Lavorativo: (non configurato)

Risultato:
→ Eventi dal 12/01/2025 per 90 giorni (fallback)
```

#### File Modificati

1. **GenericTaskForm.tsx**: Campo dataFine con validazione
2. **CalendarPage.tsx**: Passa end_date e fiscal_year_end
3. **useGenericTasks.ts**: CreateGenericTaskInput con end_date, serializzazione
4. **useMacroCategoryEvents.ts**: extractEndDate helper, espansione con fiscalYearEnd
5. **useAggregatedEvents.ts**: expandRecurringTask con fiscalYearEnd, usa next_due come start
6. **Calendar.tsx**: Passa fiscal_year_end a useMacroCategoryEvents
7. **calendar-custom.css**: Uniformità colori domeniche

#### Performance Note

- Espansione limitata da `fiscal_year_end` o `end_date` (non più fisso +90 giorni)
- Migliore performance: meno eventi generati se anno lavorativo è breve
- Cache React Query: eventi invalidati correttamente dopo creazione

---

## Versioning

**Versione Documento:** 1.2
**Data Creazione:** 2025-01-12
**Ultimo Aggiornamento:** 2025-01-12
**Autore:** Claude (Anthropic)

---

## Note Aggiuntive

### Performance Considerations
- Espansione eventi limitata da `fiscal_year_end` o `end_date` (dinamico)
- Fallback a +90 giorni se calendario non configurato
- Task completions caricati una volta all'init
- React Query cache: 5 minuti default
- Reload pagina dopo completamento (temporaneo - da ottimizzare)

### Browser Compatibility
- Testato su Chrome, Firefox, Safari
- FullCalendar compatibilità: IE11+ (con polyfills)
- Date APIs: tutte moderne (no IE support needed)

### Accessibility
- Keyboard navigation: supportata da FullCalendar
- Screen readers: aria-labels su pulsanti critici
- Color contrast: rispetta WCAG AA
