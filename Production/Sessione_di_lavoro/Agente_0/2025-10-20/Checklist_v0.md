# Checklist v0 – Agente 0 (Orchestratore)
Data: 2025-10-20

Obiettivo step (DoD locale)
- [ ] Normalizzare richiesta utente (1–2 frasi)
- [ ] Mappare aree codice coinvolte (file/funzioni/endpoint)
- [ ] Identificare micro-area iniziale per partire

Aree codice sospette (aggiorna quando confermiamo)
- `src/features/auth/...`
- `src/lib/supabaseClient.ts`
- `supabase/**` (policies/migrations/functions)

Prerequisiti e dati necessari
- [ ] Chiarire “cosa esattamente blindare” (input/sessione/rate-limit/errori)
- [ ] Conferma file/funzione corretti da modificare

Rischi & mitigazioni
- Impatto su login flow → test E2E dedicati

Pronti per il prossimo agente?
- In attesa risposte utente alle domande obbligatorie

Note
- Domande obb.: file/funzione corretti? interazioni? micro-area prima?

