# 📋 GUIDA COMPLETA ONBOARDING HACCP BUSINESS MANAGER

## 🎯 **PANORAMICA GENERALE**

L'onboarding è un **wizard a 6 step** che guida l'utente nella configurazione iniziale dell'applicazione HACCP. È implementato come sistema modulare con validazione in tempo reale, persistenza automatica e precompilazione disponibile.

---

## 🏗️ **ARCHITETTURA E STRUTTURA**

### **Componenti Principali**

1. **`OnboardingWizard.jsx`** - Componente principale orchestratore
2. **`StepNavigator.jsx`** - Navigazione tra step con indicatori visivi
3. **6 Step Components** - Componenti specializzati per ogni fase
4. **Sistema di Validazione** - Validazione HACCP integrata
5. **Sistema di Persistenza** - localStorage automatico
6. **Sistema di Precompilazione** - Dati predefiniti per test

### **Flusso di Navigazione**

```
OnboardingWizard
├── StepNavigator (indicatori progresso)
├── BusinessInfoStep (Step 1)
├── DepartmentsStep (Step 2)
├── StaffStep (Step 3)
├── ConservationStep (Step 4)
├── TasksStep (Step 5)
└── InventoryStep (Step 6)
```

---

## 📁 **FILE COINVOLTI**

### **File Principali**

- `src/components/OnboardingWizard.jsx` - Orchestratore principale
- `src/components/StepNavigator.jsx` - Navigazione e indicatori
- `src/App.jsx` - Funzioni precompilazione e reset

### **Step Components**

- `src/components/onboarding-steps/BusinessInfoStep.jsx`
- `src/components/onboarding-steps/DepartmentsStep.jsx`
- `src/components/onboarding-steps/StaffStep.jsx`
- `src/components/onboarding-steps/ConservationStep.jsx`
- `src/components/onboarding-steps/TasksStep.jsx`
- `src/components/onboarding-steps/InventoryStep.jsx`

### **File di Supporto**

- `src/utils/haccpRules.js` - Regole HACCP
- `src/hooks/useModals.js` - Gestione modali
- `src/hooks/useScrollToForm.js` - Scroll automatico
- `src/utils/debug.js` - Debug utilities
- `src/components/ui/AlertModal.jsx` - Modale alert
- `src/components/ui/ConfirmModal.jsx` - Modale conferma
- `src/components/ui/PromptModal.jsx` - Modale prompt

---

## 🔄 **LOGICHE IMPLEMENTATE**

### **1. Gestione Stato**

```javascript
// Stato principale nell'OnboardingWizard
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState({})
const [isValid, setIsValid] = useState(false)
const [isLoading, setIsLoading] = useState(false)
```

### **2. Validazione HACCP**

- **Validazione in tempo reale** per ogni step
- **Regole HACCP specifiche** per ogni campo
- **Messaggi di errore localizzati** (IT/EN)
- **Validazione integrata** con `haccpRules.js`

### **3. Persistenza Automatica**

```javascript
// Salvataggio automatico in localStorage
useEffect(() => {
  localStorage.setItem('onboarding-data', JSON.stringify(formData))
}, [formData])
```

### **4. Navigazione Intelligente**

- **Controllo validazione** prima di avanzare
- **Salvataggio automatico** ad ogni step
- **Indicatori visivi** di progresso
- **Scroll automatico** ai form

### **5. Precompilazione**

- **Dati predefiniti** per test e demo
- **Funzione `prefillOnboarding()`** in App.jsx
- **Reset completo** con `resetOnboarding()`

---

## 📊 **DETTAGLI STEP PER STEP**

### **Step 1: BusinessInfoStep**

- **Campi**: Nome azienda, Indirizzo, P.IVA, Email, Telefono
- **Validazione**: Campi obbligatori, formato email, formato telefono
- **Precompilazione**: "Al Ritrovo SRL" con dati completi

### **Step 2: DepartmentsStep**

- **Campi**: Nome reparto, Descrizione, Tipo
- **Validazione**: Nome univoco, descrizione obbligatoria
- **Precompilazione**: 6 reparti predefiniti (Cucina, Bancone, Sala, etc.)

### **Step 3: StaffStep**

- **Campi**: Nome, Cognome, Email, Ruolo, Reparto
- **Validazione**: Email univoca, ruolo obbligatorio
- **Precompilazione**: 3 dipendenti predefiniti

### **Step 4: ConservationStep**

- **Campi**: Nome punto, Temperatura, Tipo, Reparto
- **Validazione**: Temperatura valida, tipo obbligatorio
- **Precompilazione**: 4 punti conservazione predefiniti

### **Step 5: TasksStep**

- **Campi**: Nome task, Descrizione, Frequenza, Reparto
- **Validazione**: Nome univoco, frequenza obbligatoria
- **Precompilazione**: 8 task predefiniti

### **Step 6: InventoryStep**

- **Campi**: Nome prodotto, Categoria, Quantità, Scadenza
- **Validazione**: Nome univoco, quantità positiva
- **Precompilazione**: 6 prodotti predefiniti

---

## 🎨 **CARATTERISTICHE UI/UX**

### **Design System**

- **Tailwind CSS** per styling
- **Componenti modulari** riutilizzabili
- **Responsive design** mobile-first
- **Accessibilità** integrata

### **Interazioni**

- **Hover effects** su bottoni
- **Focus states** per accessibilità
- **Loading states** durante salvataggio
- **Error states** con messaggi chiari

### **Navigazione**

- **Indicatori progresso** visivi
- **Bottoni prev/next** intuitivi
- **Salvataggio automatico** trasparente
- **Scroll automatico** ai form

---

## 🔧 **FUNZIONALITÀ AVANZATE**

### **1. Validazione HACCP**

```javascript
// Esempio validazione email
const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### **2. Persistenza Intelligente**

```javascript
// Salvataggio automatico con debounce
useEffect(() => {
  const timeoutId = setTimeout(() => {
    localStorage.setItem('onboarding-data', JSON.stringify(formData))
  }, 500)
  return () => clearTimeout(timeoutId)
}, [formData])
```

### **3. Gestione Errori**

```javascript
// Gestione errori con retry
const handleError = error => {
  console.error('Onboarding error:', error)
  setError(error.message)
  setTimeout(() => setError(null), 5000)
}
```

### **4. Debug e Logging**

```javascript
// Debug integrato
if (process.env.NODE_ENV === 'development') {
  console.log('Onboarding step:', currentStep, formData)
}
```

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoints**

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Adattamenti**

- **Layout verticale** su mobile
- **Form stack** su schermi piccoli
- **Bottoni full-width** su mobile
- **Spacing ottimizzato** per touch

---

## 🌐 **INTERNAZIONALIZZAZIONE**

### **Supporto Lingue**

- **Italiano** (default)
- **Inglese** (fallback)

### **Implementazione**

```javascript
// Hook per traduzioni
const { t } = useTranslation()

// Uso nei componenti
;<label>{t('onboarding.business.name')}</label>
```

---

## 🧪 **TESTING E DEBUG**

### **Debug Mode**

```javascript
// Attivazione debug
const DEBUG_ONBOARDING = process.env.NODE_ENV === 'development'

// Log dettagliati
if (DEBUG_ONBOARDING) {
  console.log('Onboarding state:', { currentStep, formData, isValid })
}
```

### **Test Scenarios**

- **Flusso completo** end-to-end
- **Validazione** di ogni step
- **Persistenza** dati
- **Precompilazione** funzionante

---

## 🔒 **SICUREZZA E VALIDAZIONE**

### **Validazione Input**

- **Sanitizzazione** dati utente
- **Validazione** lato client e server
- **Escape** caratteri speciali
- **Controllo** lunghezza campi

### **Gestione Errori**

- **Try-catch** per operazioni critiche
- **Fallback** per errori di rete
- **Retry** automatico per operazioni fallite
- **Logging** errori per debugging

---

## 📈 **PERFORMANCE E OTTIMIZZAZIONE**

### **Lazy Loading**

```javascript
// Caricamento lazy dei componenti
const BusinessInfoStep = lazy(
  () => import('./onboarding-steps/BusinessInfoStep')
)
```

### **Memoizzazione**

```javascript
// Memo per evitare re-render
const MemoizedStep = memo(StepComponent)
```

### **Debouncing**

```javascript
// Debounce per salvataggio automatico
const debouncedSave = useCallback(
  debounce(data => {
    localStorage.setItem('onboarding-data', JSON.stringify(data))
  }, 500),
  []
)
```

---

## 🚀 **DEPLOYMENT E CONFIGURAZIONE**

### **Variabili Ambiente**

```javascript
// Configurazione per ambiente
const config = {
  development: {
    debug: true,
    apiUrl: 'http://localhost:3000',
  },
  production: {
    debug: false,
    apiUrl: 'https://api.haccpmanager.com',
  },
}
```

### **Build Optimization**

- **Code splitting** per step
- **Tree shaking** per bundle ottimizzato
- **Minification** per produzione
- **Gzip compression** per trasferimento

---

## 📋 **CHECKLIST IMPLEMENTAZIONE**

### **✅ Componenti Base**

- [ ] OnboardingWizard principale
- [ ] StepNavigator con indicatori
- [ ] 6 step components
- [ ] Sistema validazione
- [ ] Sistema persistenza

### **✅ Funzionalità Core**

- [ ] Navigazione tra step
- [ ] Validazione HACCP
- [ ] Salvataggio automatico
- [ ] Precompilazione dati
- [ ] Gestione errori

### **✅ UI/UX**

- [ ] Design responsive
- [ ] Accessibilità
- [ ] Loading states
- [ ] Error states
- [ ] Animazioni smooth

### **✅ Testing**

- [ ] Test unitari
- [ ] Test integrazione
- [ ] Test end-to-end
- [ ] Test accessibilità
- [ ] Test performance

---

## 🎯 **ISTRUZIONI PER AGENTE**

### **1. Struttura Base**

- Creare `OnboardingWizard.jsx` come orchestratore principale
- Implementare `StepNavigator.jsx` per navigazione
- Creare cartella `onboarding-steps/` con 6 componenti

### **2. Logiche Core**

- Implementare gestione stato con `useState`
- Aggiungere validazione HACCP per ogni step
- Implementare persistenza localStorage
- Aggiungere sistema precompilazione

### **3. UI Components**

- Usare Tailwind CSS per styling
- Implementare design responsive
- Aggiungere indicatori progresso
- Creare modali per conferme

### **4. Funzionalità Avanzate**

- Implementare debug mode
- Aggiungere gestione errori
- Implementare retry automatico
- Aggiungere logging dettagliato

### **5. Testing**

- Creare test per ogni step
- Testare validazione HACCP
- Testare persistenza dati
- Testare precompilazione

---

## 📚 **RISORSE AGGIUNTIVE**

### **Documentazione**

- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [HACCP Guidelines](https://www.fao.org/3/y1579e/y1579e.pdf)

### **Tools**

- [React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ESLint](https://eslint.org/)

---

## 🎉 **CONCLUSIONI**

L'onboarding HACCP Business Manager è un sistema complesso e ben strutturato che combina:

- **Architettura modulare** per manutenibilità
- **Validazione HACCP** per conformità
- **Persistenza intelligente** per UX
- **Precompilazione** per testing
- **Design responsive** per accessibilità
- **Debug integrato** per sviluppo

Questa guida fornisce tutte le informazioni necessarie per ricostruire il sistema identico, preservando tutte le logiche e funzionalità implementate.

---

_Ultima modifica: 2024-12-19_
_Versione: 1.0_
_Autore: AI Assistant_
