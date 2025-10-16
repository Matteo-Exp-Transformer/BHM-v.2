# 🤖 GUIDA TESTING MULTI-AGENT - Coordinamento Blindatura App

> **SCOPO**: Coordinare agenti multipli per blindatura sistematica di ogni elemento dell'app BHM v.2  
> **METODO**: Testing granulare dal più piccolo elemento al più complesso  
> **OBIETTIVO**: 100% componenti blindate e funzionanti

---

## 🎯 PRINCIPI FONDAMENTALI

### **REGOLA D'ORO**
> **NON PASSARE AL PROSSIMO ELEMENTO FINO A QUANDO L'ATTUALE NON È COMPLETAMENTE BLINDATO**

### **APPROCCIO GRANULARE**
1. **Partire dal più piccolo elemento** (input field, button, icona)
2. **Testare ogni combinazione possibile** (caratteri, valori, stati)
3. **Verificare logiche interne** (validazioni, vincoli, dipendenze)
4. **Blindare solo quando 100% testato**
5. **Passare all'elemento successivo**

---

## 👥 DIVISIONE RUOLI AGENTI

### **AGENTE 1 - UI ELEMENTI BASE** 🔧
**Responsabilità**: Componenti UI atomiche
- Input fields (text, number, email, password)
- Buttons (primary, secondary, disabled states)
- Icons e immagini
- Badge e labels
- Loading spinners
- Tooltip e popover

**Porta**: 3000  
**Priorità**: 1 (CRITICA)

### **AGENTE 2 - FORM E VALIDAZIONI** 📝
**Responsabilità**: Form complessi e validazioni
- Form di registrazione/login
- Form prodotti (inventario)
- Form punti conservazione
- Form gestione staff
- Validazioni cross-field
- Error handling

**Porta**: 3001  
**Priorità**: 1 (CRITICA)

### **AGENTE 3 - LOGICHE BUSINESS** 🧠
**Responsabilità**: Logiche di business e vincoli
- Regole HACCP e conservazione
- Validazioni temperatura vs categorie
- Calcoli automatici
- Vincoli dipendenze
- Regole multi-tenant

**Porta**: 3002  
**Priorità**: 1 (CRITICA)

### **AGENTE 4 - CALENDARIO E EVENTI** 📅
**Responsabilità**: Sistema calendario completo
- Configurazione calendario
- Creazione eventi
- Filtri e viste
- Ricorrenze e scheduling
- Integrazione con conservazione

**Porta**: 3003  
**Priorità**: 2 (IMPORTANTE)

### **AGENTE 5 - NAVIGAZIONE E ROUTING** 🧭
**Responsabilità**: Navigazione e routing
- Menu navigation
- Route protection
- Redirect e deep linking
- Breadcrumb e history
- Modal e overlay

**Porta**: 3004  
**Priorità**: 2 (IMPORTANTE)

---

## 🔄 WORKFLOW DETTAGLIATO PER ELEMENTO

### **FASE 1: IDENTIFICAZIONE ELEMENTO**

```markdown
## STEP 1.1 - Analisi Elemento
1. **Identificare** l'elemento più piccolo non ancora testato
2. **Localizzare** nel codice sorgente
3. **Documentare** tutte le props, stati, dipendenze
4. **Mappare** tutte le interazioni possibili
5. **Creare** piano test specifico per quell'elemento

## STEP 1.2 - Setup Test Environment
1. **Avviare** server su porta assegnata
2. **Navigare** alla pagina contenente l'elemento
3. **Verificare** che l'elemento sia visibile e funzionante
4. **Preparare** dati di test necessari
```

### **FASE 2: TESTING GRANULARE**

#### **2.1 INPUT FIELDS - Test Completo**
```javascript
// Template per ogni input field
test.describe('[NomeInput] - Test Completo', () => {
  
  // Test caratteri validi
  test('Dovrebbe accettare tutti i caratteri validi', async ({ page }) => {
    const validInputs = [
      'Testo normale',
      '123 numeri',
      'Caratteri speciali: !@#$%^&*()',
      'Spazi multipli    test',
      'Accenti: àèéìòù',
      'Emoji: 🚀🎉✅',
      'Caratteri Unicode: αβγδε',
      'Stringa molto lunga: ' + 'a'.repeat(1000)
    ];
    
    for (const input of validInputs) {
      await page.fill('[selector]', input);
      await expect(page.locator('[selector]')).toHaveValue(input);
    }
  });
  
  // Test caratteri invalidi
  test('Dovrebbe rifiutare caratteri invalidi', async ({ page }) => {
    const invalidInputs = [
      '', // stringa vuota
      '   ', // solo spazi
      null,
      undefined,
      // Caratteri specifici per tipo campo
    ];
    
    for (const input of invalidInputs) {
      await page.fill('[selector]', input);
      await expect(page.locator('[error-message]')).toBeVisible();
    }
  });
  
  // Test limiti lunghezza
  test('Dovrebbe rispettare limiti lunghezza', async ({ page }) => {
    const maxLength = 100;
    const longString = 'a'.repeat(maxLength + 1);
    
    await page.fill('[selector]', longString);
    await expect(page.locator('[selector]')).toHaveValue(
      longString.substring(0, maxLength)
    );
  });
  
  // Test validazione real-time
  test('Dovrebbe validare in tempo reale', async ({ page }) => {
    await page.fill('[selector]', 'input_invalido');
    await expect(page.locator('[error-realtime]')).toBeVisible();
    
    await page.fill('[selector]', 'input_valido');
    await expect(page.locator('[error-realtime]')).not.toBeVisible();
  });
});
```

#### **2.2 BUTTONS - Test Completo**
```javascript
test.describe('[NomeButton] - Test Completo', () => {
  
  // Test stati button
  test('Dovrebbe gestire tutti gli stati', async ({ page }) => {
    // Stato normale
    await expect(page.locator('[button]')).toBeEnabled();
    await expect(page.locator('[button]')).toBeVisible();
    
    // Stato disabled
    await page.click('[trigger-disable]');
    await expect(page.locator('[button]')).toBeDisabled();
    
    // Stato loading
    await page.click('[trigger-loading]');
    await expect(page.locator('[button] [loading-spinner]')).toBeVisible();
    
    // Stato hover
    await page.hover('[button]');
    await expect(page.locator('[button]')).toHaveClass(/hover/);
  });
  
  // Test click e azioni
  test('Dovrebbe eseguire azione corretta', async ({ page }) => {
    await page.click('[button]');
    await expect(page.locator('[result]')).toBeVisible();
  });
  
  // Test accessibilità
  test('Dovrebbe essere accessibile', async ({ page }) => {
    await expect(page.locator('[button]')).toHaveAttribute('aria-label');
    await expect(page.locator('[button]')).toHaveAttribute('role', 'button');
  });
});
```

#### **2.3 LOGICHE BUSINESS - Test Completo**
```javascript
test.describe('[NomeLogica] - Test Vincoli Business', () => {
  
  // Test regole HACCP
  test('Dovrebbe rispettare regole HACCP', async ({ page }) => {
    // Test temperatura vs categoria prodotto
    await page.selectOption('[categoria]', 'fresh_meat');
    await page.fill('[temperatura]', '10'); // Troppo alta per carne fresca
    
    await expect(page.locator('[error-haccp]')).toBeVisible();
    await expect(page.locator('[error-haccp]')).toContainText(
      'Temperatura non conforme per carne fresca'
    );
    
    // Test temperatura corretta
    await page.fill('[temperatura]', '2');
    await expect(page.locator('[error-haccp]')).not.toBeVisible();
  });
  
  // Test vincoli dipendenze
  test('Dovrebbe gestire dipendenze tra campi', async ({ page }) => {
    // Seleziona freezer
    await page.selectOption('[tipo]', 'freezer');
    
    // Temperatura deve essere negativa
    await page.fill('[temperatura]', '5'); // Positiva
    await expect(page.locator('[error-dipendenza]')).toBeVisible();
    
    // Temperatura corretta
    await page.fill('[temperatura]', '-18');
    await expect(page.locator('[error-dipendenza]')).not.toBeVisible();
  });
  
  // Test calcoli automatici
  test('Dovrebbe calcolare automaticamente', async ({ page }) => {
    await page.fill('[quantita]', '10');
    await page.fill('[prezzo-unitario]', '5');
    
    await expect(page.locator('[prezzo-totale]')).toHaveValue('50');
  });
});
```

#### **2.4 CALENDARIO - Test Completo**
```javascript
test.describe('[Calendario] - Test Configurazione', () => {
  
  // Test configurazione anno lavorativo
  test('Dovrebbe configurare anno lavorativo', async ({ page }) => {
    await page.click('[config-calendario]');
    
    // Test anno valido
    await page.fill('[anno]', '2025');
    await expect(page.locator('[anno]')).toHaveValue('2025');
    
    // Test anno invalido
    await page.fill('[anno]', '2020'); // Passato
    await expect(page.locator('[error-anno]')).toBeVisible();
    
    // Test giorni apertura
    await page.check('[lunedi]');
    await page.check('[martedi]');
    await page.check('[venerdi]');
    
    await expect(page.locator('[giorni-apertura]')).toHaveValue('3');
  });
  
  // Test creazione eventi
  test('Dovrebbe creare eventi correttamente', async ({ page }) => {
    await page.click('[nuovo-evento]');
    
    // Test evento semplice
    await page.fill('[titolo]', 'Manutenzione Frigo A');
    await page.selectOption('[tipo]', 'manutenzione');
    await page.fill('[data]', '2025-01-15');
    
    await page.click('[salva]');
    await expect(page.locator('[evento-creato]')).toBeVisible();
    
    // Test evento ricorrente
    await page.click('[nuovo-evento]');
    await page.fill('[titolo]', 'Controllo Temperatura');
    await page.check('[ricorrente]');
    await page.selectOption('[frequenza]', 'giornaliera');
    
    await page.click('[salva]');
    await expect(page.locator('[eventi-ricorrenti]')).toHaveCount(365);
  });
});
```

### **FASE 3: VALIDAZIONE E BLINDATURA**

#### **3.1 Criteri di Blindatura**
```markdown
## CHECKLIST BLINDATURA COMPLETA
- [ ] Tutti i test passano (100%)
- [ ] Elemento testato con ogni combinazione possibile
- [ ] Logiche business verificate
- [ ] Edge cases gestiti
- [ ] Error handling corretto
- [ ] Performance accettabile
- [ ] Accessibilità verificata
- [ ] Nessun side effect su altri elementi
- [ ] Documentazione aggiornata
- [ ] Codice commentato con // LOCKED:
```

#### **3.2 Processo di Lock**
```javascript
// Nel codice sorgente, aggiungere:
// LOCKED: [Data] - [NomeElemento] completamente testato
// Test eseguiti: [numero] test, tutti passati
// Combinazioni testate: [lista dettagliata]
// NON MODIFICARE SENZA PERMESSO ESPLICITO

// Esempio:
const ProductNameInput = ({ value, onChange }) => {
  // LOCKED: 2025-01-16 - ProductNameInput completamente testato
  // Test eseguiti: 15 test, tutti passati
  // Combinazioni testate: caratteri validi/invalidi, lunghezza, validazione real-time
  // NON MODIFICARE SENZA PERMESSO ESPLICITO
  
  return (
    <input 
      value={value} 
      onChange={onChange}
      maxLength={100}
      // ... resto props
    />
  );
};
```

---

## 📊 SISTEMA DI COORDINAMENTO

### **File di Coordinamento Principali**
```markdown
# Production/Knowledge/MASTER_TRACKING.md - FILE CENTRALE
# Contiene stato globale di tutte le componenti e aree

# Production/Knowledge/[AREA]_COMPONENTI.md - File Inventario Area
# Esempi: AUTENTICAZIONE_COMPONENTI.md, ONBOARDING_COMPONENTI.md, UI_BASE_COMPONENTI.md

# Production/Knowledge/INVENTARIO_COMPLETO_RIESEGUITO.md - Inventario Completo
# Tutte le 200+ componenti identificate nell'app
```

### **File di Coordinamento Agenti**
```markdown
# Production/Test_Coordination/AGENT_STATUS.md (da creare)

| Agente | Elemento Corrente | Status | Test Eseguiti | Prossimo Elemento |
|--------|------------------|---------|---------------|-------------------|
| Agente1 | ProductNameInput | 🔄 Testing | 12/15 | ProductPriceInput |
| Agente2 | LoginForm | ✅ Blinded | 20/20 | RegisterForm |
| Agente3 | TemperatureValidation | 🔄 Testing | 8/12 | CategoryConstraints |
| Agente4 | CalendarConfig | ⏳ In attesa | 0/0 | EventCreation |
| Agente5 | NavigationMenu | ✅ Blinded | 15/15 | BreadcrumbNav |
```

### **Comunicazione tra Agenti**
```markdown
## PROTOCOLLO COMUNICAZIONE

### Quando un elemento è BLINDATO:
1. **Aggiornare** AGENT_STATUS.md
2. **Commit** con messaggio "LOCK: [NomeElemento]"
3. **Notificare** altri agenti se ci sono dipendenze
4. **Passare** all'elemento successivo

### Quando si trova un BUG:
1. **Documentare** il bug nel file tracking
2. **Fixare** se possibile
3. **Ri-testare** completamente
4. **Blindare** solo se 100% funzionante

### Quando si ha un CONFLITTO:
1. **FERMARE** il lavoro
2. **Comunicare** con altri agenti
3. **Risolvere** il conflitto
4. **Riprendere** il lavoro coordinato
```

---

## 🎯 PRIORITÀ E SEQUENZA DI LAVORO

### **SEQUENZA OBBLIGATORIA**

#### **AGENTE 1 - UI ELEMENTI BASE**
```
1. Input fields (text) → 2. Input fields (number) → 3. Input fields (email) 
→ 4. Buttons (primary) → 5. Buttons (secondary) → 6. Icons
→ 7. Badge → 8. Loading spinners → 9. Tooltip
```

#### **AGENTE 2 - FORM E VALIDAZIONI**
```
1. LoginForm → 2. RegisterForm → 3. ProductForm → 4. ConservationPointForm
→ 5. StaffForm → 6. DepartmentForm → 7. CategoryForm
```

#### **AGENTE 3 - LOGICHE BUSINESS**
```
1. TemperatureValidation → 2. CategoryConstraints → 3. HACCPRules
→ 4. MultiTenantLogic → 5. PermissionLogic → 6. CalculationLogic
```

#### **AGENTE 4 - CALENDARIO E EVENTI**
```
1. CalendarConfig → 2. EventCreation → 3. EventEditing → 4. RecurrenceLogic
→ 5. FilterLogic → 6. ViewSwitching → 7. IntegrationLogic
```

#### **AGENTE 5 - NAVIGAZIONE E ROUTING**
```
1. NavigationMenu → 2. BreadcrumbNav → 3. RouteProtection → 4. ModalRouting
→ 5. DeepLinking → 6. HistoryManagement
```

---

## 🚨 GESTIONE ERRORI E CONFLITTI

### **PROTOCOLLO ERRORI**
```markdown
## SE UN TEST FALLISCE:
1. **NON continuare** con altri test
2. **Analizzare** la causa del fallimento
3. **Documentare** il problema
4. **Fixare** se possibile
5. **Ri-testare** completamente
6. **Blindare** solo se 100% successo

## SE SI TROVA UN BUG:
1. **FERMARE** il processo di blindatura
2. **Creare** issue dettagliata
3. **Fixare** il bug
4. **Ri-testare** tutto
5. **Riprendere** blindatura

## SE CI SONO SIDE EFFECTS:
1. **FERMARE** immediatamente
2. **Analizzare** l'impatto
3. **Comunicare** con altri agenti
4. **Risolvere** il side effect
5. **Ri-testare** elementi impattati
```

---

## 📈 METRICHE E REPORTING

### **Template Report Giornaliero**
```markdown
# REPORT GIORNALIERO - [Data]

## AGENTE [Nome]
- **Elemento Testato**: [NomeElemento]
- **Test Eseguiti**: [X]/[Y] (100%)
- **Tempo Speso**: [X]h [Y]m
- **Bug Trovati**: [Lista]
- **Fix Applicati**: [Lista]
- **Status**: ✅ Blinded / 🔄 In corso / ❌ Problemi

## COORDINAMENTO
- **Conflitti Risolti**: [Numero]
- **Dipendenze Gestite**: [Lista]
- **Prossimi Obiettivi**: [Lista]
```

### **Template Report Settimanale**
```markdown
# REPORT SETTIMANALE - Settimana [X]

## STATISTICHE GENERALI
- **Elementi Blindati**: [X]/[Y] ([Z]%)
- **Test Totali Eseguiti**: [Numero]
- **Bug Risolti**: [Numero]
- **Tempo Totale**: [X]h [Y]m

## PROGRESSI PER AGENTE
- **Agente 1**: [X] elementi blindati
- **Agente 2**: [X] elementi blindati
- **Agente 3**: [X] elementi blindati
- **Agente 4**: [X] elementi blindati
- **Agente 5**: [X] elementi blindati

## PROSSIMI OBIETTIVI
- [Lista obiettivi per la prossima settimana]
```

---

## 🎯 CHECKLIST FINALE PER OGNI AGENTE

### **Prima di Iniziare**
- [ ] **Leggi MASTER_TRACKING.md** per stato globale
- [ ] **Leggi [AREA]_COMPONENTI.md** per dettagli area
- [ ] **Leggi INVENTARIO_COMPLETO_RIESEGUITO.md** per overview completo
- [ ] **Leggi REGOLE_AGENTI.md** per regole critiche
- [ ] **Leggi WORKFLOW_BLINDATURA.md** per processo
- [ ] Server avviato sulla porta corretta
- [ ] Elemento da testare identificato
- [ ] Piano di test creato
- [ ] Dati di test preparati

### **Durante il Testing**
- [ ] **Usa TEMPLATE_TEST_JS.md** per struttura test
- [ ] **Crea file tracking** con TEMPLATE_TRACKING_COMPONENTE.md
- [ ] Ogni test documentato
- [ ] Ogni bug registrato
- [ ] Ogni fix documentato
- [ ] Coordinamento con altri agenti
- [ ] **Aggiorna MASTER_TRACKING.md** dopo ogni modifica
- [ ] **Aggiorna [AREA]_COMPONENTI.md** dopo ogni lock

### **Prima della Blindatura**
- [ ] Tutti i test passano (100%)
- [ ] Ogni combinazione testata
- [ ] Logiche business verificate
- [ ] Edge cases gestiti
- [ ] Nessun side effect
- [ ] Documentazione completa

### **Dopo la Blindatura**
- [ ] Codice commentato con // LOCKED:
- [ ] **MASTER_TRACKING.md aggiornato** (componenti locked +1)
- [ ] **[AREA]_COMPONENTI.md aggiornato** (stato componente → 🔒 LOCKED)
- [ ] **File tracking componente** completato
- [ ] Commit eseguito con messaggio "LOCK: [NomeComponente]"
- [ ] Altri agenti notificati
- [ ] Prossimo elemento identificato

---

## 📚 FILE DI RIFERIMENTO OBBLIGATORI

### **File di Stato e Tracking**
```markdown
# FILE CENTRALI - SEMPRE DA LEGGERE PRIMA
Production/Knowledge/MASTER_TRACKING.md              # Stato globale tutte le componenti
Production/Knowledge/INVENTARIO_COMPLETO_RIESEGUITO.md # Inventario completo 200+ componenti

# FILE INVENTARIO AREA - PER AREA SPECIFICA
Production/Knowledge/AUTENTICAZIONE_COMPONENTI.md     # 6 componenti autenticazione
Production/Knowledge/ONBOARDING_COMPONENTI.md         # 8 componenti onboarding  
Production/Knowledge/UI_BASE_COMPONENTI.md            # 19 componenti UI base
# + altri file [AREA]_COMPONENTI.md per ogni area
```

### **File Regole e Processo**
```markdown
# REGOLE CRITICHE
Production/Prompt_Context/REGOLE_AGENTI.md            # Regole blindatura NON NEGOZIABILI

# PROCESSO E WORKFLOW
Production/Prompt_Context/WORKFLOW_BLINDATURA.md      # Processo step-by-step
Production/Prompt_Context/GUIDA_GENERAZIONE_PROMPT.md # Come generare prompt perfetti
```

### **File Template e Guide**
```markdown
# TEMPLATE PER TEST
Production/Prompt_Context/TEMPLATE_TEST_JS.md         # Template test Playwright
Production/Prompt_Context/TEMPLATE_TRACKING_COMPONENTE.md # Template tracking componente

# GUIDE SPECIFICHE
Production/Prompt_Context/PROMPT_BLINDATURA_AGENTI.md # Prompt per blindatura
Production/Prompt_Context/PROMPT_MAPPATURA_AGENTI.md  # Prompt per mappatura
```

### **File Test Esistenti**
```markdown
# ESEMPI DI TEST GIÀ CREATI
Production/Test/Onboarding/OnboardingWizard/          # Test completi OnboardingWizard
├── test-funzionale.js                                # Test funzionali
├── test-validazione.js                               # Test validazione
├── test-edge-cases.js                                # Test edge cases
└── test-completamento.js                             # Test completamento

# STRUTTURA CARTELLE TEST
Production/Test/[Area]/[Componente]/                  # Struttura da seguire
├── test-funzionale.js
├── test-validazione.js
└── test-edge-cases.js
```

### **Workflow di Lettura File**
```markdown
## SEQUENZA OBBLIGATORIA DI LETTURA

### 1. ALL'INIZIO DI OGNI SESSIONE
1. **MASTER_TRACKING.md** - Stato globale progetto
2. **REGOLE_AGENTI.md** - Regole critiche
3. **[AREA]_COMPONENTI.md** - Dettagli area di lavoro

### 2. PRIMA DI INIZIARE TESTING
4. **WORKFLOW_BLINDATURA.md** - Processo completo
5. **TEMPLATE_TEST_JS.md** - Struttura test
6. **TEMPLATE_TRACKING_COMPONENTE.md** - Tracking

### 3. PRIMA DI BLINDATURA
7. **INVENTARIO_COMPLETO_RIESEGUITO.md** - Overview completo
8. Verifica esempi in **Production/Test/Onboarding/OnboardingWizard/**

### 4. DURANTE IL LAVORO
- Aggiorna **MASTER_TRACKING.md** dopo ogni modifica
- Aggiorna **[AREA]_COMPONENTI.md** dopo ogni lock
- Crea file tracking con **TEMPLATE_TRACKING_COMPONENTE.md**
```

### **Comandi di Lettura Rapida**
```bash
# Leggi file di stato
read_file target_file="Production/Knowledge/MASTER_TRACKING.md"
read_file target_file="Production/Knowledge/[AREA]_COMPONENTI.md"

# Leggi regole e processo
read_file target_file="Production/Prompt_Context/REGOLE_AGENTI.md"
read_file target_file="Production/Prompt_Context/WORKFLOW_BLINDATURA.md"

# Leggi template
read_file target_file="Production/Prompt_Context/TEMPLATE_TEST_JS.md"
read_file target_file="Production/Prompt_Context/TEMPLATE_TRACKING_COMPONENTE.md"

# Esamina test esistenti
read_file target_file="Production/Test/Onboarding/OnboardingWizard/test-funzionale.js"
```

---

**RICORDA**: La qualità è tutto! Meglio un elemento perfettamente blindato che 10 elementi parzialmente funzionanti. Ogni elemento deve essere testato in ogni modo possibile prima di essere considerato blindato. 🛡️
