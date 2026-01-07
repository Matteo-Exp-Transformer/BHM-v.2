# 📊 SKILLS DI REASONING - ANALISI E IMPLEMENTAZIONE COMPLETA

---

## 🎯 **PROBLEMA IDENTIFICATO**

Gli agenti di planning (0, 1, 2) erano soggetti a pressioni che portavano a:
- **Decisioni affrettate** senza consultazione
- **Accelerazioni eccessive** dei tempi di analisi
- **Semplificazioni pericolose** senza valutazione conseguenze
- **Disallineamenti** tra agenti e priorità
- **Compressione del lavoro** di analisi necessario

---

## ✅ **SOLUZIONE IMPLEMENTATA**

### **SKILLS DI REASONING PER AGENTI DI PLANNING**

#### **Agente 0 - Orchestratore**
- **File**: `.cursor/rules/Agente_0/Skills-reasoning.md`
- **Focus**: Decisioni collaborative e coordinamento
- **Domande obbligatorie**: Agente 1 o 2
- **Trigger**: Pressioni orchestrazione, conflitti agenti, accelerazioni

#### **Agente 1 - Product Strategy Lead**
- **File**: `.cursor/rules/Agente_1/Skills-reasoning.md`
- **Focus**: Decisioni strategiche collaborative
- **Domande obbligatorie**: Agente 0 o 2
- **Trigger**: Pressioni roadmap, conflitti obiettivi, accelerazioni strategiche

#### **Agente 2 - Systems Blueprint Architect**
- **File**: `.cursor/rules/Agente_2/Skills-reasoning.md`
- **Focus**: Decisioni architetturali collaborative
- **Domande obbligatorie**: Agente 0 o 1
- **Trigger**: Pressioni architettura, conflitti componenti, accelerazioni tecniche

---

## 🚨 **TRIGGER DI ATTIVAZIONE**

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

## 🧭 **WORKFLOW DI REASONING**

### **STEP 1: IDENTIFICAZIONE PRESSIONE**
1) **Rileva segnali**: Identifica trigger di pressione o accelerazione
2) **Valuta impatto**: Analizza conseguenze della decisione affrettata
3) **Attiva reasoning**: Attiva il processo di reasoning collaborativo

### **STEP 2: CONSULTAZIONE OBBLIGATORIA**
1) **Domanda obbligatoria**: Almeno 1 domanda ad altri agenti planning
2) **Domanda opzionale**: A utente o altri agenti se necessario
3) **Tempo di riflessione**: Pausa per analisi adeguata
4) **Verifica allineamento**: Conferma che tutti gli agenti sono allineati

### **STEP 3: DECISIONE COLLABORATIVA**
1) **Sintesi input**: Raccoglie feedback da tutti gli agenti consultati
2) **Analisi pro/contro**: Valuta vantaggi e svantaggi della decisione
3) **Decisione informata**: Prende decisione basata su input collaborativi
4) **Comunicazione**: Comunica decisione e motivazioni a tutti

---

## 🧪 **DOMANDE OBBLIGATORIE SPECIFICHE**

### **AGENTE 0 - ORCHESTRATORE**
#### **Ad Agente 1 (Product Strategy)**
- "Quali sono le implicazioni strategiche di questa accelerazione?"
- "Come impatta questa semplificazione sugli obiettivi MVP?"
- "Quali rischi vedi in questa compressione dei tempi?"
- "Questa decisione è allineata con la roadmap?"

#### **Ad Agente 2 (Systems Blueprint)**
- "Come impatta questa accelerazione sull'architettura?"
- "Quali componenti potrebbero essere compromessi?"
- "Questa semplificazione crea debito tecnico?"
- "L'architettura supporta questa compressione?"

### **AGENTE 1 - PRODUCT STRATEGY**
#### **Ad Agente 0 (Orchestratore)**
- "Come impatta questa accelerazione sul coordinamento generale?"
- "Quali sono le implicazioni per gli altri agenti?"
- "Questa decisione crea conflitti di risorse?"
- "Come gestiamo le dipendenze tra agenti?"

#### **Ad Agente 2 (Systems Blueprint)**
- "Come impatta questa accelerazione sull'architettura?"
- "Quali componenti potrebbero essere compromessi?"
- "Questa semplificazione crea debito tecnico?"
- "L'architettura supporta questa compressione?"

### **AGENTE 2 - SYSTEMS BLUEPRINT**
#### **Ad Agente 0 (Orchestratore)**
- "Come impatta questa accelerazione sul coordinamento generale?"
- "Quali sono le implicazioni per gli altri agenti?"
- "Questa decisione crea conflitti di risorse tecniche?"
- "Come gestiamo le dipendenze tra componenti?"

#### **Ad Agente 1 (Product Strategy)**
- "Come impatta questa accelerazione sugli obiettivi MVP?"
- "Quali sono le implicazioni strategiche di questa semplificazione?"
- "Questa decisione è allineata con la roadmap?"
- "Quali rischi vedi in questa compressione architetturale?"

---

## 📊 **MATRICE DI DECISIONE**

### **SCENARIO 1: ACCELERAZIONE TEMPI**
- **Trigger**: "Dobbiamo accelerare per rispettare la deadline"
- **Domande obbligatorie**: Almeno 1 altro agente planning
- **Domande opzionali**: Utente (se deadline esterna)
- **Output**: Piano accelerato con compromessi identificati

### **SCENARIO 2: COMPRESSIONE ANALISI**
- **Trigger**: "Saltiamo alcuni step per risparmiare tempo"
- **Domande obbligatorie**: Almeno 1 altro agente planning
- **Domande opzionali**: Agente 6 (Testing) se necessario
- **Output**: Analisi ridotta con gap identificati

### **SCENARIO 3: SEMPLIFICAZIONE DECISIONE**
- **Trigger**: "Facciamo così, è più semplice"
- **Domande obbligatorie**: Almeno 1 altro agente planning
- **Domande opzionali**: Agente 4/5 (se impatta implementazione)
- **Output**: Decisione semplificata con conseguenze documentate

### **SCENARIO 4: CONFLITTO PRIORITÀ**
- **Trigger**: "Gli agenti non sono d'accordo sulle priorità"
- **Domande obbligatorie**: Almeno 1 altro agente planning
- **Domande opzionali**: Utente (per chiarire priorità)
- **Output**: Priorità allineate e comunicate

---

## 🎯 **CRITERI DI QUALITÀ**

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

## 📝 **TEMPLATE DI REASONING**

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
### Ad {AGENTE_CONSULTATO}
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

## 🚀 **INTEGRAZIONE NEL SISTEMA**

### **PROMPT AGGIORNATI**
- ✅ **Agente 0**: Istruzioni per uso skills reasoning
- ✅ **Agente 1**: Istruzioni per uso skills reasoning strategiche
- ✅ **Agente 2**: Istruzioni per uso skills reasoning architetturali

### **RIFERIMENTI AGGIORNATI**
- ✅ **README_SKILLS_ORGANIZATION.md**: Documentata sezione reasoning
- ✅ **Struttura cartelle**: Aggiornata con skills reasoning
- ✅ **File prompt**: Aggiornati con istruzioni reasoning

---

## ⚠️ **ANTI-PATTERN PREVENUTI**

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

## 📊 **METRICHE DI SUCCESSO**

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

## 🎯 **RISULTATO FINALE**

**Le skills di reasoning sono state implementate con successo!**

**Il sistema ora offre**:
- ✅ **Prevenzione decisioni affrettate** per tutti gli agenti di planning
- ✅ **Consultazione obbligatoria** tra agenti planning
- ✅ **Qualità decisionale** mantenuta anche sotto pressione
- ✅ **Allineamento garantito** tra agenti e priorità

**Gli agenti di planning possono ora prendere decisioni collaborative e motivate, evitando pressioni che compromettono la qualità del lavoro!**

---

**📅 Data**: 2025-01-27  
**👤 Autore**: Agente 0 - Orchestratore  
**🎯 Status**: ✅ **SKILLS REASONING IMPLEMENTATE CON SUCCESSO**
