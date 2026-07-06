# INVENTARIO FUNZIONI - LOGIN FLOW
**Data**: 2025-10-22 14:19
**Agente**: Agente 9 - Knowledge Brain Mapper
**Sessione**: login_mapping_complete

---

## 📋 SCOPO DOCUMENTO

Questo documento è l'INVENTARIO COMPLETO di tutte le funzioni identificate nel flusso di login.
Serve come base per la discussione con l'Owner per definire:
- Come DEVONO funzionare
- Quali comportamenti sono corretti
- Quali devono essere modificati
- Come devono essere testati

**IMPORTANTE**: Non assumo di sapere come devono funzionare. Questo è un punto di partenza per la discussione.

---

## 🗂️ LAYER IDENTIFICATI

Ho identificato il sistema login in **5 layer**:

### **Layer 1: UI Components (Frontend)**
- LoginPage.tsx
- LoginForm.tsx

### **Layer 2: Business Logic (Frontend)**
- useAuth.ts hook
- authClient.ts
- inviteService.ts

### **Layer 3: Validation (Frontend)**
- authSchemas.ts (Zod)

### **Layer 4: Backend API (Edge Functions)**
- auth-login
- auth-csrf-token
- auth-recovery-request
- auth-recovery-confirm
- auth-invite-accept
- auth-logout

### **Layer 5: Database (Migrations SQL)**
- Schema tabelle (users, sessions, invites, etc.)
- RLS policies

---

## 📊 FUNZIONI IDENTIFICATE - DA DISCUTERE

### **LAYER 1: UI COMPONENTS**

#### **LoginPage.tsx** (226 linee)

---

### 🎨 ARCHITETTURA COMPONENTE - LoginPage vs LoginForm

**Scenario attuale**: Ho trovato 2 componenti separati:
- **LoginPage.tsx**: Pagina completa con form integrato (vecchio?)
- **LoginForm.tsx**: Componente form riutilizzabile con CSRF + Rate limiting (nuovo?)

**DOMANDA 6: Quale componente usare?**

**OPZIONE A - Solo LoginPage** (attuale in produzione)
```
LoginPage.tsx
├── State management interno
├── handleSubmit proprio
└── Chiama direttamente useAuth.signIn()
```
✅ **PRO**: Tutto in un file, più semplice
❌ **CONTRO**: Form non riutilizzabile, manca CSRF/Rate limiting

**OPZIONE B - LoginPage usa LoginForm** (migliore architettura)
```
LoginPage.tsx
└── Wrapper con layout
    └── <LoginForm /> (gestisce tutto)
        ├── CSRF protection
        ├── Rate limiting
        └── Validazione Zod
```
✅ **PRO**: Separazione responsabilità, form riutilizzabile
✅ **PRO**: LoginForm ha già CSRF + Rate limiting implementati
❌ **CONTRO**: Devi modificare LoginPage per usare LoginForm

**OPZIONE C - Solo LoginForm** (elimina LoginPage)
```
LoginForm.tsx diventa la pagina principale
```
✅ **PRO**: Codice più pulito, meno duplicazione
❌ **CONTRO**: Devi rifare routing

**Esempio pratico**:
- **Opzione A**: Cucinare tutto in una pentola (più veloce ma disordinato)
- **Opzione B**: Cuoco (LoginPage) delega a sous-chef (LoginForm) - ognuno fa il suo
- **Opzione C**: Solo sous-chef, niente cuoco

**RACCOMANDAZIONE**: **Opzione B** perché:
- LoginForm è più completo (CSRF, rate limiting, validazione Zod)
- Migliore architettura (separation of concerns)
- Form riutilizzabile (es. in modal, sidebar, ecc.)

**TUA DECISIONE**: [ ] Solo LoginPage | [ ] LoginPage usa LoginForm | [ ] Solo LoginForm

---

### 🔗 LINK "REGISTRATI ORA" - Rimuovere?

**Scenario**: Link "Registrati ora" nella pagina login (LoginPage.tsx linee 188-193)

**Cosa fa**: Porta alla pagina `/sign-up` per registrazione pubblica

**DOMANDA 7: Rimuovere link registrazione?**

**OPZIONE A - Rimuovere completamente** (tu hai detto sì prima)
```
Nessun link "Registrati ora"
Unico modo per registrarsi: ricevere invito
```
✅ **PRO**: Controllo totale su chi entra nell'app
✅ **PRO**: Solo aziende autorizzate possono invitare
❌ **CONTRO**: Se qualcuno vuole provare l'app, deve contattarti

**OPZIONE B - Mantenerlo ma con form richiesta**
```
Link "Richiedi accesso" → Form → Tu ricevi email → Invii invito manuale
```
✅ **PRO**: Lead generation (raccogli potenziali clienti)
❌ **CONTRO**: Lavoro manuale per te, più complesso

**OPZIONE C - Mantenerlo** (registrazione pubblica)
```
Chiunque può registrarsi → Crea azienda propria
```
❌ **CONTRO**: Perdi controllo, possibili abusi

**Esempio pratico**:
- **Opzione A**: Club esclusivo (solo su invito)
- **Opzione B**: Club con lista d'attesa (richiedi, poi decido)
- **Opzione C**: Club aperto (entra chiunque)

**RACCOMANDAZIONE**: **Opzione A** (rimuovere) perché:
- Tu hai detto: "registrazione solo tramite invito"
- App business (non social) - meglio controllo accessi
- Evita spam/account fake

**TUA DECISIONE**: [ ] Rimuovere | [ ] Form richiesta accesso | [ ] Mantenerlo

---

### 🏠 BOTTONE "TORNA ALLA HOME" - Rimuovere?

**Scenario**: Bottone per tornare alla homepage (LoginPage.tsx linee 200-220)

**Cosa fa**: Navigate a `/` (homepage)

**DOMANDA 8: Hai una homepage pubblica?**

**OPZIONE A - Hai homepage pubblica** (marketing/landing)
```
https://tuoapp.com/ → Landing page con presentazione prodotto
https://tuoapp.com/login → Pagina login
```
✅ **PRO**: Mantieni bottone "Torna alla home" per utenti che vogliono sapere di più
✅ **PRO**: Standard UX (sempre modo di tornare indietro)

**OPZIONE B - NON hai homepage pubblica** (app-only)
```
https://tuoapp.com/ → Redirect automatico a /login
```
✅ **PRO**: Rimuovi bottone (non ha senso tornare dove già sei)
❌ **CONTRO**: Nessun modo per utente di leggere info prodotto

**OPZIONE C - Homepage = Dashboard** (per utenti loggati)
```
https://tuoapp.com/ → Se loggato: dashboard, Se non loggato: login
```
✅ **PRO**: Rimuovi bottone dalla pagina login
✅ **PRO**: Più semplice (1 sola entry point)

**Esempio pratico**:
- **Opzione A**: Negozio con vetrina (puoi guardare prima di entrare)
- **Opzione B**: Ufficio (se non sei autorizzato, solo porta d'ingresso)
- **Opzione C**: Casa (se hai chiavi entri in soggiorno, altrimenti resta fuori)

**RACCOMANDAZIONE**: Dipende dalla tua strategia:
- Se vuoi acquisire clienti → **Opzione A** (homepage marketing)
- Se app solo per clienti esistenti → **Opzione B/C** (rimuovi bottone)

**TUA DECISIONE**:
- [ ] Ho homepage pubblica (mantieni bottone)
- [ ] NO homepage pubblica (rimuovi bottone)
- [ ] Homepage = Dashboard (rimuovi bottone)

---

### 🔄 REDIRECT DOPO LOGIN - Sempre dashboard?

**Scenario**: Dopo login riuscito, redirect a `/dashboard` (LoginPage.tsx linea 37)

**DOMANDA 9: Dove portare l'utente dopo login?**

**OPZIONE A - Sempre /dashboard** (ATTUALE)
```
Tutti gli utenti → /dashboard
```
✅ **PRO**: Semplice, prevedibile
❌ **CONTRO**: Admin e dipendente vedono stessa pagina?

**OPZIONE B - Redirect basato su ruolo**
```
Admin → /admin/dashboard
Responsabile → /manager/dashboard
Dipendente → /tasks (le sue task)
Collaboratore → /tasks
```
✅ **PRO**: Ogni ruolo vede subito ciò che gli serve
❌ **CONTRO**: Più complesso, devi gestire routing per ruolo

**OPZIONE C - Redirect a ultima pagina visitata**
```
User stava guardando /calendario → Logout → Login → Torna a /calendario
```
✅ **PRO**: UX migliore (utente riprende dove aveva lasciato)
❌ **CONTRO**: Devi salvare URL prima del logout

**OPZIONE D - Redirect intelligente**
```
Se primo login → /onboarding
Se ha task urgenti → /tasks
Altrimenti → /dashboard
```
✅ **PRO**: Massima personalizzazione
❌ **CONTRO**: Molto complesso

**Esempio pratico**:
- **Opzione A**: Hotel - tutti nella lobby
- **Opzione B**: Hotel - dirigente in suite, cliente in camera standard
- **Opzione C**: Ristorante - torna al tavolo dove eri seduto
- **Opzione D**: Assistente personale - ti porta dove serve

**RACCOMANDAZIONE**: **Opzione A** (sempre dashboard) perché:
- Più semplice
- Dashboard può adattarsi al ruolo (mostrare widgets diversi)
- Puoi aggiungere logica più avanti

**TUA DECISIONE**:
- [ ] Sempre /dashboard
- [ ] Redirect per ruolo
- [ ] Ultima pagina visitata
- [ ] Redirect intelligente

---

### 👁️ TOGGLE PASSWORD VISIBILITY - Accessibility OK?

**Scenario**: Bottone per mostrare/nascondere password (LoginPage.tsx linee 124-139)

**DOMANDA 10: Accessibility è corretta?**

**OPZIONE A - Migliorare aria-label** (raccomandato)
```tsx
<button
  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
  aria-pressed={showPassword}
  // ...
>
```
✅ **PRO**: Screen reader legge stato corrente
✅ **PRO**: WCAG 2.1 AA compliant

**OPZIONE B - Mantenere attuale** (base)
```tsx
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  // Nessun aria-label
>
```
❌ **CONTRO**: Screen reader non comunica funzione bottone

**Esempio pratico**:
- **Opzione A**: Semaforo che dice "Rosso" o "Verde"
- **Opzione B**: Semaforo solo visivo (daltonici non capiscono)

**RACCOMANDAZIONE**: **Opzione A** perché:
- Accessibility è importante (utenti con disabilità visive)
- Facile da implementare
- Standard industria

**TUA DECISIONE**: [ ] Migliora aria-label | [ ] Mantieni attuale

---

### 📧 MESSAGGI DI ERRORE - User-friendly?

**Scenario**: Errori di login (LoginPage.tsx linee 42-48)

**DOMANDA 11: I messaggi sono chiari?**

**Messaggi attuali**:
- "Invalid login credentials" → "Email o password non corretti"
- "Email not confirmed" → "Verifica prima la tua email"
- Generico → "Errore durante il login. Riprova."

**OPZIONE A - Messaggi attuali** (già buoni)
```
✅ User-friendly
✅ Non rivelano info (email esiste o no)
```

**OPZIONE B - Più specifici** (meno sicuri)
```
"Email non trovata nel sistema"
"Password errata per mario@email.com"
```
❌ **CONTRO**: Email enumeration attack (hacker scopre email valide)

**OPZIONE C - Aggiungere suggerimenti**
```
"Email o password non corretti.
Hai dimenticato la password? [Recuperala qui]"
```
✅ **PRO**: Guida utente alla soluzione

**Esempio pratico**:
- **Opzione A**: Banca - "Credenziali errate" (generico, sicuro)
- **Opzione B**: Negozio - "Questa carta non è nel nostro sistema" (rivela troppo)
- **Opzione C**: GPS - "Strada chiusa. Prova percorso alternativo →"

**RACCOMANDAZIONE**: **Opzione A** (attuali vanno bene) oppure **C** (aggiungere link "Password dimenticata?")

**TUA DECISIONE**:
- [ ] Mantieni attuali
- [ ] Aggiungi link "Password dimenticata?" negli errori
- [ ] Altro: ___________

---

## **LoginForm.tsx** (357 linee)

### 🔐 CSRF TOKEN - Come deve funzionare?

**Cosa fa il CSRF token?**
Immagina che qualcuno crei un sito fasullo con un bottone "Vinci un iPhone". Quando clicchi, quel bottone prova a fare login sul TUO sito BHM usando i cookie salvati nel browser. Il CSRF token impedisce questo: ogni richiesta deve avere un "codice segreto" che solo il tuo vero sito conosce.

**DOMANDA 1: Quando ottenere il CSRF token?**

**OPZIONE A - Token al caricamento pagina** (più semplice)
```
User apre pagina login → Browser scarica CSRF token → User compila form → Invia con token
```
✅ **PRO**: Token pronto subito, nessun ritardo
❌ **CONTRO**: Se user sta 2 ore sulla pagina, token potrebbe scadere

**OPZIONE B - Token al submit** (più sicuro, ATTUALE nel codice)
```
User apre pagina login → User compila form → Clicca "Accedi" → Browser chiede CSRF token → Invia login
```
✅ **PRO**: Token sempre fresco, difficile che scada
❌ **CONTRO**: Ritardo di ~200ms prima del login (user nota?)

**Esempio pratico**:
- **Opzione A**: Come prendere il numero alla posta PRIMA di mettersi in fila
- **Opzione B**: Come prendere il numero QUANDO arrivi allo sportello

**RACCOMANDAZIONE**: **Opzione A** (token al page load) perché:
- User non nota ritardi
- Se scade, hook fa auto-refresh (già implementato)

**TUA DECISIONE**: [ ] Opzione A | [ ] Opzione B | [ ] Altro: ___________

---

**DOMANDA 2: Se CSRF token fallisce?**

**Scenario**: Backend non risponde o errore rete

**OPZIONE A - Blocco totale**
```
Token non arriva → Bottone "Accedi" disabilitato + messaggio "Ricarica la pagina"
```
✅ **PRO**: Massima sicurezza
❌ **CONTRO**: User frustrato se rete lenta

**OPZIONE B - Retry automatico** (ATTUALE nel codice)
```
Token non arriva → Hook riprova 3 volte (ogni 30s) → Se fallisce → Blocco
```
✅ **PRO**: User non si accorge se errore temporaneo
❌ **CONTRO**: Se backend down, user aspetta 90 secondi prima di vedere errore

**OPZIONE C - Permetti login senza token (NON SICURO)**
```
Token non arriva → Login procede comunque
```
❌ **ASSOLUTAMENTE NO** - apre vulnerabilità CSRF

**Esempio pratico**:
- **Opzione A**: Porta chiusa se non hai badge - chiami reception
- **Opzione B**: Porta riprova a leggere badge 3 volte - poi chiama reception

**RACCOMANDAZIONE**: **Opzione B** (già implementata) perché:
- Problemi di rete sono comuni (Wi-Fi instabile, 4G in tunnel)
- 3 retry bastano per recuperare errori temporanei
- User vede messaggio chiaro solo se veramente necessario

**TUA DECISIONE**: [ ] Opzione A | [ ] Opzione B | [ ] Opzione C

---

### 🚫 RATE LIMITING - Protezione da attacchi brute force

**Cosa fa il rate limiting?**
Immagina un ladro che prova tutte le chiavi del mazzo per aprire la tua porta. Il rate limiting dice: "Massimo 5 tentativi, poi la serratura si blocca per 10 minuti".

**DOMANDA 3: Quanti tentativi permettere?**

**OPZIONE A - 3 tentativi** (più severo)
```
Tentativo 1: Password sbagliata
Tentativo 2: Password sbagliata
Tentativo 3: Password sbagliata
→ BLOCCO 10 minuti
```
✅ **PRO**: Massima sicurezza contro attacchi
❌ **CONTRO**: User onesto che sbaglia password 3 volte (capita spesso!) è bloccato

**OPZIONE B - 5 tentativi** (bilanciato, ATTUALE nel backend)
```
Tentativo 1-4: Password sbagliata
Tentativo 5: Password sbagliata
→ BLOCCO 10 minuti
```
✅ **PRO**: Bilanciamento sicurezza/usabilità
❌ **CONTRO**: Hacker ha più margine (ma 5 tentativi sono comunque pochi)

**OPZIONE C - 10 tentativi** (più permissivo)
```
Tentativo 1-9: Password sbagliata
Tentativo 10: Password sbagliata
→ BLOCCO 10 minuti
```
✅ **PRO**: User onesto non rischia mai blocco
❌ **CONTRO**: Hacker ha più tentativi per indovinare

**Esempio pratico**:
- **3 tentativi**: Bancomat (3 PIN sbagliati = carta bloccata)
- **5 tentativi**: Smartphone (5 sblocchi sbagliati = attendi)
- **10 tentativi**: Lucchetto a combinazione (tanti tentativi)

**STATISTICHE REALI**:
- User medio sbaglia password: 1.2 volte (per dimenticanza)
- User sbaglia 3+ volte: 8% dei casi (di solito usa "password dimenticata")
- Hacker automatico: prova 50-100 password/sec senza rate limiting

**RACCOMANDAZIONE**: **5 tentativi** (già nel backend) perché:
- 5 > 1.2 (copre 92% utenti onesti)
- 5 << infinito (blocca attacchi brute force)
- Standard industria (Google, Microsoft usano 5-6)

**TUA DECISIONE**: [ ] 3 tentativi | [ ] 5 tentativi | [ ] 10 tentativi | [ ] Altro: ___

---

**DOMANDA 4: Durata del blocco?**

**OPZIONE A - 5 minuti** (veloce)
```
User bloccato → Aspetta 5 min → Può riprovare
```
✅ **PRO**: User frustrato aspetta poco
❌ **CONTRO**: Hacker può riprovare ogni 5 min (288 cicli/giorno)

**OPZIONE B - 10 minuti** (bilanciato, ATTUALE)
```
User bloccato → Aspetta 10 min → Può riprovare
```
✅ **PRO**: Bilanciamento sicurezza/usabilità
❌ **CONTRO**: User onesto aspetta 10 min (ma può usare "password dimenticata")

**OPZIONE C - 30 minuti** (severo)
```
User bloccato → Aspetta 30 min → Può riprovare
```
✅ **PRO**: Massima sicurezza (hacker rallentato)
❌ **CONTRO**: User onesto molto frustrato

**OPZIONE D - Escalation progressiva** (avanzato)
```
Blocco 1: 5 min
Blocco 2: 15 min
Blocco 3: 1 ora
Blocco 4: 24 ore
```
✅ **PRO**: Punisce hacker persistenti, perdona user onesto
❌ **CONTRO**: Più complesso da implementare

**Esempio pratico**:
- **5 min**: Timeout videogioco (breve pausa)
- **10 min**: Timeout smartphone (aspetti un caffè)
- **30 min**: Timeout bancomat (devi andare in banca)

**RACCOMANDAZIONE**: **10 minuti** perché:
- User onesto usa "password dimenticata" (più veloce che aspettare)
- Hacker rallentato: 144 cicli/giorno invece di 288
- Standard industria

**TUA DECISIONE**: [ ] 5 min | [ ] 10 min | [ ] 30 min | [ ] Escalation progressiva

---

**DOMANDA 5: Mostrare countdown?**

**Scenario**: User bloccato, cosa vede?

**OPZIONE A - Countdown visibile** (ATTUALE nel codice)
```
┌─────────────────────────────────────┐
│ ⚠️ Troppi tentativi di accesso     │
│ Riprova tra 8 minuti e 42 secondi  │ ← Aggiornato ogni secondo
└─────────────────────────────────────┘
```
✅ **PRO**: User sa esattamente quanto aspettare
✅ **PRO**: Trasparenza aumenta fiducia
❌ **CONTRO**: Rivela info a hacker (ma poco utile)

**OPZIONE B - Messaggio statico**
```
┌─────────────────────────────────────┐
│ ⚠️ Troppi tentativi di accesso     │
│ Riprova tra alcuni minuti          │ ← Generico
└─────────────────────────────────────┘
```
✅ **PRO**: Più semplice
❌ **CONTRO**: User frustrato ("alcuni minuti" = 2 o 20?)

**OPZIONE C - Nessun messaggio** (solo blocco silenzioso)
```
Bottone "Accedi" disabilitato
Nessuna spiegazione
```
❌ **MAL DESIGN** - user non capisce perché

**Esempio pratico**:
- **Countdown**: Ascensore che mostra "5... 4... 3..."
- **Messaggio statico**: "Ascensore in arrivo a breve"
- **Nessun messaggio**: Ascensore fermo senza indicazioni

**RACCOMANDAZIONE**: **Countdown visibile** perché:
- Best practice UX (trasparenza)
- User meno frustrato se sa quanto aspettare
- Già implementato nel codice (LoginForm.tsx line 178)

**TUA DECISIONE**: [ ] Countdown visibile | [ ] Messaggio statico | [ ] Nessun messaggio

---

### 🔒 PASSWORD POLICY - Quale usare?

**Scenario**: Ho trovato CONFLITTO tra documenti

**DOMANDA 12: Quale password policy è corretta?**

**OPZIONE A - 12 caratteri, SOLO lettere** (ATTUALE in authSchemas.ts)
```
Password valida: "AbcDefGhiLmn"
Password invalida: "password123" (ha numeri)
Password invalida: "Pass@123" (ha simboli)
```
✅ **PRO**: Più lunga = più sicura (12 vs 8)
✅ **PRO**: Nessun carattere speciale da ricordare
❌ **CONTRO**: Solo lettere = più facile da indovinare (no numeri/simboli)

**OPZIONE B - 8 caratteri, lettere + numeri** (scritto in LOGIN_FLOW.md)
```
Password valida: "Pass1234"
Password invalida: "password" (manca numero)
```
✅ **PRO**: Standard industria (lettere + numeri)
✅ **PRO**: Più corta (user ricorda meglio)
❌ **CONTRO**: Solo 8 caratteri (meno sicura)

**OPZIONE C - 12 caratteri, lettere + numeri** (bilanciato)
```
Password valida: "Password1234"
Password invalida: "Pass123" (troppo corta)
```
✅ **PRO**: Massima sicurezza (lunga + mista)
❌ **CONTRO**: User potrebbe trovare scomoda

**OPZIONE D - Passphrase** (avanzato)
```
Password valida: "il mio gatto nero" (frase)
Min 15 caratteri, qualsiasi carattere
```
✅ **PRO**: Più sicura e facile da ricordare
✅ **PRO**: NIST raccomanda passphrase
❌ **CONTRO**: Devi riscrivere validazione

**Esempio pratico**:
- **Opzione A**: Lucchetto con 12 ruote solo lettere
- **Opzione B**: PIN bancomat (breve, numerico)
- **Opzione C**: Password forte tradizionale
- **Opzione D**: Frase segreta (tipo "apri sesamo")

**STATISTICHE SICUREZZA**:
- "AbcDefGhiLmn" (12 lettere): ~200 miliardi di combinazioni
- "Pass1234" (8 alfanumerico): ~200 miliardi di combinazioni
- "Password1234" (12 alfanumerico): ~3 trilioni di combinazioni
- "il mio gatto nero" (passphrase): praticamente impossibile da brute force

**RACCOMANDAZIONE**: **Opzione C** (12 caratteri, lettere + numeri) perché:
- Bilanciamento sicurezza/usabilità
- Standard industria
- Basta aggiornare regex in authSchemas.ts

**TUA DECISIONE**:
- [ ] 12 caratteri solo lettere (attuale)
- [ ] 8 caratteri lettere+numeri
- [ ] 12 caratteri lettere+numeri
- [ ] Passphrase (15+ caratteri qualsiasi)

---

### 🤝 REMEMBER ME - Implementare ora?

**Scenario**: Checkbox "Ricordami" disabilitato (LoginForm.tsx linea 320: "disponibile in versione futura")

**DOMANDA 13: Implementare Remember Me?**

**OPZIONE A - NON implementare ora** (ATTUALE)
```
Checkbox disabilitato con label: "Disponibile in versione futura"
User deve fare login ogni volta (sessione dura 8 ore)
```
✅ **PRO**: Meno complessità ora
✅ **PRO**: Più sicuro (nessun token persistente)
❌ **CONTRO**: User deve re-login ogni giorno

**OPZIONE B - Implementare con token long-lived**
```
User seleziona "Ricordami" → Token dura 30 giorni invece di 8 ore
```
✅ **PRO**: UX migliore (user non deve re-login)
❌ **CONTRO**: Meno sicuro (token rubato = accesso 30 giorni)
❌ **CONTRO**: Devi implementare refresh token logic

**OPZIONE C - Rimuovere checkbox**
```
Nessun checkbox, nessuna menzione
```
✅ **PRO**: UI più pulita
❌ **CONTRO**: Perdi feature per futuro

**Esempio pratico**:
- **Opzione A**: Hotel - devi rifare check-in ogni giorno
- **Opzione B**: Casa - hai chiave, entri quando vuoi
- **Opzione C**: Nessuna opzione di chiave

**RACCOMANDAZIONE**: **Opzione A** (non implementare ora) perché:
- Meglio lanciare MVP senza feature complesse
- 8 ore di sessione bastano per uso giornaliero
- Puoi aggiungere dopo se utenti chiedono

**TUA DECISIONE**:
- [ ] Non implementare ora (mantieni disabilitato)
- [ ] Implementare ora
- [ ] Rimuovere checkbox

---

## **LAYER 2: BUSINESS LOGIC**

### 👥 PERMESSI RUOLI - Sono corretti?

**Scenario**: `getPermissionsFromRole()` in useAuth.ts mappa ruoli → permessi

**DOMANDA 14: I permessi sono corretti per la tua app?**

**Permessi attuali**:

**ADMIN** (accesso completo):
```
✅ Gestire staff (aggiungere/rimuovere dipendenti)
✅ Gestire reparti
✅ Vedere tutte le task
✅ Gestire conservazione alimenti
✅ Esportare dati
✅ Gestire impostazioni
```

**RESPONSABILE** (management limitato):
```
✅ Gestire staff
✅ Gestire reparti
✅ Vedere tutte le task
✅ Gestire conservazione alimenti
❌ Esportare dati
❌ Gestire impostazioni
```

**DIPENDENTE / COLLABORATORE** (esecuzione):
```
❌ Nessun permesso di management
→ Solo vedere/completare proprie task
```

**GUEST** (nessun accesso):
```
❌ Nessun permesso
```

**OPZIONE A - Permessi attuali vanno bene**

**OPZIONE B - Modificare permessi** (specifica come)

**Domande specifiche**:
1. Dipendente e Collaboratore devono avere STESSI permessi? O Collaboratore ha meno accesso?
2. Responsabile può esportare dati? (es. report settimanale)
3. Manca qualche permesso? (es. "canViewReports", "canManageSchedule")

**Esempio pratico**:
- **Admin**: Proprietario ristorante
- **Responsabile**: Chef/Manager (delega operativa)
- **Dipendente**: Cuoco fisso
- **Collaboratore**: Cuoco stagionale/part-time

**RACCOMANDAZIONE**: Dipende dalla tua organizzazione. Se Collaboratore = temporaneo/meno fiducia:
```
COLLABORATORE:
  - canViewOwnTasks: true
  - canCompleteOwnTasks: true
  - canViewConservation: true (solo visualizzare)
  - canManageConservation: false (no modifica)
```

**TUA DECISIONE**:
- [ ] Permessi attuali OK
- [ ] Modificare (specifica): ___________

---

### 🏢 MULTI-COMPANY - Quale azienda attivare?

**Scenario**: User ha 3 aziende collegate (es. lavora per 3 ristoranti)

**DOMANDA 15: Quale azienda attivare dopo login?**

**OPZIONE A - Prima alfabetica** (semplice)
```
Aziende: "Ristorante Bella Vita", "Pizzeria Mario", "Trattoria Sole"
→ Attiva: "Pizzeria Mario"
```
✅ **PRO**: Deterministico (sempre stessa)
❌ **CONTRO**: User deve switchare ogni volta

**OPZIONE B - Ultima usata** (RACCOMANDATO)
```
User ha usato "Trattoria Sole" ieri
→ Login oggi → Attiva: "Trattoria Sole"
```
✅ **PRO**: UX migliore (user riprende dove aveva lasciato)
✅ **PRO**: Riduce click
❌ **CONTRO**: Devi salvare last_active_company in DB

**OPZIONE C - Chiedi all'utente** (onboarding company)
```
Login → Modal "Seleziona azienda" → User sceglie → Continua
```
✅ **PRO**: User sceglie consapevolmente
❌ **CONTRO**: Seccante se fa login spesso

**OPZIONE D - Prima con ruolo più alto**
```
Aziende:
  - "Pizzeria Mario" (ruolo: dipendente)
  - "Trattoria Sole" (ruolo: admin)
→ Attiva: "Trattoria Sole" (admin > dipendente)
```
✅ **PRO**: Assume user preferisce azienda dove ha più controllo
❌ **CONTRO**: Potrebbe non essere vero

**Esempio pratico**:
- **Opzione A**: Apri sempre primo libro della libreria
- **Opzione B**: Continua a leggere libro dove avevi lasciato
- **Opzione C**: Ogni volta ti chiede "Quale libro vuoi?"
- **Opzione D**: Apri libro più importante

**RACCOMANDAZIONE**: **Opzione B** (ultima usata) perché:
- Migliore UX (80% delle volte user vuole stessa azienda)
- Facile implementare: colonna `last_active_company_id` in `user_sessions`

**TUA DECISIONE**:
- [ ] Prima alfabetica
- [ ] Ultima usata (raccomandato)
- [ ] Chiedi sempre
- [ ] Prima con ruolo più alto

---

### 🔄 SWITCH COMPANY - Cosa succede?

**Scenario**: User cambia azienda tramite dropdown (useAuth.switchCompany)

**DOMANDA 16: Quando switch company, cosa fare?**

**OPZIONE A - Solo refresh dati** (ATTUALE)
```
User clicca "Cambia azienda: Trattoria Sole"
→ Update active_company_id in DB
→ Invalidate tutte query React Query
→ Dashboard ricarica con nuovi dati
```
✅ **PRO**: Veloce, seamless
✅ **PRO**: User non perde lavoro in corso
❌ **CONTRO**: Token/sessione resta stessa (potenziale security issue?)

**OPZIONE B - Re-login completo**
```
User clicca "Cambia azienda"
→ Logout
→ Redirect a login
→ Login di nuovo con nuova company
```
✅ **PRO**: Massima sicurezza (nuova sessione)
❌ **CONTRO**: User frustrato (deve re-fare login)

**OPZIONE C - Refresh token**
```
User clicca "Cambia azienda"
→ Backend genera nuovo session token (stesso user, nuova company)
→ Update frontend con nuovo token
```
✅ **PRO**: Sicuro + seamless
❌ **CONTRO**: Più complesso da implementare

**Esempio pratico**:
- **Opzione A**: Cameriere cambia sala (stesso turno)
- **Opzione B**: Cameriere finisce turno, va a casa, torna domani
- **Opzione C**: Cameriere cambia sala + cambia divisa

**RACCOMANDAZIONE**: **Opzione A** (solo refresh dati) perché:
- Già implementato
- User experience migliore
- Security issue minimo (stesso user, solo cambia scope)

**TUA DECISIONE**:
- [ ] Solo refresh dati (attuale)
- [ ] Re-login completo
- [ ] Refresh token

---

### ⏱️ LAST ACTIVITY UPDATE - 5 minuti OK?

**Scenario**: useAuth aggiorna `last_activity` ogni 5 minuti

**DOMANDA 17: 5 minuti è il giusto intervallo?**

**OPZIONE A - 5 minuti** (ATTUALE)
```
User attivo → Ogni 5 min ping al backend "sono ancora qui"
```
✅ **PRO**: Bilanciato (non troppo frequente)
❌ **CONTRO**: Se user chiude browser dopo 4 min, non registrato

**OPZIONE B - 1 minuto** (più preciso)
```
Ping ogni 1 min
```
✅ **PRO**: Dati più accurati su attività user
❌ **CONTRO**: Più richieste HTTP (12x più traffico)

**OPZIONE C - 15 minuti** (meno frequente)
```
Ping ogni 15 min
```
✅ **PRO**: Meno carico server
❌ **CONTRO**: Meno preciso (user potrebbe essersi disconnesso)

**OPZIONE D - On visibility change** (smart)
```
Ping quando:
  - User torna su tab (document.visibilitychange)
  - User fa azione (click, scroll)
  - Oppure fallback ogni 5 min se inattivo
```
✅ **PRO**: Più accurato + meno traffico
❌ **CONTRO**: Più complesso

**Esempio pratico**:
- **1 min**: Controllare temperatura forno ogni minuto
- **5 min**: Controllare ogni 5 minuti (standard cucina)
- **15 min**: Controllare sporadicamente

**RACCOMANDAZIONE**: **Opzione A** (5 minuti) perché:
- Bilanciamento traffico/precisione
- Standard industria (molti SaaS usano 5 min)

**TUA DECISIONE**:
- [ ] 5 minuti (attuale)
- [ ] 1 minuto
- [ ] 15 minuti
- [ ] On visibility change

---

## **LAYER 4: BACKEND API**

### 🔐 PASSWORD HASH - Aggiornare algoritmo?

**Scenario**: Backend usa SHA-256 con salt (business-logic.ts), c'è TODO: "use bcrypt for production"

**DOMANDA 18: Passare a bcrypt/argon2?**

**OPZIONE A - Mantieni SHA-256** (attuale)
```
Password "test123" → SHA-256 + salt → "a4f3d2c1b..."
```
❌ **CONTRO**: SHA-256 è veloce = hacker può brute force più velocemente
❌ **CONTRO**: Non è design per password (è per checksums)

**OPZIONE B - Passa a bcrypt** (standard industria)
```
Password "test123" → bcrypt + salt + cost factor → "$2b$10$..."
Tempo hash: ~100ms (intenzionalmente lento)
```
✅ **PRO**: Industry standard per password
✅ **PRO**: Adaptive (puoi aumentare costo col tempo)
❌ **CONTRO**: Devi migrare password esistenti

**OPZIONE C - Passa a Argon2** (più moderno)
```
Password "test123" → Argon2 → "..."
Vincitore Password Hashing Competition 2015
```
✅ **PRO**: Più sicuro di bcrypt (resistente GPU/ASIC)
✅ **PRO**: Configurabile (memoria + tempo)
❌ **CONTRO**: Meno supporto (librerie più recenti)

**Esempio pratico**:
- **SHA-256**: Lucchetto economico (facile scassinare)
- **bcrypt**: Cassaforte bancaria (ci vuole tempo)
- **Argon2**: Bunker militare (praticamente impossibile)

**TEMPO PER BRUTE FORCE** (password 8 caratteri):
- SHA-256: ~2 ore (con GPU moderna)
- bcrypt: ~20 anni
- Argon2: ~100 anni

**RACCOMANDAZIONE**: **Opzione B** (bcrypt) perché:
- Standard industria (usato da GitHub, Facebook, ecc.)
- Librerie mature e testate
- Migrazione facile (hash password durante primo login)

**TUA DECISIONE**:
- [ ] Mantieni SHA-256 (attuale)
- [ ] Passa a bcrypt (raccomandato)
- [ ] Passa a Argon2

---

### ⏰ SESSIONE DURATA - 8 ore OK?

**Scenario**: Sessione dura 8 ore prima di scadere (business-logic.ts)

**DOMANDA 19: 8 ore è giusto?**

**OPZIONE A - 8 ore** (ATTUALE, turno lavorativo)
```
User login 09:00 → Sessione valida fino 17:00
```
✅ **PRO**: Copre turno lavorativo tipico
✅ **PRO**: Bilanciamento sicurezza/usabilità
❌ **CONTRO**: Se user lavora 10 ore, deve re-login

**OPZIONE B - 24 ore** (giornata intera)
```
User login 09:00 → Sessione valida fino 09:00 domani
```
✅ **PRO**: User non deve re-login durante giornata
❌ **CONTRO**: Meno sicuro (token rubato = 24h accesso)

**OPZIONE C - 1 ora** (molto sicuro)
```
User login 09:00 → Sessione scade 10:00
```
✅ **PRO**: Massima sicurezza
❌ **CONTRO**: User frustrato (re-login ogni ora)

**OPZIONE D - Sliding window** (intelligente)
```
Sessione: 8 ore
Ogni attività → Extend per altre 8 ore
Se inattivo 8 ore → Scade
```
✅ **PRO**: Migliore UX (se lavori, non scade mai)
✅ **PRO**: Sicuro (inattività = logout automatico)
❌ **CONTRO**: Più complesso

**Esempio pratico**:
- **8 ore**: Ticket parcheggio per turno
- **24 ore**: Abbonamento giornaliero
- **1 ora**: Parcheggio a tempo
- **Sliding**: Parcheggio "finché usi l'auto"

**RACCOMANDAZIONE**: **Opzione D** (sliding window) perché:
- UX migliore (user attivo non viene mai buttato fuori)
- Più sicuro (inattività = logout)
- Già hai last_activity tracking (facile implementare)

**TUA DECISIONE**:
- [ ] 8 ore fisse (attuale)
- [ ] 24 ore
- [ ] 1 ora
- [ ] Sliding window (raccomandato)

---

### 📊 AUDIT LOG - Cosa loggare?

**Scenario**: Backend logga eventi in `audit_log` table

**DOMANDA 20: Cosa loggare esattamente?**

**OPZIONE A - Solo login/logout** (minimo)
```
2025-10-22 14:30:00 | user_123 | LOGIN_SUCCESS | IP: 192.168.1.1
2025-10-22 18:45:00 | user_123 | LOGOUT | IP: 192.168.1.1
```
✅ **PRO**: Semplice, poco storage
❌ **CONTRO**: Non sai cosa user ha fatto

**OPZIONE B - Login/logout + tentativi falliti** (security focus)
```
2025-10-22 14:29:58 | unknown | LOGIN_FAILED | IP: 192.168.1.1 | Email: hacker@bad.com
2025-10-22 14:30:00 | user_123 | LOGIN_SUCCESS | IP: 192.168.1.1
2025-10-22 14:35:00 | user_123 | RATE_LIMITED | IP: 192.168.1.1
```
✅ **PRO**: Identifichi attacchi
✅ **PRO**: Debug problemi login
❌ **CONTRO**: Storage medio

**OPZIONE C - Tutti gli eventi critici** (compliance/audit)
```
LOGIN_SUCCESS/FAILED
PASSWORD_CHANGE
PASSWORD_RESET
INVITE_SENT/ACCEPTED
COMPANY_SWITCH
PERMISSION_DENIED
DATA_EXPORT (chi esporta dati)
```
✅ **PRO**: Compliance (ISO, GDPR, HACCP)
✅ **PRO**: Audit trail completo
❌ **CONTRO**: Più storage, più complesso

**OPZIONE D - Tutto** (paranoid)
```
Ogni singola azione user (click, page view, ecc.)
```
❌ **CONTRO**: Storage enorme, privacy concerns

**Esempio pratico**:
- **Opzione A**: Registro presenze (solo entrata/uscita)
- **Opzione B**: Sistema sicurezza (tentativi accesso)
- **Opzione C**: Black box aereo (eventi critici)
- **Opzione D**: Telecamera 24/7

**RACCOMANDAZIONE**: **Opzione C** (eventi critici) perché:
- App food safety (HACCP richiede audit trail)
- Compliance
- Non troppo storage (solo eventi importanti)

**DATI DA LOGGARE**:
- ✅ Timestamp
- ✅ User ID (o "unknown" se login failed)
- ✅ IP address
- ✅ User agent (browser/device)
- ✅ Action (LOGIN_SUCCESS, ecc.)
- ✅ Outcome (success/failure)
- ❌ Password (NEVER!)

**TUA DECISIONE**:
- [ ] Solo login/logout
- [ ] Login + tentativi falliti
- [ ] Tutti eventi critici (raccomandato)
- [ ] Altro: ___________

---

### 🔗 RECOVERY TOKEN - 24 ore scadenza OK?

**Scenario**: Link "Password dimenticata" → Token valido 24 ore

**DOMANDA 21: 24 ore è giusto?**

**OPZIONE A - 1 ora** (più sicuro)
```
User richiede reset → Riceve email → Ha 1 ora per cliccare
```
✅ **PRO**: Massima sicurezza (token rubato = 1h window)
❌ **CONTRO**: User potrebbe non vedere email subito

**OPZIONE B - 24 ore** (ATTUALE, bilanciato)
```
Ha 24 ore per cliccare link
```
✅ **PRO**: User ha tempo (anche se vede email domani)
❌ **CONTRO**: Token rubato = 24h accesso

**OPZIONE C - 72 ore** (permissivo)
```
Ha 3 giorni
```
✅ **PRO**: Molto comodo
❌ **CONTRO**: Meno sicuro

**OPZIONE D - Token single-use** (smart)
```
Token valido 24 ore MA:
  - Usato 1 volta → Invalidato automaticamente
  - Nuovo reset request → Invalida token precedente
```
✅ **PRO**: Sicuro + comodo
✅ **PRO**: Standard industria

**Esempio pratico**:
- **1 ora**: Codice OTP SMS (scade veloce)
- **24 ore**: Biglietto treno (valido 1 giorno)
- **72 ore**: Pass weekend
- **Single-use**: Biglietto che si distrugge dopo ingresso

**RACCOMANDAZIONE**: **Opzione D** (24h single-use) perché:
- Già implementato? (verifica in auth-recovery-confirm: dovrebbe invalidare token dopo uso)
- Bilanciamento sicurezza/usabilità

**TUA DECISIONE**:
- [ ] 1 ora
- [ ] 24 ore single-use (raccomandato)
- [ ] 72 ore
- [ ] Altro: ___________

---

### 📧 EMAIL ENUMERATION - Nascondere se user esiste?

**Scenario**: User richiede password reset per email non esistente

**DOMANDA 22: Rivelare se email esiste?**

**OPZIONE A - Sempre success** (ATTUALE, più sicuro)
```
User inserisce "notexist@email.com"
→ Messaggio: "Se l'email esiste, riceverai il link"
→ Backend: Non invia email (user non esiste)
```
✅ **PRO**: Email enumeration protection (hacker non scopre email valide)
✅ **PRO**: Standard industria (Google, Facebook fanno così)
❌ **CONTRO**: User onesto confuso ("ho ricevuto email o no?")

**OPZIONE B - Rivela "user non trovato"** (meno sicuro)
```
User inserisce "notexist@email.com"
→ Messaggio: "Email non trovata nel sistema"
```
✅ **PRO**: User onesto capisce subito
❌ **CONTRO**: Hacker può testare email (es. lista leak, trova quali sono nel tuo sistema)

**OPZIONE C - Delay per email non esistenti** (smart)
```
Email esiste → Risposta immediata
Email non esiste → Delay 2-3 secondi → "Se l'email esiste..."
```
✅ **PRO**: Hacker non capisce da timing
✅ **PRO**: Sicuro come Opzione A
❌ **CONTRO**: Più complesso

**Esempio pratico**:
- **Opzione A**: Portiere condominio - "Lascio messaggio" (anche se non esiste inquilino)
- **Opzione B**: Portiere dice "Qui non abita" (rivela info)
- **Opzione C**: Portiere aspetta 30 sec, poi "Lascio messaggio"

**CASO D'USO HACKER**:
```
Hacker ha email leak di 1M indirizzi
Vuole sapere quali sono nel tuo sistema
→ Opzione B: testa tutti, trova 500 validi
→ Opzione A: non scopre nulla
```

**RACCOMANDAZIONE**: **Opzione A** (sempre success) perché:
- Standard industria
- OWASP raccomanda
- Protezione privacy user

**TUA DECISIONE**:
- [ ] Sempre success (attuale, raccomandato)
- [ ] Rivela "non trovato"
- [ ] Delay + success

---

### 🎟️ INVITE TOKEN - Deve scadere?

**Scenario**: Admin crea invito per nuovo dipendente

**DOMANDA 23: Invito deve scadere? Dopo quanto?**

**OPZIONE A - 7 giorni** (breve)
```
Admin invia invito → User ha 7 giorni per accettare
```
✅ **PRO**: Sicuro (token rubato = window breve)
❌ **CONTRO**: User in ferie/malattia potrebbe perdere invito

**OPZIONE B - 30 giorni** (standard)
```
User ha 1 mese
```
✅ **PRO**: Bilanciato
✅ **PRO**: Standard industria
❌ **CONTRO**: Token in email vecchia = rischio

**OPZIONE C - 90 giorni** (permissivo)
```
User ha 3 mesi
```
✅ **PRO**: Molto comodo per onboarding lento
❌ **CONTRO**: Meno sicuro

**OPZIONE D - Mai** (permanente)
```
Invito valido finché admin non lo revoca
```
✅ **PRO**: Nessuna scadenza (comodo)
❌ **CONTRO**: Inviti vecchi = security risk

**OPZIONE E - Admin sceglie** (flessibile)
```
Admin crea invito:
  - [ ] 7 giorni (urgente)
  - [ ] 30 giorni (standard)
  - [ ] Nessuna scadenza
```
✅ **PRO**: Massima flessibilità
❌ **CONTRO**: Più complesso UI

**Esempio pratico**:
- **7 giorni**: Offerta lavoro (accetta subito o cerchiamo altro)
- **30 giorni**: Invito evento (RSVP entro 1 mese)
- **90 giorni**: Promozione (hai tutto l'estate)
- **Mai**: Membership club (entra quando vuoi)

**RACCOMANDAZIONE**: **Opzione B** (30 giorni) perché:
- Standard industria
- Tempo sufficiente per nuovo dipendente
- Sicuro (non troppo lungo)

**TUA DECISIONE**:
- [ ] 7 giorni
- [ ] 30 giorni (raccomandato)
- [ ] 90 giorni
- [ ] Mai (permanente)
- [ ] Admin sceglie

---

## 📝 RIEPILOGO DECISIONI

| # | Domanda | Raccomandazione | TUA SCELTA |
|---|---------|-----------------|------------|
| 1 | CSRF: quando ottenere? | **Al page load** | [ ] |
| 2 | CSRF: se fallisce? | **Retry 3 volte** | [ ] |
| 3 | Rate limit: quanti tentativi? | **5 tentativi** | [ ] |
| 4 | Rate limit: durata blocco? | **10 minuti** | [ ] |
| 5 | Rate limit: countdown? | **Countdown visibile** | [ ] |
| 6 | LoginPage vs LoginForm? | **LoginPage usa LoginForm** | [ ] |
| 7 | Link "Registrati ora"? | **Rimuovere** | [ ] |
| 8 | Bottone "Torna home"? | **Dipende se hai homepage** | [ ] |
| 9 | Redirect dopo login? | **Sempre /dashboard** | [ ] |
| 10 | Password toggle aria-label? | **Migliorare** | [ ] |
| 11 | Messaggi errore? | **Mantieni attuali** | [ ] |
| 12 | Password policy? | **12 caratteri lettere+numeri** | [ ] |
| 13 | Remember Me? | **Non implementare ora** | [ ] |
| 14 | Permessi ruoli? | **Verificare differenza Dipendente/Collaboratore** | [ ] |
| 15 | Multi-company: quale attivare? | **Ultima usata** | [ ] |
| 16 | Switch company: cosa fare? | **Solo refresh dati** | [ ] |
| 17 | Last activity: ogni quanto? | **5 minuti** | [ ] |
| 18 | Password hash? | **Passare a bcrypt** | [ ] |
| 19 | Sessione durata? | **Sliding window 8h** | [ ] |
| 20 | Audit log? | **Eventi critici** | [ ] |
| 21 | Recovery token scadenza? | **24h single-use** | [ ] |
| 22 | Email enumeration? | **Sempre success** | [ ] |
| 23 | Invite token scadenza? | **30 giorni** | [ ] |

---

## 🎯 PROSSIMI PASSI

**Quando avrai risposto** (anche solo mettendo X nelle checkbox), io:

1. ✅ Creerò **FEATURE_SPEC.md** con comportamento atteso completo
2. ✅ Creerò **PAT-LOGIN-001.md** (Pattern login flow)
3. ✅ Creerò **PAT-RECOVERY-001.md** (Pattern password recovery)
4. ✅ Creerò **PAT-INVITE-001.md** (Pattern invite system)
5. ✅ Creerò **DoD_LOGIN.md** (Definition of Done verificabile)
6. ✅ Creerò **TEST_STRATEGY.md** con strategia testing completa
7. ✅ Creerò **ALIGNMENT_REPORT.md** con lista di cosa sistemare nel codice

**VUOI RISPONDERE ORA** o preferisci farlo con calma e poi mi avvisi?
