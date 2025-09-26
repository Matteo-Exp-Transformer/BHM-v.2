# 🔧 CURSOR - Workflow Specifico

**Guida dettagliata per Cursor AI Agent**

## 🎯 **MISSIONE CURSOR**

- **Fix rapidi** e implementazioni standard
- **Tempo limite**: 15 minuti per task
- **Focus**: TypeScript, UI, Import, Sintassi

---

## 📋 **PROCESSO STEP-BY-STEP**

### **Quando ricevi segnalazione problema:**

```
🔴 STEP 1: PROBLEM RECEIVED
├─ Leggi attentamente la descrizione
├─ Identifica file coinvolti
└─ Nota sintomi/errori

🔍 STEP 2: ANALYZE PROBLEM
├─ Esamina messaggi di errore
├─ Controlla contesto del problema
└─ Stima complessità

📚 STEP 3: CHECK ASSIGNMENT
├─ Consulta CONTRIBUTING.md decision tree
├─ Verifica se è compito CURSOR
└─ Determina azione

✅ STEP 4A: IF CURSOR TASK
├─ "This is a [TypeScript/UI/Import] issue - I'll fix it now"
├─ Procedi immediatamente con fix
└─ Segui quality gates

❌ STEP 4B: IF NOT CURSOR
├─ "This requires [Architecture/Auth/Security] expertise"
├─ "Assign to [Claude/Gemini]"
└─ Fornisci dettagli per escalation
```

---

## 🎯 **CURSOR COMPETENZE**

### ✅ **SÌ - Handle immediatamente:**

- **TypeScript errors** (compilation, types, interfaces)
- **Import/export issues** (missing imports, wrong paths)
- **Syntax errors** (brackets, semicolons, formatting)
- **UI component fixes** (props, styling, structure)
- **Dependency updates** (package.json, npm install)
- **Form validation** (input validation, error messages)
- **CSS/styling** (Tailwind classes, responsive)

### ❌ **NO - Escalate a Claude/Gemini:**

- **Authentication systems** (Clerk, Supabase auth)
- **Database queries** (RLS, complex queries)
- **Performance optimization** (bundle size, lazy loading)
- **Security vulnerabilities** (XSS, CSRF, permissions)
- **Architecture changes** (folder structure, major refactor)
- **Testing infrastructure** (setup test frameworks)
- **Build/deployment** (Vite config, CI/CD)

---

## ⚡ **WORKFLOW QUOTIDIANO**

### **All'inizio della sessione:**

```bash
# 1. Switch to workspace
git checkout cursor-workspace

# 2. Sync with main
git pull origin main
git rebase origin/main

# 3. Verify app status
npm run dev                    # If not running
node debug-app-detailed.js     # Full test
```

### **Per ogni fix:**

```bash
# 1. Implement fix
# 2. Test immediately
npm run type-check
npm run lint
npm run test

# 3. Full app test
node debug-app-detailed.js

# 4. Commit with format
git commit -m "fix(cursor): [description]"

# 5. Push to workspace
git push origin cursor-workspace
```

---

## 🚨 **ESCALATION PROTOCOL**

### **Escalate after 15 minutes se:**

- Fix richiede > 15 minuti
- Scopri implicazioni di architettura
- Coinvolge componenti multipli
- Emergono problemi di sicurezza

### **Escalation steps:**

```bash
# 1. Save progress
git add .
git commit -m "wip(cursor): escalating - [reason]"
git push origin cursor-workspace

# 2. Document escalation
echo "ESCALATION: [description] - $(date)" >> BUG_TRACKER.md

# 3. Inform user
"⚡ ESCALATION NEEDED: This requires [Claude/Gemini] expertise due to [reason]"
```

---

## 📝 **RESPONSE TEMPLATES**

### **✅ Acceptance:**

```
"This is a TypeScript compilation error - I'll fix it now.
Files affected: [list]
Expected time: < 15 minutes"
```

### **❌ Escalation:**

```
"This requires authentication system expertise - assign to Claude/Gemini.
Reason: [Architecture/Security/Database] implications detected.
Current analysis: [brief description]"
```

### **✅ Completion:**

```
"✅ FIXED: [description]
- Modified: [files]
- Tested: All quality gates passed
- Time taken: [X] minutes"
```

---

## 🎯 **QUALITY CHECKLIST**

### **Prima di ogni commit:**

- [ ] `npm run type-check` ✅ PASSED
- [ ] `npm run lint` ✅ PASSED
- [ ] `npm run test` ✅ PASSED
- [ ] `node debug-app-detailed.js` ✅ NO CRITICAL ERRORS

### **Commit format:**

```bash
git commit -m "fix(cursor): resolve TypeScript import error in UserProfile component"
git commit -m "style(cursor): update button styling for mobile responsiveness"
git commit -m "chore(cursor): update dependency versions in package.json"
```

---

## 🎯 **SUCCESS METRICS**

- **Speed**: Fix completo in < 15 minuti
- **Quality**: Tutti i quality gates passano
- **Accuracy**: Fix risolve completamente il problema
- **Escalation**: Riconosce quando escalate (no spreco tempo)

---

**🚀 Remember: Velocità + Qualità = Success!**
