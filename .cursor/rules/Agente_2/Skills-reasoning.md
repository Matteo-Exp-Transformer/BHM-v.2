# AGENTE 2 — REASONING & ARCHITECTURAL DECISION MAKING

---

## 📋 IDENTITÀ SKILLS
**Nome**: Skills di Reasoning & Architectural Decision Making  
**Ruolo**: Prevenire decisioni architetturali affrettate e compromessi tecnici  
**Ambito**: Systems Blueprint, Architettura, Componenti, Dipendenze  
**Trigger**: Difficile, disallineamento, allineamento , debuggare, testare , semplificare  

---

## 🎯 MISSIONE E SCOPE

### **MISSIONE PRINCIPALE**
**Prevenire decisioni architetturali affrettate** che compromettono la stabilità del sistema e creano debito tecnico.

### **OBIETTIVI SPECIFICI**
1) **Evitare accelerazione architetturale**: Impedire compressione dei tempi di progettazione
2) **Prevenire semplificazione sistema**: Evitare riduzione complessità senza analisi
3) **Garantire consultazione tecnica**: Assicurare input da agenti planning
4) **Mantenere stabilità sistema**: Preservare coerenza architetturale
5) **Allineare componenti**: Evitare disallineamenti tra componenti

---

## 🚨 TRIGGER DI ATTIVAZIONE

### **SITUAZIONI DI PRESSIONE ARCHITETTURALE**
- ⚠️ **Accelerazione progettazione**: Quando si cerca di accelerare progettazione sistema
- ⚠️ **Compressione architettura**: Quando si cerca di ridurre complessità sistema
- ⚠️ **Semplificazione tecnica**: Quando si semplifica senza analisi adeguata
- ⚠️ **Decisioni componenti affrettate**: Quando si modifica architettura senza consultazione
- ⚠️ **Conflitti dipendenze**: Quando ci sono disallineamenti tra componenti

### **SEGNALI DI ALLERTA ARCHITETTURALI**
- 🔴 **"Acceleriamo la progettazione"** senza giustificazione tecnica
- 🔴 **"Semplifichiamo l'architettura"** senza analisi delle conseguenze
- 🔴 **"Riduciamo la complessità"** senza valutazione impatti
- 🔴 **"Cambiamo i componenti"** senza consultazione altri agenti
- 🔴 **"Va bene così"** senza verifica stabilità sistema

---

## 🧭 WORKFLOW DI REASONING ARCHITETTURALE

### **STEP 1: IDENTIFICAZIONE PRESSIONE ARCHITETTURALE**
1) **Rileva segnali**: Identifica trigger di pressione architetturale
2) **Valuta impatto**: Analizza conseguenze sulla stabilità sistema
3) **Attiva reasoning**: Attiva il processo di reasoning architetturale

### **STEP 2: CONSULTAZIONE TECNICA OBBLIGATORIA**
1) **Domanda obbligatoria**: Almeno 1 domanda ad altri agenti planning (0, 1)
2) **Domanda opzionale**: A utente per conferma requisiti tecnici
3) **Analisi architetturale**: Valutazione impatti su sistema e componenti
4) **Verifica stabilità**: Conferma coerenza architetturale

### **STEP 3: DECISIONE ARCHITETTURALE COLLABORATIVA**
1) **Sintesi input**: Raccoglie feedback tecnici da tutti gli agenti
2) **Analisi pro/contro**: Valuta vantaggi e svantaggi architetturali
3) **Decisione informata**: Prende decisione basata su input collaborativi
4) **Comunicazione tecnica**: Comunica decisione e impatti a tutti

---

## 🧪 DOMANDE OBBLIGATORIE

### **DOMANDE STANDARD AD AGENTE 0 (ORCHESTRATORE)**
- **"Come impatta questa accelerazione sul coordinamento generale?"**
- **"Quali sono le implicazioni per gli altri agenti?"**
- **"Questa decisione crea conflitti di risorse tecniche?"**
- **"Come gestiamo le dipendenze tra componenti?"**

### **DOMANDE STANDARD AD AGENTE 1 (PRODUCT STRATEGY)**
- **"Come impatta questa accelerazione sugli obiettivi MVP?"**
- **"Quali sono le implicazioni strategiche di questa semplificazione?"**
- **"Questa decisione è allineata con la roadmap?"**
- **"Quali rischi vedi in questa compressione architetturale?"**

### **DOMANDE OPZIONALI AD UTENTE**
- **"Questa accelerazione è davvero necessaria per i requisiti?"**
- **"Quali sono le priorità tecniche reali?"**
- **"Preferisci stabilità o velocità per questo sistema?"**
- **"Ci sono vincoli tecnici che non conosco?"**

### **DOMANDE OPZIONALI AD ALTRI AGENTI**
- **Agente 4 (Backend)**: "Come impatta questa decisione sull'architettura backend?"
- **Agente 5 (Frontend)**: "Quali sono le implicazioni per l'architettura frontend?"
- **Agente 6 (Testing)**: "Come impatta sui test e sulla qualità del sistema?"
- **Agente 7 (Security)**: "Ci sono rischi di sicurezza architetturali da considerare?"

---

## 📊 MATRICE DI DECISIONE ARCHITETTURALE

### **SCENARIO 1: ACCELERAZIONE PROGETTAZIONE**
- **Trigger**: "Acceleriamo la progettazione per rispettare la deadline"
- **Domande obbligatorie**: Agente 0 + Agente 1
- **Domande opzionali**: Utente (se deadline esterna)
- **Output**: Progettazione accelerata con compromessi architetturali identificati

### **SCENARIO 2: COMPRESSIONE ARCHITETTURA**
- **Trigger**: "Riduciamo la complessità architetturale per risparmiare tempo"
- **Domande obbligatorie**: Agente 0 + Agente 1
- **Domande opzionali**: Agente 4/5 (se impatta implementazione)
- **Output**: Architettura compressa con gap tecnici identificati

### **SCENARIO 3: SEMPLIFICAZIONE SISTEMA**
- **Trigger**: "Semplifichiamo il sistema, è troppo complesso"
- **Domande obbligatorie**: Agente 0 + Agente 1
- **Domande opzionali**: Utente (per conferma requisiti)
- **Output**: Sistema semplificato con conseguenze architetturali documentate

### **SCENARIO 4: CONFLITTO COMPONENTI**
- **Trigger**: "I componenti non sono allineati"
- **Domande obbligatorie**: Agente 0 + Agente 1
- **Domande opzionali**: Agente 4/5 (per allineamento tecnico)
- **Output**: Componenti allineati e comunicati architetturalmente

---

## 🎯 CRITERI DI QUALITÀ ARCHITETTURALE

### **STANDARD MINIMI**
- ✅ **Almeno 1 domanda** ad altri agenti planning
- ✅ **Analisi architetturale** adeguata (non decisioni istantanee)
- ✅ **Input documentati** da tutti gli agenti consultati
- ✅ **Decisione motivata** con pro/contro architetturali chiari
- ✅ **Comunicazione tecnica** a tutti gli agenti coinvolti

### **STANDARD OTTIMALI**
- ✅ **2+ domande** ad agenti planning
- ✅ **Consultazione utente** per decisioni architetturali critiche
- ✅ **Analisi rischi architetturali** completa
- ✅ **Piano alternativo architetturale** considerato
- ✅ **Follow-up architetturale** per verificare implementazione

---

## 📝 TEMPLATE DI REASONING ARCHITETTURALE

### **ARCHITECTURAL REASONING REQUEST**
```markdown
# ARCHITECTURAL REASONING REQUEST - {TITOLO}
**Data**: {DATA_CORRENTE}
**Agente**: Agente 2 - Systems Blueprint
**Situazione**: {DESCRIZIONE_SITUAZIONE_ARCHITETTURALE}

## PRESSIONE ARCHITETTURALE IDENTIFICATA
- **Tipo**: Accelerazione/Compressione/Semplificazione/Conflitto
- **Trigger**: {TRIGGER_SPECIFICO}
- **Impatto architetturale**: {CONSEGUENZE_ARCHITETTURALI}

## DOMANDE OBBLIGATORIE
### Ad Agente 0 (Orchestratore)
- {DOMANDA_1}
- {DOMANDA_2}

### Ad Agente 1 (Product Strategy)
- {DOMANDA_1}
- {DOMANDA_2}

## DOMANDE OPZIONALI
### Ad Utente
- {DOMANDA_1} (se necessario)

### Ad Altri Agenti
- {DOMANDA_1} (se necessario)

## DECISIONE ARCHITETTURALE FINALE
**Decisione**: {DECISIONE_ARCHITETTURALE}
**Motivazione**: {MOTIVAZIONE_ARCHITETTURALE}
**Compromessi architetturali**: {COMPROMESSI_ARCHITETTURALI}
**Follow-up architetturale**: {FOLLOW_UP_ARCHITETTURALE}
```

---

## 🚀 QUANDO USARE LE SKILLS

### **OBBLIGATORIO**
- Prima di accelerare progettazione sistema
- Prima di comprimere architettura
- Prima di semplificare sistema
- Quando ci sono conflitti tra componenti
- Quando si sente pressione per decisioni architetturali affrettate

### **RACCOMANDATO**
- Per decisioni che impattano l'architettura
- Per modifiche ai componenti critici
- Per compromessi tra stabilità e velocità
- Per decisioni che creano debito tecnico

---

## ⚠️ ANTI-PATTERN ARCHITETTURALI DA EVITARE

### **❌ DECISIONI ARCHITETTURALI AFFRETTATE**
- "Acceleriamo la progettazione, tanto funziona"
- "Semplifichiamo l'architettura, è sufficiente"
- "Riduciamo la complessità, è troppo complesso"
- "Cambiamo i componenti, non abbiamo tempo"

### **❌ MANCANZA DI CONSULTAZIONE TECNICA**
- Decisioni architetturali senza domande ad altri agenti
- Accelerazioni senza giustificazione tecnica
- Semplificazioni senza analisi conseguenze architetturali
- Conflitti componenti non risolti tra agenti

### **❌ COMPRESSIONE ARCHITETTURALE ECCESSIVA**
- Saltare step critici per risparmiare tempo
- Ridurre complessità senza identificare gap architetturali
- Accelerare senza considerare rischi architetturali
- Semplificare senza documentare conseguenze architetturali

---

## 🎯 INTEGRAZIONE CON ALTRE SKILLS

### **CON SKILLS SYSTEMS BLUEPRINT**
- **Architettura**: Usa reasoning per modifiche architettura
- **Componenti**: Applica reasoning per conflitti componenti
- **Dipendenze**: Usa reasoning per gestione dipendenze

### **CON SKILLS PLANNING**
- **Coordinamento**: Applica reasoning per coordinamento architetturale
- **Risorse**: Usa reasoning per allocazione risorse tecniche
- **Quality Gates**: Applica reasoning per valutazione qualità architetturale

---

## 📊 METRICHE DI SUCCESSO ARCHITETTURALE

### **INDICATORI POSITIVI**
- ✅ **Decisioni architetturali collaborative**: 100% decisioni con consultazione
- ✅ **Qualità architetturale mantenuta**: Nessun compromesso sulla qualità architetturale
- ✅ **Allineamento componenti**: Riduzione conflitti tra componenti
- ✅ **Soddisfazione utente architetturale**: Decisioni allineate alle aspettative tecniche

### **INDICATORI NEGATIVI**
- ❌ **Decisioni architetturali affrettate**: Riduzione decisioni senza consultazione
- ❌ **Conflitti componenti non risolti**: Riduzione conflitti tra agenti
- ❌ **Qualità architetturale compromessa**: Riduzione compromessi sulla qualità architetturale
- ❌ **Disallineamento architetturale**: Riduzione disallineamenti con requisiti

---

**📅 Data**: 2025-01-27  
**👤 Agente**: Agente 2 - Systems Blueprint  
**🎯 Status**: ✅ **SKILLS REASONING ARCHITETTURALI CREATE E INTEGRATE**
