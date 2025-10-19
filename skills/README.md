# 🎭 BHM v.2 - AI Skills System

> **Sistema di skills specializzate per Claude Code e Cursor AI**

---

## 📚 SKILLS DISPONIBILI

### 1. 🏗️ **APP_OVERVIEW** - Panoramica Tecnica App
**Quando usarla**: Vuoi capire architettura, stack tecnologico, features, stato progetto

**Trigger words**:
- "panoramica app"
- "overview app"
- "architettura app"
- "stack tecnologico"
- "tecnologie utilizzate"
- "come è strutturata l'app"

**Esempio uso**:
```
User: Dammi una panoramica completa dell'app
→ Skill fornisce: architettura, stack (React 18, TypeScript, Supabase),
  features (auth, dashboard, calendar, etc.), configurazioni, stato progetto
```

**Output**: Tabelle tecnologie, lista features, comandi disponibili, file paths chiave

---

### 2. 🧪 **TEST_ARCHITECT** - Strategia Testing
**Quando usarla**: Devi progettare test per un componente (prima di scrivere codice test)

**Trigger words**:
- "strategia test"
- "piano test"
- "come testare"
- "coverage target"
- "progetta test"

**Esempio uso**:
```
User: Progetta strategia test per LoginPage component
→ Skill fornisce: 3 livelli test (funzionali/validazione/edge cases),
  numero test per livello, mocking strategy, coverage targets, effort estimate
```

**Output**: Test plan dettagliato con test cases, mocking, coverage target, istruzioni per TEST_GENERATOR

---

### 3. ⚙️ **TEST_GENERATOR** - Generazione Test Code
**Quando usarla**: Hai una strategia (da TEST_ARCHITECT) e vuoi generare il codice test

**Trigger words**:
- "genera test"
- "crea test"
- "implementa test"
- "scrivi test"

**Esempio uso**:
```
User: Genera test code per LoginPage seguendo la strategia
→ Skill crea: file test completo (Vitest + RTL o Playwright),
  esegue test, verifica 100% pass, riporta coverage
```

**Output**: File test funzionante, report esecuzione, coverage achieved

---

### 4. 🗺️ **APP_MAPPING** - Mappatura Componenti
**Quando usarla**: Devi creare inventario componenti di un'area (prerequisito per testing)

**Trigger words**:
- "mappa componenti"
- "inventario componenti"
- "esplora area"
- "lista componenti"
- "analizza feature"

**Esempio uso**:
```
User: Mappa tutti i componenti dell'area Dashboard
→ Skill esplora: src/features/dashboard/, trova tutti i file,
  analizza ogni componente, crea inventario, aggiorna MASTER_TRACKING.md
```

**Output**: File `Production/Knowledge/DASHBOARD_COMPONENTI.md`, MASTER_TRACKING aggiornato

---

### 5. 📝 **PROMPT_TESTER** - Validazione Prompt AI
**Quando usarla**: Hai scritto un prompt AI e vuoi validarne qualità ed effectiveness

**Trigger words**:
- "testa prompt"
- "valida prompt"
- "prompt quality"
- "review prompt"
- "score prompt"

**Esempio uso**:
```
User: Testa il prompt PROMPT_MAPPATURA_AGENTI.md
→ Skill esegue: 4 livelli test (structural/content/effectiveness/consistency),
  assegna score 0-10, fornisce improvements prioritized
```

**Output**: Report completo con score, strengths/weaknesses, recommended improvements, deployment decision

---

### 6. 🔧 **ERROR_INTERPRETER** - Debug & Fix Errori
**Quando usarla**: Hai un errore e vuoi capire causa + fix rapido

**Trigger words**:
- "errore"
- "bug"
- "debug"
- "non funziona"
- "fix"
- "help error"

**Esempio uso**:
```
User: Ho questo errore: "Type 'string | undefined' is not assignable to type 'string'"
→ Skill fornisce: root cause (optional property), quick fix (<5 min),
  proper fix (long-term), confidence %, next step actionable
```

**Output**: Diagnosi completa, quick fix + proper fix, spiegazione WHY funziona, prevention tips

---

## 📁 ORGANIZZAZIONE FILE

### Struttura Multi-Tool
```
BHM-v.2/
├── .claude/
│   └── skills/                    # Skills compatte per Claude Code
│       ├── app-overview.md        # Con front matter YAML + trigger words
│       ├── test-architect.md
│       ├── test-generator.md
│       ├── app-mapping.md
│       ├── prompt-tester.md
│       └── error-interpreter.md
│
├── .cursor/
│   └── rules/                     # Skills complete per Cursor AI
│       ├── SKILL_APP_OVERVIEW.md
│       ├── SKILL_TEST_ARCHITECT.md
│       ├── SKILL_TEST_GENERATOR.md
│       ├── SKILL_APP_MAPPING.md
│       ├── SKILL_PROMPT_TESTER.md
│       └── SKILL_ERROR_INTERPRETER.md
│
├── Production/
│   └── Prompt_Context/            # Skills complete + templates
│       ├── SKILL_APP_OVERVIEW.md         # Versione completa dettagliata
│       ├── SKILL_TEST_ARCHITECT.md
│       ├── SKILL_TEST_GENERATOR.md
│       ├── SKILL_APP_MAPPING.md
│       ├── SKILL_PROMPT_TESTER.md
│       ├── SKILL_ERROR_INTERPRETER.md
│       ├── GUIDA_GENERAZIONE_PROMPT.md   # Best practices prompting
│       ├── TEMPLATE_TEST_JS.md           # Template Playwright
│       └── TEMPLATE_TRACKING_COMPONENTE.md
│
├── .cursorrules                   # Config principale Cursor (auto-loaded)
└── skills/                        # Backup originale skills
```

---

## 🎯 COME USARE LE SKILLS

### Metodo 1: Trigger Words Automatico (Consigliato)
Scrivi semplicemente la parola chiave nel messaggio:

```
✅ ESEMPIO 1:
User: "Dammi panoramica app"
→ Claude/Cursor rileva "panoramica app" → Attiva SKILL_APP_OVERVIEW

✅ ESEMPIO 2:
User: "Come testare il componente LoginPage?"
→ Claude/Cursor rileva "testare" → Attiva SKILL_TEST_ARCHITECT

✅ ESEMPIO 3:
User: "Ho un errore: Cannot find module '@/components/Button'"
→ Claude/Cursor rileva "errore" → Attiva SKILL_ERROR_INTERPRETER
```

### Metodo 2: Riferimento Esplicito
Menziona esplicitamente la skill:

```
User: "@SKILL_TEST_GENERATOR implementa i test per Dashboard"
User: "Usa SKILL_APP_MAPPING per mappare area Calendar"
```

### Metodo 3: Workflow Multi-Skill
Combina più skills in sequenza:

```
User: "Mappa area Dashboard, poi progetta test, poi genera codice test"
→ Step 1: SKILL_APP_MAPPING mappa componenti
→ Step 2: SKILL_TEST_ARCHITECT progetta strategia
→ Step 3: SKILL_TEST_GENERATOR genera codice
```

---

## 🔄 WORKFLOW TIPICI

### Workflow 1: Testing Completo Nuova Feature
```bash
# Step 1: Mappa componenti
User: "Mappa componenti area Calendar"
→ SKILL_APP_MAPPING crea inventario

# Step 2: Progetta strategia test
User: "Progetta test per Calendar.tsx"
→ SKILL_TEST_ARCHITECT fornisce strategia

# Step 3: Genera test code
User: "Genera test seguendo strategia"
→ SKILL_TEST_GENERATOR crea file test

# Step 4: Debug eventuali errori
User: "Errore: Timeout waiting for locator"
→ SKILL_ERROR_INTERPRETER diagnosi + fix
```

### Workflow 2: Debug Veloce
```bash
User: "Errore build: Cannot find module '@/hooks/useAuth'"
→ SKILL_ERROR_INTERPRETER
  - Root cause: path alias issue
  - Quick fix: verifica tsconfig.json baseUrl
  - Proper fix: reinstalla node_modules
```

### Workflow 3: Onboarding Nuovo Developer
```bash
# Overview generale
User: "Panoramica completa app BHM"
→ SKILL_APP_OVERVIEW fornisce architettura, stack, features

# Capire testing
User: "Come funziona il testing in questa app?"
→ SKILL_APP_OVERVIEW sezione testing + link a skills TEST_*

# Mappare conoscenza
User: "Quali componenti ci sono nell'area auth?"
→ SKILL_APP_MAPPING o legge inventario esistente
```

---

## 📊 SKILLS DECISION MATRIX

| Situazione | Skill da Usare | Trigger Words |
|------------|---------------|---------------|
| Vuoi capire l'app | APP_OVERVIEW | "panoramica", "overview", "architettura" |
| Devi testare componente nuovo | TEST_ARCHITECT → TEST_GENERATOR | "strategia test" → "genera test" |
| Devi mappare componenti area | APP_MAPPING | "mappa componenti", "inventario" |
| Hai scritto prompt e vuoi validarlo | PROMPT_TESTER | "testa prompt", "valida prompt" |
| Hai un errore da risolvere | ERROR_INTERPRETER | "errore", "bug", "debug", "fix" |
| Vuoi migliorare coverage area | APP_MAPPING → TEST_ARCHITECT → TEST_GENERATOR | workflow completo |

---

## 💡 TIPS & BEST PRACTICES

### ✅ Do's:
- **Usa trigger words naturali**: Scrivi normalmente, le skills si attivano automaticamente
- **Fornisci contesto**: "Progetta test per LoginPage in src/features/auth/pages/LoginPage.tsx"
- **Combina skills**: Workflow multi-step per task complessi
- **Riferisci file specifici**: "@SKILL_TEST_ARCHITECT analizza src/features/dashboard/Dashboard.tsx"

### ❌ Don'ts:
- Non scrivere richieste vaghe: "testa qualcosa" → Specifica componente
- Non saltare prerequisiti: Mappa prima con APP_MAPPING, poi testa
- Non ignorare recommendations: Se PROMPT_TESTER suggerisce fix, implementali
- Non dimenticare di aggiornare tracking dopo mappatura

---

## 🚀 QUICK START

### Primo Utilizzo - Claude Code
1. Le skills sono già configurate in `.claude/skills/`
2. Scrivi semplicemente un messaggio con trigger words
3. Claude rileva automaticamente e attiva la skill appropriata

### Primo Utilizzo - Cursor AI
1. Le skills sono già configurate in `.cursor/rules/` e `.cursorrules`
2. Cursor carica automaticamente `.cursorrules` all'avvio
3. Scrivi messaggio con trigger words o menziona skill esplicitamente

### Test Rapido
```
User: "Dammi una panoramica dell'app"
→ Dovrebbe attivare SKILL_APP_OVERVIEW e fornire overview tecnica completa
```

---

## 📚 DOCUMENTAZIONE COMPLETA

Per vedere il contenuto completo di ogni skill:
- **Claude Code**: Le skills in `.claude/skills/` hanno link a versione completa in `Production/Prompt_Context/`
- **Cursor AI**: Le skills complete sono già in `.cursor/rules/`
- **Riferimento Manuale**: Consulta `Production/Prompt_Context/SKILL_*.md` per dettagli completi

---

## 🔧 TROUBLESHOOTING

### Skill non si attiva automaticamente
**Soluzione**: Usa riferimento esplicito `@SKILL_NAME` o consulta manualmente il file in `.cursor/rules/` o `Production/Prompt_Context/`

### Skill fornisce risposta generica
**Soluzione**: Fornisci più contesto specifico (file path, componente nome, errore esatto)

### Non so quale skill usare
**Soluzione**: Consulta "SKILLS DECISION MATRIX" sopra o chiedi "Quale skill devo usare per [task]?"

---

**🎯 Le skills sono progettate per essere usate naturalmente nella conversazione. Scrivi normalmente e le skills si attiveranno automaticamente quando appropriato!**
