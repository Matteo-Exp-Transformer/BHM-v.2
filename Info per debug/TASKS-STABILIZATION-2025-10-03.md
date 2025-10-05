# ✅ HACCP Business Manager - TASKS ATOMICHE STABILIZATION

**Version:** 1.0
**Date:** 3 Ottobre 2025
**Execution:** Dual Agent Parallel (GPT Codex in Cursor IDE)
**Mode:** Micro-tasks, No additions, Bug fix only

---

## 🎯 **TASK EXECUTION PRINCIPLES**

### **Rules for GPT Codex Agents**

**✅ DO:**
- Fix bugs exactly as described
- Write tests for every fix
- Follow existing code patterns
- Document complex changes
- Validate before marking complete

**❌ DON'T:**
- Add new features
- Refactor unrelated code
- Change architecture
- Add unnecessary comments
- Skip testing

### **Task States**

```
📋 TODO      → Task ready to start
🔄 IN PROGRESS → Currently being worked on
✅ DONE      → Completed and validated
⚠️ BLOCKED   → Waiting for dependency
🔴 FAILED    → Needs re-attempt
```

---

## 📊 **TASK OVERVIEW**

```
AGENT A (Architecture Lead)       AGENT B (UI/Quality Support)
├── 12 tasks                       ├── 11 tasks
├── ~25-30h estimated              ├── ~20-25h estimated
└── Critical path focus            └── UI/UX focus

Total: 23 atomic tasks
Estimated: 45-55h total (22-28h parallel)
Target: 2-3 weeks with parallel execution
```

---

## 🔥 **AGENT A TASKS (Critical & Architecture)**

### **WEEK 1: Critical Bugs**

#### **A1: Fix React Import Error in ConservationStats**
```
ID:       A1
Priority: P0 (Critical)
Status:   📋 TODO
Time:     30min
Deps:     None
Agent:    A

Description:
Add missing React import causing "React is not defined" error

Files:
- src/features/conservation/ConservationStats.tsx

Steps:
1. Open src/features/conservation/ConservationStats.tsx
2. Line 1, add: import React from 'react'
3. Run: npm run type-check
4. Run: npm run lint
5. Verify component renders without error

Validation:
[ ] TypeScript check passes
[ ] ESLint passes
[ ] Component renders
[ ] No console errors

Exit Criteria:
- Zero TypeScript errors
- Component visible on /conservation page
```

---

#### **A2: Diagnose Conservation Page Crash**
```
ID:       A2
Priority: P0 (Critical)
Status:   📋 TODO
Time:     2-3h
Deps:     A1
Agent:    A

Description:
Identify root cause of Conservation tab crash/not loading

Files:
- src/features/conservation/ConservationPage.tsx
- src/features/conservation/hooks/*
- src/features/conservation/components/*

Steps:
1. npm run dev
2. Navigate to /conservation
3. Open browser DevTools console
4. Open React DevTools
5. Document exact error stacktrace
6. Check network tab for failed API calls
7. Verify Supabase data exists:
   - conservation_points table
   - temperature_readings table
   - maintenance_tasks table
8. Check hooks dependencies
9. Identify specific line/component causing crash

Deliverable:
Create file: docs/debug/conservation-crash-diagnosis.md
With:
- Exact error message
- Stacktrace
- Failed requests (if any)
- Suspected cause
- Proposed fix approach

Validation:
[ ] Error identified
[ ] Root cause documented
[ ] Fix approach proposed
[ ] Reviewed and approved

Exit Criteria:
- Clear understanding of crash cause
- Actionable fix plan documented
```

---

#### **A3: Fix Conservation Page Crash**
```
ID:       A3
Priority: P0 (Critical)
Status:   📋 TODO
Time:     2-3h
Deps:     A2
Agent:    A

Description:
Implement fix for Conservation page based on A2 diagnosis

Files:
- (Determined in A2)

Steps:
1. Implement fix from A2 diagnosis
2. Run npm run type-check
3. Run npm run lint
4. Test manually:
   - Navigate to /conservation
   - Verify page loads
   - Verify data visible
   - Test all interactions
5. Write unit tests for fixed component
6. Run npm run test

Validation:
[ ] Page loads without crash
[ ] All data visible
[ ] No console errors
[ ] Tests written and passing
[ ] TypeScript clean
[ ] ESLint clean

Exit Criteria:
- Conservation page 100% functional
- All CRUD operations work
- Tests cover fix
```

---

#### **A4: Verify Conservation Hooks**
```
ID:       A4
Priority: P0 (Critical)
Status:   📋 TODO
Time:     2h
Deps:     A3
Agent:    A

Description:
Verify all conservation hooks return correct data and handle errors

Files:
- src/features/conservation/hooks/useConservationPoints.ts
- src/features/conservation/hooks/useTemperatureReadings.ts
- src/features/conservation/hooks/useMaintenanceTasks.ts

Steps:
For each hook:
1. Review code for:
   - Correct React Query setup
   - Proper error handling
   - Correct return types
   - No stale closures
   - Dependency arrays correct
2. Add console.log to verify data flow
3. Test loading states
4. Test error states
5. Write unit tests if missing

Validation:
[ ] All hooks return correct data
[ ] Loading states work
[ ] Error states handled
[ ] No infinite loops
[ ] TypeScript types correct
[ ] Unit tests pass

Exit Criteria:
- All conservation hooks 100% reliable
- Tests cover happy path + errors
```

---

#### **A5: Diagnose Categories System**
```
ID:       A5
Priority: P0 (Critical)
Status:   📋 TODO
Time:     1-2h
Deps:     None
Agent:    A

Description:
Investigate why product categories system is not working

Files:
- src/features/inventory/hooks/useCategories.ts
- src/features/inventory/components/AddCategoryModal.tsx
- src/features/inventory/components/CategoryFilter.tsx
- src/features/inventory/InventoryPage.tsx

Steps:
1. npm run dev
2. Navigate to /inventory
3. Check if "Add Category" button exists in UI
4. Open browser Network tab
5. Check for category API calls
6. Verify database:
   ```sql
   SELECT * FROM product_categories;
   SELECT * FROM pg_policies WHERE tablename = 'product_categories';
   ```
7. Check useCategories hook is called
8. Document findings

Deliverable:
Create file: docs/debug/categories-diagnosis.md
With:
- UI state (button visible?)
- Hook called? (React DevTools)
- API calls made? (Network tab)
- Database state
- RLS policies correct?
- Identified issue

Validation:
[ ] Issue identified
[ ] Root cause clear
[ ] Fix approach defined

Exit Criteria:
- Clear understanding why categories not working
- Fix plan documented
```

---

#### **A6: Implement Categories UI**
```
ID:       A6
Priority: P0 (Critical)
Status:   📋 TODO
Time:     2h
Deps:     A5
Agent:    A

Description:
Add missing UI elements for categories management

Files:
- src/features/inventory/InventoryPage.tsx
- src/features/inventory/components/AddCategoryModal.tsx

Steps:
1. Add "Add Category" button to InventoryPage header:
   ```tsx
   <button
     onClick={() => setShowAddCategoryModal(true)}
     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
   >
     <Plus className="w-4 h-4" />
     Nuova Categoria
   </button>
   ```

2. Add AddCategoryModal to page:
   ```tsx
   <AddCategoryModal
     isOpen={showAddCategoryModal}
     onClose={() => {
       setShowAddCategoryModal(false)
       setEditingCategory(null)
     }}
     onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
     category={editingCategory}
   />
   ```

3. Verify modal state management
4. Test modal opens/closes
5. Add Categories section with CollapsibleCard
6. Test full flow

Validation:
[ ] Button visible
[ ] Modal opens
[ ] Modal closes
[ ] State managed correctly
[ ] No console errors

Exit Criteria:
- UI for categories fully functional
- Ready for hook integration
```

---

#### **A7: Fix useCategories Hook**
```
ID:       A7
Priority: P0 (Critical)
Status:   📋 TODO
Time:     1-2h
Deps:     A6
Agent:    A

Description:
Ensure useCategories hook loads and manages categories correctly

Files:
- src/features/inventory/hooks/useCategories.ts

Steps:
1. Review hook implementation
2. Verify React Query setup:
   ```ts
   const { data: categories } = useQuery({
     queryKey: ['categories', companyId],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('product_categories')
         .select('*')
         .eq('company_id', companyId)
       if (error) throw error
       return data
     }
   })
   ```
3. Add error handling
4. Verify mutations (create/update/delete)
5. Test with API calls
6. Write unit tests

Validation:
[ ] Hook loads categories
[ ] Create mutation works
[ ] Update mutation works
[ ] Delete mutation works
[ ] Error handling present
[ ] Tests pass

Exit Criteria:
- useCategories hook 100% functional
- All CRUD operations work
```

---

#### **A8: Verify Database & RLS for Categories**
```
ID:       A8
Priority: P0 (Critical)
Status:   📋 TODO
Time:     1h
Deps:     A7
Agent:    A

Description:
Ensure database schema and RLS policies correct for categories

Steps:
1. Connect to Supabase SQL editor
2. Verify table exists:
   ```sql
   SELECT * FROM product_categories LIMIT 5;
   ```
3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'product_categories';
   ```
4. Ensure policy allows:
   - SELECT for company_id match
   - INSERT for company_id match
   - UPDATE for company_id match
   - DELETE for company_id match
5. Test with real data
6. Document any issues

Deliverable:
If issues found, create migration file:
database/migrations/fix-categories-rls.sql

Validation:
[ ] Table exists
[ ] RLS policies correct
[ ] Can read categories
[ ] Can create categories
[ ] Can update categories
[ ] Can delete categories

Exit Criteria:
- Database 100% ready for categories
- RLS secure and functional
```

---

#### **A9: Fix React Hook Error in CreateListModal**
```
ID:       A9
Priority: P1 (High)
Status:   📋 TODO
Time:     1-2h
Deps:     None
Agent:    A

Description:
Fix hook called inside callback (React rules violation)

Files:
- src/features/inventory/components/CreateListModal.tsx

Steps:
1. Find line 191 with hook in callback
2. Move hook call to component top level:
   ```tsx
   // BEFORE (WRONG):
   const handleSubmit = () => {
     const data = useTemplate() // ❌
   }

   // AFTER (CORRECT):
   const CreateListModal = () => {
     const templateData = useTemplate() // ✅

     const handleSubmit = () => {
       // use templateData
     }
   }
   ```
3. Verify functionality unchanged
4. Run eslint
5. Test modal

Validation:
[ ] Hook at top level
[ ] ESLint hook warning gone
[ ] Functionality works same
[ ] No runtime errors

Exit Criteria:
- React hooks rules followed
- ESLint clean
```

---

#### **A10: Verify Calendar Sync**
```
ID:       A10
Priority: P1 (High)
Status:   📋 TODO
Time:     2-3h
Deps:     A3, A4 (Conservation working)
Agent:    A

Description:
Test and fix calendar synchronization with tasks/maintenance

Files:
- src/features/calendar/hooks/useCalendarEvents.ts
- src/features/calendar/utils/eventTransform.ts

Steps:
1. Create task in Tasks page
2. Navigate to Calendar
3. Verify task appears
4. Create maintenance in Conservation
5. Navigate to Calendar
6. Verify maintenance appears
7. Create event directly in Calendar
8. Verify saved to database
9. Edit calendar event
10. Verify update persists
11. Delete event
12. Verify deletion works

If issues found:
- Debug eventTransform logic
- Check React Query cache invalidation
- Verify real-time subscriptions
- Fix data transformation

Validation:
[ ] Tasks sync to calendar
[ ] Maintenance sync to calendar
[ ] Calendar events save
[ ] Updates persist
[ ] Deletes work
[ ] No duplicates
[ ] Filters work

Exit Criteria:
- Calendar 100% synced with all sources
- Real-time updates working
```

---

#### **A11: Cleanup Unused Variables (Batch)**
```
ID:       A11
Priority: P2 (Medium)
Status:   📋 TODO
Time:     3-4h
Deps:     None
Agent:    A

Description:
Remove or fix 60+ unused variable TypeScript errors

Files:
- src/services/automation/*
- src/services/deployment/*
- src/services/dashboard/MultiTenantDashboard.ts

Strategy:
For each unused variable:
1. Check if actually needed for logic
2. If yes: Use it
3. If no: Remove it
4. If intentional: Add eslint-disable comment

Special fixes needed:
- MultiTenantDashboard.ts:257 → Fix type error max_locations
- MultiTenantDashboard.ts:261 → Fix type error advanced_analytics

Process:
```bash
# Get list
npm run type-check 2>&1 | grep "is declared but"

# Fix file by file
# Run type-check after each file
# Commit per file for easy rollback
```

Validation:
[ ] TypeScript unused errors: 60+ → 0
[ ] No functionality broken
[ ] Type errors fixed
[ ] Code cleaner

Exit Criteria:
- Zero unused variable errors
- All type errors resolved
```

---

#### **A12: Verify Management & Dashboard**
```
ID:       A12
Priority: P3 (Low)
Status:   📋 TODO
Time:     2h
Deps:     None
Agent:    A

Description:
Manual testing of Management and Dashboard pages

Test Scenarios:

Management:
1. View staff list
2. Add staff member (all fields)
3. Edit staff member
4. Delete staff member
5. View departments
6. Add department
7. Edit department
8. Delete department
9. Assign staff to department
10. Verify role assignment

Dashboard:
1. Verify KPI cards show correct data
2. Verify compliance score calculation
3. Verify recent activity list
4. Test quick actions
5. Verify all charts load
6. Verify data matches database

Document any issues found in:
docs/debug/management-dashboard-issues.md

Validation:
[ ] All Management CRUD works
[ ] All Dashboard data correct
[ ] No UI bugs
[ ] Performance acceptable

Exit Criteria:
- Management page 100% functional
- Dashboard page 100% accurate
```

---

## 🎨 **AGENT B TASKS (UI/UX & Quality)**

### **WEEK 1: UI Bugs**

#### **B1: Fix CollapsibleCard Empty State in Inventory**
```
ID:       B1
Priority: P1 (High)
Status:   📋 TODO
Time:     2-3h
Deps:     None
Agent:    B

Description:
Fix CollapsibleCard components showing empty content in Inventory

Files:
- src/features/inventory/InventoryPage.tsx
- src/components/ui/CollapsibleCard.tsx

Steps:
1. Open /inventory in browser
2. Identify which cards are empty
3. Check data is loaded (React DevTools)
4. Review CollapsibleCard props
5. Standardize pattern:
   ```tsx
   <CollapsibleCard
     title="Prodotti"
     icon={Package}
     defaultOpen={true}
     isEmpty={products.length === 0}
     emptyMessage="Nessun prodotto. Clicca + per aggiungere."
   >
     {products.map(product => (
       <ProductCard key={product.id} product={product} />
     ))}
   </CollapsibleCard>
   ```
6. Apply to all cards:
   - Products
   - Categories (when fixed by Agent A)
   - Shopping Lists
   - Expired Products

Validation:
[ ] No empty cards without reason
[ ] Empty states show helpful message
[ ] Data renders when present
[ ] Loading states work

Exit Criteria:
- All CollapsibleCard in Inventory show correct content or helpful empty state
```

---

#### **B2: Fix CollapsibleCard Empty State in Settings**
```
ID:       B2
Priority: P1 (High)
Status:   📋 TODO
Time:     2h
Deps:     B1 (reuse pattern)
Agent:    B

Description:
Apply same CollapsibleCard fix to Settings page

Files:
- src/features/settings/SettingsPage.tsx
- src/features/settings/components/*

Steps:
1. Audit all CollapsibleCard usage in Settings
2. Apply same pattern as B1
3. Test all settings sections:
   - Company Settings
   - HACCP Settings
   - Notification Preferences
   - User Management

Validation:
[ ] All cards show content or empty state
[ ] Pattern consistent with Inventory
[ ] No UI bugs

Exit Criteria:
- Settings page CollapsibleCard all working
```

---

#### **B3: Audit Responsive Layout**
```
ID:       B3
Priority: P1 (High)
Status:   📋 TODO
Time:     2h
Deps:     None
Agent:    B

Description:
Test all pages on mobile/tablet/desktop and document issues

Test Devices:
- Mobile: 375px (iPhone SE)
- Mobile: 414px (iPhone Pro Max)
- Tablet: 768px (iPad)
- Tablet: 1024px (iPad Pro)
- Desktop: 1920px

Pages to Test:
1. /login
2. /onboarding (all steps)
3. /conservation
4. /inventory
5. /calendar
6. /management
7. /settings
8. /dashboard

For each page check:
- [ ] No horizontal scroll
- [ ] All content visible
- [ ] Buttons reachable (44px min)
- [ ] Forms usable
- [ ] Modals fit screen
- [ ] Navigation works

Deliverable:
Create file: docs/debug/responsive-issues.md
List all layout bugs found with:
- Page
- Breakpoint
- Issue description
- Screenshot (if possible)

Validation:
[ ] All pages tested
[ ] Issues documented
[ ] Priority assigned to each

Exit Criteria:
- Complete audit done
- Issues list ready for fixing
```

---

#### **B4: Fix Responsive Layout Issues**
```
ID:       B4
Priority: P1 (High)
Status:   📋 TODO
Time:     3-4h
Deps:     B3
Agent:    B

Description:
Fix all responsive layout issues found in B3

Strategy:
- Use Tailwind responsive classes
- Follow mobile-first approach
- Standard pattern:
  ```tsx
  <div className="
    grid
    grid-cols-1        /* Mobile */
    md:grid-cols-2     /* Tablet */
    lg:grid-cols-3     /* Desktop */
    gap-4
  ">
  ```

Fix by priority:
1. Critical (blocking usage)
2. High (poor UX)
3. Medium (minor issues)

For each fix:
- Make change
- Test on all breakpoints
- Take screenshot before/after
- Document in git commit

Validation:
[ ] All critical issues fixed
[ ] All high issues fixed
[ ] Medium issues fixed if time allows
[ ] Tested on all breakpoints

Exit Criteria:
- App responsive on all device sizes
- No blocking layout bugs
```

---

#### **B5: Fix CollapsibleCard Component**
```
ID:       B5
Priority: P1 (High)
Status:   📋 TODO
Time:     2h
Deps:     B1, B2
Agent:    B

Description:
Improve CollapsibleCard component to handle all edge cases

Files:
- src/components/ui/CollapsibleCard.tsx

Improvements:
1. Better empty state handling
2. Loading state
3. Error state
4. Responsive padding/spacing
5. Consistent animations

Code:
```tsx
interface CollapsibleCardProps {
  title: string
  icon?: React.ComponentType
  children: React.ReactNode
  defaultOpen?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  isLoading?: boolean
  error?: string
  className?: string
}

export function CollapsibleCard({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  isEmpty = false,
  emptyMessage = 'Nessun dato disponibile',
  isLoading = false,
  error,
  className
}: CollapsibleCardProps) {
  // Implementation with all states handled
}
```

Validation:
[ ] Empty state works
[ ] Loading state works
[ ] Error state works
[ ] Responsive
[ ] Accessible
[ ] Used consistently

Exit Criteria:
- CollapsibleCard component robust and reusable
- All edge cases handled
```

---

#### **B6: Fix ExcelExporter Tests**
```
ID:       B6
Priority: P2 (Medium)
Status:   📋 TODO
Time:     2-3h
Deps:     None
Agent:    B

Description:
Fix 10+ TypeScript errors in ExcelExporter test file

Files:
- src/services/export/__tests__/ExcelExporter.test.ts

Issues to Fix:
1. Spread argument errors (lines 19-30)
2. Property 'at' not exist (lines 144, 182)
3. Property 'mock' not exist (lines 147, 202, 245, 287)
4. Implicit 'any' types (lines 147, 203, 245, 287)
5. Argument type errors (lines 179, 243)

Fixes:
1. Update tsconfig lib to include ES2022:
   ```json
   "lib": ["ES2022", "DOM", "DOM.Iterable"]
   ```
2. Proper mock typing:
   ```ts
   const mockJson2Sheet = vi.fn() as Mock<[any[]], WorkSheet>
   ```
3. Fix type unions:
   ```ts
   tables: ['departments', 'staff'] as const
   ```

Validation:
[ ] All TypeScript errors fixed
[ ] Tests run: npx vitest run src/services/export/__tests__/ExcelExporter.test.ts
[ ] All tests pass
[ ] No warnings

Exit Criteria:
- ExcelExporter tests 100% passing
- Zero TypeScript errors in tests
```

---

#### **B7: Replace Explicit 'any' Types (Batch)**
```
ID:       B7
Priority: P2 (Medium)
Status:   📋 TODO
Time:     2-3h
Deps:     None
Agent:    B

Description:
Replace ~20 explicit 'any' types with proper types

Priority Files (from ESLint):
1. src/components/ProtectedRoute.tsx (lines 266, 269, 278, 281)
2. src/features/calendar/* (multiple)
3. src/features/conservation/* (multiple)
4. src/features/inventory/* (multiple)

Strategy:
```ts
// BEFORE:
const handleChange = (e: any) => {}

// AFTER:
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}

// Or unknown if truly unknown:
const handleData = (data: unknown) => {
  if (isValidData(data)) {
    // use data with type guard
  }
}
```

Process:
1. grep -r ": any" src/ --include="*.ts*" | grep -v eslint-disable
2. Fix high-priority files first
3. Run type-check after each file
4. Document if any must remain

Validation:
[ ] Explicit any types: 20+ → < 5
[ ] TypeScript check passes
[ ] No functionality broken
[ ] Remaining 'any' documented

Exit Criteria:
- < 5 total explicit 'any' types
- All with justification comment
```

---

#### **B8: Fix exhaustive-deps Warnings**
```
ID:       B8
Priority: P2 (Medium)
Status:   📋 TODO
Time:     1-2h
Deps:     None
Agent:    B

Description:
Fix React hooks exhaustive-deps ESLint warnings

Files:
- src/components/onboarding-steps/BusinessInfoStep.tsx
- src/components/onboarding-steps/DepartmentsStep.tsx

Fix Pattern:
```tsx
// BEFORE:
const formData = { ...data }
useEffect(() => {
  // uses formData
}, [formData]) // ⚠️ formData changes every render

// AFTER:
const formData = useMemo(() => ({ ...data }), [data])
useEffect(() => {
  // uses formData
}, [formData]) // ✅ Stable reference
```

Validation:
[ ] Warnings fixed
[ ] useEffect dependencies correct
[ ] No infinite loops
[ ] Functionality unchanged

Exit Criteria:
- Zero exhaustive-deps warnings
- Hooks dependency arrays correct
```

---

#### **B9: Fix react-refresh Warnings**
```
ID:       B9
Priority: P2 (Medium)
Status:   📋 TODO
Time:     1h
Deps:     None
Agent:    B

Description:
Fix react-refresh "only exports components" warnings

Files:
- src/components/ProtectedRoute.tsx (lines 265, 277)
- src/components/ui/Badge.tsx (line 52)

Solutions:
1. Move non-component exports to separate util file
2. Or add: // eslint-disable-next-line react-refresh/only-export-components

Example:
```tsx
// BEFORE (single file):
export const utilFunction = () => {}
export default Component

// AFTER (split files):
// utils.ts
export const utilFunction = () => {}

// Component.tsx
import { utilFunction } from './utils'
export default Component
```

Validation:
[ ] Warnings fixed
[ ] Fast refresh works
[ ] No functionality broken

Exit Criteria:
- Zero react-refresh warnings
- HMR working correctly
```

---

#### **B10: Final ESLint Cleanup**
```
ID:       B10
Priority: P2 (Medium)
Status:   📋 TODO
Time:     1h
Deps:     B7, B8, B9
Agent:    B

Description:
Final pass to get ESLint warnings < 5 total

Steps:
1. Run: npm run lint
2. Review all remaining warnings
3. Fix what can be fixed
4. Document why others must remain
5. Ensure < 5 total warnings

Acceptable remaining warnings:
- Intentional 'any' with comment
- Third-party library issues
- Edge cases requiring exception

Create file: docs/eslint-exceptions.md
Document each exception with justification

Validation:
[ ] Total warnings < 5
[ ] All exceptions documented
[ ] No critical warnings

Exit Criteria:
- ESLint warnings: 40+ → < 5
- Clean codebase
```

---

#### **B11: Component Testing Suite**
```
ID:       B11
Priority: P2 (Medium)
Status:   📋 TODO
Time:     3-4h
Deps:     All UI fixes complete
Agent:    B

Description:
Write comprehensive component tests

Priority Components:
1. CollapsibleCard
2. ProductCard
3. ConservationPointCard
4. MaintenanceTaskCard
5. AddProductModal
6. AddCategoryModal

Test Template:
```ts
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

describe('ComponentName', () => {
  it('renders correctly', () => {})
  it('handles empty state', () => {})
  it('handles loading state', () => {})
  it('handles error state', () => {})
  it('handles user interaction', () => {})
  it('calls callbacks correctly', () => {})
})
```

Validation:
[ ] All priority components tested
[ ] Tests pass
[ ] Coverage > 80% for tested components

Exit Criteria:
- Comprehensive test suite for UI components
- Tests all pass
- Good coverage
```

---

## 📊 **TASK DEPENDENCIES GRAPH**

```
AGENT A:                                   AGENT B:

A1 (30min) ──┐                            B1 (2-3h) ──┐
             │                                         │
A2 (2-3h) ───┼─> A3 (2-3h) ──> A4 (2h)               │
             │                      │                 │
A5 (1-2h) ───┼─> A6 (2h) ──> A7 (1-2h) ──> A8 (1h)  │
             │                                        │
A9 (1-2h) ───┤                                       ├─> B2 (2h)
             │                                        │
A10 (2-3h) ──┤  (depends on A3,A4)                  B3 (2h) ──> B4 (3-4h)
             │                                        │
A11 (3-4h) ──┤                                       B5 (2h)
             │                                        │
A12 (2h) ────┘                                       B6 (2-3h)
                                                      │
                                                     B7 (2-3h)
                                                      │
                                                     B8 (1-2h) ──┐
                                                      │          │
                                                     B9 (1h) ────┼─> B10 (1h)
                                                      │          │
                                                     B11 (3-4h) ─┘

SYNC POINTS:
═══════════════════════════════════════════════════════════
SYNC 1: After A3, A4, A8 + B1, B2, B4, B5
        → Test full app functionality
═══════════════════════════════════════════════════════════
SYNC 2: After A11 + B10
        → Verify zero TypeScript/ESLint errors
═══════════════════════════════════════════════════════════
SYNC 3: After ALL tasks
        → Final validation & testing
═══════════════════════════════════════════════════════════
```

---

## ✅ **COMPLETION CHECKLIST**

### **Per Task Completion**

Before marking task as ✅ DONE:
- [ ] Code implemented
- [ ] TypeScript check passes
- [ ] ESLint check passes
- [ ] Unit tests written (if applicable)
- [ ] Unit tests pass
- [ ] Manual testing done
- [ ] No console errors/warnings
- [ ] Git commit with clear message
- [ ] Task documented in standup

### **Sync Point Validation**

**SYNC 1 Checklist:**
- [ ] Conservation page 100% working
- [ ] Categories system 100% working
- [ ] All CollapsibleCard fixed
- [ ] Layout responsive
- [ ] Manual test all pages OK

**SYNC 2 Checklist:**
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: < 5
- [ ] Build succeeds
- [ ] No unused variables

**SYNC 3 Checklist:**
- [ ] All 23 tasks completed
- [ ] All tests pass
- [ ] Full app manual test OK
- [ ] Ready for production testing

---

## 🚀 **EXECUTION WORKFLOW**

### **Daily Workflow per Agent**

**Morning:**
1. Review task status
2. Pick next TODO task
3. Update status to IN PROGRESS
4. Create feature branch: `fix/[task-id]-[description]`
5. Start work

**During Work:**
1. Follow task steps exactly
2. Test incrementally
3. Commit frequently
4. Document issues found

**End of Day:**
1. Complete validation checklist
2. Mark task DONE or document blockers
3. Push branch
4. Update standup doc
5. Plan next day tasks

### **Sync Point Workflow**

When sync point reached:
1. Both agents stop new tasks
2. Pull latest from both branches
3. Merge branches to integration branch
4. Run full test suite
5. Manual test entire app
6. Document any integration issues
7. Fix issues together
8. Continue to next phase

---

**Document Control:**
- **Created:** 3 Ottobre 2025
- **Status:** Active Task List
- **Execution:** GPT Codex (Cursor IDE)
- **Update:** Daily during execution

---

_Queste sono task atomiche eseguibili indipendentemente con validation checklists chiare. Ogni task è un micro-fix senza feature additions._
