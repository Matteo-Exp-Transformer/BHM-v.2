# 🚀 Guida Git Semplice - Salvare il Tuo Lavoro

**Per principianti che vogliono capire e usare Git senza confusione**

---

## 🎯 **COSA È GIT?**

Git è come un **"salvataggio intelligente"** per il tuo codice:
- Salva ogni modifica che fai
- Ti permette di tornare indietro se sbagli
- Sincronizza il tuo lavoro con altri (o con GitHub)

**Pensa a Git come a una macchina del tempo per i tuoi file!**

---

## 🔥 **PATTERN BASE - I 4 COMANDI ESSENZIALI**

### **📋 IL WORKFLOW STANDARD:**

quando sei in terminale bash ---> ```bash

```bash
1. git status          # "Cosa ho modificato?"
2. git add .           # "Salvo tutto quello che ho fatto"
3. git commit -m "..."  # "Confermo le modifiche"
4. git push            # "Invio tutto online"
```

### **🛠️ COMANDI DETTAGLIATI:**

#### **1. `git status` - "Che cosa ho modificato?"**
```bash
git status
```
**Cosa vedi:**
- 🟡 **"Changes not staged"** = Modifiche solo sul tuo computer
- 🟢 **"Untracked files"** = File nuovi che Git non conosce
- 🔴 **"deleted"** = File che hai cancellato

#### **2. `git add .` - "Salvo tutto quello che ho fatto"**
```bash
git add .                    # Salva TUTTO
git add nome-file.md         # Salva solo UN file
git add "cartella/"          # Salva solo una CARTELLA
```

#### **3. `git commit -m "..."` - "Confermo le modifiche"**
```bash
git commit -m "Aggiunto nuovo menu"
git commit -m "Fix bug login"
git commit -m "Aggiornato README"
```

#### **4. `git push` - "Invio tutto online"**
```bash
git push origin main         # Invio al branch principale
git push origin [nome-branch] # Invio a un branch specifico
```

---

## 🎮 **ESEMPI PRATICI SITUAZIONALI**

### **📝 SITUAZIONE 1: "Ho modificato un file"**

```bash
# 1. Verifica cosa hai modificato
git status
# Vedrai: modified:   mio-file.js

# 2. Salva le modifiche
git add mio-file.js
# Oppure: git add . (per salvare tutto)

# 3. Conferma
git commit -m "Modificato mio-file.js"

# 4. Invio online
git push origin main
```

### **📁 SITUAZIONE 2: "Ho creato nuovi file"**

```bash
# 1. Verifica file nuovi
git status
# Vedrai: Untracked files: nuovo-file.md  che è il file che hai modificato.

# 2. Salva tutto
git add .

# 3. Conferma
git commit -m "Aggiunto nuovo-file.md"    #--> dopo -m  apro virgolette e do un nome al salvataggio delle modifiche

# 4. Invio online
git push origin main
```

### **🗑️ SITUAZIONE 3: "Ho cancellato un file"**

```bash
# 1. Verifica cancellazioni
git status
# Vedrai: deleted:    file-vecchio.txt

# 2. Salva la cancellazione
git add .
# Oppure: git rm file-vecchio.txt

# 3. Conferma
git commit -m "Rimosso file-vecchio.txt"

# 4. Invio online
git push origin main
```

### **🔄 SITUAZIONE 4: "Voglio solo salvare localmente"**

```bash
# Salva solo sul tuo computer (senza inviare online)
git add .
git commit -m "Salvataggio locale"
# NON fare git push!
```

---

## 🚨 **GESTIONE PROBLEMI COMUNI**

### **❌ PROBLEMA 1: "Ho sbagliato il messaggio di commit"**

```bash
# Correggi l'ultimo commit
git commit --amend -m "Nuovo messaggio corretto"
```

### **❌ PROBLEMA 2: "Ho fatto commit ma non push, voglio annullare"**

```bash
# Annulla l'ultimo commit (mantiene le modifiche)
git reset --soft HEAD~1

# Oppure annulla completamente
git reset --hard HEAD~1
```

### **❌ PROBLEMA 3: "Ho modificato ma non voglio salvare"**

```bash
# Annulla modifiche a un file specifico
git checkout -- nome-file.js

# Annulla TUTTE le modifiche
git reset --hard HEAD
```

### **❌ PROBLEMA 4: "Git push non funziona"**

```bash
# 1. Controlla se sei connesso
git remote -v

# 2. Prova a fare pull prima
git pull origin main     # COSA FA git pull : 3 FUNZIONI PRINCIPALI = Scarica le modifiche più recenti dal repository online - Applica automaticamente queste modifiche ai tuoi file locali - Sincronizza il tuo computer con la versione online

# 3. Poi fai push
git push origin main
```
Perchè eseguire questa procedura risolve il problema? Perché: Il server ha modifiche che tu non hai e devi prima sincronizzarti.
---

## 🔍 **COMANDI UTILI PER CONTROLLARE**

### **📊 Vedere la cronologia:**
```bash
git log --oneline          # Cronologia compatta
git log --graph            # Cronologia con grafico
git show [hash-commit]     # Dettagli di un commit specifico
```

### **🌐 Verificare stato online:**
```bash
git remote -v              # Dove sono collegato online
git branch -a              # Tutti i branch disponibili
git status                 # Stato attuale del progetto
```

### **📝 Vedere differenze:**
```bash
git diff                   # Differenze non salvate
git diff --staged          # Differenze già salvate
git diff [file]            # Differenze di un file specifico
```

---

## 🎯 **WORKFLOW PROFESSIONALE**

### **🔄 Branch Management (Lavoro su funzionalità separate):**

```bash
# 1. Crea un nuovo branch
git checkout -b nuova-funzionalita

# 2. Lavora normalmente
git add .
git commit -m "Sviluppo nuova funzionalità"

# 3. Invio il branch
git push origin nuova-funzionalita

# 4. Torna al branch principale
git checkout main
```

### **🔄 Sincronizzazione (Aggiornare dal server):**

```bash
# Scarica modifiche dal server
git pull origin main

# Oppure più sicuro:
git fetch origin           # Scarica senza modificare
git merge origin/main      # Applica le modifiche
```

---

## ✅ **CHECKLIST QUOTIDIANA**

### **🌅 Inizio giornata:**
```bash
git pull origin main       # Aggiorna dal server
git status                 # Controlla stato
```

### **🛠️ Durante il lavoro:**
```bash
git status                 # Controlla modifiche
git add .                  # Salva modifiche
git commit -m "..."        # Conferma
```

### **🌙 Fine giornata:**
```bash
git push origin main       # Invio online
git status                 # Verifica che tutto sia pulito
```

---

## 🎓 **REGOLA D'ORO**

> **"Se non sei sicuro, usa `git status` prima di tutto!"**

Questo comando ti dice sempre:
- Cosa hai modificato
- Cosa è già salvato
- Cosa devi ancora fare

---

## 🚀 **COMANDI RAPIDI RICORDA**

```bash
# Salvataggio completo in 4 comandi:
git status && git add . && git commit -m "Mio lavoro" && git push

# Controllo rapido:
git status

# Aggiornamento rapido:
git pull origin main

# Reset completo (ATTENZIONE!):
git reset --hard HEAD
```

---

## 📚 **VOCABOLARIO SEMPLICE**

- **Repository**: La cartella del tuo progetto
- **Commit**: Un "salvataggio" delle tue modifiche
- **Push**: Inviare modifiche online
- **Pull**: Scaricare modifiche dal server
- **Branch**: Una versione separata del tuo progetto
- **Merge**: Unire due versioni insieme
- **Staging**: Preparare file per il commit

---

**🎯 Ricorda: Git è uno strumento potente ma semplice. Inizia con i 4 comandi base e aggiungi il resto quando ti serve!**
