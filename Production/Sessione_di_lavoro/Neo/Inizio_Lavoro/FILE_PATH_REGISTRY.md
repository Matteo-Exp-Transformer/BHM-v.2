# 📁 FILE PATH REGISTRY

> **Purpose**: Eliminate ambiguity - ONE official path per component
> **Rule**: ALL agents MUST use paths from this registry

---

## 🔐 AUTHENTICATION

### LoginPage
**OFFICIAL PATH**: `src/features/auth/LoginPage.tsx`
**TEST PATH**: `Production/Test/Autenticazione/LoginPage/test-funzionale.spec.js`
**TEST COUNT**: 31 tests
**COMMAND**: `npm test -- Production/Test/Autenticazione/LoginPage/`

### RegisterPage
**OFFICIAL PATH**: `src/features/auth/RegisterPage.tsx`
**TEST PATH**: `Production/Test/Autenticazione/RegisterPage/test-funzionale.spec.js`
**TEST COUNT**: 30 tests
**COMMAND**: `npm test -- Production/Test/Autenticazione/RegisterPage/`

### ForgotPasswordPage
**OFFICIAL PATH**: `src/features/auth/ForgotPasswordPage.tsx`
**TEST PATH**: `Production/Test/Autenticazione/ForgotPasswordPage/test-funzionale.spec.js`
**TEST COUNT**: 34 tests
**COMMAND**: `npm test -- Production/Test/Autenticazione/ForgotPasswordPage/`

---

## 🎯 ONBOARDING

### OnboardingWizard
**OFFICIAL PATH**: `src/components/OnboardingWizard.tsx`
**TEST PATH**: `Production/Test/Onboarding/OnboardingWizard/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/OnboardingWizard/`

### BusinessInfoStep (Step 1)
**OFFICIAL PATH**: `src/components/onboarding-steps/BusinessInfoStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/BusinessInfoStep/test-funzionale.spec.js`
**TEST COUNT**: 1 test file
**COMMAND**: `npm test -- Production/Test/Onboarding/BusinessInfoStep/`
**ALIASES**: "Onboarding Step 2", "Step 2" (internal naming)

### DepartmentsStep (Step 2)
**OFFICIAL PATH**: `src/components/onboarding-steps/DepartmentsStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/DepartmentsStep/test-funzionale.spec.js`
**TEST COUNT**: 1 test file
**COMMAND**: `npm test -- Production/Test/Onboarding/DepartmentsStep/`

### StaffStep (Step 3)
**OFFICIAL PATH**: `src/components/onboarding-steps/StaffStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/StaffStep/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/StaffStep/`

### ConservationStep (Step 4)
**OFFICIAL PATH**: `src/components/onboarding-steps/ConservationStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/ConservationStep/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/ConservationStep/`

### TasksStep (Step 5)
**OFFICIAL PATH**: `src/components/onboarding-steps/TasksStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/TasksStep/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/TasksStep/`

### InventoryStep (Step 6)
**OFFICIAL PATH**: `src/components/onboarding-steps/InventoryStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/InventoryStep/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/InventoryStep/`

### CalendarConfigStep (Step 7)
**OFFICIAL PATH**: `src/components/onboarding-steps/CalendarConfigStep.tsx`
**TEST PATH**: `Production/Test/Onboarding/CalendarConfigStep/`
**TEST COUNT**: Multiple test files
**COMMAND**: `npm test -- Production/Test/Onboarding/CalendarConfigStep/`

---

## 🔧 SERVICES

### RememberMeService
**OFFICIAL PATH**: `src/services/auth/RememberMeService.ts`
**TEST PATH**: `src/services/auth/__tests__/RememberMeService.test.ts`
**TEST COUNT**: 15 tests
**COMMAND**: `npm test -- RememberMeService.test.ts`

### IndexedDBManager
**OFFICIAL PATH**: `src/services/offline/IndexedDBManager.ts`
**TEST PATH**: `src/services/offline/__tests__/IndexedDBManager.test.ts`
**TEST COUNT**: 4 tests
**COMMAND**: `npm test -- IndexedDBManager.test.ts`

### BackgroundSync
**OFFICIAL PATH**: `src/services/offline/BackgroundSync.ts`
**TEST PATH**: `src/services/offline/__tests__/BackgroundSync.test.ts`
**TEST COUNT**: 18 tests
**COMMAND**: `npm test -- BackgroundSync.test.ts`

---

## ❌ DEPRECATED PATHS (DO NOT USE)

### Onboarding Tests (Old Locations)
- ❌ `tests/onboarding/step2.test.ts`
- ❌ `Archives/Tests/Onboarding/step2.test.tsx`
- ❌ `test-onboarding-simple.spec.ts`
- ❌ `tests/onboarding_full_flow.test.tsx`

**Reason**: Multiple old test locations cause confusion. Use OFFICIAL PATH only.

---

## 🔍 VERIFICATION COMMANDS

### Full Test Suite
```bash
# All tests
npm test

# Specific area
npm test -- Production/Test/Autenticazione/
npm test -- Production/Test/Onboarding/
```

### Coverage
```bash
# Specific component
npm test -- --coverage --collectCoverageFrom='src/services/auth/RememberMeService.ts'

# Full area
npm test -- --coverage --collectCoverageFrom='src/features/auth/**'
```

---

## 📝 UPDATE PROTOCOL

When adding new component:
1. Add to this registry FIRST
2. Include: OFFICIAL PATH, TEST PATH, TEST COUNT, COMMAND
3. Mark any old paths as DEPRECATED
4. Update SHARED_STATE.json planning_alignment

---

**Last Updated**: 2025-10-24
**Maintained by**: Agente 8 - Documentation Manager
