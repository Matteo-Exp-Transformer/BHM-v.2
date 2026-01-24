# Report: Allineamento Validazione Temperatura ConservationStep con AddPointModal

**Data:** 24 Gennaio 2026  
**Obiettivo:** Allineare il comportamento di `ConservationStep` (Onboarding) con `AddPointModal` per la gestione e validazione della temperatura dei punti di conservazione.

---

## 📋 Piano Originale

### Problema Identificato

**Root Cause:**
Nel file `conservationUtils.ts` (righe 171-178), la funzione `validateConservationPoint()` validava la temperatura contro i range delle categorie selezionate, ma non gestiva correttamente i range con valori `null`.

Per la categoria `blast_chilling`:
```typescript
{ id: 'blast_chilling', range: { min: null, max: null } }
```

Quando JavaScript confronta `-25 < null`, converte `null` a `0`:
- `-25 < null` → `-25 < 0` → `true` (categoria considerata "fuori range"!)

Questo causava un errore di validazione per l'Abbattitore con temperatura -25°C, anche se corretta.

### Flussi Coinvolti

1. **Pulsante "Precompila"** (DevButtons in OnboardingWizard)
   - Chiama `prefillOnboarding()` in `onboardingHelpers.ts`
   - Salva dati in localStorage
   - `ConservationStep` li carica da `data` prop

2. **Pulsante "Carica punti predefiniti"** (in ConservationStep)
   - Chiama `prefillSampleData()`
   - Crea punti direttamente nello stato

Entrambi i flussi creano l'Abbattitore con:
```typescript
{
  name: 'Abbattitore',
  targetTemperature: -25,
  pointType: 'blast',
  productCategories: ['blast_chilling']
}
```

### Differenze Chiave tra i Componenti

| Aspetto | ConservationStep (Onboarding) | AddPointModal |
|---------|------------------------------|---------------|
| Campo temperatura | Editabile (input number) | Read-only (mostra range) |
| Validazione temp | Contro range categorie | Nessuna |
| Calcolo temperatura | Input utente | Automatico (DEFAULT_TEMPERATURES) |
| Categorie | Filtrate per temperatura | Auto-assegnate per tipo |

---

## 🔧 Modifiche Implementate

### 1. Validazione in `conservationUtils.ts`

**File:** `src/utils/onboarding/conservationUtils.ts`

**Evoluzione:**

- **Problema iniziale:** `validateConservationPoint()` confrontava la temperatura con i range delle categorie senza gestire `null` (es. `blast_chilling` con `range: { min: null, max: null }`), causando `-25 < null` → `true` e validazione errata per l'Abbattitore.
- **Fix intermedio (Fase 1):** Gestione esplicita di `range.min === null && range.max === null` e di min/max null singolarmente in `validateConservationPoint` e `getCompatibleCategories`.
- **Soluzione finale (Fase 3):** Le categorie sono **auto-assegnate** in base al profilo HACCP (frigoriferi) o al tipo di punto; non serve più validazione manuale. Si è quindi **semplificata** la validazione.

**Stato attuale di `validateConservationPoint()`:**

Solo validazione **schema Zod** (`conservationPointSchema.safeParse`). Rimosse completamente le validazioni su categorie:

- ~~`incompatibleCategories`~~ (compatibilità tipo ↔ categorie)
- ~~`outOfRangeCategories`~~ (temperatura vs range categorie)

```typescript
export const validateConservationPoint = (point: ConservationPoint) => {
  const result = conservationPointSchema.safeParse(point)

  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(issue => {
      if (issue.path[0]) {
        errors[issue.path[0].toString()] = issue.message
      }
    })
    return { success: false, errors }
  }

  return { success: true, point }
}
```

**Nota:** `getCompatibleCategories()` mantiene la gestione dei range `null` per la UI (filtro categorie compatibili); non è più usata dalla validazione.

### 2. Refactoring `ConservationStep.tsx`

**File:** `src/components/onboarding-steps/ConservationStep.tsx`

#### 2.1 Import Aggiuntivi

```typescript
import {
  getConservationTempRangeString,
  DEFAULT_TEMPERATURES,
} from '@/utils/conservationConstants'
```

#### 2.2 Aggiunto `source: 'prefill'` a Tutti i Punti

**Modifica in `prefillSampleData()` (righe 219-283):**

Aggiunto `source: 'prefill'` a tutti i 7 punti predefiniti:
- Frigo A
- Freezer A
- Freezer B
- **Abbattitore** (con `targetTemperature: -25`)
- Frigo 1
- Frigo 2
- Frigo 3

#### 2.3 Aggiunto `calculatedTemperature` con `useMemo`

```typescript
const calculatedTemperature = useMemo(() => {
  if (editingId) {
    const existingPoint = points.find(p => p.id === editingId)
    if (existingPoint?.targetTemperature !== undefined) {
      return existingPoint.targetTemperature
    }
  }
  return DEFAULT_TEMPERATURES[formData.pointType] ?? 4
}, [editingId, points, formData.pointType])
```

**Comportamento:**
- In modalità edit: preserva la temperatura esistente del punto
- Per nuovi punti: usa `DEFAULT_TEMPERATURES[pointType]`

#### 2.4 Aggiornato `compatibleCategories`

```typescript
// PRIMA
const compatibleCategories = useMemo(() => {
  const temperature = formData.targetTemperature
    ? Number(formData.targetTemperature)
    : null
  return getCompatibleCategories(temperature, formData.pointType)
}, [formData.targetTemperature, formData.pointType])

// DOPO
const compatibleCategories = useMemo(() => {
  return getCompatibleCategories(calculatedTemperature, formData.pointType)
}, [calculatedTemperature, formData.pointType])
```

#### 2.5 Campo Temperatura Read-Only

**PRIMA (righe 503-554):**
```typescript
<Input
  id="point-temperature"
  type="number"
  step="0.1"
  min="-99"
  max="30"
  value={formData.targetTemperature}
  onChange={event =>
    setFormData(prev => ({
      ...prev,
      targetTemperature: event.target.value,
    }))
  }
  // ...
/>
```

**DOPO:**
```typescript
<Input
  id="point-temperature"
  type="text"
  value={getConservationTempRangeString(formData.pointType) || 'Seleziona tipo'}
  readOnly
  className="bg-gray-100 cursor-not-allowed text-black"
  aria-label={`Range temperatura per ${formData.pointType}: ${getConservationTempRangeString(formData.pointType)}`}
/>
<p className="mt-1 text-xs text-gray-500">
  {formData.pointType === 'ambient'
    ? 'La temperatura non è monitorabile per i punti di tipo Ambiente'
    : 'Il range indica le temperature consigliate per questo tipo di punto'}
</p>
```

#### 2.6 Rimozione `temperatureError` State e `useEffect`

**Rimosso:**
- `const [temperatureError, setTemperatureError] = useState<string | null>(null)`
- `useEffect` per validazione temperatura in tempo reale (righe 85-103)
- Tutti i riferimenti a `temperatureError` nel JSX

#### 2.7 Aggiornato `handleSubmit`

**PRIMA:**
```typescript
const normalized = normalizeConservationPoint({
  // ...
  targetTemperature: Number(formData.targetTemperature),
  // ...
})

// Validazione temperatura aggiuntiva
if (formData.pointType !== 'ambient' && formData.targetTemperature) {
  const temperature = Number(formData.targetTemperature)
  if (!isNaN(temperature)) {
    const tempValidation = validateTemperatureForType(
      temperature,
      formData.pointType
    )
    if (!tempValidation.valid) {
      setValidationErrors({
        ...result.errors,
        targetTemperature:
          tempValidation.message || 'Temperatura non valida',
      })
      return
    }
  }
}
```

**DOPO:**
```typescript
const normalized = normalizeConservationPoint({
  // ...
  targetTemperature: calculatedTemperature,  // Usa temperatura calcolata
  // ...
})

const result = validateConservationPoint(normalized)

if (!result.success) {
  setValidationErrors(result.errors ?? {})
  return
}
```

#### 2.8 Rimossi Import Non Utilizzati

```typescript
// RIMOSSO
import { validateTemperatureForType } from '@/utils/onboarding/conservationUtils'

// RIMOSSO
const typeInfo = useMemo(
  () => CONSERVATION_POINT_TYPES[formData.pointType],
  [formData.pointType]
)
```

### 3. Fix Bonus: Badge Ridondante "Abbattitore"

**Problema:** Badge "Abbattitore" duplicato quando `point.isBlastChiller === true`

**Soluzione:** Rimosso il badge condizionale perché il tipo è già mostrato dal badge principale (`info.label`).

**PRIMA:**
```typescript
<Badge variant="outline">{info.label}</Badge>
{point.isBlastChiller && (
  <Badge tone="warning" variant="outline">
    Abbattitore
  </Badge>
)}
```

**DOPO:**
```typescript
<Badge variant="outline">{info.label}</Badge>
```

### 4. Aggiunta Profili HACCP ai Frigoriferi Precompilati

**Obiettivo:** Aggiungere `applianceCategory` e `profileId` ai frigoriferi precompilati per testare la visualizzazione dei profili HACCP nelle card dei punti di conservazione.

**File Modificati:**
1. `src/utils/onboardingHelpers.ts` (pulsante "Precompila")
2. `src/components/onboarding-steps/ConservationStep.tsx` (pulsante "Carica punti predefiniti")

#### 4.1 Modifiche in `onboardingHelpers.ts`

**Funzione:** `getPrefillData()` - Array `conservationPoints` (righe 365-443)

Aggiunti `applianceCategory` e `profileId` ai 4 frigoriferi:

```typescript
// Frigo A (Cucina)
{
  name: 'Frigo A',
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_with_freezer',
  profileId: 'vegetables_generic', // Raccomanda 4°C
}

// Frigo 1 (Bancone)
{
  name: 'Frigo 1',
  targetTemperature: 2,
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_1_door',
  profileId: 'max_capacity', // Raccomanda 2°C
}

// Frigo 2 (Bancone)
{
  name: 'Frigo 2',
  targetTemperature: 3,
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_2_doors',
  profileId: 'meat_generic', // Raccomanda 3°C
}

// Frigo 3 (Bancone)
{
  name: 'Frigo 3',
  targetTemperature: 1,  // ⚠️ Cambiato da 5°C a 1°C per allinearsi al profilo
  // ... altri campi ...
  applianceCategory: 'base_refrigerated',
  profileId: 'fish_generic', // Raccomanda 1°C
}
```

#### 4.2 Modifiche in `ConservationStep.tsx`

**Funzione:** `prefillSampleData()` (righe 219-260)

Aggiunti gli stessi campi ai 4 frigoriferi con le stesse combinazioni:

```typescript
// Frigo A
normalizeConservationPoint({
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_with_freezer',
  profileId: 'vegetables_generic', // Raccomanda 4°C
}),

// Frigo 1
normalizeConservationPoint({
  targetTemperature: 2,
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_1_door',
  profileId: 'max_capacity', // Raccomanda 2°C
}),

// Frigo 2
normalizeConservationPoint({
  targetTemperature: 3,
  // ... altri campi ...
  applianceCategory: 'vertical_fridge_2_doors',
  profileId: 'meat_generic', // Raccomanda 3°C
}),

// Frigo 3
normalizeConservationPoint({
  targetTemperature: 1,  // ⚠️ Cambiato da 5°C a 1°C
  // ... altri campi ...
  applianceCategory: 'base_refrigerated',
  profileId: 'fish_generic', // Raccomanda 1°C
}),
```

#### 4.3 Tabella Profili Assegnati

| Frigorifero | Reparto | Categoria Elettrodomestico | Profilo HACCP | Temperatura Target |
|-------------|---------|---------------------------|---------------|-------------------|
| Frigo A | Cucina | `vertical_fridge_with_freezer` | `vegetables_generic` | 4°C |
| Frigo 1 | Bancone | `vertical_fridge_1_door` | `max_capacity` | 2°C |
| Frigo 2 | Bancone | `vertical_fridge_2_doors` | `meat_generic` | 3°C |
| Frigo 3 | Bancone | `base_refrigerated` | `fish_generic` | 1°C |

**Nota Importante:** La temperatura di **Frigo 3** è stata cambiata da **5°C a 1°C** per allinearsi al profilo `fish_generic` che raccomanda 1°C per il pesce fresco.

#### 4.4 Obiettivo delle Modifiche

Ogni frigorifero ha una combinazione diversa di:
- **Categoria elettrodomestico** (`applianceCategory`)
- **Profilo HACCP** (`profileId`)

Questo permette di testare la visualizzazione corretta dei profili nelle card dei punti di conservazione e verificare che ogni combinazione venga gestita correttamente.

**Punti non modificati:**
- Freezer A e Freezer B: rimangono senza `applianceCategory` e `profileId` (non sono frigoriferi)
- Abbattitore: rimane senza `applianceCategory` e `profileId` (non è un frigorifero)

---

### 5. Fase 3: Sezione Profilo e Allineamento UI con AddPointModal (24-01-2026)

**Obiettivo:** Allineare la UI del form punti di conservazione in `ConservationStep` (onboarding) a quella di `AddPointModal`: sezione profilo con categorie auto-assegnate, immagine elettrodomestico e lightbox.

#### 5.1 Validazione solo schema (vedi §1)

Rimozione di `incompatibleCategories` e `outOfRangeCategories` da `validateConservationPoint()`; restano solo i controlli Zod sullo schema.

#### 5.2 Sezione “Configurazione Punto di Conservazione” (solo frigoriferi)

**File:** `src/components/onboarding-steps/ConservationStep.tsx`

- **Import aggiuntivi:**  
  `AlertCircle`, `Modal`, `OptimizedImage` (da `@/components/ui/OptimizedImage`),  
  `getProfileById`, `mapCategoryIdsToDbNames`, `ConservationProfileId` (da `@/utils/conservationProfiles`),  
  `getApplianceImagePathWithProfile`, `hasApplianceImageAvailable` (da `@/config/applianceImages`).

- **Stato:**  
  `isImageModalOpen`, `imageError`; reset in `resetForm` e al cambio di `applianceCategory` / `profileId`; chiusura modal se `pointType !== 'fridge'`.

- **`selectedProfile`:**  
  `useMemo` che chiama `getProfileById(profileId, applianceCategory)` quando entrambi sono valorizzati.

- **Layout (come AddPointModal):**
  - Griglia 2 colonne: **Categoria elettrodomestico** | **Profilo HACCP** (select).
  - **Layout split:**
    - **Sinistra:** “Categorie prodotti (auto-assegnate)” dal profilo (`mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds)`), placeholder se nessun profilo.
    - **Destra:** Immagine elettrodomestico (clic → lightbox), placeholder se manca categoria o immagine.
  - **Info box “Note HACCP”** con `haccpNotes` e temperatura consigliata (`recommendedSetPointsC.fridge`).

- **Modal lightbox:**  
  Per `pointType === 'fridge'` e `applianceCategory` valorizzato; `<img>` ingrandita (stesso approccio di AddPointModal).

- **Rimozioni:**  
  Blocco “Note operative” (Textarea su `validationErrors.global`), import `Textarea`.

- **Errori in lista punti:**  
  In caso di validazione fallita si usa `Object.values(validation.errors).join(' • ')` o il fallback “Verifica i campi obbligatori” al posto di `validation.errors?.global`.

- **Cast `ApplianceCategory`:**  
  Dove `formData.applianceCategory` è usato con le API profilo/immagini, si usa `as ApplianceCategory`.

#### 5.3 Verifica

- Type-check e lint: nessun nuovo errore in `conservationUtils` o `ConservationStep`.
- Unit test: `conservationUtils.test.ts` (26 test) passano.
- Test manuali: Precompila / Carica punti predefiniti → Abbattitore -25°C valido; step 4 valido; per “Frigorifero” compaiono categoria, profilo, categorie auto-assegnate, immagine, note HACCP, lightbox.

---

## 📊 Riepilogo Modifiche

| File | Tipo | Descrizione |
|------|------|-------------|
| `src/utils/onboarding/conservationUtils.ts` | Fix + Simplify | Validazione **solo schema** in `validateConservationPoint()`; rimosse validazioni categorie |
| `src/components/onboarding-steps/ConservationStep.tsx` | Refactor | Campo temp read-only, temp calcolata, `source: 'prefill'`, profili HACCP, **sezione profilo** (layout split, immagine, lightbox) |
| `src/utils/onboardingHelpers.ts` | Enhancement | Aggiunto `applianceCategory` e `profileId` ai frigoriferi precompilati |

### Dettaglio Modifiche ConservationStep.tsx

- ✅ Aggiunto `source: 'prefill'` a tutti i punti in `prefillSampleData()` (7 punti)
- ✅ Import `getConservationTempRangeString`, `DEFAULT_TEMPERATURES`
- ✅ `calculatedTemperature` useMemo; `compatibleCategories` che lo usa
- ✅ Campo temperatura read-only con `getConservationTempRangeString()`
- ✅ Rimosso `temperatureError` state e `useEffect` validazione temperatura
- ✅ `handleSubmit` con `calculatedTemperature`; nessuna validazione temperatura aggiuntiva
- ✅ Rimosso badge "Abbattitore" ridondante
- ✅ `applianceCategory` e `profileId` ai 4 frigoriferi in `prefillSampleData()`; Frigo 3 → 1°C (`fish_generic`)
- ✅ **Fase 3:** Sezione “Configurazione Punto di Conservazione” (solo fridge): select categoria/profilo, layout split (categorie auto-assegnate | immagine), info box Note HACCP, Modal lightbox, `selectedProfile` useMemo, state `isImageModalOpen` / `imageError`
- ✅ Rimossi blocco “Note operative” e import `Textarea`
- ✅ Errori in lista punti: `Object.values(validation.errors).join(' • ')` o “Verifica i campi obbligatori”

### Dettaglio Modifiche conservationUtils.ts (Fase 3)

- ✅ `validateConservationPoint()`: solo `conservationPointSchema.safeParse`; rimosse `incompatibleCategories` e `outOfRangeCategories`

### Dettaglio Modifiche onboardingHelpers.ts

- ✅ Aggiunto `applianceCategory` e `profileId` ai 4 frigoriferi in `getPrefillData()`
- ✅ Modificata temperatura Frigo 3 da 5°C a 1°C per allinearsi al profilo `fish_generic`

---

## ✅ Verifica

### Test Manuali - Pulsante "Precompila" (DevButtons)

1. ✅ Nella pagina onboarding, cliccare il pulsante verde "Precompila"
2. ✅ Navigare allo step 4 (Punti di conservazione)
3. ✅ Verificare che "Abbattitore" con -25°C sia presente e valido (bordo verde, non giallo/rosso)
4. ✅ Verificare che lo step sia marcato come valido (pulsante "Avanti" abilitato)

### Test Manuali - Pulsante "Carica punti predefiniti" (interno step 4)

1. ✅ Andare direttamente allo step 4 dell'onboarding (senza precompilare)
2. ✅ Cliccare "Carica punti predefiniti"
3. ✅ Verificare che "Abbattitore" con -25°C sia presente e valido
4. ✅ Verificare che lo step sia marcato come valido

### Test Manuali - Creazione/Modifica

1. ✅ Verificare che il campo temperatura sia read-only e mostri il range (es. "1°C - 8°C")
2. ✅ Modificare un punto precompilato e verificare che si salvi correttamente
3. ✅ Creare un nuovo punto di ogni tipo (fridge, freezer, blast, ambient)

### Test Automatici

```bash
npm run type-check  # ✅ Passato (errori preesistenti non correlati)
npm run lint        # ✅ Passato
```

---

## 🎯 Risultati

### Prima delle Modifiche

- ❌ Abbattitore con -25°C veniva marcato come "fuori range" (bordo giallo/rosso)
- ❌ Validazione falliva per categorie con `range: { min: null, max: null }`
- ❌ Campo temperatura editabile manualmente (inconsistente con AddPointModal)
- ❌ Temperatura calcolata manualmente dall'utente

### Dopo le Modifiche

- ✅ Abbattitore con -25°C validato correttamente (bordo verde)
- ✅ Validazione **solo schema** (Fase 3); niente più validazioni categorie
- ✅ Campo temperatura read-only, range consigliato (allineato con AddPointModal)
- ✅ Temperatura calcolata automaticamente in base al tipo di punto
- ✅ Comportamento consistente tra ConservationStep e AddPointModal
- ✅ Badge "Abbattitore" ridondante rimosso
- ✅ Profili HACCP nei frigoriferi precompilati; Frigo 3 → 1°C (`fish_generic`)
- ✅ **Fase 3:** Sezione profilo in ConservationStep (layout split, categorie auto-assegnate, immagine, lightbox, note HACCP) allineata ad AddPointModal

---

## 📝 Note Tecniche

### Validazione solo schema (Fase 3)

La validazione dei punti di conservazione si basa **solo** sullo schema Zod (`conservationPointSchema`). Le categorie sono auto-assegnate (profilo HACCP per frigoriferi, compatibilità per tipo per gli altri), quindi non è più prevista validazione manuale su categorie o range.

### Gestione range null (solo per UI)

`getCompatibleCategories()` continua a gestire i range null per il filtro delle categorie compatibili in UI:

1. **Range completamente null** (`min === null && max === null`): categoria sempre compatibile (es. `blast_chilling`).
2. **Min null, max definito**: si controlla solo `temperature <= range.max`.
3. **Max null, min definito**: si controlla solo `temperature >= range.min`.

### Calcolo Temperatura Automatico

La temperatura viene calcolata automaticamente usando `DEFAULT_TEMPERATURES`:

```typescript
export const DEFAULT_TEMPERATURES: Record<ConservationPointType, number> = {
  fridge: 4,
  freezer: -18,
  blast: -30,  // Nota: Abbattitore precompilato usa -25, ma default è -30
  ambient: 20,
}
```

**Nota:** L'Abbattitore precompilato usa `-25°C`, ma il default è `-30°C`. Questo è corretto perché:
- In modalità edit, viene preservata la temperatura esistente
- Per nuovi punti blast, viene usato il default `-30°C`

### Compatibilità con Codice Esistente

- ✅ Tutti i punti esistenti continuano a funzionare
- ✅ La validazione è retrocompatibile
- ✅ Nessuna breaking change per altri componenti

---

## 🔍 File Modificati

1. **src/utils/onboarding/conservationUtils.ts**
   - `validateConservationPoint()`: **solo schema Zod**; rimosse validazioni `incompatibleCategories` e `outOfRangeCategories` (Fase 3)
   - `getCompatibleCategories()`: invariata (gestione range null per UI; non usata dalla validazione)

2. **src/components/onboarding-steps/ConservationStep.tsx**
   - Import: `getConservationTempRangeString`, `DEFAULT_TEMPERATURES`; Fase 3: `getProfileById`, `mapCategoryIdsToDbNames`, `Modal`, `OptimizedImage`, `getApplianceImagePathWithProfile`, `hasApplianceImageAvailable`, `AlertCircle`, `ConservationProfileId`
   - `calculatedTemperature` useMemo; `compatibleCategories` che lo usa
   - Rimosso `temperatureError` e `useEffect` validazione temperatura
   - `handleSubmit` con `calculatedTemperature`; validazione solo schema
   - Campo temperatura read-only; `source: 'prefill'` in `prefillSampleData()`
   - Profili HACCP ai 4 frigoriferi; Frigo 3 → 1°C; rimosso badge “Abbattitore” ridondante
   - **Fase 3:** Sezione profilo (solo fridge): layout split, `selectedProfile`, `isImageModalOpen` / `imageError`, Modal lightbox, rimozione “Note operative”, messaggio errori lista punti

3. **src/utils/onboardingHelpers.ts**
   - `applianceCategory` e `profileId` ai 4 frigoriferi in `getPrefillData()`; Frigo 3 → 1°C

---

## 📚 Riferimenti

- **Piano Originale:** Fornito dall'utente all'inizio della sessione
- **File di Riferimento:** `src/features/conservation/components/AddPointModal.tsx` (comportamento target)
- **Costanti:** `src/utils/conservationConstants.ts` (DEFAULT_TEMPERATURES, getConservationTempRangeString)

---

## ✨ Conclusione

Il lavoro è stato completato in tre fasi:

### Fase 1: Allineamento Validazione Temperatura
- Temperatura read-only e calcolata automaticamente; fix gestione range null (poi sostituito da semplificazione in Fase 3).
- Abbattitore -25°C validato correttamente.

### Fase 2: Profili HACCP nei prefill
- `applianceCategory` e `profileId` per i 4 frigoriferi; Frigo 3 → 1°C (`fish_generic`).

### Fase 3: Validazione solo schema + Sezione profilo in ConservationStep (24-01-2026)
- **Validazione:** `validateConservationPoint()` usa solo lo schema Zod; rimosse validazioni su categorie (incompatibili / fuori range).
- **UI:** Sezione “Configurazione Punto di Conservazione” (solo frigoriferi) allineata ad AddPointModal: layout split (categorie auto-assegnate | immagine), info box Note HACCP, Modal lightbox, stato immagine e reset.

---

## 👥 Contributi

- **Fase 1 (Allineamento Validazione):** Sessione iniziale
- **Fase 2 (Profili HACCP):** Stessa giornata
- **Fase 3 (Validazione schema + Sezione profilo):** 24-01-2026
