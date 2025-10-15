# 🔍 SCANSIONE COMPLETA HOOK FIX - 2025-01-10

**Issue:** Hook usavano `user?.company_id` (deprecato) invece di `companyId` dal nuovo useAuth  
**Impact:** Query non eseguite → Dati non caricati  
**Status:** ✅ **ALL HOOKS FIXED**

---

## 🐛 BUG #8: Hook usando user.company_id deprecato

### **Root Cause:**

Il nuovo `useAuth` hook (post-migrazione Supabase) ha questa API:

```typescript
// ✅ NUOVO useAuth (Supabase)
const { companyId } = useAuth()  // Campo diretto
// NOT: user.company_id (campo deprecato)
```

Ma molti hook usavano ancora:

```typescript
// ❌ VECCHIO pattern (Clerk)
const { user } = useAuth()
queryKey: ['data', user?.company_id]  // undefined!
enabled: !!user?.company_id           // sempre false!
```

### **Impact:**
- Query React Query **mai eseguite** (enabled: false)
- Dati **mai caricati** dal database
- Dashboard e pagine **vuote**

---

## ✅ HOOK FIXATI (Totale: 5)

### **1. useConservationPoints.ts** ✅
**File:** `src/features/conservation/hooks/useConservationPoints.ts`

**Changes:**
```typescript
// ❌ BEFORE
const { user } = useAuth()
queryKey: ['conservation-points', user?.company_id]
enabled: !!user?.company_id

// ✅ AFTER
const { companyId } = useAuth()
queryKey: ['conservation-points', companyId]
enabled: !!companyId
```

**Lines affected:** 
- Line 12: `const { user }` → `const { companyId }`
- Line 20: `user?.company_id` → `companyId` (query key)
- Line 22: `user?.company_id` → `companyId` (check)
- Line 29: `user.company_id` → `companyId` (log)
- Line 39: `user.company_id` → `companyId` (query)
- Line 53: `user?.company_id` → `companyId` (enabled)
- Line 72: `user?.company_id` → `companyId` (mutation)
- Line 86: `user.company_id` → `companyId` (insert)
- Line 98: `user.company_id` → `companyId` (maintenance)

**Total replacements:** 9

---

### **2. useMaintenanceTasks.ts** ✅
**File:** `src/features/conservation/hooks/useMaintenanceTasks.ts`

**Changes:**
```typescript
// ❌ BEFORE
const { user } = useAuth()
.eq('company_id', user.company_id)

// ✅ AFTER
const { companyId } = useAuth()
.eq('company_id', companyId)
```

**Lines affected:**
- Line 12: `const { user }` → `const { companyId }`
- Line 28: `user.company_id` → `companyId` (log)
- Line 37: `user.company_id` → `companyId` (query)
- Line 71: `user.company_id` → `companyId` (insert)
- Line 148: `user.company_id` → `companyId` (completion)

**Total replacements:** 5

---

### **3. useTemperatureReadings.ts** ✅
**File:** `src/features/conservation/hooks/useTemperatureReadings.ts`

**Changes:**
```typescript
// ❌ BEFORE
const { user } = useAuth()
.eq('company_id', user.company_id)

// ✅ AFTER
const { companyId } = useAuth()
.eq('company_id', companyId)
```

**Lines affected:**
- Line 12: `const { user }` → `const { companyId }`
- Line 24: `user.company_id` → `companyId` (log)
- Line 38: `user.company_id` → `companyId` (query)
- Line 69: `user.company_id` → `companyId` (insert)

**Total replacements:** 4

---

### **4. useCalendarEvents.ts** ✅
**File:** `src/features/calendar/hooks/useCalendarEvents.ts`

**Changes:**
```typescript
// ❌ BEFORE
const { user } = useAuth()
console.log('Loading for company:', user.company_id)

// ✅ AFTER
const { companyId } = useAuth()
console.log('Loading for company:', companyId)
```

**Lines affected:**
- Line 12: `const { user }` → `const { companyId }`
- Line 41: `user.company_id` → `companyId` (log)
- Line 53: `user.company_id` → `companyId` (query)
- Line 187: `user.company_id` → `companyId` (insert)

**Total replacements:** 4

---

### **5. useExpiredProducts.ts** ✅
**File:** `src/features/inventory/hooks/useExpiredProducts.ts`

**Changes:**
```typescript
// ❌ BEFORE
const { user } = useAuth()
.eq('company_id', user.company_id)

// ✅ AFTER
const { companyId } = useAuth()
.eq('company_id', companyId)
```

**Lines affected:**
- Line 12: `const { user }` → `const { companyId }`
- Line 38: `user.company_id` → `companyId` (query expired)
- Line 107: `user.company_id` → `companyId` (query expiring soon)
- Line 195: `user.company_id` → `companyId` (verify)
- Line 267: `user.company_id` → `companyId` (delete)
- Line 299: `user.company_id` → `companyId` (bulk delete)

**Total replacements:** 6

---

### **6. useConservation.ts** ✅
**File:** `src/hooks/useConservation.ts`

**Changes:**
```typescript
// ❌ BEFORE (se esisteva)
company_id: user.company_id

// ✅ AFTER
company_id: companyId
```

**Lines affected:**
- Line 504: `user.company_id` → `companyId`
- Line 539: `user.company_id` → `companyId`

**Total replacements:** 2

---

## 📊 RIEPILOGO COMPLETO

### **File Modificati: 6**
1. ✅ `src/features/conservation/hooks/useConservationPoints.ts` (9 sostituzioni)
2. ✅ `src/features/conservation/hooks/useMaintenanceTasks.ts` (5 sostituzioni)
3. ✅ `src/features/conservation/hooks/useTemperatureReadings.ts` (4 sostituzioni)
4. ✅ `src/features/calendar/hooks/useCalendarEvents.ts` (4 sostituzioni)
5. ✅ `src/features/inventory/hooks/useExpiredProducts.ts` (6 sostituzioni)
6. ✅ `src/hooks/useConservation.ts` (2 sostituzioni)

### **Total Replacements: 30+**

---

## ✅ VERIFICATION QUERIES

Dopo hard refresh, verifica che **TUTTE** le query vengano eseguite:

### **In console browser dovresti vedere:**
```
🔧 Loading conservation points from Supabase for company: UUID
✅ Loaded conservation points from Supabase: 7

🔧 Loading maintenance tasks from Supabase for company: UUID
✅ Loaded maintenance tasks from Supabase: XX

🔧 Loading temperature readings from Supabase for company: UUID
✅ Loaded temperature readings from Supabase: 0

🔧 Loading calendar events from Supabase for company: UUID
✅ Loaded calendar events from Supabase: XX

🔧 Loading products from Supabase for company: UUID
✅ Loaded products from Supabase: 6

🔧 Loading departments from Supabase
✅ Loaded departments: 8

🔧 Loading staff from Supabase
✅ Loaded staff: 5
```

---

## 🧪 TESTING CHECKLIST

### **After Hard Refresh:**
- [ ] Tutti i log "Loading from Supabase" appaiono
- [ ] Tutti i log "Loaded ... successfully" appaiono
- [ ] Conservation Points: 7 visibili
- [ ] Departments: 8 visibili
- [ ] Products: 6 visibili
- [ ] Staff: 5 visibili
- [ ] Maintenance Tasks: XX visibili
- [ ] Dashboard mostra KPI corretti

---

## 🎯 NEXT STEPS

1. **Hard Refresh browser** (Ctrl+Shift+R)
2. **Esegui resetApp()** per pulire dati vecchi
3. **Completa onboarding di nuovo** con codice fixato
4. **Verifica TUTTI i dati appaiono**

---

**Report generato:** 2025-01-10 03:30  
**Hook fixati:** 6/6 (100%)  
**Total replacements:** 30+  
**Status:** ✅ SCAN COMPLETE - ALL HOOKS FIXED

