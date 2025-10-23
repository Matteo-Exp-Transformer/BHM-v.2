# AVVIO LAVORO BLINDATURA - LOGIN E ONBOARDING

**Data**: 2025-10-22 01:38
**Sessione**: Blindatura Completa Login e Onboarding
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## 🎯 SCOPO SESSIONE

**Obiettivo**: Eseguire **mappatura completa** di Login e Onboarding con nuovo metodo agenti e confrontare con risultati sessioni precedenti per completare blindatura.

**Metodo**: 
1. **Raccolta dati** sessioni precedenti da agenti competenti
2. **Mappatura sistematica** con nuovo approccio
3. **Confronto risultati** per identificare gap
4. **Blindatura finale** elementi critici

---

## 📊 DATI SESSIONI PRECEDENTI RACCOLTI

### **ONBOARDING COMPONENTI** (Production/Knowledge/ONBOARDING_COMPONENTI.md)
- ✅ **8 componenti identificati**: OnboardingWizard + 7 step components
- ✅ **Funzionalità mappate**: Navigazione, salvataggio localStorage, validazione
- ✅ **Test plan**: 15+ test identificati (funzionali, validazione, edge cases)
- ✅ **Dipendenze**: Hook, servizi, componenti, routing mappati

### **LOGIN COMPONENTI** (Production/Test/Autenticazione/)
- ✅ **LoginForm**: Stati interni, funzioni, interazioni UI mappate
- ✅ **LoginPage**: Props, stati, metodi, API calls identificati
- ✅ **Test plan**: Test funzionali, toggle password, link navigation

### **TEST ESISTENTI** (Production/Test/)
- ✅ **Onboarding**: test-onboarding-mappatura.spec.js, test-onboarding-mappatura.spec.js
- ✅ **Login**: login-test.spec.js
- ✅ **Struttura test**: Fixtures, utils, assertions organizzati

---

## 🚀 PROMPT PER AGENTI PLANNING 0-1-2-8

### **AGENTE 8 - DOCUMENTATION**
```
MISSIONE: Organizzare e catalogare tutta la documentazione esistente per Login e Onboarding

TASK:
1. Legge ogni file .md nel progetto e analizza contenuto
2. Identifica documentazione inerente a Login e Onboarding
3. Archivia documenti con data > 1 settimana
4. Cataloga documenti recenti nella struttura Production corretta
5. Fornisce riferimenti chiari agli agenti di planning

DELIVERABLES:
- Documentation inventory completo con classificazione
- Archived documents con data > 1 settimana
- Organized structure in Production/ con riferimenti chiari
- Reference guide per agenti di planning

RIFERIMENTI:
- Tutti i file .md nel progetto
- Production/Knowledge/
- Production/Test/
- Production/Last_Info/
- Production/Conoscenze_congelate/
```

### **AGENTE 0 - ORCHESTRATOR**
```
MISSIONE: Coordinare blindatura completa Login e Onboarding

TASK:
1. Analizza dati sessioni precedenti in Production/Knowledge/ e Production/Test/
2. Identifica gap tra mappatura precedente e nuove specifiche Agente 9
3. Coordina lavoro agenti 1-2 per mappatura sistematica
4. Gestisci conflitti tra approcci vecchi e nuovi
5. Pianifica timeline blindatura finale

DELIVERABLES:
- Gap analysis completo
- Piano coordinamento agenti
- Timeline blindatura
- Risoluzione conflitti

RIFERIMENTI:
- Production/Knowledge/ONBOARDING_COMPONENTI.md
- Production/Test/Autenticazione/
- Production/Conoscenze_congelate/APP_DEFINITION/01_AUTH/
```

### **AGENTE 1 - PRODUCT STRATEGY**
```
MISSIONE: Analizzare obiettivi business e KPI per Login e Onboarding

TASK:
1. Analizza obiettivi business di ogni step onboarding
2. Identifica KPI di successo per completamento onboarding
3. Valuta rischi di abbandono utente per ogni step
4. Definisci metriche di conversione login → onboarding → main app
5. Confronta con metriche sessioni precedenti

DELIVERABLES:
- Business objectives per ogni step
- KPI dashboard per monitoring
- Risk assessment per abbandono
- Conversion funnel analysis
- Metriche di successo

RIFERIMENTI:
- Production/Knowledge/ONBOARDING_COMPONENTI.md
- Production/Conoscenze_congelate/APP_VISION_CAPTURE.md
- Production/Conoscenze_congelate/APP_DEFINITION/01_AUTH/
```

### **AGENTE 2 - SYSTEMS BLUEPRINT**
```
MISSIONE: Mappare architettura tecnica completa Login e Onboarding

TASK:
1. Analizza database schema per ogni step onboarding
2. Mappa API endpoints necessari per validazioni
3. Definisci state management tra step
4. Identifica performance requirements per ogni componente
5. Confronta con architettura sessioni precedenti

DELIVERABLES:
- Database schema completo
- API endpoints specification
- State management flow
- Performance requirements
- Architecture comparison

RIFERIMENTI:
- Production/Knowledge/ONBOARDING_COMPONENTI.md
- Production/Test/Onboarding/
- Production/Conoscenze_congelate/TECHNICAL_ANALYSIS.md
- Database migrations in database/
```

---

## 📋 PIANO DI LAVORO

### **FASE 1: ORGANIZZAZIONE DOCUMENTAZIONE** (Agente 8)
- [ ] Legge tutti i file .md nel progetto
- [ ] Identifica documentazione Login e Onboarding
- [ ] Archivia documenti con data > 1 settimana
- [ ] Cataloga documenti recenti in Production/
- [ ] Crea reference guide per agenti

### **FASE 2: RACCOLTA E ANALISI** (Agente 0)
- [ ] Analizza documentazione organizzata da Agente 8
- [ ] Identifica gap con nuove specifiche Agente 9
- [ ] Coordina lavoro agenti 1-2
- [ ] Crea gap analysis report

### **FASE 3: MAPPATURA BUSINESS** (Agente 1)
- [ ] Analizza obiettivi business per ogni step
- [ ] Definisci KPI di successo
- [ ] Valuta rischi di abbandono
- [ ] Crea metriche dashboard

### **FASE 4: MAPPATURA TECNICA** (Agente 2)
- [ ] Mappa database schema completo
- [ ] Definisci API endpoints
- [ ] Analizza state management
- [ ] Identifica performance requirements

### **FASE 5: CONFRONTO E SYNTHESIS** (Agente 9)
- [ ] Confronta risultati nuovi vs precedenti
- [ ] Identifica discrepanze e gap
- [ ] Crea specifica tecnica finale
- [ ] Pianifica blindatura elementi critici

---

## 🎯 DELIVERABLES ATTESI

### **AGENTE 8**
- Documentation inventory completo
- Archived documents con data > 1 settimana
- Organized structure in Production/
- Reference guide per agenti

### **AGENTE 0**
- Gap analysis report
- Piano coordinamento agenti
- Timeline blindatura
- Risoluzione conflitti

### **AGENTE 1**
- Business objectives per step
- KPI dashboard
- Risk assessment
- Conversion funnel

### **AGENTE 2**
- Database schema completo
- API endpoints spec
- State management flow
- Performance requirements

### **AGENTE 9**
- Specifica tecnica finale
- Piano blindatura elementi critici
- Confronto risultati
- Documentazione completa

---

## 📁 FILE DI RIFERIMENTO

### **SESSIONI PRECEDENTI**
- `Production/Knowledge/ONBOARDING_COMPONENTI.md`
- `Production/Test/Autenticazione/LoginForm/`
- `Production/Test/Onboarding/`
- `Production/Knowledge/AUTENTICAZIONE_COMPONENTI.md`

### **NUOVE SPECIFICHE**
- `Production/Conoscenze_congelate/APP_DEFINITION/01_AUTH/LOGIN_FLOW.md`
- `Production/Conoscenze_congelate/APP_DEFINITION/01_AUTH/ONBOARDING_FLOW.md`
- `Production/Conoscenze_congelate/APP_DEFINITION/01_AUTH/BLINDATURA_PLAN.md`

---

**STATUS**: 🟢 PRONTO PER AVVIO LAVORO AGENTI PLANNING
