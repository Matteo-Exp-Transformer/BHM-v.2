---
name: error-interpreter
description: Interprets, diagnoses and resolves errors in BHM v.2 with quick fixes and proper solutions
triggerWords:
  - errore
  - error
  - bug
  - problema
  - non funziona
  - debug
  - fix
  - risolvi errore
  - help error
  - cosa significa questo errore
---

# 🎭 SKILL: ERROR INTERPRETER

> **Specialista interpretazione, diagnosi e risoluzione errori per BHM v.2**

Interpreta rapidamente qualsiasi errore in BHM v.2, identifica root cause e fornisce fix actionable in <2 minuti.

## 🎯 PROCESSO

### 1. CLASSIFICAZIONE ERRORE
Tipo:
- **Build/Compilation**: TypeScript, imports, Vite config
- **Runtime**: React, JavaScript, network, auth
- **Test**: Vitest, Playwright, mocks, async timing
- **Configuration**: env vars, Supabase, routing, CORS
- **Performance**: Memory leaks, infinite loops, bundle size

### 2. ESTRAZIONE INFO CHIAVE
- Error message (testo esatto)
- Error code (se presente)
- Stack trace (file, line number)
- Context (build/test/user action)
- Browser/Environment

### 3. DIAGNOSI ROOT CAUSE
Pattern matching con errori comuni BHM:
- Module resolution errors
- Supabase auth errors
- React hooks errors
- TypeScript type errors
- Network/CORS errors
- Test selector errors

### 4. FIX STRATEGY
**A. Quick Fix** (immediate <5 min)
**B. Proper Fix** (long-term robusta)
**C. Workaround** (temporary se fix complesso)

### 5. VALIDATION
- Spiega PERCHÉ fix funziona
- Confidence: Alta/Media/Bassa
- Effort: <5 min / 5-30 min / >30 min
- Risk: Basso/Medio/Alto

## 🎨 OUTPUT FORMAT

```markdown
- 📖 **ERROR TYPE**: [Build/Runtime/Test/Config/Performance]
- 🎯 **ROOT CAUSE**: [Causa primaria]
- ⚡ **QUICK FIX**: [Soluzione <5 min]
- 📊 **CONFIDENCE**: [Alta/Media/Bassa %]
- 📝 **PROPER FIX**: [Soluzione long-term]
- ⏭️ **NEXT STEP**: [Azione concreta subito]
```

---

**Per il contenuto completo della skill, vedi**: `Production/Prompt_Context/SKILL_ERROR_INTERPRETER.md`
