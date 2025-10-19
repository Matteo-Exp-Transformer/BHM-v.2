# ✅ TEST 1 - VERIFICATION CHECKLIST

> **Verifica pre-esecuzione per garantire che TEST 1 funzioni correttamente**

**Data**: 2025-10-19
**Test**: `01-onboarding-precompila.spec.js`
**Stato**: ✅ READY TO EXECUTE

---

## 📋 PRE-EXECUTION CHECKLIST

### 1. ✅ File Structure Verificata

```
Production/Test/Onboarding/
├── 01-onboarding-precompila.spec.js    ✅ Created
├── fixtures/
│   ├── business-data.js                ✅ Created
│   └── conservation-scenarios.js       ✅ Created
├── utils/
│   ├── supabase-assertions.js          ✅ Created
│   ├── ui-assertions.js                ✅ Created
│   └── navigation-helpers.js           ✅ Created (UPDATED selectors)
├── README.md                            ✅ Created
└── TEST_1_VERIFICATION.md               ✅ This file
```

### 2. ✅ Configuration Files Verificati

- [x] `playwright-onboarding.config.ts` - Dual-mode config (headless + headed)
- [x] `.env.test` - Test credentials configured
- [x] `package.json` - Scripts added:
  - `test:onboarding` - Headless execution
  - `test:onboarding:headed` - Headed demo mode
  - `test:onboarding:debug` - Debug mode

### 3. ✅ Selectors Corretti

**VERIFIED from actual components:**

| Element | Selector | Source File | Line |
|---------|----------|-------------|------|
| Precompila button | `button:has-text("Precompila")` | `DevButtons.tsx` | 24-32 |
| Avanti button | `button:has-text("Avanti")` | `OnboardingWizard.tsx` | 422 |
| Indietro button | `button:has-text("Indietro")` | `OnboardingWizard.tsx` | 405 |
| Completa button | `button:has-text("Completa Configurazione")` | `OnboardingWizard.tsx` | 420 |
| Completa Onboarding (DevButton) | `button:has-text("Completa Onboarding")` | `DevButtons.tsx` | 48 |

**FIXED**: Updated [navigation-helpers.js:51](c:\Users\matte.MIO\Documents\GitHub\BHM-v.2\Production\Test\Onboarding\utils\navigation-helpers.js#L51) and [navigation-helpers.js:94](c:\Users\matte.MIO\Documents\GitHub\BHM-v.2\Production\Test\Onboarding\utils\navigation-helpers.js#L94) to use exact text "Completa Configurazione"

### 4. ✅ Test Data Aligned with getPrefillData

**Verified from [onboardingHelpers.ts](c:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\utils\onboardingHelpers.ts):**

| Data Type | Expected in Test | Source |
|-----------|-----------------|--------|
| Business Name | "Al Ritrovo SRL" | Line 170 |
| Address | "Via San Pietro 14, 09170 Oristano OR" | Line 171 |
| Departments | 8 departments (Cucina, Bancone, Sala, etc.) | Lines 192-240 |
| Staff | First = Paolo Dettori (admin), replaced with current user | Lines 281-295 |
| Conservation Points | Frigo, Freezer, Dispensa | Lines ~400+ |
| Temperature Validation | Exact min-max range (NOT ±1.1°C) | User clarified |

### 5. ✅ Environment Variables

**Required in `.env.test`:**

```env
TEST_USER_EMAIL=matteo.cavallaro.work@gmail.com  ✅ Set
TEST_USER_PASSWORD=your-password-here            ⚠️ USER MUST UPDATE
SUPABASE_SERVICE_KEY=your-service-key-here       ⚠️ USER MUST UPDATE
BASE_URL=http://localhost:3000                   ✅ Set
```

**ACTION REQUIRED**: User must replace placeholders with actual credentials!

### 6. ✅ Test Flow Verified

```
┌─────────────────────────────────────────────────────┐
│ TEST 1 FLOW                                         │
├─────────────────────────────────────────────────────┤
│ 1. Login (beforeEach)                               │
│    - Navigate to /login                             │
│    - Fill email & password                          │
│    - Submit login                                   │
│    - Verify redirect to /onboarding or /dashboard  │
│                                                     │
│ 2. Precompila (Step 0)                              │
│    - Wait for step 1 visible                        │
│    - Click "Precompila" button                      │
│    - Wait 1s for localStorage update                │
│                                                     │
│ 3. Navigate Steps 1-7                               │
│    - For steps 1-6: Click "Avanti"                  │
│    - For step 7: Click "Completa Configurazione"    │
│                                                     │
│ 4. ASSERT A: Onboarding Complete                    │
│    - Verify URL = /dashboard                        │
│    - Verify dashboard header visible                │
│                                                     │
│ 5. ASSERT B: Database Verification                  │
│    - Get company_id from user email                 │
│    - Query all onboarding data in Supabase          │
│    - Verify: business, departments, staff,          │
│      conservation, tasks, products, calendar        │
│                                                     │
│ 6. ASSERT C: UI Verification                        │
│    - Navigate to each tab                           │
│    - Verify data visible in UI                      │
│    - Check: Dashboard, Departments, Staff,          │
│      Conservation, Inventory, Tasks, Calendar       │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ USER ACTION REQUIRED BEFORE EXECUTION

### 1. Update `.env.test` with Real Credentials

Open [.env.test](c:\Users\matte.MIO\Documents\GitHub\BHM-v.2\.env.test) and replace:

```diff
- TEST_USER_PASSWORD=your-password-here
+ TEST_USER_PASSWORD=<actual-password>

- SUPABASE_SERVICE_KEY=your-service-key-here
+ SUPABASE_SERVICE_KEY=<actual-service-role-key>
```

**How to get SUPABASE_SERVICE_KEY:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy "service_role" key (NOT "anon" key!)
3. ⚠️ **NEVER commit this to git!**

### 2. Ensure Dev Server is Running

```bash
npm run dev
```

**Verify**: App accessible at http://localhost:3000

### 3. Verify Test User Exists in Supabase Auth

```sql
-- Check user exists
SELECT * FROM auth.users WHERE email = 'matteo.cavallaro.work@gmail.com';
```

If user doesn't exist, create account via app signup first.

---

## 🚀 EXECUTION COMMANDS

### Option 1: Headless (MCP Mode) - Recommended First

```bash
npm run test:onboarding
```

**Expected**: Test runs without browser window, logs in terminal, reports in `Production/Test/Onboarding/reports/`

### Option 2: Headed Demo (Watch It Run)

```bash
npm run test:onboarding:headed
```

**Expected**: Browser window opens, test runs slowly (500ms delay), screenshots + video recorded.

### Option 3: Debug Mode (Interactive)

```bash
npm run test:onboarding:debug
```

**Expected**: Playwright Inspector opens, step-through execution.

---

## 📊 EXPECTED OUTPUT

### ✅ Success Output (Terminal)

```
🚀 Setup: Navigazione e login...
✅ Login completato, URL attuale: http://localhost:3000/onboarding
✅ Setup completato: su pagina onboarding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST 1: Onboarding con Precompila
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 STEP 0: Click pulsante Precompila
✅ Step 1 (BusinessInfo) visibile
✅ Click pulsante Precompila
✅ Dati precompilati caricati

🔄 Navigazione attraverso wizard onboarding...

━━━ STEP 1/7: BusinessInfo ━━━
  → Attesa pulsante Avanti abilitato...
  → Click Avanti
✅ Step 1 completato

━━━ STEP 2/7: Departments ━━━
  → Attesa pulsante Avanti abilitato...
  → Click Avanti
✅ Step 2 completato

...

━━━ STEP 7/7: CalendarConfig ━━━
  → Attesa pulsante Completa visibile...
  → Click Completa Configurazione
✅ Step 7 completato

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ASSERT A: Onboarding completato con successo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ A. Redirect a /dashboard verificato
✅ A. Dashboard renderizzata correttamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ASSERT B: Verifica dati in Supabase DB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Company ID ottenuto: abc-123-xyz

✅ B. Verifica Supabase completata:
  - Business Info: ✓
  - Departments: 8 creati
  - Staff: 5 membri creati
  - Conservation Points: 3 punti creati
  - Tasks: 12 tasks creati
  - Products: 8 prodotti creati
  - Calendar Settings: ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️  ASSERT C: Verifica dati visibili nelle tab UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ C. Verifica UI completata - Dati visibili in tutte le tab!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 TEST 1 COMPLETATO CON SUCCESSO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ A. Onboarding completato
✅ B. Dati presenti in Supabase
✅ C. Dati visibili in UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1 passed (2m)
```

### ❌ Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Pulsante Precompila non visibile` | DevButtons not enabled in dev mode | Ensure `npm run dev` running (not production build) |
| `Company ID non trovato` | User not created/not logged in | Verify user exists in Supabase Auth |
| `Timeout waiting for locator` | Selector incorrect | Check component source for exact button text |
| `Database assertion failed` | RLS blocking service key | Verify SUPABASE_SERVICE_KEY is service_role (not anon) |
| `Password incorrect` | Wrong credentials in .env.test | Update `.env.test` with correct password |

---

## 🧹 CLEANUP STRATEGY

**Current**: Cleanup is **COMMENTED** in `afterEach` to allow manual inspection.

**To enable auto-cleanup**, edit [01-onboarding-precompila.spec.js:135-140](c:\Users\matte.MIO\Documents\GitHub\BHM-v.2\Production\Test\Onboarding\01-onboarding-precompila.spec.js#L135):

```diff
  test.afterEach(async ({ page }) => {
-   // NOTE: Cleanup commentato per permettere ispezione manuale post-test
-   // Decommentare se si vuole pulire DB dopo ogni test
-
-   // if (companyId) {
-   //   console.log('🧹 Cleanup: Rimozione dati test...')
-   //   await cleanupTestData(companyId)
-   //   console.log('✅ Cleanup completato')
-   // }
+   if (companyId) {
+     console.log('🧹 Cleanup: Rimozione dati test...')
+     await cleanupTestData(companyId)
+     console.log('✅ Cleanup completato')
+   }
  })
```

**Manual cleanup** (if needed):

```sql
-- Find company ID
SELECT id FROM companies WHERE name = 'Al Ritrovo SRL';

-- Delete all related data (FK cascade should handle most)
DELETE FROM companies WHERE id = '<company-id>';
```

---

## 📚 REPORTS & ARTIFACTS

After test execution, check:

- **HTML Report**: `Production/Test/Onboarding/reports/index.html`
- **JSON Results**: `Production/Test/Onboarding/reports/results.json`
- **Screenshots**: `Production/Test/Onboarding/test-results/` (on failure)
- **Videos**: `Production/Test/Onboarding/test-results/` (on failure)

Open HTML report:

```bash
npm run report:open
# or manually:
start "Production/Test/Onboarding/reports/index.html"
```

---

## ✅ FINAL CHECKLIST

Before running TEST 1, verify:

- [ ] `.env.test` updated with real password
- [ ] `.env.test` has correct SUPABASE_SERVICE_KEY
- [ ] Dev server running (`npm run dev`)
- [ ] Test user exists in Supabase Auth
- [ ] App accessible at http://localhost:3000
- [ ] Playwright installed (`npx playwright install`)

**All set?** Run:

```bash
npm run test:onboarding
```

---

## 🎯 NEXT STEPS (After TEST 1 Success)

Once TEST 1 passes successfully:

1. ✅ Verify all 3 assertions (A, B, C) passed
2. ✅ Review HTML report for complete test trace
3. ✅ Check database manually to confirm data is correct
4. ✅ Report success to user

**Then**: Move to TEST 2 in new conversation as requested:
- `02-onboarding-manuale-completo.spec.js` (manual form compilation)
- Individual step tests (steps 1-4)

---

**Document Owner**: Claude Code AI Agent
**Last Updated**: 2025-10-19
**Status**: ✅ READY FOR USER EXECUTION
