# 🎯 ATTIVITÀ - Inventario Componenti

**Data creazione**: 2025-01-15
**Stato**: 🔄 Inventario completato
**Componenti totali**: 8

---

## 📊 Panoramica Area

| Campo | Valore |
|-------|--------|
| **Area** | Attività/Activity Tracking |
| **Path** | src/features/admin/ |
| **Priorità** | 1-Critica |
| **Componenti Totali** | 8 |
| **Complessità Media** | Alta |
| **External Dependencies** | Supabase RPC, React Query, date-fns |

---

## 🗂️ Componenti Identificate

### 1. ActivityTrackingPage.tsx
- **File**: `src/features/admin/pages/ActivityTrackingPage.tsx`
- **Tipo**: Page
- **Complessità**: ALTA (174 LOC)
- **Props**: Nessuna (top-level page)
- **State**:
  - filters (ActivityFilters)
  - activeTab ('sessions' | 'timeline' | 'stats')
- **Hooks**:
  - useAuth (permission check)
- **API Calls**: Nessuna (delegato ai child components)
- **Child Components**:
  - ActivityFilters
  - ActivityLogTable
  - ActiveSessionsCard
  - ActivityStatisticsChart
- **Routing**: /admin/activity-tracking
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- Tab navigation (Sessioni Attive, Timeline Attività, Statistiche)
- Permission check per amministratori
- Layout responsive con header e footer informativi
- Gestione stato filtri condiviso tra componenti
- Loading states e error handling

**Test da creare:**
- Rendering pagina con permission check
- Switch tra tab (sessions/timeline/stats)
- Permission denied per utenti non admin
- Loading state durante auth check
- Responsive layout su mobile/desktop

---

### 2. ActivityFilters.tsx
- **File**: `src/features/admin/components/ActivityFilters.tsx`
- **Tipo**: Component (Form)
- **Complessità**: ALTA (247 LOC)
- **Props**:
  ```typescript
  {
    filters: ActivityFilters
    onFiltersChange: (filters: ActivityFilters) => void
  }
  ```
- **State**:
  - localFilters (ActivityFilters)
  - isExpanded (boolean)
- **Hooks**:
  - useState (form state)
  - useEffect (sync with parent filters)
- **API Calls**: None (pure UI component)
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- Filtri per tipo attività (15 tipi supportati)
- Date range picker (inizio/fine)
- Quick filters (oggi, ultimi 7 giorni, ultimo mese)
- Expandable/collapsible interface
- Active filters summary
- Reset e apply filters

**Test da creare:**
- Rendering filtri collapsed/expanded
- Selezione tipo attività
- Date range selection
- Quick filters functionality
- Reset filters
- Apply filters callback
- Active filters display
- Form validation

---

### 3. ActivityLogTable.tsx
- **File**: `src/features/admin/components/ActivityLogTable.tsx`
- **Tipo**: Component (Data Table)
- **Complessità**: MOLTO ALTA (255 LOC)
- **Props**:
  ```typescript
  {
    filters?: ActivityFilters
  }
  ```
- **State**: None (controlled by parent)
- **Hooks**:
  - useCompanyActivities (React Query)
- **API Calls**:
  - activityTrackingService.getCompanyActivities()
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- Timeline attività con iconografia specifica
- Formattazione dettagli attività per tipo
- Timestamp relativi e assoluti (date-fns)
- Loading, error, empty states
- Pagination info (ultime 50 attività)
- IP address display
- Entity type badges

**Test da creare:**
- Rendering timeline con dati
- Loading state
- Error state con retry
- Empty state
- Activity icons per tipo
- Timestamp formatting
- Activity details formatting
- IP address display
- Pagination info

---

### 4. ActiveSessionsCard.tsx
- **File**: `src/features/admin/components/ActiveSessionsCard.tsx`
- **Tipo**: Component (Dashboard Card)
- **Complessità**: ALTA (232 LOC)
- **Props**: Nessuna
- **State**: None (controlled by hooks)
- **Hooks**:
  - useActiveSessions (React Query)
- **API Calls**:
  - activityTrackingService.getActiveSessions()
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- Sessioni attive in tempo reale (refresh ogni 30s)
- Device detection (mobile/tablet/desktop)
- Durata sessione calcolata
- Last activity tracking
- Sessioni grid responsive
- Statistics footer
- Error handling con retry

**Test da creare:**
- Rendering sessioni attive
- Loading state
- Error state con retry
- Empty state (nessuna sessione)
- Device icons
- Duration calculation
- Last activity formatting
- Statistics calculation
- Auto-refresh behavior

---

### 5. ActivityStatisticsChart.tsx
- **File**: `src/features/admin/components/ActivityStatisticsChart.tsx`
- **Tipo**: Component (Chart/Statistics)
- **Complessità**: ALTA (285 LOC)
- **Props**:
  ```typescript
  {
    filters?: ActivityFilters
  }
  ```
- **State**: None (controlled by hooks)
- **Hooks**:
  - useActivityStatistics (React Query)
- **API Calls**:
  - activityTrackingService.getActivityStatistics()
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- Summary cards (attività totali, tipi, utenti attivi)
- Bar chart con progress bars
- Activity type colors e labels
- Period info display
- Top activity highlight
- Percentage calculations
- Loading, error, empty states

**Test da creare:**
- Rendering statistiche
- Summary cards calculation
- Bar chart rendering
- Activity type colors
- Percentage calculations
- Period info display
- Top activity highlight
- Loading/error/empty states

---

### 6. activity.ts (Types)
- **File**: `src/types/activity.ts`
- **Tipo**: Type Definitions
- **Complessità**: Media (125 LOC)
- **Props**: N/A
- **State**: N/A
- **Hooks**: N/A
- **API Calls**: N/A
- **Stato**: ✅ Type-safe

**Funzionalità principali:**
- ActivityType enum (20 tipi)
- EntityType enum (10 tipi)
- UserActivityLog interface
- ActivityFilters interface
- ActivityStatistics interface
- Session interfaces
- Activity data interfaces specifiche

**Test da creare:**
- Type validation
- Interface completeness
- Enum values validation

---

### 7. useActivityTracking.ts
- **File**: `src/hooks/useActivityTracking.ts`
- **Tipo**: Custom Hooks
- **Complessità**: Media (129 LOC)
- **Props**: N/A
- **State**: N/A
- **Hooks**:
  - useQuery, useMutation, useQueryClient (React Query)
  - useAuth (user/company context)
- **API Calls**: Tutte le chiamate activityTrackingService
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- useActivityTracking (log activity)
- useActiveSessions (sessioni attive)
- useUserActivities (attività utente)
- useCompanyActivities (attività azienda)
- useActivityStatistics (statistiche)
- useCleanupInactiveSessions (cleanup)

**Test da creare:**
- Hook initialization
- Query key generation
- Error handling
- Loading states
- Data transformation
- Cache invalidation
- Mutation success/error

---

### 8. activityTrackingService.ts
- **File**: `src/services/activityTrackingService.ts`
- **Tipo**: Service (API Layer)
- **Complessità**: ALTA (265 LOC)
- **Props**: N/A
- **State**: N/A
- **Hooks**: N/A
- **API Calls**: 
  - Supabase RPC functions (7 functions)
  - Supabase table operations
- **Stato**: ⏳ Da testare

**Funzionalità principali:**
- logActivity (RPC: log_user_activity)
- startSession (table: user_sessions)
- endSession (RPC: end_user_session)
- updateLastActivity (table update)
- getActiveSessions (RPC: get_active_sessions)
- getUserActivities (RPC: get_user_activities)
- getCompanyActivities (RPC: get_company_activities)
- getActivityStatistics (RPC: get_activity_statistics)
- cleanupInactiveSessions (RPC: cleanup_inactive_sessions)

**Test da creare:**
- Service initialization
- RPC function calls
- Error handling
- Data transformation
- Success/failure responses
- Parameter validation
- Database operations

---

## 🎯 Riepilogo Funzionalità Area Attività

1. **Activity Tracking Core**
   - Log attività utenti con metadata
   - Session management (start/end/update)
   - Real-time session monitoring
   - Activity statistics e analytics

2. **Admin Dashboard**
   - Tab navigation (sessions/timeline/stats)
   - Permission-based access control
   - Responsive layout design
   - Loading/error states management

3. **Data Visualization**
   - Timeline attività con iconografia
   - Sessioni attive in tempo reale
   - Statistiche con charts e progress bars
   - Device detection e user info

4. **Filtering & Search**
   - Filtri per tipo attività (20 tipi)
   - Date range filtering
   - Quick date filters
   - User-specific filtering

5. **Data Management**
   - Automatic session cleanup
   - Activity data formatting
   - IP address tracking
   - Entity relationship tracking

---

## 🧪 Piano Test Generale

**Test funzionali**: ~45 (rendering, interactions, data display)
**Test validazione**: ~20 (form validation, data integrity, permissions)
**Test edge cases**: ~25 (empty states, errors, real-time updates)
**Coverage target**: 90%+ (componente critico admin)

---

## 🔗 Dipendenze Identificate

**Hooks custom**:
- useActivityTracking.ts (activity logging)
- useAuth.ts (permission management)

**Servizi**:
- activityTrackingService.ts (API layer)
- Supabase RPC functions (7 functions)

**Context utilizzati**:
- AuthContext (user permissions)
- React Query (data fetching)

**External libraries**:
- @tanstack/react-query (data fetching)
- date-fns (date formatting)
- lucide-react (icons)
- Supabase (database)

---

## 📝 Note Aggiuntive

**Pattern architetturali identificati:**
- Container/Presentational separation (Page container, components presentational)
- Custom hooks per business logic
- Service layer per API abstraction
- Type-safe interfaces per data contracts

**Problemi potenziali:**
- Complessità alta ActivityLogTable (255 LOC) - potenziale refactoring
- Real-time updates potrebbero causare performance issues
- Permission check solo client-side (da verificare server-side)

**Ottimizzazioni suggerite:**
- Implementare virtualization per timeline lunghe
- Memoization di componenti pesanti
- Lazy loading di statistiche
- Server-side permission validation

---

**Prossima azione**: Iniziare testing ActivityTrackingPage (componente principale, priorità alta)
