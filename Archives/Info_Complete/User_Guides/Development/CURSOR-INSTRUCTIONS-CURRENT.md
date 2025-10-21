# 🎯 CURSOR AGENT - ISTRUZIONI CORRENTI

**Data aggiornamento:** 4 Gennaio 2025
**Branch:** `fix/cursor-functional`
**Stato:** In corso - Divisione lavoro con Claude

---

## 📋 SITUAZIONE ATTUALE

### ✅ Completato da Claude (Branch GPT → fix/cursor-functional)

1. **Conservation Page Crash** ✓
   - Aggiunto React import in ConservationStats.tsx
   - Risolto bug C003

2. **Automation Services - Variabili Non Utilizzate** ✓
   - AutomatedReportingService: 7 variabili fixate
   - IntelligentAlertManager: 14+ variabili fixate
   - SmartSchedulingService: 11 variabili fixate
   - index.ts: rimosso schedulingService inutilizzato

3. **Automation Services - Tipi Any Espliciti** ✓
   - IntelligentAlertManager: 37 tipi any → tipi specifici
   - SmartSchedulingService: 2 tipi any → tipi union
   - Ridotti warning ESLint da 39 a molto meno

**Commits fatti:**
- `de4b971` - fix(conservation): add React import
- `8f79351` - fix(automation): NodeJS undefined error
- `d1219e7` - fix(automation): remove unused schedulingService
- `73d4411` - fix(automation): replace explicit any types

---

## 🎯 TUO LAVORO - CURSOR AGENT

### **REGOLA #1: DIVISIONE DEL LAVORO**

**TU (Cursor) ti occupi SOLO di:**
- ✅ Bug funzionali (Conservation, Categories, UI)
- ✅ Fix della pagina Inventory
- ✅ Responsive design issues
- ✅ Componenti CollapsibleCard
- ✅ User experience bugs
- ✅ Hook exhaustive-deps warnings

**Claude si occupa di:**
- ❌ Cleanup TypeScript (unused variables, any types)
- ❌ Test errors (ExcelExporter)
- ❌ Linting avanzato
- ❌ Code quality generale

### **PRIORITÀ IMMEDIATE PER TE**

#### 🔴 **PRIORITÀ 1 - BUG CRITICI**

1. **C001 - Conservation Page Issues** (se non completamente risolto)
   ```bash
   File: src/features/conservation/ConservationStats.tsx
   Status: React import aggiunto da Claude
   Tua azione: Verifica che funzioni, se ci sono altri bug fixali
   ```

2. **C002 - Categories System Non Funziona** ⚠️ **INIZIA DA QUI**
   ```bash
   File: src/features/inventory/InventoryPage.tsx
   Problema: useCategories hook non funziona correttamente

   Passi:
   1. Apri src/hooks/useCategories.ts
   2. Verifica la logica di fetch delle categorie
   3. Controlla se ci sono errori nella console
   4. Fix il hook se necessario
   5. Testa che le categorie appaiano nella UI
   ```

3. **CollapsibleCard - Inventory Page** ⚠️ **SECONDO**
   ```bash
   File: src/features/inventory/InventoryPage.tsx
   Problema: CollapsibleCard non mostra contenuto

   Passi:
   1. Verifica props passate a CollapsibleCard
   2. Controlla defaultOpen, forceOpen
   3. Assicurati che children siano renderizzati
   4. Testa apertura/chiusura
   ```

#### 🟡 **PRIORITÀ 2 - UI/UX FIXES**

4. **Responsive Layout Issues**
   ```bash
   File: docs/debug/responsive-issues.md (creato da Claude)

   Verifica e fixa:
   - Mobile 375px
   - Tablet 768px
   - Desktop 1920px

   Focus su:
   - Settings page
   - Inventory page
   - Conservation page
   ```

5. **CollapsibleCard - Settings Page**
   ```bash
   File: src/features/settings/SettingsPage.tsx
   Problema: Stesso problema di Inventory

   Passi:
   1. Applica stesso fix di Inventory
   2. Testa tutte le sezioni
   ```

#### 🟢 **PRIORITÀ 3 - CLEANUP WARNINGS**

6. **React Hooks exhaustive-deps**
   ```bash
   Cerca warning tipo:
   "React Hook useEffect has missing dependencies"

   Approccio:
   1. Analizza se la dipendenza è davvero necessaria
   2. Se sì, aggiungila
   3. Se no, usa eslint-disable-next-line con commento
   4. MAI ignorare senza capire
   ```

7. **React-refresh warnings**
   ```bash
   Cerca warning tipo:
   "Fast refresh only works when a file only exports components"

   Fix:
   1. Separa exports di componenti da exports di utilities
   2. Crea file separati se necessario
   ```

---

## 🚫 NON TOCCARE (lavoro di Claude)

- ❌ WorkflowAutomationEngine.ts (variabili unused)
- ❌ ExcelExporter test files
- ❌ Tipi `any` espliciti (già fatto da Claude)
- ❌ File di configurazione ESLint/TypeScript

---

## 📝 WORKFLOW DI LAVORO

### **Prima di iniziare ogni task:**

```bash
# 1. Assicurati di essere sul branch corretto
git branch --show-current
# Deve essere: fix/cursor-functional

# 2. Pull latest changes
git pull origin fix/cursor-functional

# 3. Verifica stato
npm run type-check | head -20
npm run lint | head -20
```

### **Durante il lavoro:**

```bash
# 1. Lavora su UN task alla volta
# 2. Testa incrementalmente
npm run dev

# 3. Verifica che non rompi nulla
npm run type-check
npm run lint

# 4. Commit frequenti
git add [files modificati]
git commit -m "fix([area]): [cosa hai fatto]"

# Esempi:
# git commit -m "fix(inventory): resolve useCategories hook data fetching"
# git commit -m "fix(ui): make CollapsibleCard show content in Inventory"
# git commit -m "fix(responsive): adjust Settings layout for mobile"
```

### **Dopo ogni task completato:**

```bash
# 1. Push
git push origin fix/cursor-functional

# 2. Aggiorna questo file
# Sposta task da "Da fare" a "Completato"

# 3. Vai al task successivo
```

---

## 📊 METRICHE OBIETTIVO

### **Stato corrente (dopo lavoro Claude):**
- TypeScript errors: ~254
- ESLint warnings: ~326
- Build: ❓ (da testare)

### **Obiettivo finale (dopo tuo lavoro):**
- Conservation page: ✅ 100% funzionante
- Categories system: ✅ 100% funzionante
- Inventory page: ✅ Completamente responsive
- Settings page: ✅ CollapsibleCard funzionanti
- exhaustive-deps warnings: ✅ < 10
- react-refresh warnings: ✅ 0

### **Obiettivo combinato (Claude + Tu):**
- TypeScript errors: < 50
- ESLint warnings: < 20
- Build: ✅ Success
- All critical bugs: ✅ Fixed

---

## 🔍 TESTING CHECKLIST

Dopo ogni fix, testa:

### **Conservation Page:**
```
□ Page loads without crash
□ Stats cards show correct data
□ Can view conservation points list
□ Can add new conservation point
□ Can record temperature
□ Can complete maintenance
```

### **Inventory Page:**
```
□ Page loads
□ Categories dropdown populated
□ Can select category
□ Products filter by category
□ CollapsibleCard shows content
□ Can add/edit/delete products
□ Responsive on mobile/tablet/desktop
```

### **Settings Page:**
```
□ All CollapsibleCard sections visible
□ Can open/close sections
□ Settings save correctly
□ Responsive layout works
```

---

## 🆘 SE TROVI PROBLEMI

### **Se un task è bloccato:**

1. **Documenta il blocker**
   ```markdown
   ## Blocker - [Task Name]

   **Problema:** [Descrizione]
   **Tentato:** [Cosa hai provato]
   **Errore:** [Stack trace o messaggio]
   **Serve:** [Cosa serve per sbloccare]
   ```

2. **Passa al task successivo**
   - Non perdere tempo su un blocker
   - Torna dopo quando hai più context

3. **Chiedi a Claude se necessario**
   - Aggiorna questo file con il blocker
   - Claude risolverà quando torna

### **Se rompi qualcosa:**

```bash
# 1. Non panico
git status

# 2. Vedi cosa hai cambiato
git diff

# 3. Se è un disastro, torna indietro
git checkout [file]
# oppure
git reset --hard HEAD

# 4. Riprova con approccio diverso
```

---

## ✅ TASK LIST AGGIORNATA

### 🔴 **CRITICO - Da fare subito**

- [ ] **C002** - Fix Categories System in Inventory
  - File: src/hooks/useCategories.ts
  - File: src/features/inventory/InventoryPage.tsx
  - Tempo stimato: 2-3h
  - Acceptance: Categories dropdown funziona, prodotti filtrati

- [ ] **B1** - Fix CollapsibleCard in Inventory
  - File: src/features/inventory/InventoryPage.tsx
  - Tempo stimato: 1-2h
  - Acceptance: Tutto il contenuto visibile

### 🟡 **IMPORTANTE - Dopo i critici**

- [ ] **B2** - Fix CollapsibleCard in Settings
  - File: src/features/settings/SettingsPage.tsx
  - Tempo stimato: 1h
  - Acceptance: Tutte le sezioni funzionanti

- [ ] **B3** - Responsive Layout Audit
  - Files: Tutti i componenti principali
  - Tempo stimato: 2h
  - Acceptance: Mobile/Tablet/Desktop OK

- [ ] **B4** - Fix Responsive Issues
  - Basato su audit B3
  - Tempo stimato: 3-4h
  - Acceptance: Nessun overflow, layout corretto

### 🟢 **CLEANUP - Se hai tempo**

- [ ] **B8** - Fix exhaustive-deps warnings
  - Files: Vari hooks
  - Tempo stimato: 1-2h
  - Acceptance: < 10 warnings

- [ ] **B9** - Fix react-refresh warnings
  - Files: Componenti con exports misti
  - Tempo stimato: 1h
  - Acceptance: 0 warnings

---

## 📈 STATO AVANZAMENTO

### ✅ Completato
- [x] C003 - React Import Error (Claude)
- [x] Automation Services - Unused Variables (Claude)
- [x] Automation Services - Any Types (Claude)

### 🔄 In Corso
- [ ] Nessuno (inizia da C002)

### ⏳ Da Fare
- Vedi "TASK LIST AGGIORNATA" sopra

### ⚠️ Bloccati
- Nessuno al momento

---

## 🎯 OBIETTIVO FINALE

**Quando avrai finito, l'app deve:**

1. ✅ Caricare senza crash su tutte le pagine
2. ✅ Conservation page completamente funzionante
3. ✅ Categories system funzionante
4. ✅ Inventory page responsive e completa
5. ✅ Settings page con tutte le sezioni visibili
6. ✅ Tutti i CollapsibleCard funzionanti
7. ✅ Zero errori critici
8. ✅ < 20 warning totali (combinato con Claude)

**Poi Claude finirà:**
- ExcelExporter test fixes
- Ulteriore cleanup TypeScript
- Validazione finale

**Poi insieme:**
- Merge delle branch
- Testing integrato
- Deploy

---

## 📞 COMUNICAZIONE

### **Update frequency:**
- Ogni task completato: aggiorna questo file
- Ogni blocker: documenta immediatamente
- Fine giornata: summary commit

### **Commit message format:**
```bash
fix(area): short description

- Detail 1
- Detail 2
- Fixes #issue (se applicabile)
```

### **Esempi:**
```bash
fix(inventory): resolve categories not loading

- Fixed useCategories hook data fetching
- Added proper error handling
- Categories now populate dropdown
- Fixes C002

fix(ui): CollapsibleCard now shows content in Inventory

- Fixed defaultOpen prop handling
- Corrected children rendering logic
- All sections now visible
- Fixes B1
```

---

**RICORDA:**
- 🎯 Focus su funzionalità e UX
- 🚫 Non toccare cleanup TypeScript (è di Claude)
- ✅ Testa tutto prima di committare
- 📝 Documenta mentre lavori
- 🤝 Sync con Claude tramite questo file

---

**Ultima modifica:** 4 Gennaio 2025
**Prossimo update:** Dopo primo task completato
**Contatto Claude:** Via git commits e questo file
