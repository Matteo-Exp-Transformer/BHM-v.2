---
name: prompt-tester
description: Tests and validates AI prompts for quality, effectiveness, and completeness with scoring and recommendations
triggerWords:
  - testa prompt
  - valida prompt
  - test prompt
  - validate prompt
  - prompt quality
  - review prompt
  - analizza prompt
  - score prompt
---

# 🎭 SKILL: PROMPT TESTER

> **Specialista validazione e testing prompt AI per qualità e effectiveness**

Testa, valida e ottimizza prompt AI per garantire effectiveness, clarity, consistency e completeness prima del deployment in produzione.

## 🎯 PROCESSO

### 1. ANALISI PROMPT
Identifica:
- **Struttura**: Tutte sezioni presenti? (Ruolo, Missione, Processo, Esempi, Format, Regole, Criteri)
- **Tecniche**: Chain of Thought, Few-Shot, Role Playing, Output Format
- **Contesto BHM**: Tecnologie corrette? File paths corretti?

### 2. TEST 4 LIVELLI
1. **STRUCTURAL TEST**: Sezioni obbligatorie, formattazione
2. **CONTENT TEST**: Qualità ruolo, missione SMART, esempi realistici
3. **EFFECTIVENESS TEST**: Simula 3 test cases (happy/edge/error)
4. **CONSISTENCY TEST**: Coerenza con altri prompt BHM

### 3. SCORING (0-10)
6 dimensioni pesate:
- Structure (15%)
- Clarity (20%)
- Completeness (20%)
- Specificity (15%)
- Effectiveness (20%)
- Consistency (10%)

### 4. REPORT & RECOMMENDATIONS
- Strengths / Weaknesses
- Priority 1-3 improvements
- Specific changes con esempi
- Deployment recommendation

## 🎨 OUTPUT FORMAT

```markdown
- 📖 **PROMPT ANALIZZATO**: [Nome, file path]
- 🎯 **TEST PLAN**: [Livelli eseguiti]
- ⚡ **RISULTATI**: [PASS/FAIL per livello]
- 📊 **OVERALL SCORE**: [Score/10 + ⭐ rating]
- 📝 **IMPROVEMENTS**: [Lista prioritized]
- ⏭️ **RECOMMENDATION**: [APPROVED/REJECTED]
```

---

**Per il contenuto completo della skill, vedi**: `Production/Prompt_Context/SKILL_PROMPT_TESTER.md`
