# 📁 GUIDA COORDINAMENTO AGENTI - POSIZIONAMENTO FILE

**Data**: 2025-10-23  
**Versione**: 1.0  
**Status**: ✅ **IMPLEMENTATO**

---

## 🎯 SCOPO

Questa guida definisce **dove posizionare** i file condivisi e **dove cercare** handoff tra agenti per evitare confusione e duplicazione lavoro.

---

## 📁 STRUTTURA FILE CONDIVISI

### **🔗 HUB NEO - FILE CONDIVISI CON TUTTI**
```
Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/
├── README_SESSIONE_CORRENTE.md      # Overview sessione
├── PRIORITA_CONDIVISE.md            # Priorità condivise
├── REAL_DATA_FOR_SESSION.md         # Dati reali sessione
├── HANDOFF_ACTIVE.md                # Handoff attivi tra agenti
├── STATUS_AGENTI.md                 # Status agenti
└── FILE_RECENTI.md                  # File recenti creati
```

### **📂 CARTELLE AGENTI - FILE PROPRI**
```
Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/
├── [File specifici agente]
├── Brief_to_AgenteY.md              # Handoff ad altro agente
└── [Altri file propri]
```

---

## 🔄 FLUSSO HANDOFF AGENTI

### **📤 HANDOFF GENERICO**
1. **Agente X** crea: `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/Brief_to_AgenteY.md`
2. **Agente Y** legge: `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/Brief_to_AgenteY.md`
3. **Agente Y** aggiorna: `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/HANDOFF_ACTIVE.md`

---

## 📋 REGOLE POSIZIONAMENTO FILE

### **🔴 OBBLIGATORIO**
- **File condivisi**: SEMPRE in `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/`
- **File propri**: SEMPRE in `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/`
- **Handoff**: SEMPRE in `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/Brief_to_AgenteY.md`

### **🟡 RACCOMANDATO**
- **Data corrente**: Usare sempre `date +%Y-%m-%d` per cartelle
- **Naming**: Usare nomi descrittivi per file
- **Aggiornamento**: Aggiornare sempre `HANDOFF_ACTIVE.md` dopo handoff

### **🟢 OPCIONALE**
- **Backup**: Creare backup prima di modifiche strutturali
- **Versioning**: Usare versioni per file critici
- **Documentation**: Documentare sempre le modifiche

---

## 🎯 CHECKLIST COORDINAMENTO

### **📥 PRIMA DI INIZIARE LAVORO**
- [ ] Leggi `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/README_SESSIONE_CORRENTE.md`
- [ ] Leggi `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/PRIORITA_CONDIVISE.md`
- [ ] Leggi `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/REAL_DATA_FOR_SESSION.md`
- [ ] Leggi `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/HANDOFF_ACTIVE.md`

### **📤 DURANTE IL LAVORO**
- [ ] Salva file propri in `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/`
- [ ] Aggiorna file condivisi in `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/`
- [ ] Documenta progresso in `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/STATUS_AGENTI.md`

### **📤 DOPO COMPLETAMENTO**
- [ ] Crea handoff in `Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/Brief_to_AgenteY.md`
- [ ] Aggiorna `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/HANDOFF_ACTIVE.md`
- [ ] Aggiorna `Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/STATUS_AGENTI.md`

---

## 🚨 ERRORI COMUNI DA EVITARE

### **❌ SBAGLIATO**
- Salvare file condivisi in cartelle agenti
- Non leggere handoff da altri agenti
- Non aggiornare file condivisi
- Usare date hardcoded invece di dinamiche
- Non documentare handoff

### **✅ CORRETTO**
- Salvare file condivisi in Neo
- Leggere sempre handoff da altri agenti
- Aggiornare sempre file condivisi
- Usare sempre date dinamiche
- Documentare sempre handoff

---

## 📊 ESEMPI PRATICI

### **📥 AGENTE X LEGGE HANDOFF**
```markdown
Leggi SEMPRE:
- Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/README_SESSIONE_CORRENTE.md
- Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/PRIORITA_CONDIVISE.md
- Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/HANDOFF_ACTIVE.md
```

### **📤 AGENTE X CREA HANDOFF**
```markdown
Crea SEMPRE:
- Production/Sessione_di_lavoro/Agente_X/{DATA_CORRENTE}/Brief_to_AgenteY.md
- Aggiorna: Production/Sessione_di_lavoro/Neo/{DATA_CORRENTE}/HANDOFF_ACTIVE.md
```

---

## 🎯 CONCLUSIONI

### **✅ BENEFICI**
- **Chiarezza**: Ogni agente sa dove cercare e dove salvare
- **Coordinamento**: Handoff sempre visibili e aggiornati
- **Efficienza**: Nessuna perdita di tempo per cercare file
- **Qualità**: Documentazione sempre aggiornata

### **🚀 IMPLEMENTAZIONE**
- **Immediata**: Applicare regole a tutti gli agenti
- **Continuativa**: Mantenere aggiornato sistema
- **Monitoraggio**: Verificare compliance regole

---

**Status**: ✅ **GUIDA IMPLEMENTATA**  
**Prossimo**: Applicare regole a tutti gli agenti

**Firma**: Agente 8 - Documentation Specialist  
**Data**: 2025-10-23  
**Status**: Coordinamento agenti risolto
