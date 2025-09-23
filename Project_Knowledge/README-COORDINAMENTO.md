# 📋 COORDINAMENTO CLAUDE ↔ CURSOR - GUIDA COMPLETA

**🎯 Versione:** 3.0 - Struttura Semplificata
**📅 Aggiornamento:** 23 Gennaio 2025
**📊 Status:** B.8.1 Claude Complete → B.8.2 Cursor Ready

---

## 🚨 **PER L'UTENTE: WORKFLOW SEMPLIFICATO**

### **🔄 FLUSSO OPERATIVO:**

```
1. 👨‍💻 UTENTE → Claude: "pianifica prossime attività"
2. 🤖 CLAUDE → Aggiorna TASKS-ACTIVE.md e CURSOR-COORDINATION-MASTER.md
3. 👨‍💻 UTENTE → Cursor: "leggi il worktree di Claude e copia le istruzioni"
4. 🖱️ CURSOR → Legge CURSOR-COORDINATION-MASTER.md e inizia lavoro
5. 🔄 REPEAT per ogni sessione
```

### **📁 FILE CHIAVE PER COORDINAMENTO:**

| File | Scopo | Chi Legge |
|------|-------|-----------|
| **CURSOR-COORDINATION-MASTER.md** | 🎯 Istruzioni complete per Cursor | Cursor (COPIA QUESTO) |
| **TASKS-ACTIVE.md** | 📊 Stato progetto e prossimi task | Cursor + User |
| **B8-COORDINATION-STRATEGY.md** | 🗺️ Strategia sviluppo B.8+ | User + Monitoring |

---

## 📂 **STRUTTURA FILE COORDINAMENTO**

### **🎯 FILE ATTIVI (Usare):**

```
Project_Knowledge/
├── CURSOR-COORDINATION-MASTER.md  ← 🚨 FILE PRINCIPALE PER CURSOR
├── TASKS-ACTIVE.md                ← 📊 Stato progetto corrente
├── B8-COORDINATION-STRATEGY.md    ← 🗺️ Strategia B.8+
├── B8.1-COMPLETION-REPORT.md      ← 📋 Report completamento Claude
└── README-COORDINAMENTO.md        ← 📖 Questa guida
```

### **🗄️ FILE OBSOLETI (Non usare):**

```
❌ CURSOR-INSTRUCTIONS.md          ← Redirect a MASTER
❌ COORDINATION-STATUS.md          ← Rimosso
❌ MERGE-INSTRUCTIONS.md           ← Rimosso
❌ TASKS-ACTIVE-CLAUDE-SYNC.md     ← Rimosso
❌ CURSOR-NEXT-TASKS.md            ← Rimosso
```

### **📚 FILE ARCHIVIO (Reference):**

```
Archive/
├── Claude-v1-Complete.md          ← Storia completa precedente
├── HACCP_Business_Manager_PRD.md  ← Requirements originali
└── Altri file storici...
```

---

## 🤖 **PER CLAUDE: RESPONSABILITÀ**

### **📝 FILE DA AGGIORNARE SEMPRE:**

1. **CURSOR-COORDINATION-MASTER.md**
   - Istruzioni dettagliate per Cursor
   - Milestone corrente e obiettivi
   - File da toccare/non toccare
   - Success criteria e checklist

2. **TASKS-ACTIVE.md**
   - Status completamento milestones
   - Prossimi task pianificati
   - Coordinamento team status

3. **B8-COORDINATION-STRATEGY.md** (se necessario)
   - Aggiornare status Claude/Cursor
   - Modificare timeline se necessario

### **🎯 QUANDO AGGIORNARE:**

- **Dopo completamento milestone** → Aggiorna status + pianifica prossimo
- **Prima di ogni sessione Cursor** → Assicurati istruzioni aggiornate
- **Cambio di strategia** → Aggiorna coordinamento
- **Issues/blockers** → Documenta per coordinamento

---

## 🖱️ **PER CURSOR: ISTRUZIONI SEMPLICI**

### **📋 COSA FARE OGNI SESSIONE:**

1. **LEGGI** `CURSOR-COORDINATION-MASTER.md` (unico file importante)
2. **CONTROLLA** `TASKS-ACTIVE.md` per context
3. **LAVORA** sul milestone indicato
4. **AGGIORNA** progress nei commit messages
5. **NON TOCCARE** file di Claude specificati

### **🎯 FILE DA COPIARE NEL TUO PROGETTO:**

**SOLO UNO:** `CURSOR-COORDINATION-MASTER.md` → rinomina in `CURSOR-INSTRUCTIONS.md`

Contiene tutto:
- Prossimo milestone (B.8.2)
- Obiettivi dettagliati
- File da creare/modificare
- Testing framework integration
- Success criteria
- Workflow coordination

---

## 🔄 **COMANDI OPERATIVI**

### **👨‍💻 PER L'UTENTE:**

**A Claude:**
```
"pianifica le prossime attività e aggiorna i file di coordinamento"
"ho finito il lavoro, aggiorna per cursor"
"cursor ha completato X, pianifica il prossimo"
```

**A Cursor:**
```
"leggi il worktree di Claude (BHM-v.2-Claude) e copia CURSOR-COORDINATION-MASTER.md"
"inizia con TASKS-ACTIVE.md per vedere lo stato"
"procedi con il milestone indicato"
```

### **🔧 WORKTREE PATHS:**

```
Cursor: C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor
Claude: C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude
```

---

## 📊 **STATUS TRACKING**

### **🎯 MILESTONE TRACKING:**

**✅ COMPLETATI:**
- B.7.1 Offline System v1 (Claude)
- B.7.2 Advanced Export & Reporting (Claude)
- B.7.6 Real-time System Enhancement (Claude)
- B.7.3 Mobile PWA Enhancement (Cursor)
- B.7.4 UI Components (Cursor)
- B.7.5 Accessibility & UX (Cursor)
- **B.8.1 Cross-System Integration Testing (Claude)** ✅ NUOVO

**🔄 CORRENTE:**
- **B.8.2 Advanced Dashboard Analytics (Cursor)** ← PROSSIMO

**⏳ PIANIFICATI:**
- B.8.3 Multi-Company Management (Claude)
- B.8.4 Advanced Mobile Features (Cursor)
- B.8.5 AI-Powered Insights (Shared)

---

## 🛡️ **REGOLE DI SICUREZZA**

### **🚫 CURSOR NON DEVE TOCCARE:**

```
src/services/offline/     ← Claude offline system
src/services/export/      ← Claude export system
src/services/realtime/    ← Claude real-time system
src/services/testing/     ← Claude testing framework
Database/ scripts         ← Claude database schema
```

### **✅ CURSOR PUÒ MODIFICARE:**

```
src/features/dashboard/   ← Dashboard analytics (B.8.2)
src/components/ui/        ← UI components
src/styles/              ← Styling
src/types/ (aggiunte)    ← Type definitions (solo aggiunte)
```

### **🤝 CONDIVISO (Coordinare):**

```
src/hooks/useAuth.ts      ← Notificare modifiche
src/components/layouts/   ← Coordinare major changes
App.tsx, main.tsx        ← Coordinare modifiche
```

---

## 🚀 **QUICK START**

### **🎯 UTENTE - PROSSIMA AZIONE:**

```bash
# A Cursor:
"Leggi il worktree di Claude in C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude
Copia il file Project_Knowledge/CURSOR-COORDINATION-MASTER.md nel tuo progetto
Inizia con B.8.2 Advanced Dashboard Analytics seguendo le istruzioni"
```

### **📋 CURSOR - CHECKLIST:**

- [ ] Ho copiato CURSOR-COORDINATION-MASTER.md?
- [ ] Ho letto TASKS-ACTIVE.md per context?
- [ ] Capisco il mio milestone B.8.2?
- [ ] So quali file posso modificare?
- [ ] So come integrare testing framework Claude?

---

**🚀 SISTEMA PRONTO PER COORDINAMENTO EFFICIENTE!** 🚀