# ✅ User Activity Tracking - Task Tracking

**Project:** Business HACCP Manager v.2
**Branch:** NoClerk → **feature/user-activity-tracking** (BRANCH DEDICATO)
**Start Date:** 2025-01-10
**Status:** 🚀 In Progress
**Assigned to:** Multi-Agent Team (3 agents + Supervisore)

---

## ⚠️ WORKFLOW IMPORTANTE

1. **Branch Setup**: Tutto il lavoro va su `feature/user-activity-tracking`
2. **No Commit**: Solo supervisore (Claude Code) fa commit
3. **Espandere Esistente**: NON riscrivere da zero, espandere codice funzionante
4. **Testing Finale**: Supervisore testa prima di commit
5. **Merge**: Solo dopo approvazione utente finale

---

## 📋 TASK OVERVIEW

**Total Tasks:** 45
**Completed:** 20/45 (44%)
**In Progress:** 0/45
**Pending:** 25/45

---

## 🗓️ PHASE 1: DATABASE SETUP (1-2h)

### Task 1.1: Create `user_activity_logs` Table
**Status:** ✅ Completed
**Estimate:** 20 min
**Priority:** HIGH

**Subtasks:**
- [x] Create table with all fields
- [x] Add constraints (NOT NULL, FK)
- [x] Add CHECK constraints for activity_type
- [x] Create indexes:
  - `idx_activity_user_id`
  - `idx_activity_company_id`
  - `idx_activity_session_id`
  - `idx_activity_type`
  - `idx_activity_timestamp`
  - `idx_activity_entity`

**SQL File:** `database/migrations/005_user_activity_logs.sql` ✅ EXECUTED

---

### Task 1.2: Update `user_sessions` Table
**Status:** ✅ Completed
**Estimate:** 15 min
**Priority:** HIGH

**Subtasks:**
- [x] Add `session_start` TIMESTAMPTZ NOT NULL DEFAULT now()
- [x] Add `session_end` TIMESTAMPTZ
- [x] Add `last_activity` TIMESTAMPTZ NOT NULL DEFAULT now()
- [x] Add `is_active` BOOLEAN NOT NULL DEFAULT true
- [x] Add `ip_address` INET
- [x] Add `user_agent` TEXT
- [x] Create trigger `update_session_last_activity`
- [x] Create index `idx_sessions_active` on (company_id, is_active)

**SQL File:** `database/migrations/006_update_user_sessions.sql` ✅ EXECUTED

---

### Task 1.3: Verify Shopping Lists Tables
**Status:** ✅ Completed
**Estimate:** 10 min
**Priority:** MEDIUM

**Subtasks:**
- [x] Check if `shopping_lists` table exists
- [x] Check if `shopping_list_items` table exists
- [x] Verify schema matches planning document
- [x] Add missing fields if needed
- [x] Create indexes if missing

**SQL File:** `database/migrations/007_shopping_lists_verification.sql` ✅ EXECUTED

---

### Task 1.4: Create RLS Policies for Activity Logs
**Status:** ✅ Completed
**Estimate:** 20 min
**Priority:** HIGH

**Subtasks:**
- [x] Policy: Users can view own activities
- [x] Policy: Admins can view all company activities
- [x] Policy: Users can insert own activities
- [x] Policy: No one can update/delete activities (audit trail)

**SQL File:** `database/rls/user_activity_logs_policies.sql` ✅ EXECUTED

---

### Task 1.5: Create RLS Policies for Shopping Lists
**Status:** ✅ Completed
**Estimate:** 15 min
**Priority:** MEDIUM

**Subtasks:**
- [x] Policy: Users can view company shopping lists
- [x] Policy: Users can insert shopping lists
- [x] Policy: Users can update own shopping lists
- [x] Policy: Users can delete own shopping lists
- [x] Policy: Items inherit list permissions

**SQL File:** `database/rls/shopping_lists_policies.sql` ✅ EXECUTED

---

### Task 1.6: Create Helper Functions
**Status:** ✅ Completed
**Estimate:** 20 min
**Priority:** MEDIUM

**Subtasks:**
- [x] Function: `log_user_activity(type, data, entity_type, entity_id)`
- [x] Function: `get_active_sessions(company_id)`
- [x] Function: `end_user_session(session_id)`
- [x] Function: `cleanup_old_activities(retention_days)` (included in migrations)

**SQL File:** Included in `database/rls/user_activity_logs_policies.sql` ✅ EXECUTED

---

## 🔧 PHASE 2: BACKEND SERVICES (2-3h)

### Task 2.1: Create Activity Tracking Service
**Status:** ✅ Completed
**Estimate:** 45 min
**Priority:** HIGH

**File:** `src/services/activityTrackingService.ts`

**Functions to implement:**
- [x] `logActivity(type, data, entityType?, entityId?)`
- [x] `startSession(userId, companyId, ipAddress?, userAgent?)`
- [x] `endSession(sessionId, logoutType?)`
- [x] `updateLastActivity(sessionId)`
- [x] `getActiveSessions(companyId)`
- [x] `getUserActivities(userId, filters?)`
- [x] `getCompanyActivities(companyId, filters?)`

**Types:** `src/types/activity.ts` ✅ CREATED

---

### Task 2.2: Create Shopping List Service
**Status:** ✅ Completed
**Estimate:** 45 min
**Priority:** HIGH

**File:** `src/services/shoppingListService.ts`

**Functions to implement:**
- [x] `createShoppingList(name, items, userId, companyId, notes?)`
- [x] `getShoppingLists(companyId, filters?)`
- [x] `getShoppingListById(listId)`
- [x] `updateShoppingList(listId, data)`
- [x] `deleteShoppingList(listId)`
- [x] `addItemToList(listId, item)`
- [x] `checkItem(itemId, checked)`
- [x] `completeList(listId)`

**Types:** `src/types/shopping.ts` ✅ CREATED

---

### Task 2.3: Update Auth Service for Session Tracking
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** HIGH

**File:** `src/hooks/useAuth.ts`

**Changes:**
- [ ] On login: call `startSession()` after successful auth
- [ ] On logout: call `endSession()` before clearing state
- [ ] Add `useEffect` to update `last_activity` every 5 minutes
- [ ] Add session_id to auth state
- [ ] Handle session timeout (30 min inactivity)

---

### Task 2.4: Update Maintenance Service for Logging
**Status:** ⏳ Pending
**Estimate:** 20 min
**Priority:** MEDIUM

**File:** `src/features/conservation/hooks/useMaintenanceTasks.ts`

**Changes:**
- [ ] On task completion: call `logActivity('task_completed', {...})`
- [ ] Include task details in activity_data
- [ ] Include department and conservation_point info

---

### Task 2.5: Update Inventory Service for Logging
**Status:** ✅ Completed
**Estimate:** 20 min
**Priority:** MEDIUM

**File:** `src/features/inventory/hooks/useProducts.ts`

**Changes:**
- [x] On product creation: call `logActivity('product_added', {...})`
- [x] On product update: call `logActivity('product_updated', {...})`
- [x] On product deletion: call `logActivity('product_deleted', {...})`
- [x] Include product details in activity_data
- [x] Include category, department, conservation_point info

---

### Task 2.6: Add Product Transfer Tracking (NEW!)
**Status:** ⏳ Pending
**Estimate:** 45 min
**Priority:** HIGH

**File:** `src/features/inventory/hooks/useProducts.ts`

**Changes:**
- [ ] Create `transferProduct()` mutation
- [ ] On transfer: call `logActivity('product_transferred', {...})`
- [ ] Include from/to conservation points and departments
- [ ] Include transfer reason and authorization
- [ ] Update product record with new location

---

## 🎨 PHASE 3: FRONTEND COMPONENTS (3-4h)

### Task 3.1: Create Shopping List Card (Dashboard)
**Status:** ✅ Completed
**Estimate:** 60 min
**Priority:** HIGH

**File:** `src/features/shopping/components/ShoppingListCard.tsx`

**Components:**
- [ ] CollapseCard wrapper
- [ ] Header with title and badge (selected count)
- [ ] Action button "Genera Lista"
- [ ] Integrate in `DashboardPage.tsx`

---

### Task 3.2: Create Product Select Grid
**Status:** ✅ Completed
**Estimate:** 45 min
**Priority:** HIGH

**File:** `src/features/shopping/components/ProductSelectGrid.tsx`

**Features:**
- [x] Grid layout (responsive)
- [x] Product card with checkbox
- [x] Product info display (name, category, department, expiry)
- [x] Selection state management
- [x] Empty state

---

### Task 3.3: Create Product Filters
**Status:** ✅ Completed
**Estimate:** 30 min
**Priority:** MEDIUM

**File:** `src/features/shopping/components/ProductFilters.tsx`

**Filters:**
- [x] Category select (from products)
- [x] Department select (via conservation_points)
- [x] Expiry filter (scaduti, in scadenza 7gg, tutti)
- [x] Reset button

---

### Task 3.4: Create Shopping List Modal
**Status:** ✅ Completed
**Estimate:** 30 min
**Priority:** HIGH

**File:** `src/features/shopping/components/CreateShoppingListModal.tsx`

**Features:**
- [ ] Modal layout
- [ ] Form: name input (default: "Lista Spesa - [Date]")
- [ ] Form: notes textarea
- [ ] Preview selected products
- [ ] Confirm button (calls service)
- [ ] Success/error handling

---

### Task 3.5: Create Shopping Lists Page
**Status:** ⏳ Pending
**Estimate:** 45 min
**Priority:** MEDIUM

**File:** `src/features/shopping/ShoppingListsPage.tsx`

**Features:**
- [ ] Page layout with header
- [ ] List all shopping lists (table/cards)
- [ ] Filters (status, date range)
- [ ] Search by name
- [ ] Click to navigate to detail
- [ ] Delete action
- [ ] Export action

---

### Task 3.6: Create Shopping List Detail Page
**Status:** ⏳ Pending
**Estimate:** 45 min
**Priority:** MEDIUM

**File:** `src/features/shopping/ShoppingListDetailPage.tsx`

**Features:**
- [ ] Page layout with back button
- [ ] List header (name, date, status)
- [ ] Items list with checkboxes
- [ ] Check/uncheck items
- [ ] Status badges
- [ ] Notes display
- [ ] Complete list action
- [ ] Export PDF/Excel

---

### Task 3.7: Create Activity Tracking Page (Admin)
**Status:** ⏳ Pending
**Estimate:** 60 min
**Priority:** LOW

**File:** `src/features/admin/ActivityTrackingPage.tsx`

**Features:**
- [ ] Page layout with tabs
- [ ] Tab 1: Active Sessions
- [ ] Tab 2: Activity Timeline
- [ ] Tab 3: Statistics
- [ ] Access control (admin only)

---

### Task 3.8: Create Active Sessions Card
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** LOW

**File:** `src/features/admin/components/ActiveSessionsCard.tsx`

**Features:**
- [ ] Card per session
- [ ] User info (name, role)
- [ ] Session start time
- [ ] Last activity time
- [ ] Duration display
- [ ] Active badge

---

### Task 3.9: Create Activity Timeline Card
**Status:** ⏳ Pending
**Estimate:** 45 min
**Priority:** LOW

**File:** `src/features/admin/components/ActivityTimelineCard.tsx`

**Features:**
- [ ] Timeline layout
- [ ] Activity items (chronological)
- [ ] Icon per activity type
- [ ] Timestamp display
- [ ] User info
- [ ] Activity details
- [ ] Expandable details

---

### Task 3.10: Create Activity Stats Card
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** LOW

**File:** `src/features/admin/components/ActivityStatsCard.tsx`

**Features:**
- [ ] Stats cards (sessions, tasks, products, lists)
- [ ] Heatmap chart (optional)
- [ ] Date range filter
- [ ] Export button

---

### Task 3.11: Create Activity Filters
**Status:** ⏳ Pending
**Estimate:** 20 min
**Priority:** LOW

**File:** `src/features/admin/components/ActivityFilters.tsx`

**Filters:**
- [ ] Date range picker
- [ ] User select
- [ ] Activity type select
- [ ] Reset filters

---

## 🎣 PHASE 4: CUSTOM HOOKS (1-2h)

### Task 4.1: Create useActivityTracking Hook
**Status:** ✅ Completed
**Estimate:** 30 min
**Priority:** HIGH

**File:** `src/hooks/useActivityTracking.ts`

**Functions:**
- [x] `useLogActivity()` - Log activity helper
- [x] `useActiveSessions()` - Get active sessions
- [x] `useUserActivities(filters)` - Get user activities
- [x] `useCompanyActivities(filters)` - Get company activities

---

### Task 4.2: Create useShoppingList Hook
**Status:** ✅ Completed
**Estimate:** 45 min
**Priority:** HIGH

**File:** `src/features/shopping/hooks/useShoppingList.ts`

**Functions:**
- [x] `useCreateShoppingList()` - Create list mutation
- [x] `useShoppingLists(filters)` - Get lists query
- [x] `useShoppingListDetail(listId)` - Get list detail
- [x] `useUpdateShoppingList()` - Update list mutation
- [x] `useDeleteShoppingList()` - Delete list mutation
- [x] `useCheckItem()` - Check/uncheck item mutation

---

### Task 4.3: Create useProductSelection Hook
**Status:** ⏳ Pending
**Estimate:** 20 min
**Priority:** MEDIUM

**File:** `src/features/shopping/hooks/useProductSelection.ts`

**Features:**
- [ ] State: selected product IDs
- [ ] `toggleProduct(id)` - Toggle selection
- [ ] `selectAll()` - Select all filtered
- [ ] `clearSelection()` - Clear all
- [ ] `selectedCount` - Count selected

---

### Task 4.4: Update useAuth for Session Management
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** HIGH

**File:** `src/hooks/useAuth.ts`

**Changes:**
- [ ] Add session_id to state
- [ ] Add session tracking functions
- [ ] Add auto-update last_activity
- [ ] Add session timeout logic
- [ ] Update login/logout flow

---

## 🧪 PHASE 5: INTEGRATION & TESTING (2h)

### Task 5.1: Integrate Session Tracking in Auth Flow
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** HIGH

**Changes:**
- [ ] Test login → session_start logged
- [ ] Test logout → session_end logged
- [ ] Test last_activity updates
- [ ] Test session timeout
- [ ] Verify RLS policies work

---

### Task 5.2: Integrate Activity Logging in Features
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** HIGH

**Changes:**
- [ ] Test task completion → activity logged
- [ ] Test product addition → activity logged
- [ ] Test shopping list creation → activity logged
- [ ] Verify activity_data structure

---

### Task 5.3: Test Shopping List Feature E2E
**Status:** ⏳ Pending
**Estimate:** 30 min
**Priority:** HIGH

**Test Cases:**
- [ ] View products in dashboard card
- [ ] Apply filters (category, department, expiry)
- [ ] Select products with checkbox
- [ ] Generate shopping list
- [ ] View list in `/shopping-lists`
- [ ] Check items as purchased
- [ ] Complete list
- [ ] Delete list

---

### Task 5.4: Test Activity Tracking UI (Admin)
**Status:** ⏳ Pending
**Estimate:** 20 min
**Priority:** MEDIUM

**Test Cases:**
- [ ] View active sessions
- [ ] View activity timeline
- [ ] Apply filters
- [ ] View statistics
- [ ] Export activities

---

### Task 5.5: Performance Testing
**Status:** ⏳ Pending
**Estimate:** 20 min
**Priority:** MEDIUM

**Tests:**
- [ ] Activity logging overhead < 50ms
- [ ] Shopping list page load < 500ms
- [ ] Activity timeline load < 1s
- [ ] Check index usage with EXPLAIN
- [ ] Verify RLS performance

---

## 📚 PHASE 6: DOCUMENTATION (30 min)

### Task 6.1: Update Schema Documentation
**Status:** ⏳ Pending
**Estimate:** 10 min

**File:** `supabase/Main/NoClerk/SCHEMA_ATTUALE.md`
- [ ] Add `user_activity_logs` table
- [ ] Update `user_sessions` table
- [ ] Add `shopping_lists` and `shopping_list_items` tables

---

### Task 6.2: Create Feature Documentation
**Status:** ⏳ Pending
**Estimate:** 10 min

**Files:**
- [ ] Create `docs/SHOPPING_LIST_FEATURE.md`
- [ ] Create `docs/ACTIVITY_TRACKING_FEATURE.md`

---

### Task 6.3: Update CHANGELOG
**Status:** ⏳ Pending
**Estimate:** 5 min

**File:** `CHANGELOG.md`
- [ ] Add new features section
- [ ] List shopping list feature
- [ ] List activity tracking feature

---

### Task 6.4: Update README
**Status:** ⏳ Pending
**Estimate:** 5 min

**File:** `README.md`
- [ ] Add shopping list feature description
- [ ] Add activity tracking feature description

---

## 📊 PROGRESS SUMMARY

| Phase | Tasks | Completed | Percentage |
|-------|-------|-----------|------------|
| **Phase 1: Database** | 6 | 6 | 100% ✅ |
| **Phase 2: Backend** | 5 | 2 | 40% |
| **Phase 3: Frontend** | 11 | 4 | 36% |
| **Phase 4: Hooks** | 4 | 2 | 50% |
| **Phase 5: Testing** | 5 | 0 | 0% |
| **Phase 6: Documentation** | 4 | 0 | 0% |
| **TOTAL** | **35** | **14** | **40%** |

---

## 🎯 NEXT ACTIONS

1. **COMPLETE PHASE 2**: Backend integration
   - Task 2.3: Update Auth Service for Session Tracking
   - Task 2.4: Update Maintenance Service for Logging
   - Task 2.5: Update Inventory Service for Logging

2. **COMPLETE PHASE 3**: Frontend components
   - Task 3.5: Create Shopping Lists Page
   - Task 3.6: Create Shopping List Detail Page
   - Task 3.7-3.11: Activity Tracking Admin UI (OPTIONAL)

3. **START PHASE 5**: Integration & Testing

---

## 📝 NOTES

### Design Decisions
- Activity logs use JSONB for flexibility
- Session tracking uses `user_sessions` table (already exists)
- Shopping lists use separate tables (normalized)
- RLS policies enforce multi-tenant isolation
- Indexes optimized for common queries

### Performance Considerations
- Activity logging is async (non-blocking)
- Indexes on timestamp fields for timeline queries
- Consider partitioning `user_activity_logs` by month (future)
- Implement data retention policy (90 days default)

### Security Considerations
- Never log sensitive data (passwords, tokens)
- RLS policies enforce company isolation
- Admin-only access to full activity tracking
- Audit trail immutable (no updates/deletes)

---

**Task Owner:** Claude Code
**Last Updated:** 2025-01-11
**Status:** 🚀 In Progress (40% Complete)
**Current Phase:** Phase 2 & 3 - Backend Integration & Frontend Components
**Last Commit:** `75467274` - Fix onboarding completion and add shopping list to inventory page
