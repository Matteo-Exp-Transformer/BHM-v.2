# 📅 Piano Implementazione Sistema Calendario e Monitoraggio Scadenze

## 📖 COME USARE QUESTO FILE

### Per gli Agenti AI
1. **Leggi sempre questo file prima di iniziare** qualsiasi task relativo al calendario
2. **Aggiorna lo stato** delle task spostandole da `TODO` → `IN_PROGRESS` → `COMPLETED`
3. **Documenta errori** nella sezione "Errori Riscontrati" con:
   - Data e ora
   - Descrizione errore
   - File coinvolto
   - Soluzione applicata
4. **Non eliminare** task completate, marcale come `✅ COMPLETED`
5. **Aggiungi note** quando scopri nuove informazioni rilevanti

### Per il Developer
- Controlla regolarmente lo stato di avanzamento
- Verifica gli errori riscontrati per pattern ricorrenti
- Aggiorna i requisiti se necessario

---

## 📊 STATO PROGETTO CALENDARIO

**Ultimo Aggiornamento**: 2025-01-05 (Sessione Finale)

### Progress Overview
- ✅ **FASE 1** (Setup Base e Filtraggio) - COMPLETATA al 100%
- ⚠️ **FASE 2** (Viste Multiple) - PARZIALE (ViewSelector ✅, Week/Day views → future)
- ✅ **FASE 3** (Generatori Scadenze) - COMPLETATA al 100%
- ✅ **FASE 4** (UI/UX) - COMPLETATA al 100%
- ✅ **FASE 5** (Notifiche) - COMPLETATA al 100%
- ⏸️ **FASE 6** (Testing) - SKIP per MVP

### ✅ Lavoro Completato da Claude AI (Sessione 1 + 2)
1. ✅ `useFilteredEvents.ts` - Filtraggio eventi user-based
2. ✅ `useAggregatedEvents.ts` - Aggregazione eventi + integrazione generatori
3. ✅ `calendar.ts` types - Type definitions completi
4. ✅ `haccpDeadlineGenerator.ts` - Generatore scadenze HACCP (90/60/30/14/7 days)
5. ✅ `temperatureCheckGenerator.ts` - Generatore controlli temperatura (daily/weekly)
6. ✅ `recurrenceScheduler.ts` - Scheduler ricorrenze (custom giorni)
7. ✅ `useCalendarAlerts.ts` - Sistema alert in-app con localStorage
8. ✅ `EventBadge.tsx` - Badge categoria/ruolo/staff con icone
9. ✅ `CalendarFilters.tsx` - Filtri tipo/priorità/stato con persistence
10. ✅ `CalendarLegend.tsx` - Legenda collapsible priorità + tipi
11. ✅ `ViewSelector.tsx` - Switcher Month/Week/Day con localStorage

### 🔧 Integrazioni Richieste (per Developer)
1. **CalendarPage.tsx**: Importare e usare componenti
   ```typescript
   import { ViewSelector, CalendarFilters, CalendarLegend, useCalendarAlerts } from '@/features/calendar/components'

   // In CalendarPage:
   const [view, setView] = useCalendarView('month')
   const { alerts, alertCount } = useCalendarAlerts(filteredEvents)
   ```

2. **Header/Navbar**: Aggiungere alert badge
   ```typescript
   import { useAlertBadge } from '@/features/calendar/hooks/useCalendarAlerts'

   const { count, hasCritical } = useAlertBadge(events)
   // Mostra badge con count + icona critica se hasCritical
   ```

### 🚧 Rimane da Fare (Opzionale)
- 🔲 FASE 2.1/2.2: WeekView.tsx e DayView.tsx (viste avanzate FullCalendar)
  - **Nota**: Vista Month già funzionante, Week/Day sono enhancement
  - **Alternativa**: Usare FullCalendar views built-in (timeGridWeek, timeGridDay)

---

## 🎯 OBIETTIVO GENERALE

Implementare un sistema completo di calendario nella tab "Attività" che mostri:
- ✅ Mansioni/Manutenzioni assegnate ai dipendenti
- ✅ Scadenze HACCP e certificazioni
- ✅ Controlli temperatura programmati
- ✅ Filtraggio intelligente basato su ruolo/categoria del dipendente loggato

---

## 📋 ANALISI SITUAZIONE CORRENTE

### ✅ Componenti Esistenti
- `CalendarPage.tsx` - Pagina principale già implementata
- `Calendar.tsx` - Componente calendario base
- `useCalendar.ts` - Hook per gestione eventi calendario
- `useAuth.ts` - Sistema autenticazione con Clerk
- `useStaff.ts` - Gestione dipendenti e categorie
- `useMaintenanceTasks.ts` - Gestione task manutenzione

### 📊 Strutture Dati Rilevanti

#### StaffMember (da `useStaff.ts`)
```typescript
{
  id: string
  company_id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string  // Es: "Cuochi", "Camerieri", etc.
  email?: string
  department_assignments?: string[]
  haccp_certification?: {
    level: 'base' | 'advanced'
    expiry_date: string
    issuing_authority: string
    certificate_number: string
  }
}
```

#### MaintenanceTask (da `types/conservation.ts`)
```typescript
{
  id: string
  conservation_point_id: string
  title: string
  type: MaintenanceType
  frequency: MaintenanceFrequency
  assigned_to?: string  // Staff member ID
  next_due: Date
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
}
```

#### ConservationMaintenancePlan (da `types/onboarding.ts`)
```typescript
{
  id: string
  conservationPointId: string
  manutenzione: StandardMaintenanceType
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole | 'specifico'
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: StaffMember['id']
}
```

#### GeneralTask / GenericTask (da `types/onboarding.ts`)
```typescript
{
  id: string
  name: string
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole | 'specifico'
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: StaffMember['id']
}
```

### 🔑 Sistema Autenticazione
- **Clerk** per autenticazione utente
- **UserProfile** con `staff_id` che collega user → staff member
- **Ruoli**: admin, responsabile, dipendente, collaboratore
- **Categorie Staff**: Cuochi, Camerieri, Banconisti, etc.

---

## 🏗️ ARCHITETTURA SOLUZIONE

### 1. Logica Filtraggio Eventi (User-Based)

```typescript
// Pseudocodice logica filtraggio
function getVisibleEventsForUser(user: UserProfile, allEvents: CalendarEvent[]) {
  const staffMember = getStaffMemberByUserId(user.staff_id)

  return allEvents.filter(event => {
    // Admin e Responsabile vedono TUTTO
    if (user.role === 'admin' || user.role === 'responsabile') {
      return true
    }

    // Altri dipendenti vedono solo eventi assegnati a:
    return (
      // 1. Loro personalmente (nome specifico)
      event.assigned_to_staff_id === staffMember.id ||

      // 2. Il loro ruolo
      event.assigned_to_role === staffMember.role ||

      // 3. La loro categoria
      event.assigned_to_category === staffMember.category
    )
  })
}
```

### 2. Viste Calendario da Implementare
- ✅ **Vista Mensile** (già parzialmente implementata)
- 🔲 **Vista Settimanale** (da implementare)
- 🔲 **Vista Giornaliera** (da implementare)
- 🔲 **Vista Lista** (per mobile)

### 3. Tipi di Eventi da Visualizzare
1. **Manutenzioni Punti Conservazione** (`MaintenanceTask`)
2. **Mansioni Generiche** (`GeneralTask`, `GenericTask`)
3. **Scadenze HACCP Dipendenti** (da `staff.haccp_certification.expiry_date`)
4. **Controlli Temperatura** (pianificati automaticamente)
5. **Eventi Custom** (creati manualmente)

---

## 📝 TASKS DA COMPLETARE

### 🔴 FASE 1: Setup Base e Filtraggio ✅ COMPLETATA

#### Task 1.1: Creare Hook per Filtraggio Eventi Personalizzato
**File**: `src/features/calendar/hooks/useFilteredEvents.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Creare hook che prende eventi e user profile
- Implementa logica filtraggio basata su ruolo/categoria
- Gestisce visibilità eventi per dipendenti vs admin

**Dipendenze**: Nessuna
**Assigned**: Claude AI
**Note**: Implementato con supporto completo per admin/responsabile (vede tutto) e dipendenti (solo assegnati)

#### Task 1.2: Estendere CalendarEvent Type
**File**: `src/types/calendar.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Definire tipo `CalendarEvent` unificato
- Includere campi per assegnazione: `assigned_to_staff_id`, `assigned_to_role`, `assigned_to_category`
- Includere `source_type`: 'maintenance' | 'general_task' | 'haccp_expiry' | 'custom'

**Dipendenze**: Nessuna
**Assigned**: Claude AI
**Note**: Type esteso con metadata completi e assignment fields

#### Task 1.3: Creare Aggregatore Eventi
**File**: `src/features/calendar/hooks/useAggregatedEvents.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Raccoglie eventi da tutte le fonti (manutenzioni, task, scadenze HACCP)
- Normalizza in formato `CalendarEvent`
- Applica filtraggio user-based tramite `useFilteredEvents`

**Dipendenze**: Task 1.1, Task 1.2
**Assigned**: Claude AI
**Note**: Aggregazione da maintenance_tasks, staff HACCP expiry, products expiry

---

### 🟡 FASE 2: Viste Calendario Multiple [👤 CURSOR]

#### Task 2.1: Implementare Vista Settimanale [👤 CURSOR]
**File**: `src/features/calendar/views/WeekView.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Layout griglia 7 giorni
- Slot orari (opzionale, o solo eventi all-day)
- Responsive design

**Dipendenze**: FASE 1 completata ✅
**Assigned**: CURSOR
**Istruzioni per Cursor**:
```
Creare componente WeekView.tsx che:
1. Usa FullCalendar con vista timeGridWeek
2. Integra eventi da useAggregatedEvents + useFilteredEvents
3. Stile consistente con CalendarPage esistente
4. Supporto mobile con breakpoints Tailwind
```

#### Task 2.2: Implementare Vista Giornaliera [👤 CURSOR]
**File**: `src/features/calendar/views/DayView.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Lista eventi del giorno selezionato
- Timeline oraria
- Dettagli espansi

**Dipendenze**: FASE 1 completata ✅
**Assigned**: CURSOR
**Istruzioni per Cursor**:
```
Creare componente DayView.tsx che:
1. Usa FullCalendar con vista timeGridDay
2. Mostra eventi filtrati per giorno selezionato
3. Click su evento apre modal dettagli
4. Pulsanti navigazione prev/next day
```

#### Task 2.3: Selector Viste
**File**: `src/features/calendar/components/ViewSelector.tsx`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Pulsanti per switching: Mese | Settimana | Giorno
- Persistenza scelta in localStorage
- Integrazione in CalendarPage

**Dipendenze**: Nessuna
**Assigned**: Claude AI
**Note**: ViewSelector + CompactViewSelector variants, useCalendarView hook con localStorage

---

### 🟢 FASE 3: Generazione Automatica Scadenze ✅ COMPLETATA

#### Task 3.1: Generator Scadenze HACCP
**File**: `src/features/calendar/utils/haccpDeadlineGenerator.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Scansiona tutti i dipendenti
- Genera eventi calendario per scadenze HACCP in arrivo (30/60/90 giorni)
- Assegna eventi a admin/responsabile

**Dipendenze**: FASE 1 completata ✅
**Assigned**: Claude AI
**Note**: Implementato con configurazione warning days [90,60,30,14,7] e critical threshold 7 giorni

#### Task 3.2: Generator Controlli Temperatura Automatici
**File**: `src/features/calendar/utils/temperatureCheckGenerator.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Basato su frequenza definita per ogni punto conservazione
- Genera eventi ricorrenti
- Assegna a categoria/ruolo appropriato

**Dipendenze**: FASE 1 completata ✅
**Assigned**: Claude AI
**Note**: Genera eventi per 90 giorni future, frequenza daily per fridge/blast, weekly per freezer

#### Task 3.3: Scheduler Ricorrenze
**File**: `src/features/calendar/utils/recurrenceScheduler.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Gestisce frequenze: daily, weekly, monthly, custom
- Calcola prossime occorrenze
- Gestisce `giorniCustom` per frequenze personalizzate

**Dipendenze**: Task 3.1, Task 3.2
**Assigned**: Claude AI
**Note**: Include funzioni calculateNextOccurrences, expandRecurringEvent, supporto giorniCustom

#### Task 3.4: Integrare Generatori in useAggregatedEvents
**File**: `src/features/calendar/hooks/useAggregatedEvents.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Importare haccpDeadlineGenerator e temperatureCheckGenerator
- Chiamare generatori e includere eventi nel return
- Aggiungere source counts per dashboard stats

**Dipendenze**: Task 3.1, 3.2, 3.3 completati ✅
**Assigned**: Claude AI
**Note**: Integrati generatori con useMemo hooks, aggiunto useConservationPoints
**Istruzioni Originali per Cursor**:
```typescript
// In useAggregatedEvents.ts aggiungere:
import { generateHaccpDeadlineEvents } from '../utils/haccpDeadlineGenerator'
import { generateTemperatureCheckEvents } from '../utils/temperatureCheckGenerator'

// Nel hook:
const haccpDeadlineEvents = useMemo(() => {
  if (!staff || staff.length === 0) return []
  return generateHaccpDeadlineEvents(staff, companyId || '', user?.id || '')
}, [staff, companyId, user?.id])

const temperatureEvents = useMemo(() => {
  if (!conservationPoints || conservationPoints.length === 0) return []
  return generateTemperatureCheckEvents(conservationPoints, companyId || '', user?.id || '')
}, [conservationPoints, companyId, user?.id])

// Aggiungere a allEvents:
const allEvents = useMemo(() => {
  return [
    ...maintenanceEvents,
    ...haccpExpiryEvents,
    ...productExpiryEvents,
    ...haccpDeadlineEvents,
    ...temperatureEvents
  ]
}, [maintenanceEvents, haccpExpiryEvents, productExpiryEvents, haccpDeadlineEvents, temperatureEvents])

// Aggiungere a sources:
sources: {
  maintenance: maintenanceEvents.length,
  haccpExpiry: haccpExpiryEvents.length,
  productExpiry: productExpiryEvents.length,
  haccpDeadlines: haccpDeadlineEvents.length,
  temperatureChecks: temperatureEvents.length,
  custom: 0,
}
```

---

### 🔵 FASE 4: UI/UX Miglioramenti ✅ COMPLETATA

#### Task 4.1: Badge Categoria/Ruolo su Eventi
**File**: `src/features/calendar/components/EventBadge.tsx`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Mostra icone/badge per indicare assegnazione
- Es: 👨‍🍳 Cuochi, 👔 Responsabile, 👤 Mario Rossi

**Dipendenze**: FASE 1 completata ✅
**Assigned**: Claude AI
**Note**: Implementato con EventBadge + EventBadgeList, icone lucide-react, colori per categoria/ruolo

#### Task 4.2: Filtri Calendario
**File**: `src/features/calendar/components/CalendarFilters.tsx`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Filtra per tipo evento (Manutenzioni, Mansioni, Scadenze, etc.)
- Filtra per priorità
- Filtra per stato (completato, in corso, scaduto)

**Dipendenze**: FASE 1 completata ✅
**Assigned**: Claude AI
**Note**: Filtri collapsible con localStorage persistence, 3 sezioni (Tipo/Priorità/Stato), reset button

#### Task 4.3: Legend/Legenda
**File**: `src/features/calendar/components/CalendarLegend.tsx`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Mostra colori eventi e significato
- Collapsible per risparmiare spazio

**Dipendenze**: Nessuna
**Assigned**: Claude AI
**Note**: Legenda collapsible (default collapsed), sezioni Priorità + Tipo Evento, CompactCalendarLegend variant

---

### 🟣 FASE 5: Notifiche e Alert ✅ COMPLETATA

#### Task 5.1: Sistema Alert In-App
**File**: `src/features/calendar/hooks/useCalendarAlerts.ts`
**Status**: ✅ COMPLETED (2025-01-05)
**Descrizione**:
- Controlla eventi in scadenza
- Mostra badge notifiche in header/navbar
- Lista alert accessibile

**Dipendenze**: FASE 1 completata ✅
**Assigned**: Claude AI
**Note**: Hook con severity levels (critical/high/medium), dismissAlert con localStorage, useAlertBadge helper

#### Task 5.2: Email Reminders (Opzionale) [⏸️ SKIP]
**File**: `src/services/notifications/emailReminders.ts`
**Status**: ⏸️ SKIP (Bassa priorità - implementare dopo MVP)
**Descrizione**:
- Integrazione con servizio email
- Invio reminder automatici 24h/48h prima scadenza

**Dipendenze**: FASE 5.1 completata
**Assigned**: -
**Note**: Richiede backend service, rinviare a Fase 2 del progetto

---

### 🟠 FASE 6: Testing e Debug [👤 CURSOR + 🤖 CLAUDE]

#### Task 6.1: Test Logica Filtraggio [⏸️ SKIP]
**File**: `src/features/calendar/hooks/__tests__/useFilteredEvents.test.ts`
**Status**: ⏸️ SKIP (Post-MVP)
**Descrizione**:
- Test filtraggio per ogni tipo di ruolo
- Test assegnazione categoria/ruolo/specifico
- Edge cases

**Dipendenze**: FASE 1 completata ✅
**Assigned**: -
**Note**: Implementare dopo MVP se necessario

#### Task 6.2: Test Generatori Scadenze [⏸️ SKIP]
**File**: `src/features/calendar/utils/__tests__/generators.test.ts`
**Status**: ⏸️ SKIP (Post-MVP)
**Descrizione**:
- Verifica correttezza date generate
- Verifica assegnazioni corrette
- Test frequenze custom

**Dipendenze**: FASE 3 completata ✅
**Assigned**: -
**Note**: Implementare dopo MVP se necessario

#### Task 6.3: Testing Manuale Viste [👤 USER]
**Status**: 🔲 TODO
**Descrizione**:
- Testare ogni vista con dati reali
- Verificare responsive su mobile
- Verificare performance con molti eventi

**Dipendenze**: FASE 2 completata
**Assigned**: Developer (Matteo)
**Checklist Testing**:
- [ ] Login come admin → vede TUTTI eventi
- [ ] Login come responsabile → vede TUTTI eventi
- [ ] Login come dipendente categoria "Cuochi" → vede solo eventi assegnati a Cuochi/specifico
- [ ] Vista Mese responsive mobile
- [ ] Vista Settimana responsive mobile
- [ ] Vista Giorno responsive mobile
- [ ] Performance: <200ms con 100+ eventi
- [ ] Colori eventi corretti per priorità
- [ ] Click evento apre dettagli
- [ ] Filtri funzionano correttamente

---

## 🐛 ERRORI RISCONTRATI

### Template per Nuovo Errore
```
**[TIMESTAMP] - [FILE] - [AGENT/DEVELOPER]**
**Errore**: Descrizione
**Causa**: Causa root
**Soluzione**: Come è stato risolto
**Prevenzione**: Come evitare in futuro
---
```

_(Nessun errore ancora riscontrato - iniziare implementazione)_

---

## 📝 NOTE IMPLEMENTAZIONE

### Priorità Colori Eventi
- 🔴 **Critico/Scaduto**: Rosso (#EF4444)
- 🟠 **Alta Priorità**: Arancione (#F97316)
- 🟡 **Media Priorità**: Giallo (#EAB308)
- 🔵 **Bassa Priorità**: Blu (#3B82F6)
- 🟢 **Completato**: Verde (#22C55E)

### Categorie Staff e Icone
- 👨‍🍳 **Cuochi**: ChefHat
- 🍽️ **Camerieri**: UtensilsCrossed
- 🏪 **Banconisti**: Store
- 🧹 **Addetto Pulizie**: Brush
- 📦 **Magazziniere**: Package
- 👔 **Amministratore**: Shield
- 📱 **Social Media Manager**: Megaphone

### Librerie Consigliate
- **Calendario UI**: `react-big-calendar` o custom (già in uso?)
- **Date Utils**: `date-fns` (già usato nel progetto)
- **Icons**: `lucide-react` (già in uso ✅)

---

## 🎯 METRICHE SUCCESSO

- [ ] Dipendente vede SOLO eventi assegnati a lui/ruolo/categoria
- [ ] Admin/Responsabile vedono TUTTI gli eventi
- [ ] Viste Mese/Settimana/Giorno funzionanti
- [ ] Scadenze HACCP generate automaticamente
- [ ] Manutenzioni ricorrenti calcolate correttamente
- [ ] Performance: <200ms caricamento calendario con 100+ eventi
- [ ] Mobile responsive
- [ ] Zero errori console in produzione

---

## 🔄 CHANGELOG

### [2025-01-XX] - Versione Iniziale
- Creato file di planning
- Analizzato codebase esistente
- Definite 6 fasi implementazione
- Identificati 20+ task specifici

---

## 📞 CONTATTI & SUPPORTO

**Developer**: Matteo
**Progetto**: BHM v.2 - Business HACCP Manager
**Repo**: `BHM-v.2`

---

_Ultimo aggiornamento: 2025-01-05_
