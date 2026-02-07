# CSRF "Failed to fetch" su Vercel – verifica per esclusione

## Modifiche già applicate (esclusione cause)

1. **Ipotesi A – URL malformato**  
   In `useCsrfToken.ts` e `authClient.ts` l’URL Supabase viene normalizzato: `trim()` e rimozione di `\r`, `\n` da `VITE_SUPABASE_URL`. Se il problema era CRLF/spazi in env, ora è coperto.

2. **Ipotesi B/D – CORS / preflight**  
   La GET al token CSRF è stata resa "simple" (nessun header `Content-Type`), così il browser non manda OPTIONS. Se il problema era preflight/CORS, ora è evitato.

## Da verificare a mano (Ipotesi E – funzione non raggiungibile)

- **1. Edge Function deployata sul progetto giusto**  
  Progetto usato su Vercel: `tucqgcfrlzmwyfadiodo`.  
  Da CLI, dalla root del repo:
  ```bash
  supabase functions list
  supabase functions deploy auth-csrf-token
  ```

- **2. Path esatto della funzione**  
  Supabase espone una funzione per ogni **cartella top-level** sotto `functions/`. La cartella è `auth-csrf-token`, quindi l’URL è `/functions/v1/auth-csrf-token`.  
  Il frontend è stato aggiornato per chiamare **`auth-csrf-token`** (trattino). La cartella `auth/csrf-token/` (con slash) non è un nome di funzione valido su Supabase.

- **3. Test diretto dell’endpoint**  
  Aprendo in un browser (o con curl) l’URL che usa il frontend:
  ```
  https://tucqgcfrlzmwyfadiodo.supabase.co/functions/v1/auth-csrf-token
  ```
  Se risponde con JSON (`csrf_token`, `expires_at`) la funzione è raggiungibile. Se 404, la funzione non è deployata (es. `supabase functions deploy auth-csrf-token`).

- **4. Variabili Vercel**  
  Su Vercel → Project → Settings → Environment Variables verificare che siano impostate (senza spazi/newline a fine valore):
  - `VITE_SUPABASE_URL` = `https://tucqgcfrlzmwyfadiodo.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = la tua anon key

  Dopo ogni modifica alle env, serve un **nuovo deploy** (le variabili Vite sono inlined a build time).
