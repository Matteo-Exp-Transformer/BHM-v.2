# 🔄 HANDOFF A CURSOR - Integrazione Sistema Calendario

## 📋 CONTESTO

Claude AI ha completato l'implementazione backend e componenti del sistema calendario (FASE 1, 3, 4, 5).
**Ora serve integrare i componenti nella UI esistente.**

## ✅ GIÀ FATTO (da Claude AI)

### Hooks Implementati
- ✅ `src/features/calendar/hooks/useAggregatedEvents.ts` - Aggrega 6 fonti eventi
- ✅ `src/features/calendar/hooks/useFilteredEvents.ts` - Filtraggio user-based
- ✅ `src/features/calendar/hooks/useCalendarAlerts.ts` - Sistema alert

### Generatori Automatici
- ✅ `src/features/calendar/utils/haccpDeadlineGenerator.ts` - Scadenze HACCP
- ✅ `src/features/calendar/utils/temperatureCheckGenerator.ts` - Controlli temperatura
- ✅ `src/features/calendar/utils/recurrenceScheduler.ts` - Ricorrenze

### Componenti UI
- ✅ `src/features/calendar/components/EventBadge.tsx` - Badge assegnazione
- ✅ `src/features/calendar/components/CalendarFilters.tsx` - Filtri eventi
- ✅ `src/features/calendar/components/CalendarLegend.tsx` - Legenda
- ✅ `src/features/calendar/components/ViewSelector.tsx` - Switcher viste
- ✅ `src/features/calendar/components/index.ts` - Export clean

## 🎯 TUO COMPITO

Integrare i componenti implementati in CalendarPage.tsx e aggiungere alert badge in Header/Navbar.

### TASK 1: Integrare in CalendarPage.tsx

**File da modificare**: `src/pages/CalendarPage.tsx`

**Cosa fare**:

1. **Importa i componenti**:
```typescript
import {
  ViewSelector,
  CalendarFilters,
  CalendarLegend,
  useCalendarView
} from '@/features/calendar/components'
import { useCalendarAlerts } from '@/features/calendar/hooks/useCalendarAlerts'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'
import { useFilteredEvents } from '@/features/calendar/hooks/useFilteredEvents'
```

2. **Sostituisci useCalendar esistente con i nuovi hooks**:
```typescript
// Dentro CalendarPage component:

// RIMUOVI (se presente):
// const { events, isLoading } = useCalendar()

// AGGIUNGI:
const { events: aggregatedEvents, isLoading, sources } = useAggregatedEvents()
const { filteredEvents, canViewAllEvents } = useFilteredEvents(aggregatedEvents)
const { alerts, alertCount, criticalCount } = useCalendarAlerts(filteredEvents)
const [view, setView] = useCalendarView('month')

// State per filtri
const [activeFilters, setActiveFilters] = useState<CalendarFilterOptions>({
  eventTypes: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
  priorities: ['critical', 'high', 'medium', 'low'],
  statuses: ['pending', 'overdue']
})

// Applica filtri
const displayEvents = useMemo(() => {
  return filteredEvents.filter(event =>
    activeFilters.eventTypes.includes(event.type) &&
    activeFilters.priorities.includes(event.priority) &&
    activeFilters.statuses.includes(event.status)
  )
}, [filteredEvents, activeFilters])
```

3. **Aggiungi componenti UI al layout**:
```tsx
return (
  <div className="calendar-page">
    {/* Header con ViewSelector e Alert Count */}
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">Calendario Attività</h1>

      <div className="flex items-center gap-4">
        {alertCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm font-medium text-red-700">
              {criticalCount > 0 ? '🔴' : '⚠️'} {alertCount} Alert
            </span>
          </div>
        )}

        <ViewSelector currentView={view} onChange={setView} />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Sidebar con Filtri e Legenda */}
      <div className="lg:col-span-1 space-y-4">
        <CalendarFilters
          onFilterChange={setActiveFilters}
          initialFilters={activeFilters}
        />
        <CalendarLegend defaultExpanded={false} />

        {/* Stats Sources (opzionale) */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Fonti Eventi</h3>
          <div className="space-y-1 text-xs">
            <div>🔧 Manutenzioni: {sources.maintenance}</div>
            <div>📜 Scadenze HACCP: {sources.haccpExpiry}</div>
            <div>📦 Scadenze Prodotti: {sources.productExpiry}</div>
            <div>⏰ Alert HACCP: {sources.haccpDeadlines}</div>
            <div>🌡️ Controlli Temp: {sources.temperatureChecks}</div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="lg:col-span-3">
        <FullCalendar
          initialView={
            view === 'month' ? 'dayGridMonth' :
            view === 'week' ? 'timeGridWeek' :
            'timeGridDay'
          }
          events={displayEvents}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '' // ViewSelector esterno
          }}
          // ... resto delle props esistenti
        />
      </div>
    </div>
  </div>
)
```

**Note**:
- Se CalendarPage già usa un layout, adattalo mantenendo la struttura esistente
- ViewSelector sostituisce i pulsanti vista in FullCalendar toolbar
- Filtri vanno in sidebar a sinistra (o drawer mobile)

### TASK 2: Aggiungere Alert Badge in Header/Navbar

**File da modificare**: `src/components/Header.tsx` o `src/components/Navbar.tsx`

**Cosa fare**:

1. **Importa hook**:
```typescript
import { useAlertBadge } from '@/features/calendar/hooks/useCalendarAlerts'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'
import { useFilteredEvents } from '@/features/calendar/hooks/useFilteredEvents'
```

2. **Usa hook nel component**:
```typescript
function Header() {
  const { events } = useAggregatedEvents()
  const { filteredEvents } = useFilteredEvents(events)
  const { count, criticalCount, hasAlerts, hasCritical } = useAlertBadge(filteredEvents)

  return (
    <header>
      {/* ... altri elementi header ... */}

      {/* Alert Badge */}
      <Link to="/calendar" className="relative">
        <Bell className="h-5 w-5" />
        {hasAlerts && (
          <span className={cn(
            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white",
            hasCritical ? "bg-red-600" : "bg-orange-500"
          )}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    </header>
  )
}
```

**Variante con tooltip**:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Link to="/calendar" className="relative">
      <Bell className="h-5 w-5" />
      {hasAlerts && (
        <span className={cn(
          "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white",
          hasCritical ? "bg-red-600" : "bg-orange-500"
        )}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  </TooltipTrigger>
  <TooltipContent>
    <div className="text-sm">
      {criticalCount > 0 && (
        <div className="text-red-600 font-semibold">
          🔴 {criticalCount} Critical
        </div>
      )}
      <div>{count} Alert attivi</div>
    </div>
  </TooltipContent>
</Tooltip>
```

### TASK 3 (Opzionale): Mostrare EventBadge negli eventi

Se vuoi mostrare badge assegnazione negli eventi del calendario:

```typescript
// In FullCalendar eventContent custom render
eventContent={(arg) => {
  const event = arg.event.extendedProps.originalEvent as CalendarEvent

  return (
    <div className="p-1">
      <div className="font-semibold text-xs">{arg.event.title}</div>
      {event.metadata.assigned_to_category && (
        <EventBadge
          assignedTo={event.metadata.assigned_to_category}
          type="category"
          size="sm"
        />
      )}
    </div>
  )
}
```

## 📝 CHECKLIST COMPLETAMENTO

- [ ] CalendarPage importa nuovi hooks e componenti
- [ ] useAggregatedEvents sostituisce useCalendar vecchio
- [ ] ViewSelector integrato in header
- [ ] CalendarFilters in sidebar
- [ ] CalendarLegend in sidebar
- [ ] Alert badge in Header/Navbar
- [ ] Eventi filtrati mostrati in FullCalendar
- [ ] Test: Admin vede TUTTI eventi
- [ ] Test: Dipendente vede SOLO eventi assegnati
- [ ] Test: Filtri funzionano (localStorage persistence)
- [ ] Test: Alert badge conta eventi critici/overdue
- [ ] Test: ViewSelector cambia vista calendario
- [ ] Mobile responsive (filtri in drawer)

## 🔍 VERIFICA FUNZIONAMENTO

### Test 1: Aggregazione Eventi
```typescript
// In CalendarPage, logga sources
console.log('Event sources:', sources)
// Deve mostrare: { maintenance: X, haccpExpiry: Y, productExpiry: Z, haccpDeadlines: W, temperatureChecks: V }
```

### Test 2: Filtraggio User-Based
```typescript
console.log('Can view all events:', canViewAllEvents)
console.log('Total events:', aggregatedEvents.length)
console.log('Filtered events:', filteredEvents.length)
// Admin/Responsabile: canViewAllEvents=true, lengths uguali
// Dipendente: canViewAllEvents=false, filteredEvents < aggregatedEvents
```

### Test 3: Alert System
```typescript
console.log('Alerts:', alerts)
console.log('Critical count:', criticalCount)
// Deve mostrare eventi overdue o in scadenza <24h
```

## 🐛 TROUBLESHOOTING

### Errore: "Cannot find module '@/features/calendar/components'"
**Fix**: Verifica che `src/features/calendar/components/index.ts` esista ed esporti correttamente

### Errore: "events is undefined"
**Fix**: Aggiungi loading state:
```typescript
if (isLoading) return <LoadingSpinner />
```

### Eventi non filtrati correttamente
**Fix**: Verifica che `CalendarEvent.metadata` abbia `assigned_to_staff_id`, `assigned_to_role`, `assigned_to_category`

### Alert badge non appare
**Fix**: Verifica che eventi abbiano `status: 'overdue'` o `priority: 'critical'` con data <24h

## 📚 DOCUMENTAZIONE RIFERIMENTO

- **Planning completo**: `docs/design_structure/CALENDAR_TASKS_PLANNING.md`
- **Compliance guida**: `docs/design_structure/DATA_COMPLIANCE_GUIDE.md` (Appendice Calendario)
- **Types**: `src/types/calendar.ts`

## 🎯 RISULTATO ATTESO

Dopo l'integrazione, l'utente deve:
1. ✅ Vedere calendario con eventi da 6 fonti automatiche
2. ✅ Filtrare eventi per tipo/priorità/stato (persistente)
3. ✅ Cambiare vista Month/Week/Day
4. ✅ Vedere badge alert in header con count
5. ✅ Vedere solo eventi assegnati (se dipendente)
6. ✅ Vedere legenda colori e tipi

**Screenshot atteso**: Calendario con sidebar filtri (sx), vista month (centro), alert badge (header top-right)

---

_Creato: 2025-01-05_
_Claude AI → Cursor Handoff_
