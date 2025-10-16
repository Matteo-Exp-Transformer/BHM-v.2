# 🚨 REGOLE CRITICHE PER AGENTI

> **ATTENZIONE**: Queste regole sono OBBLIGATORIE per tutti gli agenti che lavorano su questo progetto.

## 🔒 REGOLE BLINDATURA - NON NEGOZIABILI

### 1. COMPONENTI LOCKED - ZONA VIETATA
```
🚫 MAI MODIFICARE FILE CON COMMENTI:
// LOCKED: [Data] - Componente blindata
// LOCKED: [Data] - [NomeComponente] testata e funzionante
```

**SE TROVI UN COMMENTO LOCKED:**
1. **FERMATI IMMEDIATAMENTE**
2. **NON MODIFICARE IL FILE**
3. **CHIEDI PERMESSO ESPLICITO** all'utente
4. **SE L'UTENTE ACCONSENTE**: procedi con unlock → modifica → re-test completo → re-lock

### 2. CONTROLLO OBBLIGATORIO
**PRIMA DI OGNI MODIFICA:**
1. Leggi `Production/Knowledge/MASTER_TRACKING.md`
2. Verifica se il componente è 🔒 LOCKED
3. Se LOCKED: **NON PROCEDERE SENZA PERMESSO**

### 3. AGGIORNAMENTO OBBLIGATORIO
**DOPO OGNI MODIFICA:**
1. Aggiorna `Production/Knowledge/MASTER_TRACKING.md`
2. Cambia lo stato della componente modificata
3. Documenta cosa è stato fatto

## 📋 PROCESSO DI BLINDATURA

### Quando una componente è "Locked":
1. ✅ **Tutti i test passano al 100%**
2. ✅ **Funzionalità verificate con dati validi e invalidi**
3. ✅ **Edge cases testati**
4. ✅ **UI/UX verificata completamente**
5. ✅ **Nessun side effect su altre componenti**

### Come "Lockare" una componente:
```javascript
// LOCKED: [Data] - [NomeComponente] blindata
// Tutti i test passano, funzionalità verificata
// NON MODIFICARE SENZA PERMESSO ESPLICITO
```

### Come "Unlockare" una componente:
```javascript
// UNLOCKED: [Data] - [NomeComponente] per modifica
// RICORDARE: re-test completo dopo modifica e re-lock
```

## 🎯 PRIORITÀ DI LAVORO

### Ordine di Blindatura:
1. **🔐 Autenticazione** (Login, Signup, Auth guards)
2. **🎯 Onboarding** (Wizard, setup iniziale)
3. **📊 Dashboard** (Home, navigazione principale)
4. **🎨 UI Base** (Button, Input, Modal, Form)
5. **📅 Calendario** (Eventi, task, scheduling)
6. **📦 Inventario** (Prodotti, stock, categorie)
7. **🌡️ Conservazione** (Temperature, controlli)
8. **🛒 Liste Spesa** (Shopping, ordini)
9. **⚙️ Gestione** (Admin, utenti, aziende)
10. **🔧 Impostazioni** (Configurazioni, preferenze)

## 🧪 STANDARD DI TESTING

### Test Funzionali (Tipo 1):
- ✅ Ogni bottone è cliccabile
- ✅ Ogni form accetta input e valida
- ✅ Ogni modal si apre/chiude
- ✅ Ogni tab/navigazione funziona
- ✅ Ogni tooltip/feedback appare
- ✅ Ogni azione produce risultato atteso

### Test Validazione Dati (Tipo 2):
- ✅ Input validi accettati
- ✅ Input invalidi rifiutati con errore
- ✅ Edge cases (valori limite, null, undefined)
- ✅ Casi estremi (stringhe lunghe, numeri negativi)
- ✅ Sicurezza (injection, caratteri speciali)

## 📁 ORGANIZZAZIONE FILE

### Struttura Test:
```
Production/Test/[Area]/
├── [Sottocomponente]/
│   ├── test-funzionale.js
│   ├── test-validazione.js
│   └── test-edge-cases.js
```

### Nomenclatura:
- **Cartelle**: Terminologia NON tecnica (es: "Calendario/Crea-Evento")
- **File**: Descrittivi e specifici
- **Test**: Max 50-100 righe per file

## 🚨 SANZIONI PER VIOLAZIONI

**Se modifichi codice LOCKED senza permesso:**
1. ⚠️ **PRIMO AVVERTIMENTO**: Stop immediato, rollback
2. 🔴 **SECONDO AVVERTIMENTO**: Blocco temporaneo
3. 🚫 **TERZO AVVERTIMENTO**: Esclusione dal progetto

## 📞 SUPPORTO

**Se hai dubbi:**
1. Leggi questo file completamente
2. Controlla `MASTER_TRACKING.md`
3. Chiedi chiarimenti all'utente
4. **MEGLIO CHIEDERE TROPPO CHE MODIFICARE MALE**

---

**RICORDA**: L'obiettivo è avere un'app **INDISTRUTTIBILE**. Ogni componente locked è un mattoncino solido di questa fortificazione. **NON ROMPERE I MATTONCINI!** 🛡️


