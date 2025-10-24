# 🧭 NAVIGAZIONE - Componenti Identificate

> **AGENTE**: Agente 5 - Navigazione e Routing  
> **PORTA**: 3004  
> **PRIORITÀ**: 2 (IMPORTANTE)

---

## 📊 PANORAMICA COMPONENTI NAVIGAZIONE

| Componente | File | Tipo | Complessità | Stato | Priorità |
|------------|------|------|-------------|-------|----------|
| **MainLayout** | `src/components/layouts/MainLayout.tsx` | Layout principale | Alta | ⏳ Da testare | 1 |
| **ProtectedRoute** | `src/components/ProtectedRoute.tsx` | Protezione route | Alta | ⏳ Da testare | 1 |
| **HeaderButtons** | `src/components/HeaderButtons.tsx` | Bottoni header | Media | ⏳ Da testare | 2 |
| **CompanySwitcher** | `src/components/CompanySwitcher.tsx` | Selettore azienda | Media | ⏳ Da testare | 2 |
| **StepNavigator** | `src/components/StepNavigator.tsx` | Navigazione step | Media | ⏳ Da testare | 3 |
| **OnboardingGuard** | `src/components/OnboardingGuard.tsx` | Guard onboarding | Media | ⏳ Da testare | 3 |
| **SyncStatusBar** | `src/components/offline/SyncStatusBar.tsx` | Barra sincronizzazione | Bassa | ⏳ Da testare | 4 |
| **App.tsx** | `src/App.tsx` | Routing principale | Alta | ⏳ Da testare | 1 |

**TOTALE COMPONENTI**: **8**

---

## 🎯 SEQUENZA OBBLIGATORIA DI LAVORO

### **FASE 1 - Layout e Routing Base**
1. **MainLayout.tsx** - Layout principale con navigazione bottom
2. **ProtectedRoute.tsx** - Protezione route e autorizzazioni
3. **App.tsx** - Routing principale dell'applicazione

### **FASE 2 - Componenti Navigazione**
4. **HeaderButtons.tsx** - Bottoni header e controlli
5. **CompanySwitcher.tsx** - Selettore azienda multi-tenant

### **FASE 3 - Componenti Specializzati**
6. **StepNavigator.tsx** - Navigazione step onboarding
7. **OnboardingGuard.tsx** - Guard redirect onboarding
8. **SyncStatusBar.tsx** - Barra stato sincronizzazione

---

## 📋 DETTAGLI COMPONENTI

### 1. **MainLayout.tsx** - Layout Principale
- **File**: `src/components/layouts/MainLayout.tsx`
- **Tipo**: Layout principale con navigazione
- **Funzionalità**:
  - Header con titolo e controlli
  - Bottom navigation con tab principali
  - Gestione permessi per tab (admin, responsabile)
  - Integrazione CompanySwitcher e HeaderButtons
  - SyncStatusBar per stato offline
- **Dipendenze**: HeaderButtons, CompanySwitcher, SyncStatusBar, useAuth
- **Stato**: ⏳ Da testare
- **Complessità**: Alta
- **Priorità**: 1 (CRITICA)

### 2. **ProtectedRoute.tsx** - Protezione Route
- **File**: `src/components/ProtectedRoute.tsx`
- **Tipo**: Componente protezione route
- **Funzionalità**:
  - Controllo autenticazione utente
  - Controllo autorizzazioni per ruolo
  - Controllo permessi specifici
  - Redirect automatico a login
  - Gestione stati di loading e errore
  - HOC per protezione componenti
- **Dipendenze**: useAuth, useNavigate
- **Stato**: ⏳ Da testare
- **Complessità**: Alta
- **Priorità**: 1 (CRITICA)

### 3. **HeaderButtons.tsx** - Bottoni Header
- **File**: `src/components/HeaderButtons.tsx`
- **Tipo**: Componente controlli header
- **Funzionalità**:
  - Badge attività con contatore alert
  - Bottone reset dati operativi
  - Bottone riapri onboarding
  - Bottoni dev (solo in sviluppo)
  - Sincronizzazione multi-host
  - Debug auth state
- **Dipendenze**: useAuth, useAlertBadge, useAggregatedEvents, useFilteredEvents
- **Stato**: ⏳ Da testare
- **Complessità**: Media
- **Priorità**: 2 (IMPORTANTE)

### 4. **CompanySwitcher.tsx** - Selettore Azienda
- **File**: `src/components/CompanySwitcher.tsx`
- **Tipo**: Componente selettore multi-tenant
- **Funzionalità**:
  - Dropdown aziende utente
  - Switch tra aziende multiple
  - Visualizzazione ruolo per azienda
  - Gestione stato loading switch
  - Click outside per chiudere dropdown
- **Dipendenze**: useAuth
- **Stato**: ⏳ Da testare
- **Complessità**: Media
- **Priorità**: 2 (IMPORTANTE)

### 5. **StepNavigator.tsx** - Navigazione Step
- **File**: `src/components/StepNavigator.tsx`
- **Tipo**: Componente navigazione step
- **Funzionalità**:
  - Navigazione step onboarding
  - Progress indicator
  - Click per andare a step precedenti
  - Layout responsive (desktop/mobile)
  - Gestione stati step (completed, current, upcoming)
- **Dipendenze**: Nessuna
- **Stato**: ⏳ Da testare
- **Complessità**: Media
- **Priorità**: 3 (NORMALE)

### 6. **OnboardingGuard.tsx** - Guard Onboarding
- **File**: `src/components/OnboardingGuard.tsx`
- **Tipo**: Componente guard redirect
- **Funzionalità**:
  - Controllo se utente ha company associata
  - Redirect automatico a onboarding se necessario
  - Gestione stato loading
  - Skip se già in onboarding
  - Controllo localStorage onboarding completato
- **Dipendenze**: useAuth, useNavigate, useLocation
- **Stato**: ⏳ Da testare
- **Complessità**: Media
- **Priorità**: 3 (NORMALE)

### 7. **SyncStatusBar.tsx** - Barra Sincronizzazione
- **File**: `src/components/offline/SyncStatusBar.tsx`
- **Tipo**: Componente barra stato
- **Funzionalità**:
  - Indicatore stato connessione
  - Contatore operazioni pending
  - Mostra errori sincronizzazione
  - Bottone sync manuale
  - Indicatore qualità connessione
  - Posizionamento top/bottom
- **Dipendenze**: useOfflineSync, useNetworkStatus
- **Stato**: ⏳ Da testare
- **Complessità**: Bassa
- **Priorità**: 4 (BASSA)

### 8. **App.tsx** - Routing Principale
- **File**: `src/App.tsx`
- **Tipo**: Componente routing principale
- **Funzionalità**:
  - Definizione tutte le route dell'app
  - Route pubbliche (auth)
  - Route protette con MainLayout
  - Lazy loading pagine
  - ToastContainer configurazione
  - Esposizione funzioni dev in sviluppo
- **Dipendenze**: Routes, Route, MainLayout, ProtectedRoute, OnboardingGuard
- **Stato**: ⏳ Da testare
- **Complessità**: Alta
- **Priorità**: 1 (CRITICA)

---

## 🔗 DIPENDENZE TRA COMPONENTI

### **Dipendenze Critiche**
```
App.tsx → MainLayout → HeaderButtons + CompanySwitcher + SyncStatusBar
App.tsx → ProtectedRoute → useAuth
MainLayout → ProtectedRoute → useAuth
OnboardingGuard → useAuth → useNavigate
```

### **Ordine di Test Obbligatorio**
1. **useAuth** (hook) - Deve essere testato prima di tutto
2. **ProtectedRoute** - Base per protezione
3. **MainLayout** - Layout principale
4. **App.tsx** - Routing completo
5. **HeaderButtons** - Controlli header
6. **CompanySwitcher** - Selettore azienda
7. **StepNavigator** - Navigazione step
8. **OnboardingGuard** - Guard onboarding
9. **SyncStatusBar** - Barra sincronizzazione

---

## 🧪 PIANO DI TEST

### **Test per MainLayout**
- ✅ Navigazione bottom tab
- ✅ Highlight tab attivo
- ✅ Permessi tab (admin, responsabile)
- ✅ Responsive design
- ✅ Integrazione HeaderButtons
- ✅ Integrazione CompanySwitcher
- ✅ Integrazione SyncStatusBar

### **Test per ProtectedRoute**
- ✅ Redirect non autenticato
- ✅ Controllo ruoli
- ✅ Controllo permessi
- ✅ Stati loading
- ✅ Gestione errori
- ✅ HOC withRoleProtection
- ✅ HOC withPermissionProtection

### **Test per HeaderButtons**
- ✅ Badge attività con contatore
- ✅ Reset dati operativi
- ✅ Riapri onboarding
- ✅ Bottoni dev (solo sviluppo)
- ✅ Sincronizzazione multi-host
- ✅ Debug auth state

### **Test per CompanySwitcher**
- ✅ Dropdown aziende
- ✅ Switch azienda
- ✅ Visualizzazione ruolo
- ✅ Stato loading
- ✅ Click outside
- ✅ Una sola azienda (non mostra dropdown)

### **Test per StepNavigator**
- ✅ Navigazione step
- ✅ Progress indicator
- ✅ Click step precedenti
- ✅ Layout responsive
- ✅ Stati step (completed, current, upcoming)

### **Test per OnboardingGuard**
- ✅ Redirect se no company
- ✅ Skip se in onboarding
- ✅ Controllo localStorage
- ✅ Stato loading
- ✅ Gestione admin senza company

### **Test per SyncStatusBar**
- ✅ Indicatore connessione
- ✅ Operazioni pending
- ✅ Errori sincronizzazione
- ✅ Bottone sync manuale
- ✅ Posizionamento top/bottom

### **Test per App.tsx**
- ✅ Route pubbliche
- ✅ Route protette
- ✅ Lazy loading
- ✅ ToastContainer
- ✅ Funzioni dev (solo sviluppo)

---

## 📊 STATISTICHE

- **Componenti Totali**: 8
- **Componenti Critiche**: 3 (MainLayout, ProtectedRoute, App.tsx)
- **Componenti Importanti**: 2 (HeaderButtons, CompanySwitcher)
- **Componenti Normali**: 2 (StepNavigator, OnboardingGuard)
- **Componenti Basse**: 1 (SyncStatusBar)
- **Test Stimati**: ~60 test totali
- **Tempo Stimato**: 8-12 ore

---

*Questo file rappresenta l'inventario completo dei componenti di navigazione per Agente 5.*
