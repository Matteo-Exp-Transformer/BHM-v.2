# ARCHIVIO - Vecchio Sistema 5 Agenti (OBSOLETO)

> **Status**: OBSOLETO - Non usare più
> **Data archiviazione**: 2025-10-20
> **Sostituito da**: Sistema 7 Agenti in `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/`

---

## CONTENUTO ARCHIVIO

Questo archivio contiene i **prompt del vecchio sistema a 5 agenti** focalizzato su blindatura e testing.

### File Archiviati

1. **AGENTE_1_UI_BASE.md** - Agente UI componenti base (Porta 3000)
2. **AGENTE_2_FORMS_AUTH.md** - Agente Form e autenticazione (Porta 3001)
3. **AGENTE_3_BUSINESS_LOGIC.md** - Agente Logiche business (Porta 3002)
4. **AGENTE_4_CALENDARIO.md** - Agente Calendario (Porta 3003)
5. **AGENTE_5_NAVIGAZIONE.md** - Agente Navigazione (Porta 3004)
6. **AGENTE_DEBUG.md** - Agente Debug (supporto)
7. **AGENTE_REVIEW.md** - Agente Review (supporto)
8. **AGENT_STATUS.md** - File coordinamento multi-agent
9. **GUIDA_TESTING_MULTI_AGENT.md** - Guida sistema vecchio

---

## PERCHÉ ARCHIVIATO?

### Limitazioni Sistema Vecchio
- ❌ Focus solo su testing/blindatura (reattivo)
- ❌ Mancanza di fase planning (PRD, architecture, UX)
- ❌ Nessun agente dedicato a security
- ❌ Prompt troppo operativi (non strategici)

### Nuovo Sistema (7 Agenti)
- ✅ Metodologia 90% Planning / 10% Coding
- ✅ 3 agenti planning (Product, Systems, UX)
- ✅ 4 agenti coding (Backend, Frontend, Testing, Security)
- ✅ Handoff formali con quality gates
- ✅ Documentazione completa (ADR, API spec, PRD)

---

## DOVE TROVARE IL NUOVO SISTEMA?

📂 **Path**: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/`

**File principali**:
- `README.md` - Quick start
- `00_PANORAMICA_SISTEMA_7_AGENTI.md` - Overview completo
- `PROMPT_AGENT_1_PRODUCT_STRATEGY.md` - Inizia da qui
- `PROMPT_ALL_AGENTS_2_TO_7.md` - Prompt agenti 2-7

---

## POSSO ANCORA USARE I FILE VECCHI?

**NO, sconsigliato**. Il sistema vecchio è superato.

**Se hai bisogno di riferimenti**:
- Usa il nuovo sistema per feature nuove
- Consulta `MIGRATION_PLAN.md` per mappatura ruoli vecchi → nuovi
- I file vecchi sono qui SOLO per storico

---

## MIGRAZIONE COMPLETATA?

Segui il piano: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/MIGRATION_PLAN.md`

**3 fasi**:
1. Allineamento (1 settimana)
2. Re-prompting (2 settimane)
3. Stabilizzazione (3-4 settimane)

---

**Fine Archivio - Non usare più questi prompt**
