# Glossario Calendario - Business HACCP Manager

## Indice
1. [Panoramica Sistema](#panoramica-sistema)
2. [Architettura Database](#architettura-database)
3. [Tipi di Eventi](#tipi-di-eventi)
4. [Sistema di Completamento Task](#sistema-di-completamento-task)
5. [Logiche di Visualizzazione](#logiche-di-visualizzazione)
6. [Macro Categorie](#macro-categorie)
7. [Attività in Ritardo](#attività-in-ritardo)
8. [File e Componenti Principali](#file-e-componenti-principali)
9. [Hook e Utilities](#hook-e-utilities)
10. [Troubleshooting](#troubleshooting)

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

### ✅ Calendario Configurazione (Onboarding)
- [x] Step 7 - Configurazione calendario aziendale
- [x] Selezione anno fiscale (inizio/fine)
- [x] Gestione giorni apertura settimanale
- [x] Chiusure programmate (singole o periodi)
- [x] Orari lavorativi per giorno settimana
- [x] **Contatore giorni lavorativi** con calcolo automatico
- [x] Visualizzazione breakdown: totali, settimanali, programmati, lavorativi
- [x] Formula esplicativa e percentuale apertura annuale
- [x] Barra progressiva animata
- [x] Prevenzione doppi conteggi (chiusure in giorni già chiusi)

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

### 🔄 In Progress / Future
- [ ] Click su task in "Attività in Ritardo" → apre modal
- [ ] Notifiche push per task in scadenza
- [ ] Esportazione calendario (iCal, Google Calendar)
- [ ] Template task ricorrenti predefiniti
- [ ] Report completamento task (analytics)

---

## Contatore Giorni Lavorativi

### Panoramica
Il contatore giorni lavorativi è visualizzato nello **Step 7 - Calendario** dell'onboarding e calcola automaticamente i giorni effettivi di apertura dell'azienda nell'anno fiscale.

### Calcolo
```typescript
// Formula base
giorni_lavorativi = giorni_totali - chiusure_settimanali - chiusure_programmate

// Dove:
// - giorni_totali = fiscal_year_end - fiscal_year_start + 1
// - chiusure_settimanali = conteggio giorni NON in open_weekdays
// - chiusure_programmate = closure_dates che cadono in giorni aperti (no doppi conteggi)
```

### Logica Anti-Doppi Conteggi
```typescript
// Chiusure programmate contate SOLO se cadono in giorni normalmente aperti
let programmedClosureDays = 0
for (const closureDate of formData.closure_dates) {
  const date = new Date(closureDate)
  const dayOfWeek = date.getDay()
  
  // Conta solo se la chiusura cade in un giorno normalmente aperto
  if (!closedWeekdays.includes(dayOfWeek)) {
    programmedClosureDays++
  }
}
```

**Esempio:**
- Chiusura programmata: 25 Dicembre (Natale)
- Se cade di domenica (già chiuso) → NON contato
- Se cade di lunedì (normalmente aperto) → Contato

### UI Componenti

**4 Card Statistiche:**
1. **Giorni Totali** - Grigio, numero grande
2. **Chiusura Settimanale** - Rosso, con lista giorni (es. "Dom")
3. **Chiusura Programmata** - Arancione, con sottotitolo "(Ferie/Festività)"
4. **Giorni Lavorativi** - Verde gradient, evidenziato, con check ✅

**Formula Esplicativa:**
```
📊 Formula: 365 (totali) - 52 (settimanali) - 10 (programmati) = 303 giorni lavorativi
```

**Barra Progressiva:**
- Percentuale apertura annuale: `(lavorativi / totali) * 100`
- Barra verde gradient
- Animazione transition 500ms

### File Modificati
- `src/components/onboarding-steps/CalendarConfigStep.tsx` - Logica calcolo e UI
- `src/components/StepNavigator.tsx` - Aggiunto Step 7 con icon Calendar

### Database Integration
- Nessuna modifica schema richiesta
- Usa campi esistenti da `company_calendar_settings`:
  - `fiscal_year_start` (date)
  - `fiscal_year_end` (date)
  - `open_weekdays` (integer[])
  - `closure_dates` (date[])

---

## Versioning

**Versione Documento:** 1.1
**Data Creazione:** 2025-01-12
**Ultimo Aggiornamento:** 2025-10-12
**Autore:** Claude (Anthropic)

---

## Note Aggiuntive

### Performance Considerations
- Espansione eventi limitata a 90 giorni nel futuro
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
