# 🎯 ONBOARDING - Inventario Componenti

> **Inventario completo delle componenti di onboarding da blindare**

## 📊 Panoramica Area

| Campo | Valore |
|-------|--------|
| **Area** | Onboarding |
| **Priorità** | 1 - Critica |
| **Componenti Totali** | 8 |
| **Stato** | 🔄 Inventario completato |

## 🗂️ Componenti Identificate

### 1. OnboardingWizard.tsx
- **File**: `src/components/OnboardingWizard.tsx`
- **Tipo**: Wizard principale
- **Funzionalità**:
  - Gestione 7 step di onboarding
  - Navigazione tra step (Avanti/Indietro)
  - Salvataggio automatico in localStorage
  - Gestione stato validazione per step
  - Completamento onboarding
  - Skip onboarding con conferma
  - Prefill dati con email utente
  - Progress bar
  - DevButtons per testing
- **Stato**: ⏳ Da testare
- **Complessità**: Alta

### 2. BusinessInfoStep.tsx
- **File**: `src/components/onboarding-steps/BusinessInfoStep.tsx`
- **Tipo**: Step 1 - Informazioni business
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 3. DepartmentsStep.tsx
- **File**: `src/components/onboarding-steps/DepartmentsStep.tsx`
- **Tipo**: Step 2 - Dipartimenti
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 4. StaffStep.tsx
- **File**: `src/components/onboarding-steps/StaffStep.tsx`
- **Tipo**: Step 3 - Personale
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 5. ConservationStep.tsx
- **File**: `src/components/onboarding-steps/ConservationStep.tsx`
- **Tipo**: Step 4 - Conservazione
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 6. TasksStep.tsx
- **File**: `src/components/onboarding-steps/TasksStep.tsx`
- **Tipo**: Step 5 - Task
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 7. InventoryStep.tsx
- **File**: `src/components/onboarding-steps/InventoryStep.tsx`
- **Tipo**: Step 6 - Inventario
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

### 8. CalendarConfigStep.tsx
- **File**: `src/components/onboarding-steps/CalendarConfigStep.tsx`
- **Tipo**: Step 7 - Configurazione calendario
- **Stato**: ⏳ Da analizzare
- **Complessità**: Da valutare

## 🎯 Funzionalità da Testare

### OnboardingWizard - Funzionalità Identificate

#### Navigazione
- [ ] **Bottone "Avanti"**: Naviga al prossimo step se valido
- [ ] **Bottone "Indietro"**: Naviga al step precedente
- [ ] **Click Step**: Naviga direttamente a step specifico
- [ ] **Progress Bar**: Mostra progresso corretto
- [ ] **Step Counter**: Mostra "Step X di 7"

#### Gestione Dati
- [ ] **Salvataggio Automatico**: Salva in localStorage ogni 500ms
- [ ] **Caricamento Dati**: Carica dati salvati al mount
- [ ] **Validazione Step**: Blocca avanzamento se step non valido
- [ ] **Aggiornamento FormData**: Aggiorna stato globale

#### Completamento
- [ ] **Completamento Wizard**: Ultimo step → completa onboarding
- [ ] **Completamento DevButton**: Bottone dev → completa onboarding
- [ ] **Skip Onboarding**: Conferma → salta configurazione
- [ ] **Prefill Dati**: Bottone prefill → carica dati con email

#### Stati UI
- [ ] **Loading State**: Mostra spinner durante completamento
- [ ] **Disabled States**: Disabilita bottoni quando non validi
- [ ] **Error Handling**: Mostra toast errori
- [ ] **Success Handling**: Mostra toast successo

#### DevButtons
- [ ] **Prefill Onboarding**: Precompila con email utente
- [ ] **Complete Onboarding**: Completa immediatamente
- [ ] **Visibilità**: Solo in modalità DEV

## 🧪 Test da Creare

### Test Funzionali (Tipo 1)
- [ ] **Test Navigazione Step**: Click Avanti/Indietro funziona
- [ ] **Test Validazione**: Non avanza se step non valido
- [ ] **Test Salvataggio**: Dati salvati in localStorage
- [ ] **Test Completamento**: Completa onboarding correttamente
- [ ] **Test Skip**: Skip con conferma funziona
- [ ] **Test Prefill**: Prefill carica dati corretti
- [ ] **Test Progress**: Progress bar aggiornata correttamente

### Test Validazione (Tipo 2)
- [ ] **Test Dati Validi**: Accetta dati completi e validi
- [ ] **Test Dati Invalidi**: Rifiuta dati incompleti
- [ ] **Test localStorage**: Gestisce localStorage corrotto
- [ ] **Test Navigazione**: Gestisce navigazione non valida
- [ ] **Test CompanyId**: Gestisce companyId null/valido

### Test Edge Cases
- [ ] **Test localStorage Vuoto**: Gestisce localStorage vuoto
- [ ] **Test Dati Corrotti**: Gestisce JSON malformato
- [ ] **Test Step Out of Range**: Click step non esistente
- [ ] **Test Concorrenza**: Multiple chiamate completamento
- [ ] **Test Network Error**: Gestisce errori di rete
- [ ] **Test Memory Leak**: Cleanup timeout e listener

## 🔗 Dipendenze

### Hook
- `useAuth()`: Hook per autenticazione e companyId
- `useNavigate()`: Hook React Router per navigazione
- `useQueryClient()`: Hook React Query per cache

### Servizi
- `onboardingHelpers`: Funzioni helper per onboarding
- Toast notifications: Sistema notifiche
- localStorage: Persistenza dati

### Componenti
- `StepNavigator`: Navigatore step
- `DevButtons`: Bottoni sviluppo
- Step components: 7 componenti step

### Routing
- `/dashboard`: Dashboard dopo completamento
- `/onboarding`: Wizard onboarding

## 📋 Prossimi Passi

1. **Analizzare Step Components** - Mappare funzionalità di ogni step
2. **Creare test per OnboardingWizard** - Testare wizard principale
3. **Creare test per ogni Step** - Testare ogni step individualmente
4. **Test integrazione** - Testare flusso completo
5. **Fix eventuali bug** - Risolvere problemi trovati
6. **Lock componenti** - Blindare dopo successo 100%

## 📝 Note Speciali

### Stato Attuale
- L'app ha onboarding già compilato
- Dati salvati in localStorage
- Pronto per testing

### Complessità
- **OnboardingWizard**: Alta (gestione stato complessa)
- **Step Components**: Da valutare (probabilmente Media-Alta)

### Priorità Testing
1. **OnboardingWizard** (critico - gestisce tutto)
2. **Step Components** (importanti - logica business)
3. **Integrazione** (completa - flusso end-to-end)

---

*Inventario creato per il processo di blindatura sistematica - Area Onboarding*

