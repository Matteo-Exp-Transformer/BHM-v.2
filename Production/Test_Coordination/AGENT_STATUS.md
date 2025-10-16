# 🤖 AGENT STATUS - Coordinamento Multi-Agente

> **FILE CENTRALE**: Coordinamento di tutti gli agenti che lavorano sulla blindatura dell'app BHM v.2

---

## 📊 STATO GLOBALE AGENTI

| Agente | Area Assegnata | Elemento Corrente | Status | Test Eseguiti | Prossimo Elemento | Porta |
|--------|---------------|------------------|---------|---------------|-------------------|-------|
| **Agente1** | UI Elementi Base | Button.tsx | ✅ Blinded | 30/30 | Input.tsx | 3000 |
| **Agente2** | Form e Validazioni | LoginForm | ⏳ In attesa | 0/0 | RegisterForm | 3001 |
| **Agente3** | Logiche Business | TemperatureValidation | ⏳ In attesa | 0/0 | CategoryConstraints | 3002 |
| **Agente4** | Calendario e Eventi | CalendarConfig | 🔄 Testing | 0/0 | EventCreation | 3003 |
| **Agente5** | Navigazione e Routing | MainLayout | 🔄 Testing | 0/0 | ProtectedRoute | 3004 |

---

## 🎯 PRIORITÀ E SEQUENZA DI LAVORO

### **SEQUENZA OBBLIGATORIA**

#### **AGENTE 1 - UI ELEMENTI BASE** 🔧
```
1. Button.tsx → 2. Input.tsx → 3. Modal.tsx → 4. Alert.tsx
→ 5. Badge.tsx → 6. Card.tsx → 7. LoadingSpinner.tsx → 8. Tooltip.tsx
→ 9. Select.tsx → 10. Switch.tsx → 11. Table.tsx → 12. Tabs.tsx
```

#### **AGENTE 2 - FORM E VALIDAZIONI** 📝
```
1. LoginForm → 2. RegisterForm → 3. ForgotPasswordForm → 4. AcceptInviteForm
→ 5. ProductForm → 6. ConservationPointForm → 7. StaffForm → 8. CategoryForm
```

#### **AGENTE 3 - LOGICHE BUSINESS** 🧠
```
1. TemperatureValidation → 2. CategoryConstraints → 3. HACCPRules
→ 4. MultiTenantLogic → 5. PermissionLogic → 6. CalculationLogic
→ 7. ExpiryTracking → 8. MaintenanceScheduling
```

#### **AGENTE 4 - CALENDARIO E EVENTI** 📅
```
1. CalendarConfig → 2. EventCreation → 3. EventEditing → 4. RecurrenceLogic
→ 5. FilterLogic → 6. ViewSwitching → 7. IntegrationLogic → 8. AlertSystem
```

#### **AGENTE 5 - NAVIGAZIONE E ROUTING** 🧭
```
1. MainLayout → 2. ProtectedRoute → 3. App.tsx → 4. HeaderButtons
→ 5. CompanySwitcher → 6. StepNavigator → 7. OnboardingGuard → 8. SyncStatusBar
```

---

## 📋 PROTOCOLLO COMUNICAZIONE

### **QUANDO UN ELEMENTO È BLINDATO**
1. **Aggiornare** questo file (AGENT_STATUS.md)
2. **Aggiornare** MASTER_TRACKING.md
3. **Aggiornare** [AREA]_COMPONENTI.md
4. **Commit** con messaggio "LOCK: [NomeElemento]"
5. **Notificare** altri agenti se ci sono dipendenze
6. **Passare** all'elemento successivo

### **QUANDO SI TROVA UN BUG**
1. **Documentare** il bug nel file tracking
2. **Aggiornare** questo file con status "🔄 Bug Fix"
3. **Fixare** se possibile
4. **Ri-testare** completamente
5. **Blindare** solo se 100% funzionante

### **QUANDO SI HA UN CONFLITTO**
1. **FERMARE** il lavoro
2. **Aggiornare** questo file con status "⚠️ Conflitto"
3. **Comunicare** con altri agenti
4. **Risolvere** il conflitto
5. **Riprendere** il lavoro coordinato

---

## 🚨 GESTIONE ERRORI E CONFLITTI

### **STATI POSSIBILI**
- ⏳ **In attesa** - Agente non ancora iniziato
- 🔄 **Testing** - Agente sta testando elemento corrente
- 🔄 **Bug Fix** - Agente sta fixando bug trovati
- ✅ **Blinded** - Elemento completamente testato e blindato
- ⚠️ **Conflitto** - Conflitto con altri agenti
- ❌ **Problemi** - Problemi tecnici o di coordinamento

### **PROTOCOLLO ERRORI**
```markdown
## SE UN TEST FALLISCE:
1. NON continuare con altri test
2. Aggiornare status a "🔄 Bug Fix"
3. Documentare il problema
4. Fixare se possibile
5. Ri-testare completamente
6. Blindare solo se 100% successo

## SE SI TROVA UN BUG:
1. FERMARE il processo di blindatura
2. Aggiornare status a "🔄 Bug Fix"
3. Creare issue dettagliata
4. Fixare il bug
5. Ri-testare tutto
6. Riprendere blindatura

## SE CI SONO SIDE EFFECTS:
1. FERMARE immediatamente
2. Aggiornare status a "⚠️ Conflitto"
3. Analizzare l'impatto
4. Comunicare con altri agenti
5. Risolvere il side effect
6. Ri-testare elementi impattati
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

## 🔗 DIPENDENZE TRA AGENTI

### **Dipendenze Critiche**
```markdown
## AGENTE 1 → AGENTE 2
- UI Elementi Base devono essere blindate prima dei Form
- Button.tsx e Input.tsx sono prerequisiti per tutti i form

## AGENTE 2 → AGENTE 3
- Form di login/registrazione devono essere blindate prima delle logiche business
- LoginForm è prerequisito per autenticazione e permessi

## AGENTE 3 → AGENTE 4
- Logiche business devono essere blindate prima del calendario
- TemperatureValidation è prerequisito per controlli calendario

## AGENTE 4 → AGENTE 5
- Sistema calendario deve essere blindato prima della navigazione
- EventCreation è prerequisito per routing eventi
```

### **Coordinate Critiche**
```markdown
## QUANDO AGENTE 1 COMPLETA:
- Notificare Agente 2 che può iniziare con i form
- Verificare che tutti i componenti UI base siano blindati

## QUANDO AGENTE 2 COMPLETA:
- Notificare Agente 3 che può iniziare con le logiche business
- Verificare che tutti i form siano blindati

## QUANDO AGENTE 3 COMPLETA:
- Notificare Agente 4 che può iniziare con il calendario
- Verificare che tutte le logiche business siano blindate

## QUANDO AGENTE 4 COMPLETA:
- Notificare Agente 5 che può iniziare con la navigazione
- Verificare che tutto il sistema calendario sia blindato
```

---

## 📝 NOTE OPERATIVE

### **Regole per Agenti**
1. **MAI modificare** file con `// LOCKED:`
2. **SEMPRE controllare** questo file prima di iniziare
3. **AGGIORNARE** questo file dopo ogni modifica
4. **COMUNICARE** con altri agenti in caso di conflitti
5. **SEGUIRE** la sequenza obbligatoria

### **Regole per Coordinamento**
1. **Un solo agente** per elemento alla volta
2. **Nessun conflitto** su file sorgente
3. **Comunicazione chiara** su dipendenze
4. **Aggiornamento tempestivo** di tutti i file di tracking

---

*Questo file deve essere aggiornato da ogni agente dopo ogni modifica per mantenere la sincronizzazione.*
