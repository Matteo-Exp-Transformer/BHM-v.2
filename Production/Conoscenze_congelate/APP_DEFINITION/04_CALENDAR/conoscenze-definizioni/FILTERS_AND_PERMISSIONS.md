# FILTERS AND PERMISSIONS - DOCUMENTAZIONE

**Data Creazione**: 2026-01-30
**Versione**: 1.0.0
**Hook Filtri Permessi**: `src/features/calendar/hooks/useFilteredEvents.ts`
**Componente Filtri UI**: `src/features/calendar/components/NewCalendarFilters.tsx`

---

## 🎯 SCOPO

Il sistema Calendar implementa un **filtraggio a 2 layer**:

1. **Layer 1 - Permessi** (`useFilteredEvents`): Filtra gli eventi in base al ruolo e alle assegnazioni dell'utente. Questo è un filtro **di sicurezza**.

2. **Layer 2 - Visuale** (`NewCalendarFilters`): Filtra gli eventi in base alle preferenze visuali dell'utente (reparto, stato, tipo). Questo è un filtro **di preferenza**.

---

## 🔒 LAYER 1: FILTRI PERMESSI (useFilteredEvents)

### Scopo
Garantire che ogni utente veda solo gli eventi per cui ha autorizzazione.

### Regole

| Ruolo | Cosa Vede |
|-------|-----------|
| **admin** | TUTTI gli eventi |
| **responsabile** | TUTTI gli eventi |
| **dipendente** | Solo eventi assegnati a lui |
| **collaboratore** | Solo eventi assegnati a lui |

### Logica per Dipendenti

Un dipendente vede un evento se **almeno una** di queste condizioni è vera:

```typescript
function checkEventAssignment(
  event: CalendarEvent,
  staffMember: StaffMember
): boolean {
  const assignment = event.metadata

  // ✅ Categoria 'all' → tutti vedono
  if (assignment.assigned_to_category === 'all') return true

  // ✅ Reparto specifico (formato: "department:uuid")
  if (assignment.assigned_to_category?.startsWith('department:')) {
    const deptId = assignment.assigned_to_category.replace('department:', '')
    if (staffMember.department_assignments?.includes(deptId)) return true
  }

  // ✅ Dipendente specifico
  if (assignment.assigned_to_staff_id === staffMember.id) return true

  // ✅ Ruolo corrispondente
  if (assignment.assigned_to_role === staffMember.role) return true

  // ✅ Categoria corrispondente
  if (assignment.assigned_to_category === staffMember.category) return true

  return false
}
```

### Utilizzo

```typescript
const { filteredEvents, canViewAllEvents } = useFilteredEvents(aggregatedEvents)

// canViewAllEvents = true per admin/responsabile
// canViewAllEvents = false per dipendente/collaboratore
```

### Flusso

```
aggregatedEvents (tutti gli eventi azienda)
        │
        ▼
┌───────────────────────────────────┐
│      useFilteredEvents()          │
│                                   │
│ if (role === 'admin' ||           │
│     role === 'responsabile') {    │
│   return aggregatedEvents         │  ← Nessun filtro
│ }                                 │
│                                   │
│ return aggregatedEvents.filter(   │
│   event => checkEventAssignment(  │
│     event, currentStaffMember     │
│   )                               │
│ )                                 │
└───────────────┬───────────────────┘
                │
                ▼
        filteredEvents
```

### Bypass per Eventi Vuoti

Se `filteredEvents` è vuoto ma `aggregatedEvents` ha eventi, potrebbe essere un problema di configurazione. Il sistema usa un bypass:

```typescript
// In CalendarPage
const eventsForFiltering =
  filteredEvents.length > 0 ? filteredEvents : aggregatedEvents
```

---

## 🎨 LAYER 2: FILTRI VISUALI (NewCalendarFilters)

### Scopo
Permettere all'utente di filtrare la vista per preferenza, senza rimuovere permessi.

### Filtri Disponibili

#### 1. Filtro Reparto (Multi-select)

```typescript
interface DepartmentFilter {
  departments: string[]  // Array di UUID reparti
}

// Logica: OR tra reparti selezionati
// Se departments = ['uuid1', 'uuid2']
// → Mostra eventi dove department_id === 'uuid1' OR department_id === 'uuid2'
```

**UI**: Dropdown multi-select con conteggio eventi per reparto.

#### 2. Filtro Stato (Chips)

```typescript
type EventStatus = 'to_complete' | 'completed' | 'overdue' | 'future'

interface StatusFilter {
  statuses: EventStatus[]
}

// Logica: OR tra stati selezionati
// Se statuses = ['to_complete', 'overdue']
// → Mostra eventi pending O overdue
```

**UI**: Chips cliccabili con badge colorato.

#### 3. Filtro Tipo (Chips)

```typescript
type EventType = 'generic_task' | 'maintenance' | 'product_expiry'

interface TypeFilter {
  types: EventType[]
}

// Logica: OR tra tipi selezionati
// Se types = ['maintenance', 'product_expiry']
// → Mostra manutenzioni O scadenze prodotti
```

**UI**: Chips cliccabili con icona categoria.

### Combinazione Filtri

I filtri si combinano con logica **AND** tra categorie diverse:

```typescript
function doesEventPassFilters(
  event: CalendarEvent,
  filters: CalendarFilters
): boolean {
  // Se tutti i filtri sono vuoti, passa tutto
  if (areAllFiltersEmpty(filters)) return true

  // REPARTO: AND (deve passare se filtro attivo)
  if (filters.departments.length > 0) {
    if (!event.department_id ||
        !filters.departments.includes(event.department_id)) {
      return false  // Non passa filtro reparto
    }
  }

  // STATO: AND (deve passare se filtro attivo)
  if (filters.statuses.length > 0) {
    const eventStatus = mapToFilterStatus(event.status)
    if (!filters.statuses.includes(eventStatus)) {
      return false  // Non passa filtro stato
    }
  }

  // TIPO: AND (deve passare se filtro attivo)
  if (filters.types.length > 0) {
    const eventType = mapToFilterType(event)
    if (!filters.types.includes(eventType)) {
      return false  // Non passa filtro tipo
    }
  }

  return true  // Passa tutti i filtri attivi
}
```

### Mapping Status

```typescript
function mapToFilterStatus(status: CalendarEventStatus): EventStatus {
  switch (status) {
    case 'completed':
      return 'completed'
    case 'overdue':
      return 'overdue'
    case 'pending':
      // Determina se è futuro o da completare
      return isPast(event.start) ? 'to_complete' : 'future'
    default:
      return 'to_complete'
  }
}
```

### Mapping Type

```typescript
function mapToFilterType(event: CalendarEvent): EventType {
  if (event.source === 'maintenance') return 'maintenance'
  if (event.source === 'general_task') return 'generic_task'
  if (event.metadata?.product_id) return 'product_expiry'
  return 'generic_task'
}
```

---

## 🔄 FLUSSO COMPLETO 2-LAYER

```
┌─────────────────────────────────────────────────────────┐
│              useAggregatedEvents()                       │
│                                                          │
│ Carica tutti gli eventi azienda da 6 fonti              │
│ → aggregatedEvents (es: 150 eventi)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│        LAYER 1: useFilteredEvents()                      │
│                                                          │
│ Admin/Responsabile → vede tutto (150 eventi)            │
│ Dipendente → filtra per assegnazione (es: 30 eventi)    │
│                                                          │
│ → filteredEvents                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BYPASS CHECK                                │
│                                                          │
│ eventsForFiltering = filteredEvents.length > 0          │
│   ? filteredEvents                                       │
│   : aggregatedEvents                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│        LAYER 2: calendarFilters                          │
│                                                          │
│ Utente seleziona:                                        │
│ - Reparto: "Cucina"                                      │
│ - Stato: "to_complete", "overdue"                        │
│ - Tipo: "maintenance"                                    │
│                                                          │
│ eventsForFiltering.filter(doesEventPassFilters)          │
│ → displayEvents (es: 8 eventi)                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              VIEW FILTER                                 │
│                                                          │
│ Filtra per view corrente (month/week/day/year)          │
│ → viewBasedEvents                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              useMacroCategoryEvents()                    │
│                                                          │
│ Aggrega per data + categoria                             │
│ → MacroCategoryEvents mostrati sul calendario           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 UI COMPONENTE: NewCalendarFilters

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Filtri                                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Reparto: [▼ Tutti (12)]                                 │
│          ☐ Cucina (5)                                   │
│          ☐ Sala (3)                                     │
│          ☐ Magazzino (4)                                │
│                                                          │
│ Stato:   [Da completare] [Completati] [In ritardo]      │
│               ✓             ○             ✓              │
│                                                          │
│ Tipo:    [🔧 Manutenzioni] [📋 Mansioni] [📦 Scadenze]  │
│               ✓               ○              ○           │
│                                                          │
│ [Reset Filtri]                                           │
└─────────────────────────────────────────────────────────┘
```

### Comportamento Chips

- **Click**: Toggle selezione
- **Selezionato**: Background colorato
- **Non selezionato**: Background grigio
- **Badge**: Mostra conteggio eventi per quel filtro

### Reset Filtri

```typescript
const handleResetFilters = () => {
  setCalendarFilters({
    departments: [],
    statuses: [],
    types: []
  })
}
```

---

## 📊 STRUTTURA DATI

### CalendarFilters

```typescript
interface CalendarFilters {
  departments: string[]      // Array UUID reparti
  statuses: EventStatus[]    // Array stati
  types: EventType[]         // Array tipi
}

type EventStatus = 'to_complete' | 'completed' | 'overdue' | 'future'
type EventType = 'generic_task' | 'maintenance' | 'product_expiry'

const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  departments: [],
  statuses: [],
  types: []
}
```

### StaffMember (per filtri permessi)

```typescript
interface StaffMember {
  id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category?: string
  department_assignments?: string[]
}
```

### EventAssignment (metadati assegnazione)

```typescript
interface EventAssignment {
  assigned_to_staff_id?: string
  assigned_to_role?: string
  assigned_to_category?: string
}
```

---

## ✅ ACCEPTANCE CRITERIA

### Layer 1 - Permessi
- [x] Admin vede tutti gli eventi
- [x] Responsabile vede tutti gli eventi
- [x] Dipendente vede solo eventi assegnati a lui
- [x] Assegnazione per staff_id funzionante
- [x] Assegnazione per role funzionante
- [x] Assegnazione per category funzionante
- [x] Assegnazione per department funzionante
- [x] Categoria 'all' mostra a tutti

### Layer 2 - Visuali
- [x] Filtro reparto multi-select funzionante
- [x] Filtro stato chips funzionante
- [x] Filtro tipo chips funzionante
- [x] Combinazione AND tra categorie diverse
- [x] Combinazione OR dentro stessa categoria
- [x] Reset filtri funzionante
- [x] Badge conteggio eventi per filtro
- [x] Filtri persistenti durante sessione

---

## 📚 RIFERIMENTI

### File Correlati
- **Hook Permessi**: `src/features/calendar/hooks/useFilteredEvents.ts`
- **Componente UI**: `src/features/calendar/components/NewCalendarFilters.tsx`
- **Page**: `src/features/calendar/CalendarPage.tsx`
- **Types**: `src/types/calendar.ts`

### Documentazione Correlata
- [00_MASTER_INDEX_CALENDAR.md](./00_MASTER_INDEX_CALENDAR.md)
- [CALENDAR_PAGE.md](./CALENDAR_PAGE.md)
- [EVENT_AGGREGATION.md](./EVENT_AGGREGATION.md)

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 1.0.0
