# ⚠️ ATTENZIONE: MODIFICHE DA FARE PRIMA DI PRODUCTION

Questo file contiene tutte le funzionalità utili per lo sviluppo che **NON** dovranno essere disponibili per gli utenti finali in produzione.

---

## 🗑️ DA RIMUOVERE PRIMA DI PRODUCTION:

### **1. Pulsanti Dev in MainLayout (HeaderButtons.tsx)**
**File:** `src/components/HeaderButtons.tsx`

**Cosa rimuovere:**
- ✅ Tutti i pulsanti mostrati solo quando `showDevButtons={true}`
- ✅ Pulsanti: Precompila, Completa, Reset Manuale, Reset Onboarding, Reset All Data, Reset Tot+Utenti
- ✅ Import delle funzioni: `prefillOnboarding`, `completeOnboarding`, `resetManualData`, etc.
- ❌ **NUOVO**: Pulsante "Cancella e Ricomincia" (non sarà disponibile in produzione)

**Come rimuovere:**
```tsx
// Rimuovere questo blocco:
{showDevButtons && (
  <>
    {/* Tutti i pulsanti dev */}
  </>
)}

// ❌ RIMUOVERE ANCHE: Pulsante "Cancella e Ricomincia" (sempre visibile)
<Button onClick={handleResetAndRestart}>
  Cancella e Ricomincia
</Button>
```

**IMPORTANTE:** Mantenere solo:
- Pulsante "Attività" (Alert Badge)
- ❌ RIMUOVERE: Pulsante "Onboarding" (non più necessario)
- ❌ RIMUOVERE: Pulsante "Cancella e Ricomincia" (funzionalità dev)

---

### **1.1. MODIFICHE RECENTI DA RIPRISTINARE (Pulsante "Cancella e Ricomincia")**
**⚠️ ATTENZIONE: Queste modifiche sono state fatte per il pulsante "Cancella e Ricomincia" che NON sarà disponibile in produzione**

**File modificati che vanno ripristinati:**

#### **A. `src/components/HeaderButtons.tsx`**
**Modifiche da ripristinare:**
```tsx
// ❌ RIMUOVERE: Invalidazione cache aggiunta per il reset
await queryClient.invalidateQueries({ queryKey: ['company', companyId] })
await queryClient.invalidateQueries({ queryKey: ['haccp-config', companyId] })
await queryClient.invalidateQueries({ queryKey: ['user-profiles', companyId] })
await queryClient.invalidateQueries({ queryKey: ['company'] })
await queryClient.invalidateQueries({ queryKey: ['haccp-config'] })
await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })

// ❌ RIMUOVERE: Handler per il pulsante reset
const handleResetAndRestart = async () => { ... }
```

#### **B. `src/utils/onboardingHelpers.ts`**
**Modifiche da ripristinare:**
```typescript
// ❌ RIMUOVERE: Aggiornamento campi company a stringhe vuote
await supabase
  .from('companies')
  .update({
    address: '',  // Era null, cambiato per constraint NOT NULL
    email: '',    // Era null, cambiato per constraint NOT NULL
    staff_count: 0,
    updated_at: new Date().toISOString(),
  })
  .eq('id', companyId)

// ❌ RIMUOVERE: Aggiunta haccp_configurations alle tabelle da cancellare
supabase.from('haccp_configurations').delete().eq('company_id', companyId),
```

#### **C. `src/utils/safeStorage.ts`**
**Modifiche da ripristinare:**
```typescript
// ❌ RIMUOVERE: Chiavi localStorage aggiunte per il reset
'haccp-config',
'user-profiles',
'calendar-view-preference',
'calendar-filters',
'calendar-dismissed-alerts',
'audit_logs',
'update_analytics',
'install_analytics',
'automation_cache',
'automation_cache_manager',
```

**Come ripristinare:**
1. **Rimuovere** tutte le invalidazioni cache aggiunte per il reset
2. **Ripristinare** i valori originali nei campi company (null invece di stringhe vuote)
3. **Rimuovere** haccp_configurations dalle tabelle da cancellare
4. **Ripristinare** la lista originale di chiavi localStorage

**Motivo:** Queste modifiche erano specifiche per far funzionare il pulsante "Cancella e Ricomincia" che non esisterà in produzione.

---

### **2. Comportamento Onboarding (NUOVO COMPORTAMENTO)**
**File:** `src/components/HeaderButtons.tsx` e logica onboarding

**Cosa modificare:**
- ❌ RIMUOVERE: Pulsante "Onboarding" dall'header
- ✅ IMPLEMENTARE: Onboarding come prima pagina dopo login SOLO per admin al primo accesso
- ✅ IMPLEMENTARE: Dopo completamento onboarding, non mostrare più mai

**Logica da implementare:**
```tsx
// In HeaderButtons.tsx - RIMUOVERE:
<Button onClick={handleReopenOnboarding}>
  Riapri Onboarding
</Button>

// In App.tsx o routing - IMPLEMENTARE:
// 1. Check se utente è admin
// 2. Check se onboarding è già stato completato
// 3. Se admin + primo accesso → Mostra onboarding
// 4. Se già completato → Vai direttamente a dashboard
```

---

### **3. Pulsanti Dev in Onboarding (DevButtons.tsx)**
**File:** `src/components/DevButtons.tsx`

**Cosa fare:**
- ❌ ELIMINARE COMPLETAMENTE il componente `DevButtons.tsx`
- ❌ RIMUOVERE import in `OnboardingWizard.tsx`
- ❌ RIMUOVERE il componente dal render di OnboardingWizard

**Alternativa:** Nascondere con flag ambiente
```tsx
{import.meta.env.DEV && <DevButtons ... />}
```

---

### **4. Funzioni Globali Dev (App.tsx)**
**File:** `src/App.tsx`

**Cosa rimuovere:**
```tsx
// Rimuovere questo blocco dentro useEffect:
if (import.meta.env.DEV) {
  const devWindow = window as DevWindow
  devWindow.resetApp = resetApp
  devWindow.resetOnboarding = resetOnboarding
  // ... tutte le altre funzioni
}
```

**IMPORTANTE:** Rimuovere anche:
- Type `DevWindow`
- Import delle funzioni da `onboardingHelpers`
- Console.log delle funzioni disponibili

---

### **5. Auto-Login Multi-Host (QUESTA MODIFICA - Opzione A)**
**File:** `src/utils/multiHostAuth.ts` (da creare)

**Cosa rimuovere:**
- ✅ Tutto il file `multiHostAuth.ts`
- ✅ Import in componenti che lo usano
- ✅ Pulsante "Sincronizza Host" nel MainLayout

**Motivo:** Funzionalità solo per sviluppo locale con più porte.
In produzione c'è un solo host (es: app.tuodominio.com)

**IMPORTANTE:** Questa funzionalità serve SOLO per:
- Sviluppo locale con Vite (porta 3002)
- Sviluppo locale con altro server (porta 3000, 3001, 3002, etc.)
- NON serve in produzione dove c'è un solo dominio

---

### **6. Script SQL di Reset (database/scripts/)**
**Cartella:** `database/scripts/`

**Cosa fare:**
- ⚠️ Verificare ogni script SQL
- ❌ NON includere in production: `fix_admin_account.sql`, `authorize_admin_account.sql`
- ✅ MANTENERE: Script di migrazione e setup iniziale

**File da NON deployare:**
- `fix_admin_account.sql`
- `authorize_admin_account.sql`
- Altri script di test/debug

---

### **7. File di Debug e Report**
**Cosa rimuovere:**
- ❌ `DEBUG_COMPLIANCE_REPORT.md`
- ❌ Cartella `Info per debug/`
- ❌ Cartella `Report Agenti/`
- ❌ File `TEST_*.md`

**IMPORTANTE:** Spostare in cartella `.gitignore` o rimuovere prima del deploy

---

### **8. Console.log di Debug**
**Dove cercare:**
- Tutti i file `.tsx` e `.ts`
- Cercare: `console.log`, `console.debug`, `console.info`

**Cosa fare:**
- ✅ MANTENERE: `console.error`, `console.warn` (per errori reali)
- ❌ RIMUOVERE: Console.log di debug/sviluppo

**Tool consigliato:** Usare `eslint` con regola `no-console`

---

### **9. Dati di Test Precompilati**
**File:** `src/utils/onboardingHelpers.ts`

**Funzioni da rimuovere/modificare:**
- `getPrefillData()` - Dati fake di Paolo Dettori, etc.
- `prefillOnboarding()` - Funzione che precompila l'onboarding

**Alternativa:** Lasciare ma nascondere con flag:
```tsx
if (import.meta.env.DEV) {
  // Funzioni di prefill
}
```

**IMPORTANTE - Logica Form Onboarding:**
La logica dei form negli step onboarding è stata ottimizzata per essere **intelligente**:

```tsx
// Logica implementata:
{(data.length === 0 || editingId) && (
  <FormComponent />
)}

// Comportamento:
// - Se NON ci sono dati → Form APERTO (per inserire primi dati)
// - Se ci sono dati → Form CHIUSO (mostra solo pulsante "Aggiungi")
// - Se stiamo editando → Form APERTO (per modificare)
```

**Vantaggi per Production:**
- ✅ **UX Ottimale**: Form aperti solo quando necessario
- ✅ **Nessun codice dev**: La logica funziona automaticamente
- ✅ **Pulizia automatica**: Dopo precompilazione, form si chiudono
- ✅ **Zero configurazione**: Non serve flag o variabili d'ambiente

**File coinvolti:**
- `src/components/onboarding-steps/DepartmentsStep.tsx`
- `src/components/onboarding-steps/StaffStep.tsx` 
- `src/components/onboarding-steps/ConservationStep.tsx`

**Nota:** Questa logica rimane attiva anche in production perché migliora l'UX senza dipendere da dati di test.

---

### **10. Environment Variables di Sviluppo**
**File:** `.env`

**Verificare:**
- ✅ SUPABASE_URL corretta per production
- ✅ SUPABASE_ANON_KEY corretta per production
- ❌ RIMUOVERE: Flag di debug, chiavi di test, etc.

**IMPORTANTE:** Creare `.env.production` separato da `.env.development`

---

### **11. Service Worker e PWA**
**File:** `vite.config.ts`

**Verificare:**
- ✅ Service Worker abilitato
- ✅ Manifest corretto
- ✅ Icons corrette
- ✅ Offline fallback configurato

**IMPORTANTE:** Testare PWA in production mode prima del deploy

---

## 🔍 CHECKLIST PRE-PRODUCTION:

### **Fase 1: Pulizia Codice**
- [ ] ❌ **PRIORITÀ**: Ripristinare modifiche per pulsante "Cancella e Ricomincia"
  - [ ] Rimuovere invalidazioni cache aggiunte in HeaderButtons.tsx
  - [ ] Ripristinare valori originali in onboardingHelpers.ts (null invece di stringhe vuote)
  - [ ] Rimuovere haccp_configurations dalle tabelle da cancellare
  - [ ] Ripristinare lista originale chiavi localStorage in safeStorage.ts
- [ ] Rimuovere pulsanti dev da HeaderButtons
- [ ] ❌ RIMUOVERE: Pulsante "Onboarding" dall'header
- [ ] ❌ RIMUOVERE: Pulsante "Cancella e Ricomincia" (funzionalità dev)
- [ ] ✅ IMPLEMENTARE: Onboarding automatico per admin al primo accesso
- [ ] Rimuovere DevButtons component
- [ ] Rimuovere funzioni globali dev da App.tsx
- [ ] Rimuovere auto-login multi-host
- [ ] Rimuovere console.log di debug
- [ ] ✅ VERIFICARE: Logica form intelligente funziona correttamente (form aperti/chiusi automaticamente)

### **Fase 2: Pulizia File**
- [ ] Rimuovere script SQL di test
- [ ] Rimuovere file di debug/report
- [ ] Rimuovere file TEST_*.md
- [ ] Verificare .gitignore

### **Fase 3: Configurazione**
- [ ] Verificare .env.production
- [ ] Verificare Supabase keys
- [ ] Verificare manifest.json
- [ ] Verificare icons PWA

### **Fase 4: Testing**
- [ ] Build production (`npm run build`)
- [ ] Preview production (`npm run preview`)
- [ ] Test su mobile
- [ ] Test PWA offline
- [ ] Test autenticazione
- [ ] Test RLS policies

### **Fase 5: Deploy**
- [ ] Verificare CORS settings su Supabase
- [ ] Configurare dominio custom
- [ ] Configurare SSL
- [ ] Test finale su production URL

---

## 📋 NOTE IMPORTANTI:

### **Auto-Login Multi-Host (Opzione A):**
**Implementata:** [DATA]
**Scopo:** Sincronizzare sessione Supabase tra localhost:3000, localhost:3001, localhost:3002
**Rimuovere:** Prima di production (non serve con un solo dominio)
**File coinvolti:**
- `src/utils/multiHostAuth.ts`
- `src/components/HeaderButtons.tsx` (pulsante sync)
- Qualsiasi import/uso di questa funzionalità

**Come funziona:**
- Legge sessione da localStorage di porta 3000
- Copia su localStorage delle altre porte
- Ricarica la pagina per applicare la sessione

**Perché solo per dev:**
- In production c'è UN SOLO dominio (es: app.tuodominio.com)
- Non servono più porte diverse
- Il problema esiste solo in localhost

---

## 🎯 IMPLEMENTAZIONE ONBOARDING AUTOMATICO:

### **Logica da Implementare:**

```typescript
// In App.tsx o routing principale
const shouldShowOnboarding = () => {
  // 1. Verifica se utente è admin
  const isAdmin = user?.role === 'admin' || hasPermission('canManageSettings')
  
  // 2. Verifica se onboarding è già stato completato
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true'
  
  // 3. Mostra onboarding solo se admin + primo accesso
  return isAdmin && !onboardingCompleted
}

// Nel routing
if (shouldShowOnboarding()) {
  return <OnboardingWizard onComplete={() => {
    localStorage.setItem('onboarding_completed', 'true')
    // Redirect to dashboard
  }} />
}
```

### **File da Modificare:**
1. **`src/components/HeaderButtons.tsx`** - Rimuovere pulsante onboarding
2. **`src/App.tsx`** - Implementare logica automatica
3. **`src/components/OnboardingWizard.tsx`** - Aggiungere callback onComplete
4. **Database** - Aggiungere flag `onboarding_completed` in `user_sessions` o `companies`

### **Comportamento Finale:**
- ✅ **Admin primo accesso**: Vede onboarding automaticamente
- ✅ **Admin dopo onboarding**: Vede direttamente dashboard
- ✅ **Utenti non-admin**: Non vedono mai onboarding
- ❌ **Pulsante riapri**: Non esiste più

---

## 🚀 AUTOMATED CLEANUP SCRIPT (TODO):

Creare uno script che automatizza la pulizia:

```bash
# npm run cleanup-for-production
# - Rimuove file di debug
# - Commenta/rimuove console.log
# - Genera report di cosa va verificato manualmente
```

**TODO:** Implementare script automatico di cleanup

---

**Last Updated:** [DATA]
**Maintainer:** Matteo Cavallaro
**Status:** 🚧 In Development

