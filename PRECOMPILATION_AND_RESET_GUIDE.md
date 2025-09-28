# 🔄 GUIDA COMPLETA PRECOMPILAZIONE E RESET ONBOARDING

## 🎯 **PANORAMICA GENERALE**

Questa guida documenta tutte le funzionalità di **precompilazione**, **reset** e **riapertura** dell'onboarding nell'applicazione HACCP Business Manager. Include i dati precompilati, le funzioni di reset e i pulsanti di controllo.

---

## 📁 **FILE DA ESAMINARE**

### **File Principali**
1. **`src/App.jsx`** - Funzioni principali di precompilazione e reset
2. **`src/components/DevButtons.jsx`** - Pulsanti di sviluppo per precompilazione e reset
3. **`src/components/HeaderButtons.jsx`** - Pulsante "Riapri Onboarding"
4. **`src/utils/safeStorage.js`** - Utility per pulizia sicura dei dati

### **File di Supporto**
5. **`src/components/DevModeBanner.jsx`** - Banner dev mode con pulsanti reset
6. **`src/utils/devMode.js`** - Gestione modalità sviluppo

---

## 🔧 **FUNZIONI PRINCIPALI**

### **1. `prefillOnboarding()` - Precompilazione Completa**

**Posizione**: `src/App.jsx` (linee 300-840)

**Scopo**: Precompila l'onboarding con dati di test completi per demo e sviluppo.

**Dati Precompilati**:

#### **🏢 Informazioni Aziendali**
```javascript
{
  companyName: "Al Ritrovo SRL",
  address: "Via centotrecento 1/1b Bologna 40128",
  vatNumber: "001255668899101",
  email: "000@gmail.com",
  phone: "0511234567"
}
```

#### **🏭 Reparti (6)**
```javascript
[
  { name: "Cucina", description: "Area di preparazione cibi", type: "kitchen" },
  { name: "Bancone", description: "Area di servizio clienti", type: "counter" },
  { name: "Sala", description: "Area di consumo", type: "dining" },
  { name: "Magazzino", description: "Area di stoccaggio", type: "storage" },
  { name: "Magazzino B", description: "Area di stoccaggio secondaria", type: "storage" },
  { name: "Sala B", description: "Area di consumo secondaria", type: "dining" }
]
```

#### **👥 Staff (3 dipendenti)**
```javascript
[
  {
    firstName: "Matteo",
    lastName: "Cavallaro",
    email: "matteo.cavallaro@alritrovo.it",
    role: "Responsabile",
    department: "Banconisti"
  },
  {
    firstName: "Fabrizio",
    lastName: "Dettori",
    role: "Amministratore",
    department: "Amministratore"
  },
  {
    firstName: "Paolo",
    lastName: "Dettori",
    role: "Cuoco",
    department: "Cuochi"
  }
]
```

#### **❄️ Punti di Conservazione (4)**
```javascript
[
  {
    name: "Frigo A",
    temperature: "4°C",
    type: "refrigerator",
    department: "Cucina"
  },
  {
    name: "Frigo Bancone 1",
    temperature: "2°C",
    type: "refrigerator",
    department: "Bancone"
  },
  {
    name: "Frigo Bancone 2",
    temperature: "3°C",
    type: "refrigerator",
    department: "Bancone"
  },
  {
    name: "Frigo Bancone 3",
    temperature: "5°C",
    type: "refrigerator",
    department: "Bancone"
  }
]
```

#### **📋 Task di Manutenzione (8)**
```javascript
[
  {
    task_name: "Rilevamento Temperatura",
    frequency: "Giornaliero",
    assigned_role: "Responsabile",
    assigned_category: "Banconisti"
  },
  {
    task_name: "Sanificazione",
    frequency: "Settimanale",
    assigned_role: "Dipendente",
    assigned_category: "Cuochi"
  },
  {
    task_name: "Sbrinamento",
    frequency: "Annuale",
    assigned_role: "Amministratore",
    assigned_category: "Amministratore"
  }
  // ... altri 5 task
]
```

#### **📦 Inventario (6 prodotti)**
```javascript
[
  {
    name: "Pomodori San Marzano",
    category: "Verdura",
    quantity: "5 kg",
    expiryDate: "2024-12-25",
    position: "Frigo A"
  },
  {
    name: "Mozzarella di Bufala",
    category: "Latticini",
    quantity: "3 confezioni",
    expiryDate: "2024-12-22",
    position: "Frigo Bancone 1"
  }
  // ... altri 4 prodotti
]
```

### **2. `resetOnboarding()` - Reset Completo**

**Posizione**: `src/App.jsx` (linee 843-894)

**Scopo**: Resetta completamente l'onboarding e tutti i dati dell'app.

**Funzionalità**:
- Conferma utente con `window.confirm()`
- Pulisce tutti i dati localStorage
- Resetta stato onboarding
- Ricarica la pagina

**Dati Rimossi**:
```javascript
const keysToRemove = [
  'haccp-onboarding',
  'haccp-onboarding-new',
  'haccp-departments',
  'haccp-staff',
  'haccp-refrigerators',
  'haccp-cleaning',
  'haccp-products',
  'haccp-temperatures',
  'haccp-product-labels',
  'haccp-users',
  'haccp-current-user',
  'haccp-last-check',
  'haccp-last-sync',
  'haccp-company-id'
];
```

### **3. `resetApp()` - Reset App Completo**

**Posizione**: `src/App.jsx` (linee 896-920)

**Scopo**: Reset completo dell'applicazione (solo sviluppo).

**Funzionalità**:
- Conferma utente
- Pulisce tutti i dati
- Resetta stato completo
- Ricarica la pagina

### **4. `completeOnboarding()` - Completa Onboarding Automaticamente**

**Posizione**: `src/App.jsx` (linee 922-950)

**Scopo**: Completa automaticamente l'onboarding senza interazione utente.

**Funzionalità**:
- Simula completamento onboarding
- Imposta stato completato
- Chiude wizard
- Aggiorna dati app

---

## 🎮 **PULSANTI E CONTROLLI**

### **1. DevButtons Component**

**Posizione**: `src/components/DevButtons.jsx`

**Pulsanti Disponibili**:

#### **🟢 Precompila**
```javascript
<Button
  onClick={onPrefillOnboarding}
  variant="outline"
  size="sm"
  className="text-green-600 hover:text-green-700 hover:bg-green-50"
  title="Precompila onboarding con dati di test"
>
  <Users className="h-4 w-4" />
  <span>Precompila</span>
</Button>
```

#### **🔵 Completa Onboarding**
```javascript
<Button
  onClick={onCompleteOnboarding}
  variant="outline"
  size="sm"
  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  title="Completa onboarding automaticamente"
>
  <CheckCircle className="h-4 w-4" />
  <span>Completa Onboarding</span>
</Button>
```

#### **🔴 Reset Onboarding**
```javascript
<Button
  onClick={onResetOnboarding}
  variant="outline"
  size="sm"
  className="text-red-600 hover:text-red-700 hover:bg-red-50"
  title="Reset completo onboarding e app"
>
  <RotateCcw className="h-4 w-4" />
  <span>Reset Onboarding</span>
</Button>
```

### **2. HeaderButtons Component**

**Posizione**: `src/components/HeaderButtons.jsx`

**Pulsanti Disponibili**:

#### **🔴 Reset App (Solo Sviluppo)**
```javascript
{showResetApp && (
  <Button
    onClick={onResetApp}
    variant="outline"
    size="sm"
    className="text-red-600 hover:text-red-700 hover:bg-red-50"
    title="Reset completo dell'app (solo sviluppo)"
  >
    <RotateCcw className="h-4 w-4" />
    <span>Reset App</span>
  </Button>
)}
```

#### **🔵 Riapri Onboarding**
```javascript
<Button
  onClick={onOpenOnboarding}
  variant="outline"
  size="sm"
  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  title="Riapri l'onboarding"
>
  <Users className="h-4 w-4" />
  <span>Riapri Onboarding</span>
</Button>
```

### **3. DevModeBanner Component**

**Posizione**: `src/components/DevModeBanner.jsx`

**Funzionalità**:
- Banner giallo in modalità sviluppo
- Pulsante "Disattiva Dev Mode"
- Pulsante "Rimuovi Dati Dev"
- Pulsante "Ricarica Pagina"

---

## 🔧 **UTILITY E HELPER**

### **1. SafeStorage Utility**

**Posizione**: `src/utils/safeStorage.js`

**Funzioni Principali**:

#### **`safeSetItem(key, data)`**
- Salva dati in localStorage in modo sicuro
- Previene errori di serializzazione
- Gestisce dati undefined/null

#### **`safeGetItem(key, defaultValue)`**
- Carica dati da localStorage in modo sicuro
- Gestisce dati corrotti
- Ritorna valore di default se errore

#### **`clearHaccpData()`**
- Pulisce tutti i dati HACCP
- Rimuove chiavi specifiche
- Gestisce errori di pulizia

#### **`checkDataIntegrity()`**
- Verifica integrità dati localStorage
- Identifica dati corrotti
- Genera report dettagliato

### **2. DevMode Utility**

**Posizione**: `src/utils/devMode.js`

**Funzioni Principali**:

#### **`isDevMode()`**
- Controlla se modalità dev è attiva
- Legge da localStorage

#### **`toggleDevMode(enabled, reason)`**
- Attiva/disattiva modalità dev
- Salva impostazioni
- Ricarica pagina se necessario

#### **`shouldBypassOnboarding()`**
- Controlla se bypassare onboarding
- Basato su modalità dev

---

## 🎯 **INTEGRAZIONE NELL'APP**

### **1. Inizializzazione Funzioni Dev**

**Posizione**: `src/App.jsx` (linee 1015-1041)

```javascript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    // Espone funzioni globalmente per debug
    window.resetApp = resetApp
    window.resetOnboarding = resetOnboarding
    window.prefillOnboarding = prefillOnboarding
    window.completeOnboarding = completeOnboarding
    
    // Log delle funzioni disponibili
    if (!window.devFunctionsLogged) {
      console.log('🔄 Funzioni dev disponibili:')
      console.log('  - resetApp() - Reset completo app')
      console.log('  - resetOnboarding() - Reset onboarding e app')
      console.log('  - prefillOnboarding() - Precompila onboarding')
      console.log('  - completeOnboarding() - Completa onboarding automaticamente')
      window.devFunctionsLogged = true
    }
  }
}, [])
```

### **2. Rendering Componenti**

**Posizione**: `src/App.jsx` (linee 1996-2008)

```javascript
<HeaderButtons
  onResetApp={resetApp}
  onOpenOnboarding={() => setShowOnboarding(true)}
  showResetApp={process.env.NODE_ENV === 'development'}
/>

<DevButtons
  onPrefillOnboarding={prefillOnboarding}
  onResetOnboarding={resetOnboarding}
  onCompleteOnboarding={completeOnboarding}
  isDevMode={process.env.NODE_ENV === 'development'}
/>
```

---

## 🧪 **TESTING E DEBUG**

### **1. Funzioni Console**

In modalità sviluppo, le funzioni sono disponibili globalmente:

```javascript
// Precompila onboarding
prefillOnboarding()

// Reset completo
resetOnboarding()

// Reset app
resetApp()

// Completa onboarding
completeOnboarding()
```

### **2. Controlli Integrità**

```javascript
// Verifica integrità dati
const integrity = checkDataIntegrity()
console.log('Integrità dati:', integrity)

// Pulisce dati corrotti
clearHaccpData()
```

### **3. Modalità Dev**

```javascript
// Attiva modalità dev
toggleDevMode(true, 'Attivato per testing')

// Disattiva modalità dev
toggleDevMode(false, 'Disattivato dopo testing')

// Controlla stato
const isDev = isDevMode()
console.log('Modalità dev attiva:', isDev)
```

---

## 📋 **CHECKLIST IMPLEMENTAZIONE**

### **✅ Funzioni Core**
- [ ] `prefillOnboarding()` con tutti i dati
- [ ] `resetOnboarding()` con conferma
- [ ] `resetApp()` per sviluppo
- [ ] `completeOnboarding()` automatico

### **✅ Componenti UI**
- [ ] `DevButtons` con 3 pulsanti
- [ ] `HeaderButtons` con reset e riapri
- [ ] `DevModeBanner` con controlli dev
- [ ] Styling Tailwind CSS

### **✅ Utility**
- [ ] `safeStorage.js` per operazioni sicure
- [ ] `devMode.js` per gestione modalità
- [ ] Gestione errori e logging
- [ ] Validazione dati

### **✅ Integrazione**
- [ ] Esposizione funzioni globali (dev)
- [ ] Rendering condizionale componenti
- [ ] Gestione stato onboarding
- [ ] Persistenza dati

---

## 🎯 **ISTRUZIONI PER AGENTE**

### **1. Implementare Precompilazione**
- Creare funzione `prefillOnboarding()` in App.jsx
- Includere tutti i dati predefiniti (azienda, reparti, staff, etc.)
- Gestire salvataggio in localStorage
- Aggiungere logging per debug

### **2. Implementare Reset**
- Creare funzione `resetOnboarding()` con conferma
- Creare funzione `resetApp()` per sviluppo
- Implementare pulizia completa dati
- Gestire ricaricamento pagina

### **3. Creare Componenti UI**
- `DevButtons` con 3 pulsanti colorati
- `HeaderButtons` con reset e riapri
- `DevModeBanner` per controlli dev
- Usare icone Lucide React

### **4. Implementare Utility**
- `safeStorage.js` per operazioni sicure
- `devMode.js` per gestione modalità
- Gestione errori e validazione
- Logging dettagliato

### **5. Integrare nell'App**
- Esporre funzioni globalmente (dev mode)
- Rendering condizionale componenti
- Gestione stato e persistenza
- Test delle funzionalità

---

## 📚 **RISORSE AGGIUNTIVE**

### **Dati Precompilati Completi**
- **Azienda**: Al Ritrovo SRL con dati completi
- **Reparti**: 6 reparti con tipologie diverse
- **Staff**: 3 dipendenti con ruoli specifici
- **Conservazione**: 4 punti con temperature
- **Task**: 8 task di manutenzione
- **Inventario**: 6 prodotti con scadenze

### **Funzioni Console Disponibili**
- `prefillOnboarding()` - Precompila tutto
- `resetOnboarding()` - Reset completo
- `resetApp()` - Reset app (dev)
- `completeOnboarding()` - Completa automatico

### **Componenti UI**
- Pulsanti colorati con icone
- Tooltip informativi
- Responsive design
- Hover effects

---

## 🎉 **CONCLUSIONI**

Il sistema di precompilazione e reset dell'onboarding include:

- **Precompilazione completa** con dati realistici
- **Reset sicuro** con conferme utente
- **Pulsanti intuitivi** per tutte le funzioni
- **Utility robuste** per gestione dati
- **Debug integrato** per sviluppo
- **Modalità dev** per testing

Questa guida fornisce tutte le informazioni necessarie per ricreare le stesse funzionalità identiche, preservando tutti i dati precompilati e le logiche di reset.

---

*Ultima modifica: 2024-12-19*
*Versione: 1.0*
*Autore: AI Assistant*
