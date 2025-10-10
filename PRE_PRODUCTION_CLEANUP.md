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

**Come rimuovere:**
```tsx
// Rimuovere questo blocco:
{showDevButtons && (
  <>
    {/* Tutti i pulsanti dev */}
  </>
)}
```

**IMPORTANTE:** Mantenere solo:
- Pulsante "Attività" (Alert Badge)
- Pulsante "Onboarding" (Riapri)

---

### **2. Pulsanti Dev in Onboarding (DevButtons.tsx)**
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

### **3. Funzioni Globali Dev (App.tsx)**
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

### **4. Auto-Login Multi-Host (QUESTA MODIFICA - Opzione A)**
**File:** `src/utils/multiHostAuth.ts` (da creare)

**Cosa rimuovere:**
- ✅ Tutto il file `multiHostAuth.ts`
- ✅ Import in componenti che lo usano
- ✅ Pulsante "Sincronizza Host" nel MainLayout

**Motivo:** Funzionalità solo per sviluppo locale con più porte.
In produzione c'è un solo host (es: app.tuodominio.com)

**IMPORTANTE:** Questa funzionalità serve SOLO per:
- Sviluppo locale con Vite (porta 3002)
- Sviluppo locale con altro server (porta 3000, 5173, etc.)
- NON serve in produzione dove c'è un solo dominio

---

### **5. Script SQL di Reset (database/scripts/)**
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

### **6. File di Debug e Report**
**Cosa rimuovere:**
- ❌ `DEBUG_COMPLIANCE_REPORT.md`
- ❌ Cartella `Info per debug/`
- ❌ Cartella `Report Agenti/`
- ❌ File `TEST_*.md`

**IMPORTANTE:** Spostare in cartella `.gitignore` o rimuovere prima del deploy

---

### **7. Console.log di Debug**
**Dove cercare:**
- Tutti i file `.tsx` e `.ts`
- Cercare: `console.log`, `console.debug`, `console.info`

**Cosa fare:**
- ✅ MANTENERE: `console.error`, `console.warn` (per errori reali)
- ❌ RIMUOVERE: Console.log di debug/sviluppo

**Tool consigliato:** Usare `eslint` con regola `no-console`

---

### **8. Dati di Test Precompilati**
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

---

### **9. Environment Variables di Sviluppo**
**File:** `.env`

**Verificare:**
- ✅ SUPABASE_URL corretta per production
- ✅ SUPABASE_ANON_KEY corretta per production
- ❌ RIMUOVERE: Flag di debug, chiavi di test, etc.

**IMPORTANTE:** Creare `.env.production` separato da `.env.development`

---

### **10. Service Worker e PWA**
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
- [ ] Rimuovere pulsanti dev da HeaderButtons
- [ ] Rimuovere DevButtons component
- [ ] Rimuovere funzioni globali dev da App.tsx
- [ ] Rimuovere auto-login multi-host
- [ ] Rimuovere console.log di debug

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
**Scopo:** Sincronizzare sessione Supabase tra localhost:3000, localhost:3002, localhost:5173
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

