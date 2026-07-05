# Decisioni owner — intervista post-mappatura (scope beta)
**Data:** 2026-07-06 · **Contesto:** intervista al termine delle 5 mappe d'area · **Alimenta:** masterplan §8, port logica §6.6, UI §6.5

> Queste 10 decisioni **risolvono** le domande "❓ dipende da owner" accumulate nelle 5 mappe.
> Dove una decisione aggiunge feature/scope nuovo → segnalato **[NUOVO SCOPE]** per masterplan §8/§11.

---

## Le 10 decisioni

| # | Tema | Decisione | Impatto sulle mappe |
|---|------|-----------|---------------------|
| 1 | **Immutabilità audit-grade** | **Immutabile da subito**: letture temperatura e completamenti **append-only**; annullare = **riga di storno tracciata**, mai DELETE fisico | Reparti (§4 letture) · Oggi (`uncompleteTask` DELETE → storno) · Fondamenta (policy no-UPDATE/DELETE) |
| 2 | **Dashboard** | **Dashboard ricca con dati reali**: collega `DashboardPage`, elimina i dati fabbricati (`turnover_rate:85`, split 60/30/10) | Regia (③ controllo) |
| 3 | **Liste spesa** | **In beta**: deploy 4 RPC shopping (migration 007) + unifica il dual-stack legacy/RPC | Scorte · Fondamenta (RPC target) |
| 4 | **Dati azienda** | **Solo P.IVA + ragione sociale**; **rimuovere** numero licenza e campi non necessari (telefono/tipo/data da valutare come opzionali) | Regia (companies) · Fondamenta (schema companies) |
| 5 | **Notifiche** | **Solo alert in-app, nessun pannello preferenze**: **non** creare `notification_preferences`; rimuovere la sezione Settings | Regia (Settings) · Fondamenta (tabella tagliata) |
| 6 | **HACCP Settings UI** | **Niente editing libero**: le soglie vivono in `src/compliance/haccp-rules.ts` (Track B); la UI al massimo le **mostra in sola lettura** | Regia (Settings HACCP) · coerente con [[rilancio-bhm-skill-system]] |
| 7 | **Timbro fine turno** | **[NUOVO SCOPE]** feature **dedicata in beta**: vero timbro presenza/chiusura turno → schema + UI **da progettare** (Track A) | Oggi (§4/§6) · masterplan §8/§11 |
| 8 | **Lettura temperatura** | **Temperatura + metodo obbligatori**; **note e foto entrambe opzionali** | Reparti (§4 temperature_readings, §6) |
| 9 | **Multi-utente** | **Tutti e 3 i ruoli** (titolare/responsabile/dipendente) + inviti staff attivi in beta | Regia (ruoli/RLS) · trasversale |
| 10 | **Ciclo scadenze** | **Completo**: scadenza + `expired_at` + reinserimento (`previous_product_id`, `reinsertion_count`, `archived_at`, status `archived`) + storico | Scorte (§4 products) · Fondamenta (schema products) |

---

## Conseguenze schema (delta target aggiornato)

Migration/DDL che le decisioni **confermano necessari** (ordine indicativo):

1. **Immutabilità** (dec. 1): policy/trigger append-only su `temperature_readings`, `task_completions`, `maintenance_completions`; `uncompleteTask`/annulli riscritti come storno.
2. **Migration 015** (già P0): `method`, `notes`, `photo_evidence`, `recorded_by` su `temperature_readings` — con `method` obbligatorio, `notes`/`photo_evidence` opzionali (dec. 8).
3. **RPC shopping ×4** + RLS (dec. 3, migration 007).
4. **companies**: aggiungi `vat_number` (+ ragione sociale se distinta da `name`); **rimuovi** `license_number` dalla UI (dec. 4).
5. **products**: aggiungi `expired_at`, `previous_product_id`, `reinsertion_count`, `archived_at`; estendi CHECK status con `archived` (dec. 10).
6. **notification_preferences**: **NON** creare; rimuovere la sezione Settings (dec. 5).
7. **haccp_configurations**: la UI diventa sola-lettura; nessun payload flat di scrittura (dec. 6).
8. **timbro fine turno**: schema nuovo da progettare (dec. 7) — **non** ancora definito.
9. **onboarding_completed** su `companies` (da mappa Regia, indipendente dall'intervista ma coerente): stato completamento server-side.
10. **companies.onboarding** + ruoli: RLS per 3 ruoli già in gran parte live; verificare `responsabile` (dec. 9).

---

## Decisioni minori assunte come default (recommended) — correggere se sbagliato

Non chieste in intervista; assunte per non bloccare, allineate ai vincoli del rilancio:

- **Creazione punto+manutenzioni** → **RPC transazionale** (non rollback client-side): coerente con audit-grade dec. 1. *(Reparti §4)*
- **`/sign-up` pubblica** → **chiudere** (design solo-invito, dec. 9 multi-utente via invito). *(Regia)*
- **Staff CRUD UI** → **collegare** `StaffManagement`↔`useStaff` (non è un bivio, è un fix; DB/RLS pronti). *(Regia)*
- **Ruoli**: fonte unica **`company_members.role`**; `UserManagement` smette di scrivere `user_profiles.role`. *(Regia, dec. 9)*
- **Metadati `[END_DATE:]`** in `description` → **colonna** vera. *(Oggi §4)*
- **Dead code** B.9/B.10 + modal/hook duplicati → **rimuovere** (elenco nelle mappe). *(Fondamenta, tutte)*

---

## Per il masterplan §8
- Le domande "Mappatura area-per-area" e le "due lenti" delle 5 mappe hanno ora **risposte owner** su 10 bivi → §8 spuntabile.
- **[NUOVO SCOPE] Timbro fine turno** (dec. 7): aprire voce dedicata (design comportamento + schema) — non era nel codice legacy.
- Restano da progettare: schema timbro; forma esatta `vat_number`/ragione sociale; profondità storico riordini.
