# 🔄 WORKFLOW UPDATE - 4 Gennaio 2025

## ⚠️ CAMBIO STRATEGIA IMPORTANTE

### **DA:**
Dual-agent Cursor (Agent A + Agent B) su branch separate

### **A:**
**Cursor + Claude Code in parallelo** su stesso branch

---

## 🎯 NUOVO MODELLO DI LAVORO

### **Branch Unico: `fix/cursor-functional`**

```
fix/cursor-functional (branch condiviso)
├── CURSOR lavora su:
│   ✅ Bug funzionali (Conservation, Categories)
│   ✅ UI/UX issues (CollapsibleCard, Responsive)
│   ✅ React hooks warnings (exhaustive-deps)
│   ✅ User experience
│
└── CLAUDE CODE lavora su:
    ✅ TypeScript cleanup (unused variables, any types)
    ✅ Test fixes (ExcelExporter)
    ✅ ESLint advanced cleanup
    ✅ Code quality generale
```

### **Coordinazione:**
- ✅ Stesso branch, file diversi
- ✅ Commit frequenti con messaggi chiari
- ✅ Cursor legge `CURSOR-INSTRUCTIONS-CURRENT.md`
- ✅ Claude segue sua todo list
- ✅ Sync via git commits

---

## 📋 STATO AVANZAMENTO ATTUALE

### ✅ **Completato da Claude (4 Gen 2025)**

**Commit history:**
```
73d4411 - fix(automation): replace explicit any types with proper types
d1219e7 - fix(automation): remove unused schedulingService variable
8f79351 - fix(automation): fix NodeJS undefined error in AutomatedReportingService
de4b971 - fix(conservation): add React import to ConservationStats
```

**Risultati:**
- ✅ Conservation crash (C003) risolto
- ✅ AutomatedReportingService: 7 unused variables fixate
- ✅ IntelligentAlertManager: 14 unused variables + 37 any types fixati
- ✅ SmartSchedulingService: 11 unused variables + 2 any types fixati
- ✅ Automation index: unused variable rimosso

**Metriche migliorate:**
- TypeScript errors: ~254 (da 300+)
- ESLint warnings: ~326 (da 400+)
- Any types in automation: Quasi tutti eliminati

### 🔄 **In corso - Prossimi task Claude**

1. WorkflowAutomationEngine - unused variables
2. ExcelExporter test errors
3. Ulteriore cleanup ESLint
4. Validazione finale

### ⏳ **Da fare - Task Cursor**

**PRIORITÀ 1 (Critico):**
1. C002 - Categories System Fix (useCategories hook)
2. B1 - CollapsibleCard Inventory Fix

**PRIORITÀ 2 (Importante):**
3. B2 - CollapsibleCard Settings Fix
4. B3 - Responsive Audit
5. B4 - Responsive Fixes

**PRIORITÀ 3 (Cleanup):**
6. B8 - exhaustive-deps warnings
7. B9 - react-refresh warnings

---

## 📝 ISTRUZIONI PER CURSOR

### **⚠️ LEGGI SEMPRE PRIMA:**
`Info per debug/CURSOR-INSTRUCTIONS-CURRENT.md`

Questo file contiene:
- ✅ Task dettagliati con accettazione criteria
- ✅ File specifici da modificare
- ✅ Workflow di lavoro
- ✅ Testing checklist
- ✅ Cosa NON toccare (lavoro di Claude)
- ✅ Come gestire blockers

### **Quick Start per Cursor:**

```bash
# 1. Apri il progetto
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# 2. Verifica branch
git branch --show-current
# Deve essere: fix/cursor-functional

# 3. Pull latest
git pull origin fix/cursor-functional

# 4. Leggi istruzioni
code "Info per debug/CURSOR-INSTRUCTIONS-CURRENT.md"

# 5. Inizia dal primo task critico
# → C002: Categories System Fix
```

---

## 🚫 REGOLE FONDAMENTALI

### **Cursor NON deve:**
- ❌ Modificare WorkflowAutomationEngine.ts
- ❌ Modificare file di test ExcelExporter
- ❌ Fare cleanup generale di tipi `any`
- ❌ Modificare configurazione ESLint/TypeScript
- ❌ Creare nuove feature

### **Claude NON deve:**
- ❌ Modificare logica business dei componenti UI
- ❌ Fare refactoring funzionale
- ❌ Cambiare comportamento UX
- ❌ Modificare hooks funzionali (solo cleanup)

### **Entrambi DEVONO:**
- ✅ Commit frequenti con messaggi chiari
- ✅ Testare prima di committare
- ✅ Non rompere il lavoro dell'altro
- ✅ Documentare decisioni importanti
- ✅ Aggiornare file di stato

---

## 📊 METRICHE OBIETTIVO

### **Obiettivo Intermedio (Fine settimana):**
```
TypeScript errors: < 100
ESLint warnings: < 50
Build: ✅ Success
Conservation: ✅ Funzionante
Categories: ✅ Funzionante
Inventory: ✅ Responsive
Settings: ✅ CollapsibleCard OK
```

### **Obiettivo Finale (Fine sprint):**
```
TypeScript errors: < 20
ESLint warnings: < 10
Build time: < 8s
Test coverage: > 80%
All critical bugs: ✅ Fixed
All pages: ✅ Working
Responsive: ✅ All breakpoints
Ready for production: ✅ Yes
```

---

## 🔄 SYNC PROTOCOL

### **Ogni 2-3 ore:**

**Cursor:**
```bash
git add .
git commit -m "progress: [what you did]"
git push origin fix/cursor-functional
```

**Claude:**
```bash
git pull origin fix/cursor-functional
# Continua suo lavoro
git add .
git commit -m "fix: [what fixed]"
git push origin fix/cursor-functional
```

### **Fine giornata - Entrambi:**

```bash
# 1. Commit tutto
git add .
git commit -m "eod: [summary of day work]"
git push origin fix/cursor-functional

# 2. Update status files
# - CURSOR-INSTRUCTIONS-CURRENT.md (Cursor)
# - Todo list internal (Claude)

# 3. Test integrato
npm run type-check
npm run lint
npm run build
npm run dev

# 4. Documentare problemi trovati
```

---

## ✅ SUCCESS CRITERIA

### **Per considerare il workflow un successo:**

**Tecnico:**
- [ ] Zero merge conflicts
- [ ] Tutti i task completati
- [ ] Build passa
- [ ] Type-check passa
- [ ] Test pass > 90%

**Funzionale:**
- [ ] Conservation page: 100% funzionante
- [ ] Categories system: 100% funzionante
- [ ] Inventory: Completamente responsive
- [ ] Settings: Tutte le sezioni visibili
- [ ] Zero crash

**Qualità:**
- [ ] Codice pulito
- [ ] Commit messages chiari
- [ ] Documentazione aggiornata
- [ ] Nessun technical debt aggiunto

---

## 📞 COMUNICAZIONE

### **Canali:**
1. **Git commits** - Comunicazione primaria
2. **CURSOR-INSTRUCTIONS-CURRENT.md** - Istruzioni Cursor
3. **Questo file** - Status generale
4. **Standup notes** - Se necessario

### **Template commit messages:**

**Cursor:**
```bash
fix(inventory): resolve categories dropdown
fix(ui): CollapsibleCard shows content
feat(responsive): improve mobile layout
```

**Claude:**
```bash
fix(automation): remove unused variables
fix(types): replace any with specific types
test(excel): fix ExcelExporter errors
```

---

## 🎯 PROSSIMI STEP IMMEDIATI

### **CURSOR (ORA):**
1. Leggi `CURSOR-INSTRUCTIONS-CURRENT.md`
2. Inizia con C002 - Categories System Fix
3. Poi B1 - CollapsibleCard Inventory
4. Commit dopo ogni fix

### **CLAUDE (ORA):**
1. ~~Fix automation services~~ ✅ FATTO
2. Continua con WorkflowAutomationEngine
3. Fix ExcelExporter tests
4. Final cleanup

### **ENTRAMBI (Stasera):**
1. Sync point - pull reciproco
2. Test integrato
3. Fix eventuali conflitti
4. Update metriche
5. Plan domani

---

**Documento creato:** 4 Gennaio 2025
**Ultimo update:** 4 Gennaio 2025
**Prossimo sync:** Fine giornata
**Status:** ✅ ATTIVO
