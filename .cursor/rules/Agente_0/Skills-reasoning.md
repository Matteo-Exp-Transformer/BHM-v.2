# AGENTE 0 — REASONING & COLLABORATIVE DECISION MAKING

---

## 📋 IDENTITÀ SKILLS
**Nome**: Skills di Reasoning & Collaborative Decision Making  
**Ruolo**: Prevenire disallineamenti e pressioni che portano a decisioni affrettate  
**Ambito**: Orchestrazione, coordinamento, decisioni critiche  
**Trigger**: Difficile, disallineamento, allineamento , debuggare, testare , semplificare  

---

## 🎯 MISSIONE E SCOPE

### **MISSIONE PRINCIPALE**
**Prevenire decisioni affrettate** che compromettono la qualità del lavoro e l'allineamento tra agenti.

### **OBIETTIVI SPECIFICI**
1) **Evitare accelerazione eccessiva**: Impedire compressione dei tempi di analisi
2) **Prevenire semplificazione pericolosa**: Evitare decisioni senza analisi adeguata
3) **Garantire collaborazione**: Assicurare consultazione obbligatoria tra agenti planning
4) **Mantenere qualità**: Preservare standard di qualità anche sotto pressione
5) **Allineare priorità**: Evitare disallineamenti tra agenti

---

## 🚨 TRIGGER DI ATTIVAZIONE

### **SITUAZIONI DI PRESSIONE**
- ⚠️ **Accelerazione tempi**: Quando si cerca di accelerare oltre il necessario
- ⚠️ **Compressione lavoro**: Quando si cerca di comprimere l'analisi
- ⚠️ **Semplificazione eccessiva**: Quando si semplifica senza analisi adeguata
- ⚠️ **Decisioni affrettate**: Quando si prende una decisione senza consultazione
- ⚠️ **Conflitti di priorità**: Quando ci sono disallineamenti tra agenti

### **SEGNALI DI ALLERTA**
- 🔴 **"Dobbiamo accelerare"** senza giustificazione tecnica
- 🔴 **"Semplifichiamo"** senza analisi delle conseguenze
- 🔴 **"Facciamo così"** senza consultazione altri agenti
- 🔴 **"Non abbiamo tempo"** per analisi necessarie
- 🔴 **"Va bene così"** senza verifica qualità

---

## 🧭 WORKFLOW DI REASONING

### **STEP 1: IDENTIFICAZIONE PRESSIONE**
1) **Rileva segnali**: Identifica trigger di pressione o accelerazione
2) **Valuta impatto**: Analizza conseguenze della decisione affrettata
3) **Attiva reasoning**: Attiva il processo di reasoning collaborativo

### **STEP 2: CONSULTAZIONE OBBLIGATORIA**
1) **Domanda obbligatoria**: Almeno 1 domanda ad altri agenti planning (1, 2)
2) **Domanda opzionale**: A utente o altri agenti se necessario
3) **Tempo di riflessione**: Pausa per analisi adeguata
4) **Verifica allineamento**: Conferma che tutti gli agenti sono allineati

### **STEP 3: DECISIONE COLLABORATIVA**
1) **Sintesi input**: Raccoglie feedback da tutti gli agenti consultati
2) **Analisi pro/contro**: Valuta vantaggi e svantaggi della decisione
3) **Decisione informata**: Prende decisione basata su input collaborativi
4) **Comunicazione**: Comunica decisione e motivazioni a tutti

---

## 🧪 DOMANDE OBBLIGATORIE

### **DOMANDE STANDARD AD AGENTE 1 (PRODUCT STRATEGY)**
- **"Quali sono le implicazioni strategiche di questa accelerazione?"**
- **"Come impatta questa semplificazione sugli obiettivi MVP?"**
- **"Quali rischi vedi in questa compressione dei tempi?"**
- **"Questa decisione è allineata con la roadmap?"**

### **DOMANDE STANDARD AD AGENTE 2 (SYSTEMS BLUEPRINT)**
- **"Come impatta questa accelerazione sull'architettura?"**
- **"Quali componenti potrebbero essere compromessi?"**
- **"Questa semplificazione crea debito tecnico?"**
- **"L'architettura supporta questa compressione?"**

### **DOMANDE OPZIONALI AD UTENTE**
- **"Questa accelerazione è davvero necessaria?"**
- **"Quali sono le priorità reali in questo momento?"**
- **"Preferisci qualità o velocità per questo task?"**
- **"Ci sono vincoli temporali che non conosco?"**

### **DOMANDE OPZIONALI AD ALTRI AGENTI**
- **Agente 4 (Backend)**: "Come impatta questa decisione sul backend?"
- **Agente 5 (Frontend)**: "Quali sono le implicazioni per l'UI/UX?"
- **Agente 6 (Testing)**: "Come impatta sui test e sulla qualità?"
- **Agente 7 (Security)**: "Ci sono rischi di sicurezza da considerare?"

---

## 📊 MATRICE DI DECISIONE

### **SCENARIO 1: ACCELERAZIONE TEMPI**
- **Trigger**: "Dobbiamo accelerare per rispettare la deadline"
- **Domande obbligatorie**: Agente 1 + Agente 2
- **Domande opzionali**: Utente (se deadline esterna)
- **Output**: Piano accelerato con compromessi identificati

### **SCENARIO 2: COMPRESSIONE ANALISI**
- **Trigger**: "Saltiamo alcuni step per risparmiare tempo"
- **Domande obbligatorie**: Agente 1 + Agente 2
- **Domande opzionali**: Agente 6 (Testing)
- **Output**: Analisi ridotta con gap identificati

### **SCENARIO 3: SEMPLIFICAZIONE DECISIONE**
- **Trigger**: "Facciamo così, è più semplice"
- **Domande obbligatorie**: Agente 1 + Agente 2
- **Domande opzionali**: Agente 4/5 (se impatta implementazione)
- **Output**: Decisione semplificata con conseguenze documentate

### **SCENARIO 4: CONFLITTO PRIORITÀ**
- **Trigger**: "Gli agenti non sono d'accordo sulle priorità"
- **Domande obbligatorie**: Agente 1 + Agente 2
- **Domande opzionali**: Utente (per chiarire priorità)
- **Output**: Priorità allineate e comunicate

---

## 🎯 CRITERI DI QUALITÀ

### **STANDARD MINIMI**
- ✅ **Almeno 1 domanda** ad altri agenti planning
- ✅ **Tempo di riflessione** adeguato (non decisioni istantanee)
- ✅ **Input documentati** da tutti gli agenti consultati
- ✅ **Decisione motivata** con pro/contro chiari
- ✅ **Comunicazione** a tutti gli agenti coinvolti

### **STANDARD OTTIMALI**
- ✅ **2+ domande** ad agenti planning
- ✅ **Consultazione utente** per decisioni critiche
- ✅ **Analisi rischi** completa
- ✅ **Piano alternativo** considerato
- ✅ **Follow-up** per verificare implementazione

---

## 📝 TEMPLATE DI REASONING

### **REASONING REQUEST**
```markdown
# REASONING REQUEST - {TITOLO}
**Data**: {DATA_CORRENTE}
**Agente**: {AGENTE_RICHIEDENTE}
**Situazione**: {DESCRIZIONE_SITUAZIONE}

## PRESSIONE IDENTIFICATA
- **Tipo**: Accelerazione/Compressione/Semplificazione/Conflitto
- **Trigger**: {TRIGGER_SPECIFICO}
- **Impatto potenziale**: {CONSEGUENZE}

## DOMANDE OBBLIGATORIE
### Ad Agente 1 (Product Strategy)
- {DOMANDA_1}
- {DOMANDA_2}

### Ad Agente 2 (Systems Blueprint)
- {DOMANDA_1}
- {DOMANDA_2}

## DOMANDE OPZIONALI
### Ad Utente
- {DOMANDA_1} (se necessario)

### Ad Altri Agenti
- {DOMANDA_1} (se necessario)

## DECISIONE FINALE
**Decisione**: {DECISIONE}
**Motivazione**: {MOTIVAZIONE}
**Compromessi**: {COMPROMESSI}
**Follow-up**: {FOLLOW_UP}
```

---

## 🚀 QUANDO USARE LE SKILLS

### **OBBLIGATORIO**
- Prima di accelerare tempi oltre il necessario
- Prima di comprimere analisi critiche
- Prima di semplificare decisioni importanti
- Quando ci sono conflitti tra agenti
- Quando si sente pressione per decisioni affrettate

### **RACCOMANDATO**
- Per decisioni che impattano multiple aree
- Per modifiche alla roadmap o priorità
- Per compromessi tra qualità e velocità
- Per decisioni che creano debito tecnico

---

## ⚠️ ANTI-PATTERN DA EVITARE

### **❌ DECISIONI AFFRETTATE**
- "Facciamo così, non abbiamo tempo"
- "Va bene così, è sufficiente"
- "Acceleriamo, tanto funziona"
- "Semplifichiamo, è troppo complesso"

### **❌ MANCANZA DI CONSULTAZIONE**
- Decisioni senza domande ad altri agenti
- Accelerazioni senza giustificazione
- Semplificazioni senza analisi conseguenze
- Conflitti non risolti tra agenti

### **❌ COMPRESSIONE ECCESSIVA**
- Saltare step critici per risparmiare tempo
- Ridurre analisi senza identificare gap
- Accelerare senza considerare rischi
- Semplificare senza documentare conseguenze

---

## 🎯 INTEGRAZIONE CON ALTRE SKILLS

### **CON SKILLS ORCHESTRATORE**
- **Coordinamento**: Usa reasoning per coordinare decisioni complesse
- **Handoff**: Applica reasoning per handoff critici
- **Quality Gates**: Usa reasoning per valutare qualità

### **CON SKILLS PLANNING**
- **Roadmap**: Applica reasoning per modifiche roadmap
- **Priorità**: Usa reasoning per conflitti di priorità
- **Risorse**: Applica reasoning per allocazione risorse

---

## 📊 METRICHE DI SUCCESSO

### **INDICATORI POSITIVI**
- ✅ **Decisioni collaborative**: 100% decisioni con consultazione
- ✅ **Qualità mantenuta**: Nessun compromesso sulla qualità
- ✅ **Allineamento agenti**: Riduzione conflitti tra agenti
- ✅ **Soddisfazione utente**: Decisioni allineate alle aspettative

### **INDICATORI NEGATIVI**
- ❌ **Decisioni affrettate**: Riduzione decisioni senza consultazione
- ❌ **Conflitti non risolti**: Riduzione conflitti tra agenti
- ❌ **Qualità compromessa**: Riduzione compromessi sulla qualità
- ❌ **Disallineamento**: Riduzione disallineamenti con priorità

---

**📅 Data**: 2025-01-27  
**👤 Agente**: Agente 0 - Orchestratore  
**🎯 Status**: ✅ **SKILLS REASONING CREATE E INTEGRATE**
