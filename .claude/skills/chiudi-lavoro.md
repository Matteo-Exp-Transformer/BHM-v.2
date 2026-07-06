---
name: chiudi-lavoro
description: Chiude una sessione di lavoro creando report, aggiornando MASTER_INDEX e conoscenze-definizioni nella cartella APP_DEFINITION specificata
triggerWords:
  - chiudi il lavoro
  - chiudi lavoro
  - close work session
  - end work session
  - finalizza sessione
  - documenta sessione
---

# Chiudi il Lavoro

> **Skill per documentare e chiudere formalmente una sessione di lavoro in BHM v.2**

Quando l'utente dice "Chiudi il lavoro [AREA] [DATA]", questa skill guida la creazione di documentazione strutturata per preservare la conoscenza del lavoro svolto.

## Parametri

L'utente deve fornire:
- **Area**: Cartella in APP_DEFINITION (es. `03_CONSERVATION`, `04_CALENDAR`)
- **Data**: Formato DD-MM-YYYY (es. `05-02-2026`)

**Esempio:** "Chiudi il lavoro 04_CALENDAR 05-02-2026"

## Processo

### 1. Annuncio e Validazione

```
Sto usando la skill chiudi-lavoro per documentare la sessione [AREA] del [DATA].
```

Verificare che esistano:
- `Production/Conoscenze_congelate/APP_DEFINITION/[AREA]/`
- Cartella lavoro: `[AREA]/Lavoro/[DATA]/` (crearla se non esiste)

### 2. Raccolta Informazioni

**Eseguire:**
```bash
# Commit del giorno
git log --oneline --since="[DATA]" --until="[DATA+1]"

# File modificati
git diff --name-only HEAD~10
```

**Chiedere all'utente (se non chiaro dal contesto):**
- Obiettivi principali della sessione?
- Problemi aperti o bug non risolti?
- Prossimi passi consigliati?

### 3. Creare Report Sessione

**Percorso:** `[AREA]/Lavoro/[DATA]/REPORT_SESSIONE_[DATA].md`

**Template:**

```markdown
# Report Sessione [DATA]

**Data**: [DD-MM-YYYY]
**Area**: [Nome Area]
**Sessione**: [Breve descrizione lavoro]

---

## Obiettivi della Sessione

1. [Obiettivo 1]
2. [Obiettivo 2]

---

## Lavoro Svolto

### [Categoria]

| Intervento | Descrizione | Stato |
|------------|-------------|-------|
| **Nome** | Descrizione | ✅ COMPLETATO |

---

## File Modificati

| File | Tipo |
|------|------|
| `src/path/file.tsx` | Modifica |

---

## Commit della Sessione

| Hash | Messaggio |
|------|-----------|
| `abc123` | feat: descrizione |

---

## Problemi Aperti

[Lista se presenti, altrimenti "Nessuno"]

---

## Prossimi Passi

1. [Raccomandazione]

---

**Fine Report**
```

### 4. Aggiornare MASTER_INDEX

**Localizzare:**
- `[AREA]/Lavoro/00_MASTER_INDEX_*.md` oppure
- `[AREA]/conoscenze-definizioni/00_MASTER_INDEX_*.md`

**Aggiungere sezione (dopo STATO ATTUALE):**

```markdown
### [DATA]: [Titolo Sessione] ✅

**Obiettivo**: [Descrizione]

**Implementazione**:
- ✅ **Feature**: Descrizione

**File chiave**:
- [REPORT_SESSIONE_DATA.md](./[Data]/REPORT_SESSIONE_DATA.md)

---
```

**Aggiornare:**
- Header "Aggiornato: [DATA]"
- CRONOLOGIA SESSIONI
- STRUTTURA CARTELLE

### 5. Aggiornare Conoscenze-Definizioni

**Percorso:** `[AREA]/conoscenze-definizioni/`

Se il lavoro ha modificato comportamenti documentati:
1. Identificare file da aggiornare
2. Aggiornare sezioni rilevanti
3. Aggiungere note con data

### 6. README Cartella Lavoro

**File:** `[AREA]/Lavoro/[DATA]/README.md`

```markdown
# Sessione [DATA]

## Contenuto

| File | Descrizione |
|------|-------------|
| REPORT_SESSIONE_[DATA].md | Report completo |

## Riferimenti

- [MASTER_INDEX](../00_MASTER_INDEX_*.md)
```

### 7. Conferma Finale

```
✅ Sessione [AREA] [DATA] chiusa

Documenti creati/aggiornati:
- Lavoro/[DATA]/REPORT_SESSIONE_[DATA].md
- Lavoro/[DATA]/README.md
- MASTER_INDEX aggiornato
- [Conoscenze aggiornate se applicabile]

Prossimi passi:
- [Raccomandazioni]
```

## Struttura Cartelle

```
Production/Conoscenze_congelate/APP_DEFINITION/
├── 03_CONSERVATION/
│   ├── Lavoro/
│   │   ├── 00_MASTER_INDEX_CONSERVATION.md
│   │   └── [DATA]/
│   │       ├── README.md
│   │       └── REPORT_SESSIONE_[DATA].md
│   └── conoscenze-definizioni/
│
└── 04_CALENDAR/
    ├── Lavoro/
    │   └── [DATA]/
    └── conoscenze-definizioni/
        └── 00_MASTER_INDEX_CALENDAR.md
```

## Note

- Sempre raccogliere info (git log/diff) PRIMA di scrivere
- Sempre linkare il report nel MASTER_INDEX
- Sempre aggiornare la data nell'header MASTER_INDEX
- Se ci sono problemi aperti, documentarli chiaramente
