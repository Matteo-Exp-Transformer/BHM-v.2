# 🔒 REPORT COMPLIANCE HACCP - FORM PUNTI DI CONSERVAZIONE

## 🎯 **PANORAMICA GENERALE**

Questo report documenta tutti i file che gestiscono la **compliance HACCP** per il form di nuovo punto di conservazione nell'applicazione HACCP Business Manager. Include validazione automatica, regole specifiche, controlli di sicurezza alimentare e feedback visivo per l'utente.

---

## 📁 **FILE PRINCIPALI**

### **1. `src/components/PuntidiConservazione.jsx`** - Componente Principale
**Posizione**: Root del componente principale
**Scopo**: Form completo per creazione/modifica punti di conservazione con validazione HACCP integrata

#### **Caratteristiche Principali:**
- **Form completo** con validazione HACCP integrata
- **4 tipi di punti**: Frigorifero, Freezer, Abbattitore, Ambiente
- **Gestione categorie** con compatibilità temperature automatica
- **UI a 4 colonne** con colori specifici per tipo
- **Validazione in tempo reale** con feedback visivo

#### **Funzioni HACCP Implementate:**
```javascript
// Validazione form con regole HACCP
const validateForm = () => {
  // Validazione nome, location, temperature
  // Validazione categorie con regole HACCP
  // Controllo compatibilità temperature-categorie
  // Verifica duplicati nome/location
}

// Gestione categorie con limite HACCP
const handleCategoryToggle = (categoryId) => {
  // Limite massimo di 5 categorie per compliance
  // Controllo compatibilità con altre categorie
  // Validazione HACCP automatica
}

// Salvataggio con validazione HACCP
const handleSubmitForm = async () => {
  // Validazione con regole HACCP
  const validation = validationService.validateConservationPoint(formData, {
    existing: conservationPoints,
    rules: CONSERVATION_POINT_RULES
  })
}
```

#### **UI Compliance:**
- **4 colonne colorate**: Blu (Frigoriferi), Viola (Freezer), Rosso (Abbattitore), Verde (Ambiente)
- **Status indicatori**: OK (verde), Attenzione (giallo), Fuori Range (rosso)
- **Feedback visivo** per compliance HACCP
- **Suggerimenti** temperature ottimali

### **2. `src/components/onboarding-steps/ConservationStep.jsx`** - Step Onboarding
**Posizione**: Step 4 dell'onboarding
**Scopo**: Form semplificato per configurazione punti di conservazione durante onboarding

#### **Caratteristiche Principali:**
- **Form semplificato** per onboarding
- **Validazione HACCP** con `checkHACCPCompliance()`
- **Gestione categorie** con regole di compatibilità
- **Feedback visivo** per compliance
- **Scroll automatico** al form

#### **Funzioni HACCP Implementate:**
```javascript
// Controllo compliance HACCP
const checkHACCPCompliance = (targetTemp, selectedCategories = []) => {
  // Gestisce caso speciale "Ambiente"
  if (typeof targetTemp === 'string' && targetTemp.includes('Ambiente')) {
    // Per ambiente, controlla solo "Dispensa Secca"
    const hasDispensaSecca = selectedCategories.includes('dry_goods');
    return hasDispensaSecca ? 
      { compliant: true, message: '✅ Temperatura ambiente valida per Dispensa Secca' } :
      { compliant: false, message: '⚠️ Per temperatura ambiente seleziona solo "Dispensa Secca"' };
  }
  
  // Validazione temperature con categorie HACCP
  const temp = parseFloat(targetTemp);
  // Controlla compatibilità tra categorie
  // Verifica range temperature HACCP
}

// Aggiornamento compliance automatico
const updatePointCompliance = (pointId) => {
  // Ricalcola compliance quando cambiano dati
  // Aggiorna status visivo
  // Marca step come non confermato
}
```

#### **Validazione Categorie:**
- **Compatibilità automatica** tra categorie selezionate
- **Range temperature** HACCP per ogni categoria
- **Controllo incompatibilità** tra categorie
- **Suggerimenti** temperature ottimali

### **3. `src/utils/haccpRules.js`** - Regole HACCP
**Posizione**: Utility con tutte le regole HACCP
**Scopo**: Definizione regole, categorie e validazioni per compliance HACCP

#### **Regole Principali:**
```javascript
export const CONSERVATION_POINT_RULES = {
  // Categorie prodotti con range temperature HACCP
  categories: [
    {
      id: 'fresh_dairy',
      name: 'Latticini Freschi',
      minTemp: 2,
      maxTemp: 8,
      description: 'Latte, formaggi freschi, yogurt',
      incompatibleWith: ['frozen', 'deep_frozen', 'hot_holding']
    },
    {
      id: 'fresh_meat',
      name: 'Carni Fresche',
      minTemp: 0,
      maxTemp: 4,
      description: 'Carni bovine, suine, avicole',
      incompatibleWith: ['frozen', 'deep_frozen', 'hot_holding']
    },
    {
      id: 'fresh_fish',
      name: 'Pesce Fresco',
      minTemp: 0,
      maxTemp: 2,
      description: 'Pesce fresco, molluschi',
      incompatibleWith: ['frozen', 'deep_frozen', 'hot_holding']
    },
    {
      id: 'frozen',
      name: 'Congelati',
      minTemp: -18,
      maxTemp: -15,
      description: 'Prodotti congelati',
      incompatibleWith: ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'hot_holding']
    },
    {
      id: 'dry_goods',
      name: 'Dispensa Secca',
      minTemp: 15,
      maxTemp: 25,
      description: 'Pasta, riso, farina, conserve',
      incompatibleWith: ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'frozen']
    },
    {
      id: 'hot_holding',
      name: 'Mantenimento Caldo',
      minTemp: 60,
      maxTemp: 70,
      description: 'Piatti pronti caldi',
      incompatibleWith: ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'frozen']
    }
  ],
  
  // Tolleranza standard per tutte le categorie (±0.5°C)
  tolerance: 0.5,
  
  // Validazione punto di conservazione
  validateConservationPoint: (point) => {
    const errors = [];
    
    if (!point.name?.trim()) {
      errors.push('Nome punto di conservazione obbligatorio');
    }
    
    if (!point.location) {
      errors.push('Posizione obbligatoria');
    }
    
    if (!point.minTemp || !point.maxTemp) {
      errors.push('Range temperature obbligatorio');
    }
    
    return { isValid: errors.length === 0, errors };
  },
  
  // Validazione compatibilità temperature con categorie
  validateTemperatureCompatibility: (minTemp, maxTemp, selectedCategories) => {
    // Controlla che le temperature rientrino nel range HACCP
    // per ogni categoria selezionata ± tolleranza
    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    
    for (const categoryId of selectedCategories) {
      const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
      if (!category) continue;
      
      const categoryMin = category.minTemp - tolerance;
      const categoryMax = category.maxTemp + tolerance;
      
      if (minTemp < categoryMin || maxTemp > categoryMax) {
        return {
          compatible: false,
          message: `Temperature non compatibili con ${category.name}. Range consentito: ${category.minTemp}°C - ${category.maxTemp}°C (±${tolerance}°C)`
        };
      }
    }
    
    return { compatible: true, message: 'Temperature compatibili con tutte le categorie selezionate' };
  },
  
  // Ottieni suggerimenti per temperature ottimali
  getOptimalTemperatureSuggestions: (selectedCategories) => {
    // Se c'è solo una categoria, suggerisci il suo range
    // Se ci sono più categorie, trova l'intersezione dei range
    // Controlla compatibilità tra categorie
  }
};
```

#### **Helper Functions:**
```javascript
export const CONSERVATION_POINT_HELPERS = {
  // Ottieni categorie consentite per tipo
  getAllowedCategoriesByType: (type) => {
    const typeMap = {
      'FRIGO': ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'fresh_produce', 'chilled_ready'],
      'FREEZER': ['frozen', 'deep_frozen'],
      'ABBATTITORE': ['abbattitore_menu', 'abbattitore_esposizione'],
      'AMBIENTE': ['dry_goods']
    };
    return typeMap[type] || [];
  },
  
  // Ottieni suggerimenti temperature ottimali
  getOptimalTemperatureSuggestions: (type, categories) => {
    // Calcola range ottimale basato su tipo e categorie
    // Controlla compatibilità tra categorie
    // Ritorna suggerimenti specifici
  }
};
```

### **4. `src/validation/validationService.ts`** - Servizio Validazione
**Posizione**: Servizio centralizzato per validazione
**Scopo**: Validazione HACCP con normalizzazione input e calcolo status

#### **Funzioni Principali:**
```typescript
// Normalizzazione input ConservationPoint
export function normalizeConservationPointInput(input: any) {
  const normalized = {
    name: input.name?.trim() || '',
    type: input.type || (input.isAbbattitore ? 'ABBATTITORE' : 'FRIGO'),
    location: input.location?.trim() || '',
    categories: Array.isArray(input.categories) ? input.categories : 
                Array.isArray(input.selectedCategories) ? input.selectedCategories : [],
    targetTemp: input.targetTemp || input.tempRange?.[0] || 4,
    minTemp: input.minTemp || input.tempRange?.[0],
    maxTemp: input.maxTemp || input.tempRange?.[1],
    isAbbattitore: input.isAbbattitore || input.type === 'ABBATTITORE',
    meta: input.meta || {}
  };
  
  // Rimuovi duplicati dalle categorie
  normalized.categories = [...new Set(normalized.categories)];
  return normalized;
}

// Validazione ConservationPoint con regole HACCP
export function validateConservationPoint(data: unknown, context?: { existing?: any[], rules?: any }) {
  const normalized = normalizeConservationPointInput(data);
  
  // Valida schema base
  const schemaResult = ConservationPointInputSchema.safeParse(normalized);
  if (!schemaResult.success) {
    return {
      success: false,
      error: new Error('Dati non validi'),
      errors: schemaResult.error.errors.map(e => e.message)
    };
  }

  const validated = schemaResult.data;
  const errors: string[] = [];

  // Validazione HACCP
  if (context?.rules) {
    const rules = context.rules;
    
    // Controlla duplicati nome/location
    if (context.existing) {
      const existing = context.existing as any[];
      const duplicate = existing.find(p => 
        p.location === validated.location && 
        p.name.toLowerCase() === validated.name.toLowerCase() &&
        p.id !== validated.id
      );
      if (duplicate) {
        errors.push('Esiste già un punto con lo stesso nome in questa sede');
      }
    }

    // Valida compatibilità temperature con categorie
    if (validated.categories.length > 0) {
      const tempRange = getTempRangeFromInput(validated);
      const compatibility = rules.validateTemperatureCompatibility?.(
        tempRange.min, 
        tempRange.max, 
        validated.categories
      );
      
      if (compatibility && !compatibility.compatible) {
        errors.push(compatibility.message);
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: new Error('Validazione HACCP fallita'),
      errors
    };
  }

  // Converte in ConservationPoint completo
  const tempRange = getTempRangeFromInput(validated);
  const conservationPoint = {
    id: data.id || `pc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: validated.name,
    type: validated.type,
    location: validated.location,
    categories: validated.categories,
    tempRange: [tempRange.min, tempRange.max],
    lastReading: data.lastReading,
    status: computeConservationPointStatus(validated, data.lastReading, context?.rules),
    meta: validated.meta
  };

  return {
    success: true,
    data: conservationPoint
  };
}

// Calcolo status ConservationPoint
export function computeConservationPointStatus(point: any, lastReading?: number, rules?: any) {
  if (typeof lastReading !== 'number') {
    return 'OK';
  }
  
  const tempRange = getTempRangeFromInput(point);
  const isInRange = lastReading >= tempRange.min && lastReading <= tempRange.max;
  
  if (isInRange) {
    return 'OK';
  }
  
  // Controlla se è in zona di attenzione (±1°C dal range)
  const tolerance = 1;
  const isInWarning = lastReading >= (tempRange.min - tolerance) && 
                     lastReading <= (tempRange.max + tolerance);
  
  return isInWarning ? 'ATTENZIONE' : 'FUORI_RANGE';
}
```

#### **Validation Service Object:**
```typescript
export const validationService = {
  validateForm: (entityType: string, data: unknown, mode: 'create' | 'update') => {
    switch (entityType) {
      case 'refrigerators':
      case 'conservationPoints':
        return validateConservationPoint(data);
      case 'staff':
        return validateStaff(data);
      case 'departments':
        return validateDepartment(data);
      default:
        return { success: false, error: new Error(`Unknown entity type: ${entityType}`) };
    }
  },
  
  // Funzioni specifiche per ConservationPoint
  normalizeConservationPointInput,
  validateConservationPoint,
  computeConservationPointStatus
};
```

---

## 📁 **FILE DI SUPPORTO**

### **5. `src/store/selectors/conservation.ts`** - Selettori Store
**Posizione**: Selettori per dati conservation
**Scopo**: Accesso ottimizzato ai dati punti di conservazione

#### **Selettori Principali:**
```typescript
// Selettore per lista punti di conservazione
export const selectConservationPointsList = (store: DataStore) => {
  return store.entities.conservationPoints || [];
};

// Selettore per statistiche conservation
export const selectConservationStats = (store: DataStore) => {
  const points = selectConservationPointsList(store);
  return {
    total: points.length,
    compliant: points.filter(p => p.status === 'OK').length,
    critical: points.filter(p => p.status === 'FUORI_RANGE').length,
    recent: points.filter(p => {
      const lastReading = p.lastReading;
      if (!lastReading) return false;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(lastReading) > oneDayAgo;
    }).length
  };
};

// Selettore per punti raggruppati per tipo
export const selectGroupedRefrigerators = (store: DataStore) => {
  const points = selectConservationPointsList(store);
  return {
    frigorifero: points.filter(p => p.type === 'FRIGO'),
    freezer: points.filter(p => p.type === 'FREEZER'),
    abbattitore: points.filter(p => p.type === 'ABBATTITORE'),
    ambiente: points.filter(p => p.type === 'AMBIENTE')
  };
};
```

### **6. `src/validation/schemas/entities.ts`** - Schema Validazione
**Posizione**: Schema Zod per validazione
**Scopo**: Definizione schema per validazione dati

#### **Schema ConservationPoint:**
```typescript
export const ConservationPointInputSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  type: z.enum(['FRIGO', 'FREEZER', 'ABBATTITORE', 'AMBIENTE']),
  location: z.string().min(1, 'Posizione obbligatoria').max(200, 'Posizione troppo lunga'),
  categories: z.array(z.string()).min(1, 'Almeno una categoria richiesta'),
  targetTemp: z.number().min(-80).max(80),
  minTemp: z.number().optional(),
  maxTemp: z.number().optional(),
  isAbbattitore: z.boolean().optional(),
  meta: z.record(z.any()).optional()
});

export const ConservationPointSchema = ConservationPointInputSchema.extend({
  id: z.string(),
  tempRange: z.tuple([z.number(), z.number()]),
  lastReading: z.number().optional(),
  status: z.enum(['OK', 'ATTENZIONE', 'FUORI_RANGE']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
```

### **7. `src/utils/debug.js`** - Debug Utilities
**Posizione**: Utility per debug e logging
**Scopo**: Logging dettagliato per sviluppo e troubleshooting

#### **Funzioni Debug:**
```javascript
// Log per debug generale
export const debugLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Log per errori
export const errorLog = (message, error) => {
  console.error(`[ERROR] ${message}`, error);
};

// Log per HACCP
export const haccpLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[HACCP] ${message}`, data);
  }
};
```

### **8. `src/hooks/useScrollToForm.js`** - Hook Scroll
**Posizione**: Hook per scroll automatico
**Scopo**: Scroll automatico al form quando si apre

#### **Implementazione:**
```javascript
export const useScrollToForm = (shouldScroll, formId) => {
  const formRef = useRef(null);
  
  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, []);
  
  useEffect(() => {
    if (shouldScroll) {
      setTimeout(scrollToForm, 100);
    }
  }, [shouldScroll, scrollToForm]);
  
  return { formRef, scrollToForm };
};
```

---

## 🔧 **FUNZIONALITÀ HACCP IMPLEMENTATE**

### **1. Validazione Temperature**
- **Range HACCP** specifici per ogni categoria
- **Tolleranza** ±0.5°C standard
- **Controllo compatibilità** tra categorie
- **Suggerimenti** temperature ottimali

### **2. Gestione Categorie**
- **12 categorie** HACCP standard
- **Incompatibilità** automatiche tra categorie
- **Limite massimo** 5 categorie per punto
- **Validazione** in tempo reale

### **3. Controlli Duplicati**
- **Nome univoco** per location
- **Controllo esistenza** prima del salvataggio
- **Validazione** schema completa
- **Gestione errori** dettagliata

### **4. Calcolo Status**
- **OK**: Temperatura nel range
- **ATTENZIONE**: Temperatura ±1°C dal range
- **FUORI_RANGE**: Temperatura fuori range
- **Aggiornamento** automatico status

### **5. UI Compliance**
- **4 colonne colorate** per tipo
- **Indicatori status** visivi
- **Feedback** compliance in tempo reale
- **Suggerimenti** temperature ottimali

---

## 📋 **CHECKLIST IMPLEMENTAZIONE**

### **✅ File Core:**
- [ ] `src/components/PuntidiConservazione.jsx` - Form principale
- [ ] `src/components/onboarding-steps/ConservationStep.jsx` - Form onboarding
- [ ] `src/utils/haccpRules.js` - Regole HACCP
- [ ] `src/validation/validationService.ts` - Servizio validazione

### **✅ File di Supporto:**
- [ ] `src/store/selectors/conservation.ts` - Selettori store
- [ ] `src/validation/schemas/entities.ts` - Schema validazione
- [ ] `src/utils/debug.js` - Debug utilities
- [ ] `src/hooks/useScrollToForm.js` - Hook scroll

### **✅ Funzionalità HACCP:**
- [ ] Validazione temperature con range HACCP
- [ ] Gestione categorie con compatibilità
- [ ] Controllo duplicati nome/location
- [ ] Calcolo status automatico
- [ ] UI compliance con feedback visivo

### **✅ Validazione:**
- [ ] Schema Zod per validazione dati
- [ ] Normalizzazione input
- [ ] Controllo compatibilità temperature-categorie
- [ ] Gestione errori dettagliata
- [ ] Logging per debug

---

## 🎯 **ISTRUZIONI PER AGENTE**

### **1. Implementare Form Principale**
- Creare `PuntidiConservazione.jsx` con form completo
- Implementare 4 tipi di punti con colori specifici
- Aggiungere validazione HACCP integrata
- Implementare UI a 4 colonne

### **2. Implementare Regole HACCP**
- Creare `haccpRules.js` con tutte le regole
- Definire categorie con range temperature
- Implementare validazione compatibilità
- Aggiungere suggerimenti temperature

### **3. Implementare Validazione**
- Creare `validationService.ts` per validazione
- Implementare normalizzazione input
- Aggiungere calcolo status automatico
- Implementare schema Zod

### **4. Implementare UI Compliance**
- Aggiungere indicatori status visivi
- Implementare feedback compliance
- Aggiungere suggerimenti temperature
- Implementare validazione tempo reale

### **5. Implementare Supporto**
- Creare selettori store per dati
- Implementare hook scroll automatico
- Aggiungere debug utilities
- Implementare logging dettagliato

---

## 📚 **RISORSE AGGIUNTIVE**

### **Regole HACCP Implementate:**
- **Regolamento UE 852/2004** - Igiene prodotti alimentari
- **Regolamento UE 853/2004** - Prodotti origine animale
- **Linee Guida ASL** - Controllo ufficiale
- **Standard ISO 22000** - Sistema gestione sicurezza alimentare

### **Categorie HACCP Supportate:**
- **Latticini Freschi**: 2°C - 8°C
- **Carni Fresche**: 0°C - 4°C
- **Pesce Fresco**: 0°C - 2°C
- **Congelati**: -18°C - -15°C
- **Dispensa Secca**: 15°C - 25°C
- **Mantenimento Caldo**: 60°C - 70°C

### **Status Punti Conservazione:**
- **OK**: Temperatura nel range HACCP
- **ATTENZIONE**: Temperatura ±1°C dal range
- **FUORI_RANGE**: Temperatura fuori range HACCP

---

## 🎉 **CONCLUSIONI**

Il sistema di compliance HACCP per i punti di conservazione include:

- **Validazione completa** con regole HACCP specifiche
- **Gestione categorie** con compatibilità automatica
- **Controlli duplicati** e validazione schema
- **Calcolo status** automatico con indicatori visivi
- **UI compliance** con feedback in tempo reale
- **Debug integrato** per sviluppo e troubleshooting

Questo report fornisce tutte le informazioni necessarie per implementare un sistema completo di compliance HACCP per la gestione dei punti di conservazione, garantendo la sicurezza alimentare e la conformità alle normative europee.

---

*Ultima modifica: 2024-12-19*
*Versione: 1.0*
*Autore: AI Assistant*
