# 📊 Sistema di Log "Completa Onboarding"

Documentazione del sistema di log dettagliato per tracciare il flusso completo quando si clicca sui pulsanti "Completa Onboarding".

## 🎯 Obiettivo

Tracciare nel dettaglio cosa succede quando si clicca su "Completa Onboarding" per:
- Sincronizzare tutti i pulsanti
- Debug problemi di flusso
- Capire dove si interrompe il processo

## 🔘 Pulsanti "Completa Onboarding"

### 1️⃣ DevButtons (Onboarding Wizard)
- **Posizione**: `src/components/DevButtons.tsx`
- **Visibilità**: Sempre visibile nell'onboarding
- **Handler**: `onCompleteOnboarding` (prop da OnboardingWizard)
- **Log**: 🔵 `[DevButtons] CLICK su "Completa Onboarding"`

### 2️⃣ Pulsante "Avanti" (Ultimo Step)
- **Posizione**: `src/components/OnboardingWizard.tsx`
- **Visibilità**: Ultimo step del wizard (step 6/6)
- **Handler**: `completeOnboardingFromWizard`
- **Log**: 🟣 `[OnboardingWizard] completeOnboardingFromWizard CHIAMATO`

### 3️⃣ Console (Dev Mode)
- **Posizione**: Console browser
- **Visibilità**: Solo in modalità sviluppo
- **Handler**: `window.completeOnboarding()`
- **Log**: Entra direttamente in completeOnboarding

## 📝 Flusso dei Log

### Scenario 1: Click su DevButtons

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [DevButtons] CLICK su "Completa Onboarding"
📍 Sorgente: DevButtons nell'OnboardingWizard
⏰ Timestamp: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 [OnboardingWizard] handleCompleteOnboarding CHIAMATO
📍 Sorgente: Callback da DevButtons
📊 CompanyId ricevuto: xxx-xxx-xxx
📦 FormData presente: true
📦 FormData keys: [company, departments, staff, ...]
⏰ Timestamp: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [completeOnboarding] FUNZIONE PRINCIPALE AVVIATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Parametri ricevuti:
  - companyIdParam: xxx-xxx-xxx
  - formDataParam: FORNITO
  - formDataParam keys: [company, departments, ...]
⏰ Timestamp inizio: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
🔍 [completeOnboarding] Verifica localStorage all'inizio:
📦 Tutte le chiavi localStorage: [...]
  - bhm-supabase-auth: PRESENTE (length: 1234)
  - onboarding-data: PRESENTE (length: 5678)
    ↓
[... elaborazione dati ...]
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ [completeOnboarding] COMPLETATO CON SUCCESSO
🔄 Reindirizzamento a /dashboard tra 1 secondo...
⏰ Timestamp fine: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
🔄 REDIRECT a /dashboard...
🔄 RELOAD pagina...
```

### Scenario 2: Click su "Avanti" (Ultimo Step)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟣 [OnboardingWizard] completeOnboardingFromWizard CHIAMATO
📍 Sorgente: Pulsante "Avanti" ultimo step wizard
📊 CompanyId attuale: xxx-xxx-xxx
📦 FormData presente: true
⏰ Timestamp: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
🚀 Chiamando completeOnboardingHelper con finalCompanyId: xxx-xxx-xxx
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [completeOnboarding] FUNZIONE PRINCIPALE AVVIATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[... continua come Scenario 1 ...]
```

### Scenario 3: Errore

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ [completeOnboarding] ERRORE!
❌ Errore completo: Error: ...
⏰ Timestamp errore: 2025-10-13T...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔍 Come Usare i Log

### 1. Verifica Punto di Partenza
Cerca il primo log con le linee `━━━━━━`:
- 🔵 `[DevButtons]` → Click da pulsante DevButtons
- 🟣 `[OnboardingWizard]` → Click da pulsante "Avanti"

### 2. Segui il Flusso
I log seguono questo ordine:
1. **Click** (DevButtons o Wizard)
2. **Handler** (handleCompleteOnboarding o completeOnboardingFromWizard)
3. **Funzione Principale** (completeOnboarding)
4. **Elaborazione** (verifiche, salvataggio, etc.)
5. **Completamento** (successo o errore)

### 3. Debug Problemi

#### Se non vedi log dopo il click:
- Verifica che il pulsante sia visibile
- Controlla che la prop sia passata correttamente

#### Se vedi errore:
- Leggi il messaggio di errore nel log `❌ [completeOnboarding] ERRORE!`
- Verifica timestamp per capire quando si è interrotto
- Controlla localStorage nel log iniziale

#### Se si blocca a metà:
- Cerca l'ultimo log con timestamp
- Verifica se mancano log tra uno step e l'altro

## 📋 Checklist Debug

- [ ] Vedo il log di click? (🔵 DevButtons o 🟣 Wizard)
- [ ] Vedo il log handler? (🟢 handleCompleteOnboarding o completeOnboardingFromWizard)
- [ ] Vedo il log funzione principale? (🔵 completeOnboarding AVVIATA)
- [ ] Vedo parametri ricevuti corretti?
- [ ] Vedo localStorage presente?
- [ ] Vedo completamento con successo? (✅ COMPLETATO)
- [ ] Vedo redirect? (🔄 REDIRECT)

## 🔧 File Modificati

1. **`src/components/DevButtons.tsx`**
   - Aggiunto log al click su "Completa Onboarding"

2. **`src/components/OnboardingWizard.tsx`**
   - Aggiunto log in `handleCompleteOnboarding`
   - Aggiunto log in `completeOnboardingFromWizard`

3. **`src/utils/onboardingHelpers.ts`**
   - Migliorati log iniziali con parametri dettagliati
   - Aggiunto log di successo prima del redirect
   - Aggiunto log di errore strutturato

## 💡 Tips

- I log con `━━━━━━` sono separatori per facilitare la lettura
- I timestamp aiutano a capire dove si blocca il flusso
- I log mostrano anche i dati passati (companyId, formData, etc.)
- In caso di errore, il log include lo stack trace completo

## 🚀 Prossimi Passi

1. Testa click su ogni pulsante "Completa Onboarding"
2. Verifica che i log appaiano correttamente
3. Confronta i flussi dei diversi pulsanti
4. Identifica differenze o problemi

