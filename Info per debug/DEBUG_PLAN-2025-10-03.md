# 🐛 HACCP Business Manager - DEBUG PLAN COMPLETO

**Version:** 1.0
**Date:** 3 Ottobre 2025
**Phase:** Stabilization - Bug Resolution
**Agents:** Multi-Agent Parallel Execution (GPT Codex in Cursor IDE)

---

## 🎯 **OBIETTIVO**

**Portare l'applicazione da ~70% funzionante a 100% stabile e testata.**

Questo piano organizza tutto il lavoro di debug in task atomiche eseguibili in parallelo da 2 agenti, con checkpoint di sincronizzazione e test di validazione continui.

---

## 📊 **BUG INVENTORY - COMPLETO**

### **🔥 CRITICAL (3) - App Bloccata**

| ID   | Bug                                      | Impatto | Files Coinvolti                                                                      | Estimated Time |
| ---- | ---------------------------------------- | ------- | ------------------------------------------------------------------------------------ | -------------- |
| C001 | Tab Conservazione non si carica/crasha   | BLOCCO  | ConservationPage.tsx, ConservationStats.tsx, hooks/useConservation\*.ts              | 4-6h           |
| C002 | Categorie prodotti completamente mancant | BLOCCO  | useCategories.ts, AddCategoryModal.tsx, CategoryFilter.tsx, InventoryPage.tsx       | 3-4h           |
| C003 | React 'not defined' error                | ERROR   | ConservationStats.tsx:25                                                             | 30min          |

### **⚠️ HIGH (5) - Funzionalità Compromesse**

| ID   | Bug                                   | Impatto    | Files Coinvolti                                    | Estimated Time |
| ---- | ------------------------------------- | ---------- | -------------------------------------------------- | -------------- |
| H001 | CollapsibleCard vuote in Inventory    | UX Rotta   | InventoryPage.tsx, ProductCard.tsx                 | 2-3h           |
| H002 | CollapsibleCard vuote in Settings     | UX Rotta   | SettingsPage.tsx, vari components                  | 2-3h           |
| H003 | Bug layout generale responsive        | UX         | Tutti i pages, CollapsibleCard.tsx                 | 3-4h           |
| H004 | React Hook error in CreateListModal   | BLOCCO FX  | CreateListModal.tsx:191 (useTemplate in callback)  | 1-2h           |
| H005 | Possibili bug Calendar sync           | DATI       | CalendarPage.tsx, hooks/useCalendarEvents.ts       | 2-3h           |

### **📋 MEDIUM (4) - TypeScript & Code Quality**

| ID   | Bug                                      | Impatto       | Files Coinvolti                                                        | Estimated Time |
| ---- | ---------------------------------------- | ------------- | ---------------------------------------------------------------------- | -------------- |
| M001 | 60+ variabili unused                     | Build Warning | automation/\*, deployment/\*, multi-tenant/\*                          | 3-4h           |
| M002 | 10+ errori test ExcelExporter            | Test Fail     | export/__tests__/ExcelExporter.test.ts                                 | 2-3h           |
| M003 | 20+ explicit `any` types                 | Type Safety   | Vari file (calendar, conservation, inventory)                          | 2-3h           |
| M004 | 40+ ESLint warnings                      | Code Quality  | Vari file (exhaustive-deps, react-refresh)                             | 2-3h           |

### **🔍 LOW (2) - Da Verificare**

| ID   | Bug                                      | Impatto    | Files Coinvolti                | Estimated Time |
| ---- | ---------------------------------------- | ---------- | ------------------------------ | -------------- |
| L001 | Management tab funzionalità incomplete?  | Unknown    | ManagementPage.tsx + components | 1-2h           |
| L002 | Dashboard dati potenzialmente incorretti | Dati       | DashboardPage.tsx + hooks      | 1-2h           |

---

## 🔄 **STRATEGIA DI RISOLUZIONE**

### **Approccio Multi-Agente Parallelo**

```
AGENT A (Architecture & Critical)     AGENT B (UI/UX & Quality)
├── Focus: Critical bugs               ├── Focus: UI bugs & warnings
├── TypeScript errors                  ├── Layout & responsive
├── React hooks issues                 ├── CollapsibleCard issues
├── Data flow problems                 ├── ESLint cleanup
└── Integration testing                └── Component testing

═══════════════ SYNC POINT 1 ═══════════════
After C001, C002, C003 resolved

═══════════════ SYNC POINT 2 ═══════════════
After H001-H005 resolved

═══════════════ SYNC POINT 3 ═══════════════
After M001-M004 resolved

═══════════════ FINAL SYNC ═══════════════
Complete testing & validation
```

### **Work Division Principles**

**AGENT A** (Lead - Complex):
- Critical path bugs
- Architecture changes
- Type system fixes
- Hook dependency issues
- Integration problems

**AGENT B** (Support - UI/Quality):
- UI/UX bugs
- Layout responsiveness
- CollapsibleCard standardization
- Code quality (linting)
- Component-level testing

---

## 📝 **TASK BREAKDOWN - ATOMICA**

### **PHASE 1: CRITICAL BUGS (Week 1 Days 1-3)**

#### **🔥 C001: Fix Tab Conservazione**

**Agent A - Lead**

**Task A1.1**: Diagnosi crash Conservation
```bash
# Commands
cd C:/Users/matte.MIO/Documents/GitHub/BHM-v.2
npm run dev
# Navigate to /conservation
# Check browser console for errors
# Check React DevTools for component tree
```

**Checklist:**
- [ ] Identificare stacktrace errore
- [ ] Verificare dati caricati da Supabase
- [ ] Controllare hook dependencies
- [ ] Verificare ConservationStats.tsx imports

**Task A1.2**: Fix ConservationStats React import
```typescript
// File: src/features/conservation/ConservationStats.tsx:25
// Current: Error "React is not defined"
// Fix: Add import React from 'react'
```

**Validation:**
- [ ] TypeScript check passa
- [ ] Component renders senza errori
- [ ] Stats visualizzate correttamente

**Task A1.3**: Verificare hooks useConservation*
```typescript
// Files to check:
// - hooks/useConservationPoints.ts
// - hooks/useTemperatureReadings.ts
// - hooks/useMaintenanceTasks.ts

// Verify:
// - Correct return types
// - Proper error handling
// - React Query configuration
// - No stale closures
```

**Validation:**
- [ ] Tutti hook ritornano dati corretti
- [ ] Loading states funzionano
- [ ] Error states gestiti
- [ ] No infinite loops

**Task A1.4**: Test Conservation Page completa
```bash
# Test scenarios:
1. Navigate to /conservation
2. View existing conservation points
3. Add new conservation point
4. Record temperature reading
5. Complete maintenance task
6. Verify all stats update correctly
```

**Acceptance Criteria:**
- [ ] Page loads senza crash
- [ ] Tutti i dati visibili
- [ ] CRUD operations funzionanti
- [ ] No console errors
- [ ] Mobile responsive

**Time Estimate**: 4-6h
**Dependencies**: None
**Priority**: P0 (Must have)

---

#### **🔥 C002: Fix Categorie Prodotti**

**Agent A - Lead**

**Task A2.1**: Diagnosi sistema categorie
```bash
# Commands
cd C:/Users/matte.MIO/Documents/GitHub/BHM-v.2
npm run dev
# Navigate to /inventory
# Check if "Add Category" button exists
# Check network tab for API calls
```

**Investigation:**
- [ ] UI mostra button per aggiungere categoria?
- [ ] useCategories hook chiamato correttamente?
- [ ] Database ha tabella `product_categories`?
- [ ] RLS policies configurate per categories?

**Task A2.2**: Implementare UI categorie mancante
```typescript
// File: src/features/inventory/InventoryPage.tsx

// Add button:
<button
  onClick={() => setShowAddCategoryModal(true)}
  className="btn btn-secondary"
>
  <Plus className="w-4 h-4" />
  Aggiungi Categoria
</button>

// Add modal:
<AddCategoryModal
  isOpen={showAddCategoryModal}
  onClose={() => setShowAddCategoryModal(false)}
  onSave={handleCreateCategory}
  category={editingCategory}
/>
```

**Task A2.3**: Verificare hook useCategories
```typescript
// File: src/features/inventory/hooks/useCategories.ts

// Verify:
1. Query key corretto
2. Supabase RLS permette lettura
3. Error handling presente
4. React Query cache config OK
```

**Task A2.4**: Verificare database & RLS
```sql
-- Check table exists:
SELECT * FROM product_categories LIMIT 1;

-- Check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'product_categories';

-- Ensure company_id filtering works
```

**Task A2.5**: Test completo categorie
```bash
# Test scenarios:
1. View existing categories
2. Add new category
3. Edit category
4. Delete category
5. Filter products by category
6. Verify category shows in AddProductModal
```

**Acceptance Criteria:**
- [ ] Button "Aggiungi Categoria" visibile
- [ ] Modal si apre correttamente
- [ ] Categorie salvate in DB
- [ ] Filtro categorie funzionante
- [ ] Prodotti associati a categorie correttamente

**Time Estimate**: 3-4h
**Dependencies**: None
**Priority**: P0 (Must have)

---

#### **🔥 C003: Fix React Import Error**

**Agent A - Quick Fix**

**Task A3.1**: Add missing React import
```typescript
// File: src/features/conservation/ConservationStats.tsx
// Line 1, add:
import React from 'react'
```

**Validation:**
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] Component renders

**Time Estimate**: 30min
**Dependencies**: None
**Priority**: P0
**Can be done immediately**

---

### **PHASE 2: HIGH PRIORITY (Week 1 Days 3-5)**

#### **⚠️ H001: Fix CollapsibleCard Vuote Inventory**

**Agent B - Lead**

**Task B1.1**: Diagnosi CollapsibleCard inventory
```typescript
// Investigate:
// - src/features/inventory/InventoryPage.tsx
// - src/components/ui/CollapsibleCard.tsx

// Check:
1. Props passati correttamente?
2. Children renderizzati?
3. Data presente ma non mostrata?
4. Conditional rendering issue?
```

**Task B1.2**: Standardizzare pattern CollapsibleCard
```typescript
// Pattern corretto:
<CollapsibleCard
  title="Prodotti"
  icon={Package}
  defaultOpen={true}
  isEmpty={products.length === 0}
  emptyMessage="Nessun prodotto disponibile"
>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</CollapsibleCard>

// Verify:
- isEmpty prop utilizzato correttamente
- emptyMessage mostrato quando no data
- Children renderizzati quando data presente
```

**Task B1.3**: Verificare tutti usi CollapsibleCard in Inventory
```bash
# Files to check:
- InventoryPage.tsx (products, categories, shopping lists, expired)
- Ogni sezione deve avere pattern consistente
```

**Acceptance Criteria:**
- [ ] Nessuna card vuota senza motivo
- [ ] Empty states mostrano messaggio chiaro
- [ ] Dati visibili quando presenti
- [ ] Loading states funzionanti

**Time Estimate**: 2-3h
**Dependencies**: None
**Priority**: P1

---

#### **⚠️ H002: Fix CollapsibleCard Vuote Settings**

**Agent B - Lead**

**Task B2.1**: Applicare stesso fix di H001 a Settings
```typescript
// Files to check:
// - src/features/settings/SettingsPage.tsx
// - src/features/settings/components/*

// Ensure consistent pattern everywhere
```

**Time Estimate**: 2-3h
**Dependencies**: H001 completed (reuse pattern)
**Priority**: P1

---

#### **⚠️ H003: Fix Layout Responsive Generale**

**Agent B - Lead**

**Task B3.1**: Audit responsive layout
```bash
# Test on:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

# Check:
- Tutte le pagine
- Tutti i componenti
- Modali
- Form
```

**Task B3.2**: Fix breakpoints Tailwind
```typescript
// Ensure consistent usage:
<div className="
  grid
  grid-cols-1         // Mobile
  md:grid-cols-2      // Tablet
  lg:grid-cols-3      // Desktop
  gap-4
">
```

**Task B3.3**: Fix CollapsibleCard responsive
```typescript
// File: src/components/ui/CollapsibleCard.tsx
// Ensure proper mobile layout
```

**Acceptance Criteria:**
- [ ] Tutte le pagine responsive
- [ ] No horizontal scroll
- [ ] Touch targets 44px min
- [ ] Form usabili su mobile

**Time Estimate**: 3-4h
**Dependencies**: None
**Priority**: P1

---

#### **⚠️ H004: Fix React Hook in CreateListModal**

**Agent A - Lead**

**Task A4.1**: Fix hook chiamato in callback
```typescript
// File: src/features/inventory/components/CreateListModal.tsx:191
// Current: useTemplate() chiamato dentro callback
// Fix: Move hook call to component top level

// Before (WRONG):
const handleSubmit = () => {
  const template = useTemplate() // ❌ Hook in callback
}

// After (CORRECT):
const Component = () => {
  const template = useTemplate() // ✅ Hook at top level

  const handleSubmit = () => {
    // use template here
  }
}
```

**Validation:**
- [ ] ESLint hook warning risolto
- [ ] Funzionalità mantiene stesso comportamento
- [ ] No runtime errors

**Time Estimate**: 1-2h
**Dependencies**: None
**Priority**: P1

---

#### **⚠️ H005: Verificare Calendar Sync**

**Agent A - Support**

**Task A5.1**: Test sincronizzazione Calendar
```bash
# Test scenarios:
1. Create task in Tasks page
2. Verify appears in Calendar
3. Create maintenance in Conservation
4. Verify appears in Calendar
5. Create event directly in Calendar
6. Verify saved correctly
7. Edit event in Calendar
8. Verify updates persist
```

**Task A5.2**: Fix sync issues se trovati
```typescript
// Files to check:
// - src/features/calendar/hooks/useCalendarEvents.ts
// - src/features/calendar/utils/eventTransform.ts

// Verify:
- Event transformation corretto
- Real-time updates funzionanti
- Filter logic corretto
```

**Acceptance Criteria:**
- [ ] Task sincronizzati con calendar
- [ ] Maintenance sincronizzate con calendar
- [ ] Real-time updates funzionanti
- [ ] No duplicati
- [ ] Filtri funzionanti

**Time Estimate**: 2-3h
**Dependencies**: C001 resolved (conservation working)
**Priority**: P1

---

### **PHASE 3: MEDIUM PRIORITY (Week 2)**

#### **📋 M001: Cleanup 60+ Unused Variables**

**Agent A - Batch Fix**

**Task A6.1**: Fix automation services
```typescript
// Files:
// - src/services/automation/AutomatedReportingService.ts
// - src/services/automation/SmartSchedulingService.ts
// - src/services/automation/WorkflowAutomationEngine.ts
// - src/services/automation/IntelligentAlertManager.ts

// Strategy:
1. Rimuovi variabili veramente unused
2. Usa variabili se necessarie per logica
3. Aggiungi // eslint-disable-next-line se intenzionale
```

**Task A6.2**: Fix deployment services
```typescript
// Files:
// - src/services/deployment/ProductionDeploymentManager.ts

// Same strategy
```

**Task A6.3**: Fix dashboard services
```typescript
// Files:
// - src/services/dashboard/MultiTenantDashboard.ts

// Same strategy + fix TypeScript errors:
// - max_locations does not exist in TenantLimits
// - advanced_analytics does not exist in TenantFeatures
```

**Acceptance Criteria:**
- [ ] `npm run type-check` passa senza errori unused
- [ ] Nessuna funzionalità rotta
- [ ] Code più pulito e manutenibile

**Time Estimate**: 3-4h
**Dependencies**: None
**Priority**: P2

---

#### **📋 M002: Fix ExcelExporter Tests**

**Agent B - Test Fix**

**Task B4.1**: Fix test ExcelExporter
```typescript
// File: src/services/export/__tests__/ExcelExporter.test.ts

// Issues to fix:
1. Spread argument errors (lines 19-30)
2. Property 'at' does not exist (lines 144, 182)
3. Property 'mock' does not exist (lines 147, 202, 245, 287)
4. Implicit 'any' types (lines 147, 203, 245, 287)
5. Argument type errors (lines 179, 243)

// Strategy:
- Update lib target to ES2022 for 'at' support
- Proper typing for mocks
- Fix argument types with correct union types
```

**Task B4.2**: Eseguire test e validare
```bash
npx vitest run src/services/export/__tests__/ExcelExporter.test.ts
```

**Acceptance Criteria:**
- [ ] Tutti test passano
- [ ] No TypeScript errors nei test
- [ ] Coverage adeguata

**Time Estimate**: 2-3h
**Dependencies**: None
**Priority**: P2

---

#### **📋 M003: Replace Explicit `any` Types**

**Agent B - Type Safety**

**Task B5.1**: Audit e fix explicit any
```bash
# Find all explicit any:
grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v "eslint-disable"

# Priority files (from lint output):
1. src/components/ProtectedRoute.tsx (lines 266, 269, 278, 281)
2. src/features/calendar/* (multiple files)
3. src/features/conservation/* (multiple files)
4. src/features/inventory/* (multiple files)
```

**Strategy per file:**
```typescript
// Before:
const handleChange = (e: any) => { }

// After:
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { }

// Or use unknown se tipo veramente sconosciuto:
const handleData = (data: unknown) => {
  // Type guard
  if (isValidData(data)) {
    // use data
  }
}
```

**Acceptance Criteria:**
- [ ] < 5 explicit `any` types totali
- [ ] Tutti `any` rimanenti documentati con commento
- [ ] No type safety compromessa

**Time Estimate**: 2-3h
**Dependencies**: None
**Priority**: P2

---

#### **📋 M004: Cleanup ESLint Warnings**

**Agent B - Code Quality**

**Task B6.1**: Fix exhaustive-deps warnings
```typescript
// Files affected:
// - src/components/onboarding-steps/BusinessInfoStep.tsx
// - src/components/onboarding-steps/DepartmentsStep.tsx

// Fix con useMemo:
const formData = useMemo(() => ({
  // ... data
}), [/* dependencies */])

useEffect(() => {
  // use formData
}, [formData]) // ✅ Now stable reference
```

**Task B6.2**: Fix react-refresh warnings
```typescript
// Files affected:
// - src/components/ProtectedRoute.tsx
// - src/components/ui/Badge.tsx

// Fix: Move exports to separate file se necessario
// O: Add // eslint-disable-next-line se intenzionale
```

**Acceptance Criteria:**
- [ ] `npm run lint` mostra < 5 warnings
- [ ] Nessun warning critico
- [ ] Code quality migliorata

**Time Estimate**: 2-3h
**Dependencies**: None
**Priority**: P2

---

### **PHASE 4: VERIFICATION (Week 2 Days 4-5)**

#### **🔍 L001: Verify Management Page**

**Agent B - Testing**

**Task B7.1**: Test completo Management
```bash
# Test scenarios:
1. View staff list
2. Add new staff member
3. Edit staff member
4. Delete staff member
5. View departments
6. Add department
7. Edit department
8. Delete department
9. Assign staff to department
10. Verify role assignment works
```

**Acceptance Criteria:**
- [ ] Tutte funzionalità CRUD funzionanti
- [ ] No UI bugs
- [ ] Dati persistono correttamente

**Time Estimate**: 1-2h
**Priority**: P3

---

#### **🔍 L002: Verify Dashboard Data**

**Agent A - Testing**

**Task A7.1**: Verificare dati Dashboard
```bash
# Check:
1. KPI cards mostrano dati corretti
2. Compliance score calcolato correttamente
3. Recent activity sincronizzata
4. Quick actions funzionanti
5. Grafici mostrano dati reali
```

**Task A7.2**: Fix dati incorretti se trovati

**Acceptance Criteria:**
- [ ] Tutti i dati accurati
- [ ] Calcoli corretti
- [ ] Performance accettabile

**Time Estimate**: 1-2h
**Priority**: P3

---

## 🧪 **TESTING STRATEGY**

### **Test Levels**

**1. Unit Tests** (Agent B primary)
```bash
# Per ogni fix:
npm run test -- [file-path]

# Coverage check:
npm run test:coverage
```

**2. Integration Tests** (Agent A primary)
```bash
# Test hooks integration:
npm run test -- src/features/*/hooks/*.test.ts
```

**3. E2E Tests** (Both agents)
```bash
# Critical user flows:
npm run test:e2e

# Or manual:
node debug-app-detailed.js
```

### **Test Scenarios per Feature**

**Conservation:**
```
✓ Load page without crash
✓ View conservation points
✓ Add conservation point with maintenance tasks
✓ Record temperature reading
✓ Complete maintenance task
✓ View statistics
✓ Filter by department/status
```

**Inventory:**
```
✓ Load page
✓ View products
✓ Add category
✓ Edit category
✓ Delete category
✓ Add product with category
✓ Edit product
✓ Delete product
✓ Filter by category
✓ View expired products
✓ Reinse rt expired product
✓ Generate shopping list
```

**Calendar:**
```
✓ Load calendar
✓ View tasks from Tasks page
✓ View maintenance from Conservation
✓ Create new event
✓ Edit event
✓ Delete event
✓ Filter by type/department
✓ Switch views (month/week/day)
```

**Management:**
```
✓ View staff
✓ CRUD staff
✓ View departments
✓ CRUD departments
✓ Assign roles
```

**Settings:**
```
✓ View company settings
✓ Update company settings
✓ View HACCP settings
✓ Update HACCP settings
✓ View notification preferences
✓ Update notification preferences
```

---

## 📊 **PROGRESS TRACKING**

### **Daily Standup Template**

```markdown
## Daily Standup - [Date]

### Agent A Progress
**Yesterday:**
- [ ] Completed tasks
- [ ] Blockers encountered

**Today:**
- [ ] Planned tasks
- [ ] Expected completion

**Blockers:**
- List any blockers

### Agent B Progress
**Yesterday:**
- [ ] Completed tasks
- [ ] Blockers encountered

**Today:**
- [ ] Planned tasks
- [ ] Expected completion

**Blockers:**
- List any blockers

### Sync Points Needed
- [ ] None
- [ ] Discuss: [topic]
```

### **Weekly Milestone Tracking**

**Week 1:**
- [ ] C001: Conservation Tab Fixed
- [ ] C002: Categorie Fixed
- [ ] C003: React Import Fixed
- [ ] H001-H003: CollapsibleCard & Layout Fixed
- [ ] H004-H005: Hooks & Calendar Fixed

**Week 2:**
- [ ] M001-M004: All TypeScript/ESLint cleaned
- [ ] L001-L002: Verification completed
- [ ] Testing suite 90%+ coverage
- [ ] Documentation updated

**Week 3:**
- [ ] Sentry configured and active
- [ ] Performance profiling completed
- [ ] All acceptance criteria met
- [ ] Ready for staging deployment

---

## 🚨 **ESCALATION PROTOCOL**

### **When to Escalate**

**Blockers che richiedono decisione:**
1. Architettura change necessaria?
2. Database schema change necessario?
3. Breaking change inevitabile?
4. Time estimate > 8h per singolo task?

**Escalation Process:**
1. Document blocker completamente
2. Proponi 2-3 soluzioni alternative
3. Flag in standup immediato
4. Pausa task fino a decisione

### **Bug Criticality Reassignment**

Se durante fix scopri:
- Bug più critico del previsto → Escalate to P0
- Bug meno critico → Can downgrade
- New bug discovered → Add to tracker con priorità

---

## ✅ **ACCEPTANCE CRITERIA - FINALE**

### **Definition of Done per Bug Fix**

**Code:**
- [ ] Fix implementato
- [ ] TypeScript check passa
- [ ] ESLint passa (o < 5 warnings totali)
- [ ] No console errors/warnings
- [ ] Code reviewable (clean, commented se necessario)

**Testing:**
- [ ] Unit tests scritti e passano
- [ ] Integration test passa
- [ ] Manual test scenario completed
- [ ] Regression test passa

**Documentation:**
- [ ] CHANGELOG.md aggiornato
- [ ] JSDoc aggiunto se funzione complessa
- [ ] README aggiornato se necessario

**Validation:**
- [ ] Utente finale può validare fix
- [ ] No side effects su altre feature
- [ ] Performance non degradata

---

## 📈 **SUCCESS METRICS**

### **Obiettivi Quantificabili**

**Code Quality:**
```
TypeScript Errors:  92 → 0     (100% improvement)
ESLint Warnings:    40+ → < 5  (88%+ improvement)
Build Time:         9.09s → < 8s
Test Coverage:      ~30% → 90%+
```

**Bug Resolution:**
```
Critical Bugs:  3 → 0  (100% resolved)
High Bugs:      5 → 0  (100% resolved)
Medium Issues:  4 → 0  (100% resolved)
Low Issues:     2 → 0  (100% resolved)
```

**User Experience:**
```
Pages Working:     ~70% → 100%
Features Working:  ~70% → 100%
Mobile Score:      ~70% → 95%+
Lighthouse:        Unknown → 90+
```

---

## 🎯 **FINAL VALIDATION CHECKLIST**

Prima di dichiarare STABILIZATION PHASE completa:

### **Functional Testing**
- [ ] Login/Auth flow: 100% funzionante
- [ ] Onboarding: Tutti 6 step completabili
- [ ] Conservation: CRUD + Temperature + Maintenance OK
- [ ] Inventory: CRUD + Categories + Shopping Lists OK
- [ ] Calendar: Sync + CRUD + Filters OK
- [ ] Management: Staff + Departments OK
- [ ] Settings: All settings saveable
- [ ] Dashboard: All data accurate

### **Technical Health**
- [ ] `npm run build`: Success, no errors
- [ ] `npm run type-check`: 0 errors
- [ ] `npm run lint`: < 5 warnings
- [ ] `npm run test`: 90%+ coverage, all pass
- [ ] `npm run test:e2e`: Critical paths pass

### **Performance**
- [ ] Lighthouse Score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 1.5MB

### **Monitoring**
- [ ] Sentry configured in prod
- [ ] Test error tracking works
- [ ] Performance monitoring active
- [ ] Alerts configured

### **Documentation**
- [ ] All changes documented
- [ ] README up to date
- [ ] API docs current
- [ ] CHANGELOG complete

---

## 📝 **NEXT STEPS POST-DEBUG**

Una volta completato questo DEBUG PLAN:

1. **Production Deployment**
   - Staging deploy con Sentry attivo
   - Smoke tests
   - Production deploy
   - Monitor for 48h

2. **User Validation**
   - Internal testing
   - Bug bash session
   - User acceptance testing

3. **Phase 2 Planning**
   - Prioritize enhancements (Alert, Export, Offline, IA)
   - Create detailed implementation plans
   - Estimate timeline

---

**Document Control:**
- **Created:** 3 Ottobre 2025
- **Status:** Active Debug Guide
- **Owners:** Agent A + Agent B (GPT Codex Cursor)
- **Next Review:** Daily during debug phase

---

_Questo è il piano operativo completo per portare l'app a 100% stabilità. Ogni task è atomica ed eseguibile indipendentemente con clear acceptance criteria._
