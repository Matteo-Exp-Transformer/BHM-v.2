# HANDOFF TEMPLATES - VERSIONE SNELLITA

## TEMPLATE HANDOFF GENERICO

```markdown
# HANDOFF_TO_AGENTE_{N}.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
[Link agli handoff esistenti con task dettagliati]

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `[FILE_SPECIFICI]` (file necessari per il lavoro)

---

## TRACKING LAVORO (da aggiornare durante sviluppo)

### 🐛 Problemi Identificati
- [Data] - [Descrizione problema] - [Status: Risolto/In corso/Bloccante]

### ❓ Dubbi/Questioni
- [Data] - [Descrizione dubbio] - [Status: Risolto/In attesa risposta]

### 📝 Note Agente
- [Data] - [Note libere sul lavoro svolto]
- [Data] - [Decisioni prese e perché]
- [Data] - [Idee per miglioramenti futuri]

### ✅ Completamento
- [Data] - [Task completato] - [Note]
- [Data] - [Handoff ad agente successivo pronto]
```

## TEMPLATE SPECIFICI PER AGENTE

### HANDOFF_TO_AGENTE_4.md (Backend)
```markdown
# HANDOFF_TO_AGENTE_4.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
- Implementa Edge Functions per [Feature]
- Crea migrazioni SQL + RLS policies
- Test unit/integration ≥80% coverage

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `API_[FEATURE].yaml` (API spec)
- `DB_SCHEMA_[FEATURE].sql` (schema DB)

---

## TRACKING LAVORO

### 🐛 Problemi Identificati
- [Data] - [Descrizione problema] - [Status: Risolto/In corso/Bloccante]

### ❓ Dubbi/Questioni
- [Data] - [Descrizione dubbio] - [Status: Risolto/In attesa risposta]

### 📝 Note Agente
- [Data] - [Note libere sul lavoro svolto]
- [Data] - [Decisioni prese e perché]
- [Data] - [Idee per miglioramenti futuri]

### ✅ Completamento
- [Data] - [Task completato] - [Note]
- [Data] - [Handoff ad agente successivo pronto]
```

### HANDOFF_TO_AGENTE_5.md (Frontend)
```markdown
# HANDOFF_TO_AGENTE_5.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
- Implementa componenti React per [Feature]
- Integra con API da `API_[FEATURE].yaml`
- Usa design tokens da Agente 3

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `API_[FEATURE].yaml` (API spec)
- `DESIGN_TOKENS_[FEATURE].md` (design system)

---

## TRACKING LAVORO

### 🐛 Problemi Identificati
- [Data] - [Descrizione problema] - [Status: Risolto/In corso/Bloccante]

### ❓ Dubbi/Questioni
- [Data] - [Descrizione dubbio] - [Status: Risolto/In attesa risposta]

### 📝 Note Agente
- [Data] - [Note libere sul lavoro svolto]
- [Data] - [Decisioni prese e perché]
- [Data] - [Idee per miglioramenti futuri]

### ✅ Completamento
- [Data] - [Task completato] - [Note]
- [Data] - [Handoff ad agente successivo pronto]
```

### HANDOFF_TO_AGENTE_6.md (Testing)
```markdown
# HANDOFF_TO_AGENTE_6.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
- Crea test E2E per [Feature]
- Test unit/integration per componenti
- Coverage report ≥80%

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `USER_STORIES_[FEATURE].md` (user stories)
- `API_[FEATURE].yaml` (API spec)

---

## TRACKING LAVORO

### 🐛 Problemi Identificati
- [Data] - [Descrizione problema] - [Status: Risolto/In corso/Bloccante]

### ❓ Dubbi/Questioni
- [Data] - [Descrizione dubbio] - [Status: Risolto/In attesa risposta]

### 📝 Note Agente
- [Data] - [Note libere sul lavoro svolto]
- [Data] - [Decisioni prese e perché]
- [Data] - [Idee per miglioramenti futuri]

### ✅ Completamento
- [Data] - [Task completato] - [Note]
- [Data] - [Handoff ad agente successivo pronto]
```

---

## ESEMPIO CONCRETO

```markdown
# HANDOFF_TO_AGENTE_5.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
- Implementa componenti React per [Feature]
- Integra con API da `API_[FEATURE].yaml`
- Usa design tokens da Agente 3

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `API_[FEATURE].yaml` (API spec)
- `DESIGN_TOKENS_[FEATURE].md` (design system)

---

## TRACKING LAVORO

### 🐛 Problemi Identificati
- [2025-01-27] - API endpoint /feature/list non funziona - Status: Risolto (fix in commit abc123)
- [2025-01-27] - Componente Button non rispetta design tokens - Status: In corso

### ❓ Dubbi/Questioni
- [2025-01-27] - Come gestire loading state per liste lunghe? - Status: Risolto (usare virtualizzazione)
- [2025-01-27] - Validazione form lato client o server? - Status: In attesa risposta Agente 4

### 📝 Note Agente
- [2025-01-27] - Implementato componente principale, performance buona
- [2025-01-27] - Deciso di usare React Query per caching, funziona bene
- [2025-01-27] - Idea: aggiungere skeleton loading per UX migliore

### ✅ Completamento
- [2025-01-27] - Componenti React implementati - Tutti i test passano
- [2025-01-27] - Handoff ad Agente 6 pronto - Test E2E da implementare
```

---

## ISTRUZIONI PER AGENTI

### Agenti Planning (0, 1, 2, 3)
- **Crea handoff** usando template appropriato
- **Includi solo** sezione TRACKING LAVORO
- **Non duplicare** informazioni già presenti in altri file

### Agenti Sviluppo (4, 5, 6)
- **Aggiorna tracking** durante il lavoro
- **Annota problemi** in tempo reale
- **Comunica status** agli agenti planning

### Agente 0 (Orchestratore)
- **Verifica tracking** completato prima di handoff
- **Monitora problemi** per interventi tempestivi