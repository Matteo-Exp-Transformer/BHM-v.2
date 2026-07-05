# Mockup UI — direzione visiva BHM v.2

> **Stato**: 🟢 ATTIVO · **Creato**: 2026-07-05
> **Fonte di verità della direzione**: [`../MASTERPLAN_RILANCIO_BHM_v2.md`](../MASTERPLAN_RILANCIO_BHM_v2.md) §13.
> Questi file **mostrano** ciò che il §13 **decide**. Se divergono, vince il masterplan (e allinealo).

## A cosa serve questa cartella (doppio uso)

1. **Fonte unica di verità per costruire la UI** — quando si ricostruisce la UI ad hoc (repo nuova),
   questi mockup HTML self-contained sono il riferimento visivo/interazione approvato dall'owner:
   palette, tipografia, gerarchia, pattern dei 3 gesti-firma, micro-interazioni.
2. **Materiale marketing / demo / video** — sono navigabili in browser, girano ovunque (mobile→desktop),
   light/dark: usabili per promo, screenshot, video presentativi del prodotto.

## Come aprirli

File `.html` self-contained (nessuna dipendenza esterna): doppio click → si aprono nel browser.
Interattivi. Toggle light/dark disponibile dove il visore lo espone.

## Indice mockup

| # | Schermata | File | Gesti-firma dimostrati | Artifact online |
|---|-----------|------|------------------------|-----------------|
| 1 | **Oggi** (dipendente) | [`01_OGGI_dipendente.html`](./01_OGGI_dipendente.html) | 🌡️ temperatura che atterra · 🔖 timbro fine turno · spunta ottimistica | https://claude.ai/code/artifact/13f022b8-34d5-41a5-bee1-5af908e17a5d |
| 2 | **Reparto** (Cucina — mappa punti + temperatura dallo spazio) | [`02_REPARTO_cucina.html`](./02_REPARTO_cucina.html) | 🗺️ schematico punti · 🌡️ registra dal punto · 💧 assaggio cascata | https://claude.ai/code/artifact/7ab16ce0-b5ee-4366-8028-82c7d58dd521 |
| 3 | **Form a cascata** che si scioglie ✅ | [`03_FORM_CASCATA.html`](./03_FORM_CASCATA.html) | 💧 opzioni che svaniscono (ritmo lento) · sussurro HACCP · parametri pre-compilati | https://claude.ai/code/artifact/eb037d91-3315-49eb-9285-0a36c514488b |
| 4 | **Regia** — vista titolare su tablet (respiro + "Genera dossier") | [`04_REGIA_titolare.html`](./04_REGIA_titolare.html) | 🫧 respiro azienda · 📦 dossier che si assembla · side-rail (unfold desktop) | https://claude.ai/code/artifact/a9dd38c4-11e3-4715-b579-71570c3ad9f3 |

## Note di interazione (feedback owner — regole per il build reale)

- **Form a cascata (💧) — ritmo obbligato**: la sequenza è *selezione → **mostro le possibilità** (tempo per vederle) → **scioglimento lento** delle incompatibili → **scelta corretta evidenziata***. L'animazione NON deve essere veloce: se è troppo rapida si perde il senso didattico (l'owner "non ha visto bene l'animazione" nella v1). Tempi attuali nel mockup 3: ~1,1s di lettura, sussurro, poi melt scaglionati ~240ms, poi pulse sul "consigliato". Da preservare in produzione (con `prefers-reduced-motion` che salta le pause).
- **Scroll / rivelazione dei passi — da migliorare (feedback owner)**: lo **scorrimento automatico** quando si rivela un nuovo passo non è super fluido; l'auto-scroll dello schermo risulta **troppo caotico**. In produzione: rivelazione dei passi **più lenta e in dissolvenza** (fade-in morbido) e **niente salto di scroll brusco** — il nuovo passo emerge dolcemente sotto, senza spostare lo schermo di colpo. Vale per la cascata (mockup 3) e ovunque un contenuto si riveli progressivamente. _(annotato, non ancora implementato)_

## Direzione bloccata (sintesi §13)

- **Temperamento**: clinico-caldo — ground greige caldo, card bianche crisp, inchiostro caldo.
- **Accento**: terracotta `#C0552E`, solo sulle azioni. Verdetti semantici separati: verde/oro/rosso.
- **Type**: sans, niente serif (evita il cliché AI); cifre tabellari protagoniste.
- **Interazione**: UI ottimistica, delizia nel feedback, voce umana da cucina, icone disegnate (no emoji in UI).
- **Device**: responsive-everywhere; mobile perfetto, desktop/tablet come banco sempre-acceso.

---

**Ultimo aggiornamento**: 2026-07-05 · **tutti e 4 i mockup approvati** (Oggi · Reparto · Form cascata · Regia). Serie base completa.
