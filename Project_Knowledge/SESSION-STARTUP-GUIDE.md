# 🚀 SESSION STARTUP GUIDE - Claude & Cursor Coordination

**Version:** 1.0
**Created:** January 22, 2025
**Purpose:** Garantire metodologia sincronizzata tra Claude e Cursor

---

## 📂 **FILE DA LINKARE NELLE CHAT**

### **🤖 PER CLAUDE (Ogni nuova chat):**

**OBBLIGATORI - Link in questo ordine:**

1. **📋 Project Status**: `@Project_Knowledge/TASKS-ACTIVE.md`
2. **🤖 Coordination**: `@Project_Knowledge/Claude.md`
3. **🏗️ Architecture**: `@PLANNING.md`
4. **📝 Session Rules**: `@Project_Knowledge/SESSION-STARTUP-GUIDE.md` (questo file)

**OPZIONALI - Se necessario:**
- `@Project_Knowledge/Bug_Reports/bug-tracking-index.md` (se ci sono bug critici)
- `@simple-shopping-lists-only.sql` (se lavori su database)

### **👨‍💻 PER CURSOR (Ogni nuova chat):**

**OBBLIGATORI - Link in questo ordine:**

1. **📋 Project Status**: `@Project_Knowledge/TASKS-ACTIVE.md`
2. **🎯 Instructions**: `@Project_Knowledge/CURSOR-INSTRUCTIONS.md`
3. **🐛 Bug Priority**: `@Project_Knowledge/Bug_Reports/bug-tracking-index.md`
4. **📖 Bug System**: `@Project_Knowledge/Bug_Reports/Cross_References/README.md`

**OPZIONALI - Se necessario:**
- `@Project_Knowledge/Claude.md` (per coordinazione)
- `@PLANNING.md` (se serve context architettura)

---

## ⏰ **TIMING PROTOCOLLI: COMMIT, MERGE, BACKUP**

### **🔄 COMMIT PROTOCOL**

#### **Claude - Commit Trigger Points:**
```bash
# COMMIT OBBLIGATORIO ogni:
✅ Milestone completato (es: shopping lists integration)
✅ Database schema deployment riuscito
✅ Feature funzionante e testata
✅ Fix bug critico risolto
✅ Fine sessione (sempre)

# COMMIT COMMAND:
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Claude"
git add . && git commit --no-verify -m "feat: [description]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### **Cursor - Commit Trigger Points:**
```bash
# COMMIT OBBLIGATORIO ogni:
✅ Bug TypeScript risolto (aggiorna bug-tracking-index.md)
✅ Feature UI completata e testata
✅ Performance improvement implementato
✅ Test suite aggiunto
✅ Fine sessione (sempre)

# COMMIT COMMAND:
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Cursor"
git add . && git commit --no-verify -m "fix: [description]

🎨 Generated with Cursor
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### **🔀 MERGE PROTOCOL**

#### **QUANDO FARE MERGE:**

**🔥 MERGE IMMEDIATO** (entro 4 ore):
- Bug CRITICO risolto da uno dei due
- Breaking change che blocca l'altro
- Database schema update deployato

**📅 MERGE PROGRAMMATO** (ogni 2-3 giorni):
- Venerdì fine giornata (sync settimanale)
- Dopo completamento milestone importante
- Prima di iniziare nuova feature complessa

#### **CHI FA IL MERGE:**
- **Claude**: Sempre Claude coordina i merge (ha lead su architettura)
- **User**: Tu decidi QUANDO fare merge, Claude esegue

#### **MERGE STEPS** (Claude responsibility):
```bash
# 1. Sync da Cursor a Claude
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Claude"
git pull ../BHM-v.2-Cursor Curs

# 2. Risolve conflitti se presenti
# 3. Test completo dell'integrazione
# 4. Commit merge
git commit -m "merge: Integrate Cursor changes [description]"

# 5. Sync back a Cursor
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Cursor"
git pull ../BHM-v.2-Claude Claude
```

### **💾 BACKUP PROTOCOL**

#### **BACKUP AUTOMATICI:**

**🔄 BACKUP ROLLING** (ogni 3 commit):
```bash
# Claude crea backup ogni 3 commit:
git branch Claude-Backup-YYYYMMDD-HHmm

# Cursor crea backup ogni 2 commit:
git branch Curs-Backup-YYYYMMDD-HHmm
```

**📅 BACKUP SCHEDULED:**
- **Daily**: Ogni fine giornata lavorativa
- **Weekly**: Venerdì sera (pre-weekend)
- **Pre-Milestone**: Prima di iniziare nuova feature importante
- **Pre-Merge**: Sempre prima di ogni merge

#### **BACKUP NAMING CONVENTION:**
```bash
# Format: [AI]-Backup-[Date]-[Context]
Claude-Backup-20250122-SessionEnd
Curs-Backup-20250122-TypeScriptFixed
Claude-Backup-20250125-WeeklySync
Curs-Backup-20250125-BeforeMerge
```

---

## 🎯 **SYNCHRONIZATION CHECKPOINTS**

### **📊 STATUS CHECK (ogni inizio sessione):**

**Claude verifica:**
```bash
# 1. Branch status
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Claude"
git status

# 2. Cursor progress check
cat "Project_Knowledge/Bug_Reports/bug-tracking-index.md"

# 3. Commits since last sync
git log --oneline -5
```

**Cursor verifica:**
```bash
# 1. Bug priority list
cat "Project_Knowledge/Bug_Reports/bug-tracking-index.md"

# 2. TypeScript status
npm run type-check

# 3. Development server
npm run dev
```

### **🚨 CONFLICT RESOLUTION PROTOCOL:**

**Se conflict detection:**
1. **Stop development** immediately
2. **Create emergency backup** both branches
3. **User decides**: Chi ha priority (usually: critical bugs = Cursor priority, features = Claude priority)
4. **Coordinate solution** via shared documentation
5. **Test resolution** before continuing

---

## 📋 **SESSION END CHECKLIST**

### **Claude Session End:**
- [ ] Update TASKS-CORE.md with progress
- [ ] Update Claude.md with session summary
- [ ] Commit all changes with descriptive message
- [ ] Check if Cursor needs coordination
- [ ] Create backup if milestone reached

### **Cursor Session End:**
- [ ] Update bug-tracking-index.md with resolved bugs
- [ ] Update TASKS-CORE.md if milestones completed
- [ ] Commit all changes with descriptive message
- [ ] Document any breaking changes
- [ ] Create backup if major fixes completed

### **User Checklist (end of day):**
- [ ] Review both AI progress
- [ ] Decide if merge needed
- [ ] Trigger daily backup creation
- [ ] Plan next day priorities
- [ ] Update this guide if needed

---

## 🎪 **COORDINATION SCENARIOS**

### **Scenario 1: Cursor fixes critical TypeScript bug**
1. Cursor commits fix immediately
2. Updates bug-tracking-index.md
3. Claude pulls changes in next session
4. Continue parallel development

### **Scenario 2: Claude deploys new database schema**
1. Claude commits schema + code changes
2. Updates Claude.md with breaking changes
3. Cursor checks for impact in next session
4. Immediate merge if Cursor affected

### **Scenario 3: Weekly sync**
1. Both create backup before merge
2. Claude coordinates merge Friday evening
3. Both test integrated codebase
4. Both start fresh Monday with synced base

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

**"Git merge conflicts"**
→ Create backup, let Claude resolve (architecture lead)

**"TypeScript errors after merge"**
→ Cursor priority to fix, Claude waits

**"Database connection broken"**
→ Claude priority to fix, Cursor can work on pure UI

**"Development server won't start"**
→ Check both worktrees, use working one as reference

---

**🎯 OBIETTIVO:** Zero conflitti, massima produttività parallela, sync perfetta tra Claude e Cursor!