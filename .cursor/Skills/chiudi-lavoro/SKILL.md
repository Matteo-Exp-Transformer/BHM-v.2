---
name: chiudi-lavoro
description: Chiude una sessione di lavoro creando report, aggiornando MASTER_INDEX e conoscenze-definizioni nella cartella APP_DEFINITION specificata
---

# Chiudi il Lavoro

## Overview

Skill per chiudere formalmente una sessione di lavoro documentando tutto il lavoro svolto. Crea report strutturati, aggiorna il MASTER_INDEX e sincronizza le conoscenze-definizioni.

**Announce at start:** "Sto usando la skill chiudi-lavoro per documentare la sessione."

## Parametri Richiesti

L'utente deve specificare:
1. **Area APP_DEFINITION**: es. `03_CONSERVATION`, `04_CALENDAR`
2. **Data cartella lavoro**: es. `05-02-2026` (formato DD-MM-YYYY)

**Esempio invocazione:** "Chiudi il lavoro 04_CALENDAR 05-02-2026"

## Il Processo

### Step 1: Identificare i Percorsi

```
Base: Production/Conoscenze_congelate/APP_DEFINITION/

Cartelle target:
- Lavoro: [Area]/Lavoro/[Data]/
- MASTER_INDEX: [Area]/Lavoro/00_MASTER_INDEX_[NOME].md
  oppure: [Area]/conoscenze-definizioni/00_MASTER_INDEX_[NOME].md
- Conoscenze: [Area]/conoscenze-definizioni/
```

### Step 2: Raccogliere Informazioni Sessione

Prima di creare il report, raccogliere:

1. **Git log sessione** - Commit del giorno
2. **File modificati** - `git diff --name-only` per i file cambiati
3. **Contenuto esistente cartella lavoro** - Report già presenti
4. **Todo list** - Se presente, recuperare task completati

**Domande da porre all'utente se non chiare:**
- Quali sono stati gli obiettivi principali della sessione?
- Ci sono problemi aperti o bug non risolti?
- Quali sono i prossimi passi consigliati?

### Step 3: Creare Report Sessione

**File:** `[Area]/Lavoro/[Data]/REPORT_SESSIONE_[DATA].md`

**Struttura Report:**

```markdown
# Report Sessione [DATA]

**Data**: [DD-MM-YYYY]
**Area**: [Nome Area]
**Sessione**: [Breve descrizione]

---

## Obiettivi della Sessione

1. [Obiettivo 1]
2. [Obiettivo 2]

---

## Lavoro Svolto

### [Categoria 1]

| Intervento | Descrizione | Stato |
|------------|-------------|-------|
| **Nome** | Descrizione dettagliata | ✅ COMPLETATO |

### [Categoria 2]

[...]

---

## File Modificati

| File | Tipo Modifica |
|------|---------------|
| `src/path/file.tsx` | Modifica |
| `src/path/new.ts` | Nuovo |

---

## Commit della Sessione

| Hash | Messaggio |
|------|-----------|
| `abc123` | feat: descrizione |

---

## Problemi Aperti

| Problema | Priorità | Note |
|----------|----------|------|
| [Se presenti] | Alta/Media/Bassa | Dettagli |

---

## Prossimi Passi

1. [Raccomandazione 1]
2. [Raccomandazione 2]

---

**Fine Report Sessione [DATA]**
```

### Step 4: Aggiornare MASTER_INDEX

**Localizzare il file:**
- Prima cercare in `[Area]/Lavoro/00_MASTER_INDEX_*.md`
- Se non trovato, cercare in `[Area]/conoscenze-definizioni/00_MASTER_INDEX_*.md`

**Aggiungere nuova sezione** nella parte alta del documento (dopo STATO ATTUALE):

```markdown
### [DATA]: [Titolo Breve Sessione] ✅

**Obiettivo**: [Descrizione sintetica]

**Implementazione**:
- ✅ **Feature 1**: Descrizione
- ✅ **Feature 2**: Descrizione
- ⚠️ **Issue aperta**: Se presente

**File chiave**:
- `src/path/file.tsx` — Descrizione ruolo
- [REPORT_SESSIONE_DATA.md](./[Data]/REPORT_SESSIONE_DATA.md)

---
```

**Aggiornare anche:**
- Data "Aggiornato:" nell'header
- Sezione CRONOLOGIA SESSIONI (se presente)
- Sezione FUNZIONALITÀ IMPLEMENTATE (se nuove feature)
- Sezione STRUTTURA CARTELLE (aggiungere nuova cartella data)

### Step 5: Aggiornare Conoscenze-Definizioni

**Percorso:** `[Area]/conoscenze-definizioni/`

Se il lavoro ha modificato comportamenti o definizioni documentate:

1. **Identificare file da aggiornare** - Es. `FILTERS_AND_PERMISSIONS.md`, `CALENDAR_PAGE.md`
2. **Aggiornare sezioni rilevanti** con le nuove informazioni
3. **Aggiungere note di aggiornamento** con data

### Step 6: Creare/Aggiornare README Cartella Lavoro

**File:** `[Area]/Lavoro/[Data]/README.md`

```markdown
# Sessione [DATA]

## Contenuto Cartella

| File | Descrizione |
|------|-------------|
| README.md | Questo file |
| REPORT_SESSIONE_[DATA].md | Report completo sessione |
| [Altri file] | [Descrizione] |

## Riferimenti

- **MASTER_INDEX**: [Link relativo al master index]
- **Conoscenze**: [Link a conoscenze-definizioni]

## Quick Start

[Istruzioni per agenti che devono continuare il lavoro]
```

### Step 7: Verifica Finale

Verificare che:
- [ ] Report creato in `Lavoro/[Data]/`
- [ ] MASTER_INDEX aggiornato con nuova sezione
- [ ] Data aggiornata nell'header MASTER_INDEX
- [ ] Conoscenze-definizioni aggiornate (se necessario)
- [ ] README cartella lavoro presente

**Report finale:**
```
✅ Sessione chiusa correttamente

Documenti creati/aggiornati:
- [Lista file]

Prossimi passi:
- [Raccomandazioni]
```

## Quick Reference

| Step | Azione | Output |
|------|--------|--------|
| 1 | Identifica percorsi | Path cartelle |
| 2 | Raccogli info | Commit, file, todo |
| 3 | Crea report | REPORT_SESSIONE_[DATA].md |
| 4 | Aggiorna MASTER | Nuova sezione + header |
| 5 | Aggiorna conoscenze | File .md aggiornati |
| 6 | Crea README | README.md cartella |
| 7 | Verifica | Checklist completata |

## Common Mistakes

**Non raccogliere info prima di scrivere**
- **Problema:** Report incompleto o impreciso
- **Fix:** Sempre fare git log e diff prima

**Dimenticare di aggiornare la data nel MASTER_INDEX**
- **Problema:** Documenti sembrano obsoleti
- **Fix:** Aggiornare sempre header "Aggiornato:"

**Non linkare il report nel MASTER_INDEX**
- **Problema:** Difficile trovare i dettagli
- **Fix:** Sempre aggiungere link relativo al report

## Esempi Struttura Cartelle

```
Production/Conoscenze_congelate/APP_DEFINITION/
├── 03_CONSERVATION/
│   ├── Lavoro/
│   │   ├── 00_MASTER_INDEX_CONSERVATION.md
│   │   ├── 04-02-2026/
│   │   │   ├── README.md
│   │   │   └── REPORT_SESSIONE_04-02-2026.md
│   │   └── 05-02-2026/
│   │       ├── README.md
│   │       └── REPORT_SESSIONE_05-02-2026.md
│   └── conoscenze-definizioni/
│       ├── CONSERVATION_POINT_CARD.md
│       └── SCHEDULED_MAINTENANCE_SECTION.md
│
└── 04_CALENDAR/
    ├── Lavoro/
    │   └── 05-02-2026/
    │       ├── README.md
    │       └── REPORT_SESSIONE_05-02-2026.md
    └── conoscenze-definizioni/
        ├── 00_MASTER_INDEX_CALENDAR.md
        ├── FILTERS_AND_PERMISSIONS.md
        └── CALENDAR_PAGE.md
```
