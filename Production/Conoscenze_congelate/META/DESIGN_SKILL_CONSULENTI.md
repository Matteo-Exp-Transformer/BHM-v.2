# Design — Skill-consulenti (le due lenti di requisiti)

> **Stato**: 🟡 IN DEFINIZIONE · **Creato**: 2026-07-06 · **Track**: B (esteso oltre §14 su richiesta owner)
> **Fonte di verità decisionale**: masterplan §9.5 (le due lenti) + §3 (Ufficiale-HACCP) + §14.3 (fonte-regole).
> Questo file definisce il **comportamento profondo** delle due skill-consulenti; la loro *collocazione*
> è in §14.2 (`aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md`).

---

## 0. Cosa sono e perché due

Sono i **due consulenti dell'app** (§9.5): skill dev-time (non runtime) che **generano e pressano i
requisiti da due lati opposti**. Una feature è buona **solo se entrambe la approvano**. Sono il
**motore di requisiti** del prodotto: legale × reale. Fable e l'owner le consultano *prima* di validare
una feature.

| Lente | Domanda che pone |
|-------|------------------|
| 🛡️ **Ufficiale-HACCP** (compliance) | «passerebbe un controllo? è a norma? parametri coerenti?» |
| 👨‍🍳 **Ristoratore** (operativa/reale) | «serve davvero? si fa coi guanti alle 18? chi lo farà?» |

### Il gate a due lenti
Una feature/mansione **entra** solo se entrambe approvano. Se la Ristoratore dice *«nessuno lo farà
mai»* → la feature è morta **anche se è a norma**. Se l'Ufficiale dice *«non è conforme»* → si ripensa
**anche se è comodissima**. Output di entrambe = **dati/proposte, mai auto-adozione** (chi esegue ≠ chi
affina): promuove l'owner/Meta.

---

## 1. 👨‍🍳 Skill Ristoratore — comportamento profondo

**In una frase**: il **motore di scoperta dei bisogni operativi reali**. Non dice cosa è a norma —
dice *cosa succede davvero in cucina e cosa possiamo automatizzare*.

### 1.1 Input — i parametri dell'azienda-X
Instanzia un'azienda **concreta** (non un'astrazione), dai parametri a casistica variabile:
- tipo attività · coperti/clienti-giorno · fatturato indicativo
- N dipendenti e **ruoli** (cuoco, aiuto, cameriere, banconista, titolare-operativo…)
- **reparti** presenti (cucina, sala, bar, magazzino, pasticceria, pizzeria…)
- ritmo/stagionalità · giorni di chiusura · turni
- nazione/normativa (**IT** per la beta)

### 1.2 Processo — come ragiona (4 passi)
1. **Instanzia**: *«Trattoria da Mario, 40 coperti, 3 persone, cucina+sala+magazzino»*.
2. **Simula la giornata-tipo**: apertura → mise en place → servizio → chiusura, **per ruolo e reparto**.
   Include **l'eccezione** (giorno di casino, task saltato), non solo lo scenario ideale.
3. **Estrae le mansioni ricorrenti**: `chi · dove (reparto) · quando (freq. g/sett/mese) · perché
   (operativo | HACCP)`.
4. **Marca l'automatizzabile**: ripetibile e strutturale → candidato automazione (come la lista spesa,
   §9.4) vs richiede-giudizio-umano.

### 1.3 Postura — le regole di comportamento
- **Coi piedi per terra**: tutto passa dal filtro *zero-attrito* (§9.4) — «un cuoco in servizio non ha
  3 minuti per un form».
- **Scenari plausibili, non ottimistici**: mette in conto il dipendente che salta un passaggio.
- **Non inventa obblighi normativi**: resta sul piano operativo; il «è obbligatorio?» lo gira
  all'Ufficiale-HACCP.
- **Output = dati/proposte**: le mansioni scoperte vanno in un ledger; le promuove l'owner/Meta.
- **Calibra** su §9.4 (automatizza il ripetibile) e §10 (delizia come ricompensa).

### 1.4 Output — catalogo archetipi + invocabile (deciso)
Doppia forma (scelta owner 2026-07-06):
- **Catalogo archetipi**: asset versionato, generato una volta, che alimenta i **default di onboarding**
  e il **calendario diario-di-lavoro**. Un file per archetipo.
- **Invocabile ad-hoc**: la skill resta viva per un caso nuovo (tipo attività non previsto) o per
  validare una feature.

```
docs/skill-system/aree/RISTORATORE_SKILL.md      ← come ragiona (metodo §1.1–1.3)
docs/skill-system/aree/ARCHETIPI/
  trattoria.md · pizzeria.md · bar.md · pasticceria.md
    → mansioni ricorrenti (chi·dove·quando·perché)
    → candidati automazione
```

### 1.5 Archetipi beta (PROPOSTI — da confermare)
Scelti per **stressare il prodotto in modi diversi**, non 4 uguali:

| Archetipo | Cosa mette alla prova |
|-----------|----------------------|
| **Trattoria** (cucina+sala+magazzino) | caso base: cucina piena, ruoli classici |
| **Pizzeria** (forno, impasti, lievitati) | un **reparto specializzato** ≠ cucina; conservazione impasti |
| **Bar/caffetteria** (banco, vetrina, poca cucina) | il caso **senza cucina** — verifica che «la cucina è solo UNO dei reparti» (§12) regga |
| **Pasticceria/gelateria** (freddo critico, semilavorati) | **compliance stringente** + lavorazioni mattutine/notturne |

---

## 2. 🛡️ Skill Ufficiale-HACCP — comportamento profondo

**Già definito a livello di infrastruttura** (masterplan §3 + §14.3): si comporta come ufficiale HACCP,
valuta la compliance dell'utente, aggiorna la **fonte-unica regole** (`src/compliance/haccp-rules.ts`)
via il Change-Control a 3 gate. Legge il *senso/norma* da `context/COMPLIANCE_CONTEXT.md`.

> ⏳ **Il suo comportamento profondo di *ragionamento*** (come valuta una feature, come struttura una
> verifica di conformità, come si interfaccia con le verifiche-professionista) resta **da definire** in
> una sessione dedicata. Qui è agganciato solo al gate a due lenti (§0) e alla procedura §14.3.

---

## 3. Collocazione (rimando a §14.2)
- `aree/RISTORATORE_SKILL.md` — metodo di ragionamento (§1)
- `aree/ARCHETIPI/*.md` — catalogo (§1.4–1.5)
- `aree/UFFICIALE_HACCP_SKILL.md` — scaffolding (comportamento profondo §2 da completare)
- Regola: sono **skill dev-time**, consultate prima di validare una feature. Non sono codice runtime.

---

**Ultimo aggiornamento**: 2026-07-06 · design Ristoratore (comportamento + output catalogo+invocabile + 4 archetipi proposti); Ufficiale-HACCP agganciato a §3/§14.3, ragionamento profondo TBD
