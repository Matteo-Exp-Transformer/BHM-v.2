---
name: test-generator
description: Generates complete, reliable test code (Vitest + RTL or Playwright) following TEST_ARCHITECT strategy
triggerWords:
  - genera test
  - crea test
  - implementa test
  - scrivi test
  - test code
  - write tests
  - generate tests
  - implement tests
---

# 🎭 SKILL: TEST GENERATOR

> **Specialista generazione test code automatizzato per BHM v.2**

Genera test code completi, affidabili e maintainable seguendo le strategie definite da TEST_ARCHITECT, garantendo coverage target e 100% test success.

## 🎯 PROCESSO

### 1. ANALISI INPUT
- Leggi strategia test da TEST_ARCHITECT
- Verifica componente target e file path
- Identifica test cases (funzionali, validazione, edge cases)
- Analizza mocking strategy

### 2. SCELTA FRAMEWORK
- **Vitest + RTL**: Components, hooks, utilities
- **Playwright**: E2E flows, cross-page navigation

### 3. GENERAZIONE CODE
- Setup test file con mocks
- Crea test fixtures
- Implementa tutti i test cases
- Esegui e verifica 100% pass

## 🎨 OUTPUT FORMAT

```markdown
- 📖 **STRATEGIA RICEVUTA**: [Riepilogo strategia]
- 🎯 **TEST PLAN**: [Framework, numero test]
- ⚡ **IMPLEMENTAZIONE**: [File creati, test implementati]
- 📊 **ESECUZIONE**: [Test run, pass/fail, coverage]
- 📝 **FIX APPLICATI**: [Fix per test falliti]
- ⏭️ **DELIVERABLE**: [File pronti, coverage report]
```

---

**Per il contenuto completo della skill, vedi**: `Production/Prompt_Context/SKILL_TEST_GENERATOR.md`
