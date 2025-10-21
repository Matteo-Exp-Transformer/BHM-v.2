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

### 🔴 FASE 1: Setup Base e Filtraggio

#### Task 1.1: Creare Hook per Filtraggio Eventi Personalizzato
**File**: `src/features/calendar/hooks/useFilteredEvents.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Creare hook che prende eventi e user profile
- Implementa logica filtraggio basata su ruolo/categoria
- Gestisce visibilità eventi per dipendenti vs admin

**Dipendenze**: Nessuna
**Assigned**: -

#### Task 1.2: Estendere CalendarEvent Type
**File**: `src/types/calendar.ts` (da creare se non esiste)
**Status**: 🔲 TODO
**Descrizione**:
- Definire tipo `CalendarEvent` unificato
- Includere campi per assegnazione: `assigned_to_staff_id`, `assigned_to_role`, `assigned_to_category`
- Includere `source_type`: 'maintenance' | 'general_task' | 'haccp_expiry' | 'custom'

**Dipendenze**: Nessuna
**Assigned**: -

#### Task 1.3: Creare Aggregatore Eventi
**File**: `src/features/calendar/hooks/useAggregatedEvents.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Raccoglie eventi da tutte le fonti (manutenzioni, task, scadenze HACCP)
- Normalizza in formato `CalendarEvent`
- Applica filtraggio user-based tramite `useFilteredEvents`

**Dipendenze**: Task 1.1, Task 1.2
**Assigned**: -

---

### 🟡 FASE 2: Viste Calendario Multiple

#### Task 2.1: Implementare Vista Settimanale
**File**: `src/features/calendar/views/WeekView.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Layout griglia 7 giorni
- Slot orari (opzionale, o solo eventi all-day)
- Responsive design

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 2.2: Implementare Vista Giornaliera
**File**: `src/features/calendar/views/DayView.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Lista eventi del giorno selezionato
- Timeline oraria
- Dettagli espansi

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 2.3: Selector Viste
**File**: `src/features/calendar/components/ViewSelector.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Pulsanti per switching: Mese | Settimana | Giorno
- Persistenza scelta in localStorage
- Integrazione in CalendarPage

**Dipendenze**: Task 2.1, Task 2.2
**Assigned**: -

---

### 🟢 FASE 3: Generazione Automatica Scadenze

#### Task 3.1: Generator Scadenze HACCP
**File**: `src/features/calendar/utils/haccpDeadlineGenerator.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Scansiona tutti i dipendenti
- Genera eventi calendario per scadenze HACCP in arrivo (30/60/90 giorni)
- Assegna eventi a admin/responsabile

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 3.2: Generator Controlli Temperatura Automatici
**File**: `src/features/calendar/utils/temperatureCheckGenerator.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Basato su frequenza definita per ogni punto conservazione
- Genera eventi ricorrenti
- Assegna a categoria/ruolo appropriato

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 3.3: Scheduler Ricorrenze
**File**: `src/features/calendar/utils/recurrenceScheduler.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Gestisce frequenze: daily, weekly, monthly, custom
- Calcola prossime occorrenze
- Gestisce `giorniCustom` per frequenze personalizzate

**Dipendenze**: Task 3.1, Task 3.2
**Assigned**: -

---

### 🔵 FASE 4: UI/UX Miglioramenti

#### Task 4.1: Badge Categoria/Ruolo su Eventi
**File**: `src/features/calendar/components/EventBadge.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Mostra icone/badge per indicare assegnazione
- Es: 👨‍🍳 Cuochi, 👔 Responsabile, 👤 Mario Rossi

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 4.2: Filtri Calendario
**File**: `src/features/calendar/components/CalendarFilters.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Filtra per tipo evento (Manutenzioni, Mansioni, Scadenze, etc.)
- Filtra per priorità
- Filtra per stato (completato, in corso, scaduto)

**Dipendenze**: FASE 2 completata
**Assigned**: -

#### Task 4.3: Legend/Legenda
**File**: `src/features/calendar/components/CalendarLegend.tsx`
**Status**: 🔲 TODO
**Descrizione**:
- Mostra colori eventi e significato
- Collapsible per risparmiare spazio

**Dipendenze**: Nessuna (può essere fatto in parallelo)
**Assigned**: -

---

### 🟣 FASE 5: Notifiche e Alert

#### Task 5.1: Sistema Alert In-App
**File**: `src/features/calendar/hooks/useCalendarAlerts.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Controlla eventi in scadenza
- Mostra badge notifiche in header/navbar
- Lista alert accessibile

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 5.2: Email Reminders (Opzionale)
**File**: `src/services/notifications/emailReminders.ts`
**Status**: 🔲 TODO (Bassa priorità)
**Descrizione**:
- Integrazione con servizio email
- Invio reminder automatici 24h/48h prima scadenza

**Dipendenze**: FASE 5.1 completata
**Assigned**: -

---

### 🟠 FASE 6: Testing e Debug

#### Task 6.1: Test Logica Filtraggio
**File**: `src/features/calendar/hooks/__tests__/useFilteredEvents.test.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Test filtraggio per ogni tipo di ruolo
- Test assegnazione categoria/ruolo/specifico
- Edge cases

**Dipendenze**: FASE 1 completata
**Assigned**: -

#### Task 6.2: Test Generatori Scadenze
**File**: `src/features/calendar/utils/__tests__/generators.test.ts`
**Status**: 🔲 TODO
**Descrizione**:
- Verifica correttezza date generate
- Verifica assegnazioni corrette
- Test frequenze custom

**Dipendenze**: FASE 3 completata
**Assigned**: -

#### Task 6.3: Testing Manuale Viste
**Status**: 🔲 TODO
**Descrizione**:
- Testare ogni vista con dati reali
- Verificare responsive su mobile
- Verificare performance con molti eventi

**Dipendenze**: FASE 2 completata
**Assigned**: -

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
