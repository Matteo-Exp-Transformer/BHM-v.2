# 📎 CHAT LINKING GUIDE - File da Incollare

**Quick Reference per Matteo**
**Updated:** January 22, 2025

---

## 🤖 **CLAUDE - File da linkare in OGNI nuova chat**

### **Copy-Paste questo messaggio:**

```
Ciao Claude! Nuovo session per HACCP Business Manager.

LEGGI QUESTI FILE in ordine:
@Project_Knowledge/TASKS-CORE.md
@Project_Knowledge/Claude.md
@PLANNING.md
@Project_Knowledge/SESSION-STARTUP-GUIDE.md

CONTESTO: Progetto dual-AI con Cursor. Tu lavori su branch Claude (BHM-v.2-Claude), Cursor su branch Curs. Main branch broken (210 TypeScript errors).

PRIORITÀ CORRENTE: Shopping lists → calendar integration + database schema deployment.

Cosa devo fare oggi?
```

### **File paths per copy-paste:**
```
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\Project_Knowledge\TASKS-CORE.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\Project_Knowledge\Claude.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\PLANNING.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\Project_Knowledge\SESSION-STARTUP-GUIDE.md
```

---

## 👨‍💻 **CURSOR - File da linkare in OGNI nuova chat**

### **Copy-Paste questo messaggio:**

```
Ciao Cursor! Nuovo session per HACCP Business Manager.

LEGGI QUESTI FILE in ordine:
@Project_Knowledge/TASKS-CORE.md
@Project_Knowledge/Bug_Reports/Istruzioni_Debug_Agente/CURSOR-INSTRUCTIONS.md
@Project_Knowledge/Bug_Reports/bug-tracking-index.md
@Project_Knowledge/Bug_Reports/README.md

CONTESTO: Progetto dual-AI con Claude. Tu lavori su branch Curs (BHM-v.2-Cursor), Claude su branch Claude.

PRIORITÀ CRITICA: Risolvi 5 TypeScript errors (BUG-001 a BUG-005) che bloccano git commits.

Inizia con BUG-001 (TypeScript User import missing).
```

### **File paths per copy-paste:**
```
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor\Project_Knowledge\TASKS-CORE.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor\Project_Knowledge\Bug_Reports\Istruzioni_Debug_Agente\CURSOR-INSTRUCTIONS.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor\Project_Knowledge\Bug_Reports\bug-tracking-index.md
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor\Project_Knowledge\Bug_Reports\README.md
```

---

## ⏰ **QUANDO CHIEDERE MERGE/BACKUP**

### **🔥 MERGE IMMEDIATO** - Scrivi a Claude:
```
"Claude, ho bisogno di un merge immediato perché [Cursor ha risolto bug critico / ho deployato database / breaking change]"
```

### **📅 MERGE PROGRAMMATO** - Ogni Venerdì:
```
"Claude, facciamo il sync settimanale. Merge del lavoro di Cursor e backup completo."
```

### **💾 BACKUP MANUALE** - Quando serve:
```
"Claude, crea backup di entrambi i branch prima di [nuova feature / merge / deploy]"
```

---

## 🎯 **QUICK STATUS CHECK**

### **Verifica veloce prima di iniziare:**

**Per Claude:**
```
"Qual è lo status corrente? Ci sono modifiche di Cursor da syncronizzare?"
```

**Per Cursor:**
```
"Ci sono nuovi bug critici? Claude ha fatto modifiche che mi impattano?"
```

---

## 📊 **MONITORING DASHBOARD**

### **File di monitoraggio da controllare:**

**Bug Status:**
```
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Cursor\Project_Knowledge\Bug_Reports\bug-tracking-index.md
```

**Project Progress:**
```
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\Project_Knowledge\TASKS-CORE.md
```

**Coordination Status:**
```
C:\Users\matte.MIO\Documents\GitHub\BHM-v.2-Claude\Project_Knowledge\Claude.md
```

---

## 🚨 **EMERGENCY PROTOCOLS**

### **Se TypeScript esplode:**
```
"EMERGENZA: TypeScript broken. Cursor, priorità assoluta su fix. Claude, aspetta sync."
```

### **Se database non funziona:**
```
"EMERGENZA: Database broken. Claude, priorità assoluta su fix. Cursor, lavora su pure UI."
```

### **Se git conflicts:**
```
"CONFLITTO GIT: Claude, risolvi conflitti e coordina merge. Stop development finché non risolto."
```

---

**💡 TIP:** Salva questo file nei bookmark per copy-paste veloce!