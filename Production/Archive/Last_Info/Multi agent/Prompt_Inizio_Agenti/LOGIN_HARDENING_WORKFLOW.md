# Blindatura Login – Workflow per Agenti (Checklist Orchestrata)

Scopo: partire dalla tua richiesta in chat e portare a una blindatura del login sicura, testata e documentata, lavorando per micro-area e passando i gate.

---

## 0) Agente 0 – Orchestratore

Input: richiesta in chat (testo libero)

Output:
- `Agente_0/{YYYY-MM-DD}/Checklist_v0.md` (mappatura iniziale)
- `Agente_1/{YYYY-MM-DD}/Brief_to_Agente1.md`

Contenuti di `Checklist_v0.md` (bozza):
- File sospetti: `src/features/auth/...`, `supabase/auth/*`, `src/lib/supabaseClient.ts`
- Punti critici: validazioni form, error handling, rate-limit, brute force, session storage, RLS
- Domande all’utente: cosa esattamente vuoi blindare (input, sessione, reset password…)?

---

## 1) Agente 1 – Product Strategy

Obiettivo: definire problema, scope e metriche.

Output:
- `Agente_1/{YYYY-MM-DD}/Checklist_v1.md`
- Metriche (esempi):
  - Tasso errori login falsi positivi ≤1%
  - Tempo medio login ≤2s
  - 0 lockout ingiustificati
- “Fuori scope” esplicito (es. social login se non richiesto)
- `Agente_2/{YYYY-MM-DD}/Brief_to_Agente2.md`

---

## 2) Agente 2 – Systems Blueprint

Obiettivo: definire architettura sicurezza login.

Output:
- `Agente_2/{YYYY-MM-DD}/Checklist_v2.md`
- Decisioni:
  - Rate limiting (edge / middleware)
  - Password policy (min length, entropy)
  - Session storage (httpOnly, secure, sameSite)
  - Error response strategy (no leak info)
  - Audit log tentativi
- Mapping file/endpoint/DB (con percorsi)
- `Agente_3/{YYYY-MM-DD}/Brief_to_Agente3.md`

---

## 3) Agente 3 – Experience & Interface

Obiettivo: UX chiara e sicura.

Output:
- `Agente_3/{YYYY-MM-DD}/Checklist_v3.md`
- UX:
  - Messaggi errore generici (no “utente inesistente”)
  - Inline validation semplice
  - Indicatori stato (loading/disabled)
- “Checklist Planning Consolidata (Login)” = v1+v2+v3 per micro-area “login form + sessione”
- Gate: conferma umana
- Allineamento utente (Obbligatorio prima di passare al coding):
  - ✅ Conferma su scope (form+sessione), messaggi errore, policy UX (loading/disabled)
  - ✅ Esempi concreti: 1 caso “OK” (es. credenziali errate → messaggio generico), 1 caso “NO” (es. leak “utente inesistente”)
  - ✅ Firma utente registrata nell’handoff (Conferma Umana – Allineamento Utente)
- `Agente_4/{YYYY-MM-DD}/Brief_to_Agente4.md`

---

## 4) Agente 4 – Backend

Obiettivo: implementare difese server-side.

Azioni tipiche (derivate dalla Consolidata):
- Implementare rate limiting
- Normalizzare errori (no info leak)
- Forzare session cookie httpOnly/secure/sameSite=strict
- Log tentativi falliti + soglia lock temporaneo
- RLS/Policies verificate per tabelle user/session

Output:
- `Agente_4/{YYYY-MM-DD}/Checklist_v4.md`
- Migrazioni/edge functions aggiornate
- `Agente_5/{YYYY-MM-DD}/Brief_to_Agente5.md`

---

## 5) Agente 5 – Frontend

Obiettivo: implementare difese client-side/UX.

Azioni tipiche:
- Validazione form (schema) + disabilita spam submit
- Stati UI (loading/disabled) + messaggi generici
- Non loggare credenziali in console
- Gestione sicura storage (niente token nel localStorage)

Output:
- `Agente_5/{YYYY-MM-DD}/Checklist_v5.md`
- Componenti aggiornati + servizi API
- `Agente_6/{YYYY-MM-DD}/Brief_to_Agente6.md`

---

## 6) Agente 6 – Testing

Obiettivo: copertura test e2e/unit/integration.

Test minimi:
- E2E: login valido, login con credenziali errate (no leak), blocco rate-limit
- Unit: validazione schema, handler errori
- Integration: flusso sessione, redirect post-login

Output:
- `Agente_6/{YYYY-MM-DD}/Checklist_v6.md`
- Report coverage ≥80%
- `Agente_7/{YYYY-MM-DD}/Brief_to_Agente7.md`

---

## 7) Agente 7 – Security

Obiettivo: audit finale sicurezza.

Controlli:
- OWASP ASVS (autenticazione/sessioni)
- Headers sicurezza
- Secrets management
- Nessuna vulnerabilità High/Critical

Output:
- `Agente_7/{YYYY-MM-DD}/Checklist_v7.md`
- Go/No-Go sicurezza + note per hardening aggiuntivo

---

## Domande Obbligatorie (semplici) per ogni agente
1) È questo il file/funzione da cambiare? (percorso + esempio)
2) Confermi interazioni individuate? (lista breve)
3) Procediamo su questa micro-area per prima? (Sì/No)

---

## Come iniziare (tu)
1) Scrivi in chat la tua richiesta: “Blindare login: voglio X, Y, Z…”
2) L’Agente 0 creerà `Checklist_v0.md` e `Brief_to_Agente1.md`
3) Valida le domande e la micro-area proposta
4) Procediamo sequenzialmente passando i gate


