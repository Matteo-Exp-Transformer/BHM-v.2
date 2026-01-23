# 🐛 BUG REPORT - 2025-01-07

**Project:** Business HACCP Manager v2.0  
**Reporter:** User  
**Status:** 🔴 IDENTIFIED  

---

## 📋 BUG #1: Manifest Webmanifest 401 Error

### **Severity:** 🟡 MEDIUM  
### **Type:** PWA Configuration Error

### **Issue Description**
```
Console Error:
manifest.webmanifest:1 Failed to load resource: 
the server responded with a status of 401 ()
```

### **Root Cause**
Il file `public/manifest.webmanifest` fa riferimento a icone PNG che non esistono nel progetto:

```json
// public/manifest.webmanifest
{
  "icons": [
    {
      "src": "/icon-192.png",  // ❌ Non esiste
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",  // ❌ Non esiste
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Files Affected**
- `public/manifest.webmanifest`
- `index.html` (reference)

### **Impact**
- ❌ PWA non installabile correttamente
- ❌ Errore 401 in console
- ⚠️ Icone mancanti su mobile/desktop install

---

### **Solution**

#### **Option 1: Use Existing SVG Icons (RECOMMENDED)**

Modify `public/manifest.webmanifest` to use existing SVG:

```json
{
  "name": "Business HACCP Manager",
  "short_name": "BHM",
  "description": "Sistema di gestione HACCP per ristoranti e attività alimentari",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icons/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

#### **Option 2: Generate PNG Icons from SVG**

1. Convert `/icons/icon.svg` to PNG at 192x192 and 512x512
2. Place in `public/` directory
3. Keep current manifest configuration

---

### **Testing**
```bash
# After fix, verify:
1. Open DevTools → Application → Manifest
2. Check that icons load without errors
3. Verify no 401 errors in console
4. Test PWA install on mobile/desktop
```

---

## 📋 BUG #2: Conservation Point Form - Department Dropdown Crash

### **Severity:** 🔴 HIGH  
### **Type:** Runtime Error / State Management

### **Issue Description**
Quando si clicca sulla casella "Reparto" nel form di aggiunta nuovo punto di conservazione, l'app genera un errore.

### **Location**
- **File:** `src/features/conservation/components/AddPointModal.tsx`
- **Lines:** 573-597

### **Code Analysis**

```typescript
// Lines 573-597 - Department Select
<div>
  <Label>Reparto *</Label>
  <Select
    value={formData.departmentId || undefined}  // ❌ PROBLEMA QUI!
    onValueChange={value =>
      setFormData(prev => ({ ...prev, departmentId: value }))
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Seleziona un reparto" />
    </SelectTrigger>
    <SelectContent>
      {departmentOptions.map(department => (
        <SelectOption key={department.id} value={department.id}>
          {department.name}
        </SelectOption>
      ))}
    </SelectContent>
  </Select>
</div>
```

### **Possible Root Causes**

#### **Cause 1: useDepartments Hook Error**
```typescript
// src/features/management/hooks/useDepartments.ts:42
const { data, error } = await supabase
  .from('departments')
  .select('*')
  .eq('company_id', companyId)  // ❌ Se company_id è null → query fallisce

if (!companyId) throw new Error('Company ID not found')  // ❌ Ma check è DOPO query!
```

**Problem:** Hook fa query PRIMA di controllare se `company_id` esiste!

#### **Cause 2: Empty Departments Array**
```typescript
// AddPointModal.tsx:371
const departmentOptions = useMemo(
  () => departments.filter(department => department.is_active !== false),
  [departments]
)

// Se departments è vuoto → SelectContent non ha opzioni
// Dropdown potrebbe crashare se non gestisce caso vuoto
```

#### **Cause 3: Select Component State Issue**
```typescript
value={formData.departmentId || undefined}  // ❌ Passa undefined

// Select component potrebbe non gestire undefined correttamente
// Meglio usare empty string per controlled component
```

---

### **Solution**

#### **Fix 1: Correct Hook Query Order**

**File:** `src/features/management/hooks/useDepartments.ts`  
**Lines:** 33-55

```typescript
// BEFORE (BROKEN):
const { data: departments = [], isLoading, error, refetch } = useQuery({
  queryKey: QUERY_KEYS.departments(companyId || ''),
  queryFn: async (): Promise<Department[]> => {
    if (!companyId) throw new Error('Company ID not found')  // ❌ Troppo tardi!
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)  // ❌ Già eseguito!

// AFTER (FIXED):
const { data: departments = [], isLoading, error, refetch } = useQuery({
  queryKey: QUERY_KEYS.departments(companyId || ''),
  queryFn: async (): Promise<Department[]> => {
    // ✅ Check BEFORE query
    if (!companyId) {
      console.warn('⚠️ No company_id, returning empty departments')
      return []
    }
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
      
    if (error) {
      console.error('❌ Error loading departments:', error)
      throw error
    }
    
    return data || []
  },
  enabled: !!companyId,  // ✅ Don't run query if no company_id
  staleTime: 5 * 60 * 1000,
})
```

---

#### **Fix 2: Handle Empty Departments in Modal**

**File:** `src/features/conservation/components/AddPointModal.tsx`  
**Lines:** 573-597

```typescript
// IMPROVED VERSION:
<div>
  <Label>Reparto *</Label>
  
  {/* Show warning if no departments */}
  {departmentOptions.length === 0 && (
    <p className="mb-2 text-sm text-amber-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      Nessun reparto disponibile. Crea prima un reparto dalla sezione Gestione.
    </p>
  )}
  
  <Select
    value={formData.departmentId || ''}  {/* ✅ Empty string invece di undefined */}
    onValueChange={value =>
      setFormData(prev => ({ ...prev, departmentId: value }))
    }
    disabled={departmentOptions.length === 0}  {/* ✅ Disable se vuoto */}
  >
    <SelectTrigger>
      <SelectValue placeholder="Seleziona un reparto" />
    </SelectTrigger>
    <SelectContent>
      {departmentOptions.length === 0 ? (
        <div className="p-2 text-sm text-gray-500">
          Nessun reparto disponibile
        </div>
      ) : (
        departmentOptions.map(department => (
          <SelectOption key={department.id} value={department.id}>
            {department.name}
          </SelectOption>
        ))
      )}
    </SelectContent>
  </Select>
  
  {validationErrors.departmentId && (
    <p className="mt-1 text-sm text-red-600">
      {validationErrors.departmentId}
    </p>
  )}
</div>
```

---

#### **Fix 3: Add Error Boundary Around Select**

**File:** `src/features/conservation/components/AddPointModal.tsx`

Add error handling:

```typescript
import { ErrorBoundary } from 'react-error-boundary'

// Wrap Select in ErrorBoundary
<ErrorBoundary
  fallback={
    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
      <p className="text-sm text-red-700">
        Errore nel caricamento reparti. Riprova più tardi.
      </p>
    </div>
  }
  onError={(error) => {
    console.error('Select department error:', error)
  }}
>
  <Select ... >
    {/* Select content */}
  </Select>
</ErrorBoundary>
```

---

### **Priority Fixes**

#### **IMMEDIATE (P0):**
1. ✅ Fix `useDepartments` hook query order
2. ✅ Handle empty departments array in modal
3. ✅ Change `undefined` to empty string for controlled input

#### **SHORT-TERM (P1):**
1. ✅ Add error boundary around Select component
2. ✅ Add user-friendly error messages
3. ✅ Improve loading states

---

## 🔍 DEBUGGING STEPS

### **For Bug #2 (Department Dropdown)**

1. **Check Console Errors:**
```javascript
// Open DevTools Console
// Look for:
- "Company ID not found"
- Query errors from Supabase
- React component errors
- State update errors
```

2. **Check Network Tab:**
```javascript
// Filter: departments
// Look for:
- 401 Unauthorized (RLS policy issue)
- 400 Bad Request (query issue)
- 500 Server Error (database issue)
```

3. **Check React DevTools:**
```javascript
// Component: AddPointModal
// Check props:
- departments: [] or undefined?
- isLoading: true stuck?
- error: any error object?

// Component: useDepartments
// Check state:
- companyId: null or valid UUID?
- departments: empty array or populated?
```

4. **Check localStorage:**
```javascript
// Console:
localStorage.getItem('clerk-user-id')
// Should return: "user_xxx"

// Check user profile:
const { data } = await supabase
  .from('user_profiles')
  .select('company_id')
  .eq('clerk_user_id', localStorage.getItem('clerk-user-id'))
  .single()

console.log('company_id:', data?.company_id)
// Should return: UUID or null
```

---

## 📊 VERIFICATION CHECKLIST

### **After Implementing Fixes:**

- [ ] **Manifest Fixed:**
  - [ ] No 401 errors in console
  - [ ] Icons load correctly in DevTools → Application → Manifest
  - [ ] PWA installable on mobile
  - [ ] PWA installable on desktop

- [ ] **Department Dropdown Fixed:**
  - [ ] Dropdown opens without errors
  - [ ] Departments load correctly
  - [ ] Empty state shows helpful message
  - [ ] Can select department
  - [ ] Can create conservation point
  - [ ] Error handling works correctly

---

## 🎯 ROOT CAUSE SUMMARY

### **Bug #1 - Manifest 401:**
- **Cause:** Reference to non-existent PNG icons
- **Fix:** Use existing SVG icons or generate PNGs
- **Priority:** P1 (Medium)

### **Bug #2 - Dropdown Crash:**
- **Cause:** useDepartments query runs before company_id check
- **Secondary:** Empty departments not handled in UI
- **Tertiary:** Controlled input receives `undefined`
- **Fix:** Reorder query check + handle empty state + use empty string
- **Priority:** P0 (Critical)

---

## 🔗 RELATED ISSUES

This bug is related to:
- [MULTI_TENANT_ARCHITECTURE_ANALYSIS.md](./MULTI_TENANT_ARCHITECTURE_ANALYSIS.md)
  - Problem 1: No company creation logic
  - Missing company_id causes department query to fail

**If user has no company_id:**
→ `useDepartments` fails
→ Department dropdown crashes
→ Cannot create conservation points

**Long-term fix:** Implement proper company creation flow from MULTI_TENANT_ARCHITECTURE_ANALYSIS.md

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-07  
**Next Review:** After implementing fixes

