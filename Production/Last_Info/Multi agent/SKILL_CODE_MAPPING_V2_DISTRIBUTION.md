# 🗺️ SKILL CODE_MAPPING v2.0 - Guida Rapida Agenti

> **Versione**: 2.0
> **Data**: 2025-10-23
> **Target**: Tutti gli agenti (1-9)

---

## 🎯 COSA FA

Mappa sistematicamente aree dell'app basandosi **SOLO su codice reale**:
1. Scansiona file con Glob
2. Legge OGNI file con Read
3. Documenta componenti, dipendenze, complessità
4. Identifica gap testing e priorità P0-P3
5. Crea report in `Production/Knowledge/[AREA]/Reports/`
6. Aggiorna statistiche globali + changelog
7. Commit git

---

## 🔑 TRIGGER WORDS

`knowledge base` • `mappa` • `scansiona` • `ricerca approfondita` • `inventario` • `documenta componenti` • `analizza area`

---

## ⚠️ REGOLA CRITICA

**SEMPRE leggere codice con Read tool - MAI assumere strutture**

✅ Read ogni file → Documenta
❌ Assumere da nome file → NON documentare

---

## 📋 PROCESSO 7 STEP

1. **Identifica area** (Glob per trovare file)
2. **Scansiona file** (Read OGNI file)
3. **Analizza** (props, dipendenze, complessità)
4. **Verifica test** (Glob per test esistenti)
5. **Prioritizza** (P0-P3 basato su criticità)
6. **Crea report** (Production/Knowledge/[AREA]/Reports/)
7. **Aggiorna tracking** (Stats + Changelog + Commit)

---

## 🎯 ESEMPIO

**Input**: "Mappa area Autenticazione"

**Agent fa**:
```bash
1. Glob: src/features/auth/**/*.tsx → 6 file
2. Read: LoginPage.tsx, RegisterPage.tsx, ... (tutti)
3. Analizza: props, hooks, services, complessità
4. Glob: Production/Test/Autenticazione/**/*.spec.js → 2 test
5. Prioritizza: LoginPage=P0, RegisterPage=P0, ...
6. Crea: Production/Knowledge/AUTENTICAZIONE/Reports/AUTENTICAZIONE_COMPONENTI.md
7. Aggiorna: STATISTICHE_GLOBALI.md + CHANGELOG_MAPPATURA.md
8. Commit: "docs: Mappatura Autenticazione - 6 componenti, 4 gap"
```

**Output**:
```
✅ 6 componenti mappati
✅ 4 gap testing
✅ 2 componenti P0
✅ Report: Production/Knowledge/AUTENTICAZIONE/Reports/AUTENTICAZIONE_COMPONENTI.md
```

---

## ✅ CHECKLIST

Prima di completare:
- [ ] Tutti i file letti con Read
- [ ] Zero assunzioni
- [ ] Ogni componente documentato
- [ ] Priorità P0-P3 assegnate
- [ ] STATISTICHE_GLOBALI.md aggiornato
- [ ] CHANGELOG_MAPPATURA.md aggiornato
- [ ] Commit git creato

---

## 📚 RIFERIMENTI

- **Skill completa**: `skills/code-mapping.md`
- **README skills**: `skills/README.md`
- **Template report**: `Production/Knowledge/TEMPLATES/`

---

## 🚫 ERRORI COMUNI

❌ Assumere componenti senza leggere codice
❌ Saltare file "semplici"
❌ Copiare vecchia documentazione
❌ Dimenticare di aggiornare statistiche
❌ Dimenticare commit git

✅ Leggere TUTTO il codice
✅ Analizzare ogni file
✅ Basarsi solo su dati reali
✅ Aggiornare tracking globale
✅ Committare sempre

---

## 🔗 WORKFLOW

```
CODE_MAPPING → TEST_ARCHITECT → TEST_GENERATOR
    ↓               ↓                ↓
 Inventario     Strategia         Test Code
```

---

**La mappatura è seria. Usa SOLO dati reali. Aggiorna ad ogni modifica.**
