# 📊 User Activity Tracking System - Planning Document

**Project:** Business HACCP Manager v.2
**Branch:** NoClerk
**Start Date:** 2025-01-10
**Status:** 🚀 In Planning

---

## 🎯 OBIETTIVI

### Feature 1: Shopping List System
Creare sistema completo di lista della spesa con:
- CollapseCard "Lista della Spesa" nella dashboard
- Visualizzazione tutti prodotti del catalogo aziendale
- Filtri: categorie, reparti (via conservation_point), scadenza, tutti
- Checkbox per selezionare prodotti
- Generazione lista della spesa con prodotti selezionati
- Salvataggio liste generate

### Feature 2: User Activity Tracking
Sistema completo di tracciamento attività utente:
- **Session Tracking**: Orario inizio/fine sessione per ogni login
- **Task Completion**: Tracciamento task completate (manutenzioni, attività generiche)
- **Product Operations**: Tracking inserimento prodotti
- **Shopping Lists**: Tracking liste della spesa generate
- **Audit Trail**: Log completo per compliance HACCP

---

## 📊 DATABASE SCHEMA - New Tables

### 1. `user_activity_logs`
**Descrizione**: Log completo di tutte le attività utente

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | `gen_random_uuid()` | ID log |
| `user_id` | UUID | NOT NULL, FK → auth.users | - | Utente |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda |
| `session_id` | UUID | FK → user_sessions | - | Sessione riferimento |
| `activity_type` | VARCHAR | NOT NULL | - | Tipo: 'session_start', 'session_end', 'task_completed', 'product_added', 'shopping_list_created' |
| `activity_data` | JSONB | - | `{}` | Dati specifici attività |
| `entity_type` | VARCHAR | - | - | Tipo entità: 'maintenance_task', 'generic_task', 'product', 'shopping_list' |
| `entity_id` | UUID | - | - | ID entità riferimento |
| `timestamp` | TIMESTAMPTZ | NOT NULL | `now()` | Timestamp attività |
| `ip_address` | INET | - | - | IP utente |
| `user_agent` | TEXT | - | - | Browser/device info |

**Indici**:
- `idx_activity_user_id` su `user_id`
- `idx_activity_company_id` su `company_id`
- `idx_activity_session_id` su `session_id`
- `idx_activity_type` su `activity_type`
- `idx_activity_timestamp` su `timestamp DESC`
- `idx_activity_entity` su `(entity_type, entity_id)`

**Partitioning Strategy** (future):
- Partizionamento per mese su `timestamp` per performance

---

### 2. Update `user_sessions` Table
**Aggiungere campi**:

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `session_start` | TIMESTAMPTZ | NOT NULL | `now()` | Inizio sessione |
| `session_end` | TIMESTAMPTZ | - | - | Fine sessione (NULL = in corso) |
| `last_activity` | TIMESTAMPTZ | NOT NULL | `now()` | Ultima attività |
| `is_active` | BOOLEAN | NOT NULL | `true` | Sessione attiva |
| `ip_address` | INET | - | - | IP login |
| `user_agent` | TEXT | - | - | Browser info |

**Trigger**: `update_session_last_activity` (aggiorna `last_activity` automaticamente)

---

### 3. `shopping_lists` (ALREADY EXISTS - verify)
**Descrizione**: Liste della spesa generate

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | `gen_random_uuid()` | ID lista |
| `company_id` | UUID | NOT NULL, FK → companies | - | Azienda |
| `user_id` | UUID | NOT NULL, FK → auth.users | - | Utente creatore |
| `name` | VARCHAR | NOT NULL | - | Nome lista |
| `status` | VARCHAR | NOT NULL | `'draft'` | Status: 'draft', 'sent', 'completed', 'cancelled' |
| `notes` | TEXT | - | - | Note |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | Data aggiornamento |
| `completed_at` | TIMESTAMPTZ | - | - | Data completamento |

**Relazioni**:
- ← `shopping_list_items.shopping_list_id`

---

### 4. `shopping_list_items` (ALREADY EXISTS - verify)
**Descrizione**: Prodotti in lista della spesa

| Campo | Tipo | Constraints | Default | Descrizione |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | `gen_random_uuid()` | ID item |
| `shopping_list_id` | UUID | NOT NULL, FK → shopping_lists | - | Lista riferimento |
| `product_id` | UUID | FK → products | - | Prodotto (opzionale) |
| `product_name` | VARCHAR | NOT NULL | - | Nome prodotto |
| `quantity` | DECIMAL | NOT NULL | - | Quantità |
| `unit` | VARCHAR | NOT NULL | `'pz'` | Unità misura |
| `category` | VARCHAR | - | - | Categoria prodotto |
| `notes` | TEXT | - | - | Note |
| `is_checked` | BOOLEAN | NOT NULL | `false` | Acquistato |
| `checked_at` | TIMESTAMPTZ | - | - | Data acquisto |

---

## 🔧 ACTIVITY TYPES DETAILS

### 1. Session Activities
```typescript
// session_start
{
  activity_type: 'session_start',
  activity_data: {
    login_method: 'email' | 'magic_link',
    device_type: 'desktop' | 'mobile' | 'tablet'
  }
}

// session_end
{
  activity_type: 'session_end',
  activity_data: {
    duration_minutes: 45,
    logout_type: 'manual' | 'timeout' | 'auto'
  }
}
```

### 2. Task Completion
```typescript
// task_completed
{
  activity_type: 'task_completed',
  entity_type: 'maintenance_task' | 'generic_task',
  entity_id: 'uuid-task-id',
  activity_data: {
    task_name: 'Rilevamento Temperature Frigo 1',
    task_type: 'temperature' | 'sanitization' | 'defrosting' | 'generic',
    department_name: 'Cucina',
    conservation_point_name?: 'Frigo 1',
    completed_value?: 4.5, // temperatura registrata
    notes?: 'Tutto ok'
  }
}
```

### 3. Product Operations
```typescript
// product_added
{
  activity_type: 'product_added',
  entity_type: 'product',
  entity_id: 'uuid-product-id',
  activity_data: {
    product_name: 'Mozzarella Bufala',
    category: 'Latticini',
    department: 'Cucina',
    conservation_point: 'Frigo 1',
    quantity: 10,
    unit: 'kg'
  }
}
```

### 4. Shopping List Operations
```typescript
// shopping_list_created
{
  activity_type: 'shopping_list_created',
  entity_type: 'shopping_list',
  entity_id: 'uuid-list-id',
  activity_data: {
    list_name: 'Lista Spesa - 10 Gen 2025',
    items_count: 15,
    total_products: 15,
    categories: ['Latticini', 'Carne', 'Verdure']
  }
}
```

---

## 🎨 UI/UX DESIGN

### 1. Shopping List CollapseCard

**Location**: Dashboard (dopo existing cards)

**Structure**:
```
📋 Lista della Spesa
├── Header
│   ├── Title: "Lista della Spesa"
│   ├── Badge: Count selected items (es. "5 selezionati")
│   └── Action Button: "Genera Lista"
├── Filters Bar
│   ├── Select: "Tutte le categorie"
│   ├── Select: "Tutti i reparti"
│   ├── Select: "Scadenza: Tutte"
│   └── Button: "Reset Filtri"
└── Products Grid
    ├── Product Card (per ogni prodotto)
    │   ├── Checkbox (select)
    │   ├── Product Name
    │   ├── Category Badge
    │   ├── Department Badge (via conservation_point)
    │   ├── Expiry Date (se presente)
    │   ├── Quantity + Unit
    │   └── Conservation Point Name
    └── Empty State (se nessun prodotto)
```

**Actions**:
1. **Select Products**: Click checkbox per selezionare
2. **Filter Products**: Usa filtri per trovare prodotti
3. **Generate List**: Click "Genera Lista" → Modal con:
   - Nome lista (default: "Lista Spesa - [Data]")
   - Note opzionali
   - Preview prodotti selezionati
   - Button "Conferma e Salva"

**Generated List View**:
- Nuova pagina `/shopping-lists`
- Lista tutte le liste generate
- Click su lista → Dettaglio con:
  - Prodotti in lista
  - Checkbox per spuntare acquistati
  - Status lista (draft/sent/completed)
  - Export PDF/Excel

---

### 2. Activity Tracking UI (Admin Only)

**Location**: New page `/admin/activity-tracking`

**Sections**:

#### A. Session Overview
```
👥 Sessioni Attive
├── Card per ogni utente attivo
│   ├── User Name + Role
│   ├── Session Start (es. "10:30 - 2h 15m fa")
│   ├── Last Activity (es. "5 minuti fa")
│   └── Badge: "Attivo" (green)
└── Total: 5 utenti attivi
```

#### B. Activity Timeline
```
📊 Timeline Attività (Oggi)
├── Filters
│   ├── Date Range
│   ├── User Select
│   ├── Activity Type
│   └── Export Button
└── Timeline Items (cronologico inverso)
    ├── Item
    │   ├── Timestamp: "14:35"
    │   ├── User: "Mario Rossi"
    │   ├── Activity: "Task Completata"
    │   ├── Details: "Rilevamento Temperature - Frigo 1"
    │   └── Icon based on type
    └── ... more items
```

#### C. Statistics Dashboard
```
📈 Statistiche (Ultima Settimana)
├── Card: Sessioni Totali (120)
├── Card: Task Completate (85)
├── Card: Prodotti Aggiunti (45)
├── Card: Liste Generate (12)
└── Chart: Activity Heatmap (giorni/ore)
```

---

## 🔄 IMPLEMENTATION FLOW

### Phase 1: Database Setup (1-2h)
1. Create `user_activity_logs` table
2. Update `user_sessions` table with new fields
3. Verify `shopping_lists` and `shopping_list_items` tables exist
4. Create indexes for performance
5. Write RLS policies for new tables
6. Create helper functions for logging

### Phase 2: Backend Services (2-3h)
1. Create `activityTrackingService.ts`:
   - `logActivity(type, data)`
   - `startSession(userId, companyId)`
   - `endSession(sessionId)`
   - `updateLastActivity(sessionId)`
   - `getActiveSessions(companyId)`
   - `getUserActivities(userId, filters)`

2. Create `shoppingListService.ts`:
   - `createShoppingList(name, items, userId, companyId)`
   - `getShoppingLists(companyId, filters)`
   - `updateShoppingList(listId, data)`
   - `deleteShoppingList(listId)`
   - `checkItem(itemId)`

3. Update existing services to log activities:
   - `maintenanceService.ts` → log task completions
   - `inventoryService.ts` → log product additions
   - `useAuth.ts` → log session start/end

### Phase 3: Frontend Components (3-4h)

#### Shopping List Components
1. `ShoppingListCard.tsx` (CollapseCard dashboard)
2. `ProductSelectGrid.tsx` (grid with checkboxes)
3. `ProductFilters.tsx` (categoria, reparto, scadenza)
4. `CreateShoppingListModal.tsx` (genera lista)
5. `ShoppingListPage.tsx` (pagina liste)
6. `ShoppingListDetail.tsx` (dettaglio lista)

#### Activity Tracking Components (Admin)
1. `ActivityTrackingPage.tsx` (main page)
2. `ActiveSessionsCard.tsx` (sessioni attive)
3. `ActivityTimelineCard.tsx` (timeline)
4. `ActivityStatsCard.tsx` (statistiche)
5. `ActivityFilters.tsx` (filtri timeline)

### Phase 4: Hooks (1-2h)
1. `useActivityTracking.ts`:
   - `useLogActivity()`
   - `useActiveSessions()`
   - `useUserActivities(filters)`

2. `useShoppingList.ts`:
   - `useCreateShoppingList()`
   - `useShoppingLists(filters)`
   - `useUpdateShoppingList()`
   - `useCheckItem()`

3. Update `useAuth.ts`:
   - Add session tracking on login
   - Add session end on logout
   - Add last_activity update

### Phase 5: Integration & Testing (2h)
1. Integrate session tracking in auth flow
2. Integrate activity logging in existing features
3. Test shopping list creation flow
4. Test activity tracking UI
5. Test RLS policies
6. Performance testing

---

## 🎯 ACCEPTANCE CRITERIA

### Shopping List Feature
- [ ] CollapseCard visible in dashboard
- [ ] All products from catalog visible
- [ ] Filters work (categoria, reparto, scadenza)
- [ ] Checkbox selection works
- [ ] Generate list modal works
- [ ] List saved to database
- [ ] List visible in `/shopping-lists` page
- [ ] Items can be checked as purchased
- [ ] Export PDF/Excel works

### Activity Tracking
- [ ] Session start logged on login
- [ ] Session end logged on logout
- [ ] Last activity updated every action
- [ ] Task completions logged with details
- [ ] Product additions logged
- [ ] Shopping list creation logged
- [ ] Admin can view active sessions
- [ ] Admin can view activity timeline
- [ ] Filters work correctly
- [ ] Export activities to CSV

### Performance
- [ ] Activity logging < 50ms overhead
- [ ] Shopping list page loads < 500ms
- [ ] Activity timeline loads < 1s
- [ ] Indexes improve query performance

### Security
- [ ] RLS policies enforce company isolation
- [ ] Only admins can view all activities
- [ ] Users can only view own activities
- [ ] Sensitive data not logged (passwords, tokens)

---

## 📊 TIMELINE ESTIMATE

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1: Database** | 1-2h | Tables, indexes, RLS, functions |
| **Phase 2: Backend** | 2-3h | Services, API integration |
| **Phase 3: Frontend** | 3-4h | Components, UI |
| **Phase 4: Hooks** | 1-2h | Custom hooks |
| **Phase 5: Testing** | 2h | Integration, testing |
| **TOTAL** | **9-13h** | Over 2-3 days |

---

## 🚧 RISKS & MITIGATION

### Risk 1: Performance Degradation
- **Mitigation**: Indexes strategici, async logging, background jobs
- **Fallback**: Partizionamento tabelle, caching

### Risk 2: Storage Growth
- **Mitigation**: Data retention policy (es. 90 giorni), archiving
- **Fallback**: Compression, cleanup jobs

### Risk 3: RLS Overhead
- **Mitigation**: Ottimizzazione query, denormalizzazione se necessario
- **Fallback**: Application-level filtering

---

## 📚 DOCUMENTATION TO UPDATE

- [ ] `SCHEMA_ATTUALE.md` - Add new tables
- [ ] `API_DOCUMENTATION.md` - Document new endpoints
- [ ] `USER_GUIDE.md` - Shopping list usage
- [ ] `ADMIN_GUIDE.md` - Activity tracking usage
- [ ] `CHANGELOG.md` - New features

---

**Planning Owner:** Claude Code
**Last Updated:** 2025-01-10
**Status:** 📋 Planning Complete - Ready for Implementation
