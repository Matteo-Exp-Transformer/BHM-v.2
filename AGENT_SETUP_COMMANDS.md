# 🤖 Comandi Setup per Agenti AI

**Quick reference per configurazione branch permanenti**

## 🚀 SETUP INIZIALE BRANCH (Eseguire una volta)

```bash
# Creazione branch permanenti
git checkout main
git pull origin main

# Cursor workspace
git checkout -b cursor-workspace
git push -u origin cursor-workspace

# Gemini workspace
git checkout -b gemini-workspace
git push -u origin gemini-workspace

# Claude workspace
git checkout -b claude-workspace
git push -u origin claude-workspace
```

## 📋 COMANDI QUOTIDIANI PER AGENTI

### **🔧 CURSOR - Daily Start**

```bash
git checkout cursor-workspace
git pull origin main
git rebase origin/main
npm run dev                     # Se non running
node debug-app-detailed.js      # Verifica stato app
```

### **⚡ GEMINI - Daily Start**

```bash
git checkout gemini-workspace
git pull origin main
git rebase origin/main
npm run dev                     # Se non running
node debug-app-detailed.js      # Verifica stato app
```

### **🧠 CLAUDE - Daily Start**

```bash
git checkout claude-workspace
git pull origin main
git rebase origin/main
npm run dev                     # Se non running
node debug-app-detailed.js      # Verifica stato app
```

## ✅ PRE-COMMIT CHECKLIST

```bash
# 1. Type check
npm run type-check

# 2. Linting
npm run lint

# 3. Tests
npm run test

# 4. Full app test (CRITICAL)
node debug-app-detailed.js
```

## 🎯 COMMIT & PUSH

```bash
# Stage changes
git add .

# Commit with agent prefix
git commit -m "[type](agent): [description]"
# Examples:
# git commit -m "fix(cursor): resolve import error in UserProfile"
# git commit -m "feat(claude): add authentication system"

# Push to workspace
git push origin [agent]-workspace
```

## 🚨 ESCALATION COMMAND

```bash
# When CURSOR needs to escalate
git add .
git commit -m "wip(cursor): escalating - [reason]"
git push origin cursor-workspace

# Add to bug tracker
echo "ESCALATION: [description] - [date]" >> BUG_TRACKER.md
```

## 🔧 UTILITY COMMANDS

```bash
# Check current branch
git branch --show-current

# See recent commits
git log --oneline -5

# Check git status
git status

# View differences
git diff

# Check running processes
npm run dev  # Development server

# Quick test
node debug-app-detailed.js
```

---

**🎯 Memorizza questi comandi per workflow efficiente!**
