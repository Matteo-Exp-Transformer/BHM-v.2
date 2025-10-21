# 🧭 GUIDA NAVIGAZIONE PER AGENTI
**Progetto**: BHM v.2 - Business HACCP Manager  
**Data**: {DATA_CORRENTE_SESSIONE}  
**Versione**: 1.0

## 🎯 SCOPO
Questa guida aiuta ogni agente a orientarsi facilmente nella struttura del progetto, con nomi chiari che specificano bene i contenuti.

## 📅 SISTEMA DATA CORRENTE DINAMICA

**IMPORTANTE**: Tutti gli agenti utilizzano la **data corrente di sessione di lavoro**, non date hardcoded o di esempio.

### **DEFINIZIONE DATA CORRENTE SESSIONE**
- **Data corrente sessione** = Data di inizio della sessione di lavoro attuale
- **Formato**: YYYY-MM-DD (formato ISO standard)
- **Utilizzo**: Per cartelle, file, e riferimenti temporali
- **Aggiornamento**: Automatico all'inizio di ogni nuova sessione

### **REGOLE PER TUTTI GLI AGENTI**
1. **NON usare mai** date hardcoded o date di esempio
2. **SEMPRE usare** `{DATA_CORRENTE_SESSIONE}` nei template e esempi
3. **SEMPRE ottenere** la data corrente con comando appropriato prima di creare file
4. **SEMPRE verificare** che le cartelle usino la data corrente di sessione

## 📁 STRUTTURA PRINCIPALE

### **🏠 ROOT DIRECTORY**
```
BHM-v.2/
├── 📁 Production/           # LAVORO ATTIVO - Solo file correnti
├── 📁 Archives/             # STORICO - Tutti i file archiviati
├── 📁 docs/                 # DOCUMENTAZIONE - Guide e overview
├── 📁 src/                  # CODICE SORGENTE - App React
├── 📁 config/               # CONFIGURAZIONI - Build, test, deploy
├── 📁 assets/               # RISORSE - Screenshot, immagini
├── 📁 scripts/              # UTILITY - Script di automazione
├── 📁 database/             # DATABASE - Migrazioni e schema
├── 📁 supabase/             # SUPABASE - Configurazioni cloud
└── 📁 [altri file config]   # CONFIGURAZIONE - Package, tsconfig
```

## 🎯 DOVE TROVARE COSA

### **📋 PER AGENTI DI LAVORO**
- **Production/Sessione_di_lavoro/** → Lavoro corrente degli agenti
- **Production/Last_Info/Multi agent/** → Prompt e istruzioni agenti
- **Production/Prompt_Context/** → Skills e contesti agenti

### **📚 PER DOCUMENTAZIONE**
- **docs/agent-guides/** → Guide specifiche per agenti
- **docs/project-overview/** → Panoramica del progetto
- **docs/development/** → Guide di sviluppo

### **🗃️ PER STORICO E RIFERIMENTI**
- **Archives/Knowledge/** → Conoscenza storica del progetto
- **Archives/Reports/** → Report storici e analisi
- **Archives/Tests/** → Test storici e risultati
- **Archives/Info_Complete/** → Informazioni complete archiviate

### **⚙️ PER CONFIGURAZIONE E BUILD**
- **config/playwright/** → Configurazioni test E2E
- **config/vitest/** → Configurazioni test unitari
- **config/build/** → Configurazioni build e deploy

### **🖼️ PER RISORSE E ASSETS**
- **assets/screenshots/** → Screenshot di test
- **assets/images/** → Immagini del progetto
- **assets/reports/** → Immagini di report

## 🚀 WORKFLOW PER AGENTI

### **1. AGENTE 0 (Orchestratore)**
```
Production/Sessione_di_lavoro/Agente_0/{DATA_CORRENTE_SESSIONE}/
├── ANALISI_*.md              # Analisi e decisioni
├── PROMPT_*.md               # Prompt per altri agenti
└── REPORT_*.md               # Report di coordinamento
```

### **2. AGENTE 1 (Product Strategy)**
```
Production/Sessione_di_lavoro/Agente_1/{DATA_CORRENTE_SESSIONE}/
├── BRIEF_TO_*.md             # Brief per altri agenti
├── REAL_DATA_*.md            # Dati reali verificati
├── REPORT_*.md               # Report strategici
└── PIANO_*.md                # Piani e strategie
```

### **3. AGENTE 2 (Systems Blueprint)**
```
Production/Sessione_di_lavoro/Agente_2/{DATA_CORRENTE_SESSIONE}/
├── MAPPATURA_*.md            # Mappature componenti
├── DIPENDENZE_*.md           # Analisi dipendenze
├── PIANO_BLINDAGGIO_*.md     # Piani di blindaggio
└── STATUS_*.md               # Status componenti
```

### **4. AGENTE 3 (Experience Designer)**
```
Production/Sessione_di_lavoro/Agente_3/{DATA_CORRENTE_SESSIONE}/
├── TEST_CASES_*.md           # Test cases specifici
├── USER_JOURNEY_*.md         # User journey e flussi
├── ACCESSIBILITY_*.md        # Audit accessibilità
└── VERIFICHE_*.md            # Verifiche UX/UI
```

### **5. AGENTE 4 (Backend Agent)**
```
Production/Sessione_di_lavoro/Agente_4/{DATA_CORRENTE_SESSIONE}/
├── *.ts                      # Codice TypeScript
├── *.md                      # Documentazione backend
└── *.sh                      # Script di deployment
```

### **6. AGENTE 5 (Frontend Agent)**
```
Production/Sessione_di_lavoro/Agente_5/{DATA_CORRENTE_SESSIONE}/
├── HANDOFF_*.md              # Handoff ad altri agenti
├── REPORT_*.md               # Report frontend
└── *.md                      # Documentazione UI
```

### **7. AGENTE 6 (Testing Agent)**
```
Production/Sessione_di_lavoro/Agente_6/{DATA_CORRENTE_SESSIONE}/
├── PIANO_*.md                # Piani di testing
├── ANALISI_*.md              # Analisi test
└── HANDOFF_*.md              # Handoff testing
```

### **8. AGENTE 7 (Security Agent)**
```
Production/Sessione_di_lavoro/Agente_7/{DATA_CORRENTE_SESSIONE}/
├── SECURITY_*.md             # Audit sicurezza
├── REPORT_*.md               # Report sicurezza
└── HANDOFF_*.md              # Handoff sicurezza
```

### **9. AGENTE 8 (Documentation Manager)**
```
Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE_SESSIONE}/
├── README_SESSIONE_*.md      # Overview sessione
├── FILE_RECENTI.md           # File creati oggi
└── COORDINAMENTO_*.md        # Coordinamento agenti
```

## 🔍 RICERCA RAPIDA

### **Per trovare file specifici:**
- **Prompt agenti**: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/`
- **Skills agenti**: `Production/Prompt_Context/`
- **Test cases**: `Production/Sessione_di_lavoro/Agente_3/{DATA_CORRENTE_SESSIONE}/`
- **Mappature**: `Production/Sessione_di_lavoro/Agente_2/{DATA_CORRENTE_SESSIONE}/`
- **Report**: `Production/Sessione_di_lavoro/Agente_*/{DATA_CORRENTE_SESSIONE}/`

### **Per trovare informazioni storiche:**
- **Conoscenza**: `Archives/Knowledge/`
- **Report storici**: `Archives/Reports/`
- **Test storici**: `Archives/Tests/`
- **Info complete**: `Archives/Info_Complete/`

## 📊 CONVENZIONI NOMI

### **File di lavoro:**
- `REPORT_*.md` → Report e analisi
- `BRIEF_*.md` → Brief e istruzioni
- `HANDOFF_*.md` → Handoff tra agenti
- `ANALISI_*.md` → Analisi e valutazioni
- `PIANO_*.md` → Piani e strategie
- `STATUS_*.md` → Status e stato attuale

### **Cartelle:**
- `{DATA_CORRENTE_SESSIONE}` → Formato ISO standard YYYY-MM-DD
- `Agente_X` → X = numero agente (0-8)
- `Neo` → Hub condiviso per coordinamento

## ⚠️ REGOLE IMPORTANTI

1. **Production/** → Solo lavoro corrente
2. **Archives/** → Tutto il resto
3. **Date dinamiche** → Usa sempre data corrente
4. **Nomi chiari** → Ogni file deve essere autoesplicativo
5. **Struttura logica** → Segui sempre le convenzioni

---
**🎯 OBIETTIVO**: Ogni agente deve poter trovare qualsiasi informazione in meno di 30 secondi usando questa guida.
