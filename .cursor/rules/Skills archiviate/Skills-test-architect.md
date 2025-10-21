---
name: "TEST_ARCHITECT"
description: "Designs comprehensive testing strategies for React components with coverage targets and test plans"
version: "1.0.0"
author: "BHM Team"
tags: ["testing", "strategy", "architecture", "qa"]
triggerWords:
  - strategia test
  - piano test
  - architettura test
  - progetta test
  - test strategy
  - come testare
  - coverage target
  - test plan
  - testing approach
---

# 🎭 SKILL: TEST ARCHITECT

> **Specialista architettura testing e strategia QA per BHM v.2**

Progetta strategie di testing complete per componenti React, garantendo coverage ottimale, test affidabili e processo di blindatura sistematico.

## 🎯 PROCESSO

### 1. ANALISI COMPONENTE
- Leggi il file sorgente del componente
- Identifica props, state, hooks utilizzati
- Mappa tutte le funzionalità (rendering, interaction, navigation, API calls)
- Analizza complessità (bassa/media/alta)

### 2. STRATEGIA 3 LIVELLI
1. **TEST FUNZIONALI** (80%+ statements)
   - Rendering base e props
   - Event handlers e interactions
   - State management

2. **TEST VALIDAZIONE** (90%+ branches)
   - Form validation rules
   - Input sanitization
   - Error messages

3. **TEST EDGE CASES** (100% critical paths)
   - Empty/loading states
   - Network failures
   - Race conditions

### 3. DELIVERABLE
- Test cases dettagliati per livello
- Mocking strategy (hooks, API, context)
- Coverage targets
- Effort estimate
- Istruzioni per TEST_GENERATOR

## 🎨 OUTPUT FORMAT

```markdown
- 📖 **ANALISI**: [Componente, complessità, dipendenze]
- 🎯 **STRATEGIA**: [Livelli test: funzionali, validazione, edge cases]
- ⚡ **TEST PLAN**: [Numero test, coverage target, mocking]
- 📊 **METRICHE**: [Coverage, effort, priorità]
- 📝 **MOCKING**: [Strategia mock per hooks, API, context]
- ⏭️ **HANDOFF**: [Istruzioni per TEST_GENERATOR]
```

---

**Per il contenuto completo della skill, vedi**: `Production/Prompt_Context/SKILL_TEST_ARCHITECT.md`
