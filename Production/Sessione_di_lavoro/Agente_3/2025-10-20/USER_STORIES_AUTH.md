# USER STORIES - Login Hardening Auth Flow

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Micro-area A1 - UI Login Form (P0)

---

## Epic: UI Login Form Accessibile e Sicuro

Form di login con validazione schema-based, CSRF protection, rate limiting feedback e accessibility AA compliance per utenti 40-60 anni nel settore HACCP.

---

## US-001: Login con Credenziali Valide

### Story
**Come** dipendente/manager di un'azienda alimentare,  
**voglio** accedere al sistema BHM inserendo email e password,  
**per** gestire le attività HACCP e evitare multe ASL.

### Context
Il sistema BHM v.2 gestisce la sicurezza alimentare. Gli utenti devono accedere rapidamente per completare controlli giornalieri. Il form deve essere intuitivo per utenti non tech-savvy (40-60 anni).

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Login Successo
**GIVEN** sono un utente con credenziali valide  
**WHEN** inserisco email e password corrette nel form  
**THEN** vengo reindirizzato alla dashboard principale  
**AND** ricevo conferma visiva "Login effettuato con successo!"  
**AND** la sessione viene creata con cookie sicuri  

#### Scenario 2: Validazione Campi
**GIVEN** sono sulla pagina di login  
**WHEN** inserisco email non valida (es. "test@")  
**THEN** vedo errore "Formato email non valido" sotto il campo  
**AND** il campo email ha bordo rosso  
**AND** il pulsante "Accedi" rimane disabilitato  

#### Scenario 3: Password Policy
**GIVEN** sono sulla pagina di login  
**WHEN** inserisco password con meno di 12 caratteri  
**THEN** vedo errore "Password deve essere di almeno 12 caratteri"  
**AND** il campo password ha bordo rosso  
**AND** il pulsante "Accedi" rimane disabilitato  

#### Scenario 4: Credenziali Non Valide
**GIVEN** inserisco credenziali sbagliate  
**WHEN** clicco "Accedi"  
**THEN** vedo messaggio generico "Credenziali non valide"  
**AND** il form rimane compilato (no enumeration)  
**AND** posso riprovare immediatamente  

### Functional Requirements
- [ ] Form con campi: email (RFC 5322), password (min 12 char, solo lettere)
- [ ] Validazione real-time con Zod schema
- [ ] Messaggi errore generici (no information leakage)
- [ ] Pulsante "Accedi" con loading state
- [ ] Redirect automatico a `/dashboard` su successo
- [ ] Toast notification di successo (4s auto-dismiss)

### Non-Functional Requirements
- **Performance**: Login completo ≤ 2s end-to-end
- **Accessibility**: WCAG 2.1 AA compliance (contrast ≥4.5:1, focus visible, screen reader)
- **Security**: CSRF protection, rate limiting feedback
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: Responsive design, touch targets ≥44px

### UI/UX Requirements
- **Layout**: Form centrato, card con shadow
- **Colors**: Primary blue (#3B82F6), Error red (#EF4444), Success green (#10B981)
- **Typography**: Inter font, 16px base size per leggibilità
- **Spacing**: 24px tra sezioni, 16px tra campi
- **Icons**: Eye icon per show/hide password
- **Loading**: Spinner nel pulsante durante submit

### Technical Notes
- API endpoint: `POST /auth/login` con CSRF token
- Validazione: Zod schema condiviso client/server
- Error handling: Codici standardizzati (AUTH_FAILED, RATE_LIMITED)
- Session: Cookie httpOnly/secure/sameSite=strict

### Dependencies
- [ ] Agente 4: Implementa endpoint `/auth/login` con CSRF
- [ ] Agente 5: Implementa LoginForm component con validazione
- [ ] Agente 6: Test E2E flow login valido/invalido

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 200 (Reach: 100%, Impact: 100%, Confidence: 100%, Effort: 2 giorni)
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 8 SP
- **Hours**: 12-16 ore (Backend 4h, Frontend 6h, Testing 4h, UX 2h)

### Related Stories
- US-002: Rate limiting feedback UI
- US-003: Password show/hide toggle
- US-004: Remember me checkbox (v1.1)

---

## US-002: Gestione Rate Limiting

### Story
**Come** utente che ha fatto troppi tentativi di login,  
**voglio** ricevere feedback chiaro sul rate limiting,  
**per** capire quando posso riprovare senza frustrazione.

### Context
Sistema di sicurezza contro brute-force: 5 tentativi per account in 5 minuti, poi lockout 10 minuti. L'utente deve capire cosa sta succedendo.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Rate Limit Attivo
**GIVEN** ho fatto 5 tentativi di login falliti  
**WHEN** provo a fare login di nuovo  
**THEN** vedo banner arancione "Troppi tentativi di accesso"  
**AND** vedo countdown "Riprova tra X secondi"  
**AND** il pulsante "Accedi" è disabilitato  
**AND** il form rimane compilato  

#### Scenario 2: Rate Limit Reset
**GIVEN** sono in rate limiting  
**WHEN** aspetto che scada il countdown  
**THEN** il banner scompare automaticamente  
**AND** il pulsante "Accedi" si riabilita  
**AND** posso riprovare il login  

### Functional Requirements
- [ ] Banner warning arancione per rate limiting
- [ ] Countdown timer in secondi
- [ ] Disabilitazione pulsante durante lockout
- [ ] Auto-dismiss del banner quando scade
- [ ] Persistenza stato durante navigazione

### UI/UX Requirements
- **Colors**: Warning orange (#F59E0B), background (#FFFBEB)
- **Icon**: Warning triangle
- **Animation**: Smooth fade in/out
- **Position**: Top del form, sopra errori

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 150
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 5 SP
- **Hours**: 8 ore

---

## US-003: Password Visibility Toggle

### Story
**Come** utente che digita password lunghe,  
**voglio** poter vedere temporaneamente la password,  
**per** verificare di averla digitata correttamente.

### Context
Password policy richiede 12+ caratteri solo lettere. Utenti 40-60 anni possono avere difficoltà a digitare password lunghe senza errori.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Mostra Password
**GIVEN** sto digitando la password  
**WHEN** clicco l'icona occhio nel campo password  
**THEN** la password diventa visibile come testo  
**AND** l'icona cambia in "occhio barrato"  
**AND** l'aria-label dice "Nascondi password"  

#### Scenario 2: Nascondi Password
**GIVEN** la password è visibile  
**WHEN** clicco di nuovo l'icona  
**THEN** la password torna nascosta con asterischi  
**AND** l'icona torna normale  
**AND** l'aria-label dice "Mostra password"  

### Functional Requirements
- [ ] Icona occhio cliccabile nel campo password
- [ ] Toggle tra testo visibile e nascosto
- [ ] Aria-label dinamico per accessibilità
- [ ] Focus management corretto

### UI/UX Requirements
- **Icon**: Eye/EyeOff SVG icons
- **Position**: Right side del campo password
- **Size**: 20px, touch target 44px
- **Color**: Gray-400, hover Gray-600

### Priority
- **MoSCoW**: SHOULD (P1)
- **RICE Score**: 120
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 3 SP
- **Hours**: 4 ore

---

## US-004: Remember Me Checkbox (v1.1)

### Story
**Come** utente che usa sempre lo stesso computer,  
**voglio** poter mantenere la sessione attiva più a lungo,  
**per** non dover rifare login ogni volta.

### Context
Feature rimandata a v1.1 per semplificare MVP. Per ora checkbox disabilitata con testo esplicativo.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Checkbox Disabilitata
**GIVEN** sono sulla pagina di login  
**WHEN** vedo la checkbox "Remember Me"  
**THEN** è disabilitata (grayed out)  
**AND** il testo dice "Ricordami (disponibile in versione futura)"  
**AND** non posso cliccarla  

### Functional Requirements
- [ ] Checkbox presente ma disabilitata
- [ ] Testo esplicativo per utente
- [ ] Styling coerente con design system

### Priority
- **MoSCoW**: WON'T (v1.1)
- **RICE Score**: 80
- **Sprint**: Sprint 2

### Estimate
- **Story Points**: 2 SP
- **Hours**: 2 ore

---

## US-005: Link Password Dimenticata

### Story
**Come** utente che ha dimenticato la password,  
**voglio** un link per recuperare l'accesso,  
**per** poter rientrare nel sistema senza chiamare il supporto.

### Context
Link che porta al recovery flow. Deve essere visibile ma non prominente per non confondere il flow principale.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Accesso Recovery
**GIVEN** sono sulla pagina di login  
**WHEN** clicco "Password dimenticata?"  
**THEN** vengo reindirizzato a `/recovery`  
**AND** vedo il form per richiedere reset password  

### Functional Requirements
- [ ] Link "Password dimenticata?" sotto il form
- [ ] Navigazione a pagina recovery
- [ ] Styling come link secondario

### UI/UX Requirements
- **Position**: Sotto il pulsante "Accedi"
- **Color**: Blue-600, hover Blue-700
- **Size**: 14px, font-weight normal
- **Spacing**: 16px dal pulsante

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 100
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 2 SP
- **Hours**: 2 ore

---

## US-006: Loading States e Feedback

### Story
**Come** utente che fa login,  
**voglio** feedback visivo durante il caricamento,  
**per** sapere che la mia richiesta è in elaborazione.

### Context
Login può richiedere 1-2 secondi. Utenti devono sapere che il sistema sta lavorando.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Loading Durante Submit
**GIVEN** ho compilato il form correttamente  
**WHEN** clicco "Accedi"  
**THEN** il pulsante mostra spinner e testo "Accesso in corso..."  
**AND** il pulsante è disabilitato  
**AND** tutti i campi sono disabilitati  

#### Scenario 2: Success Feedback
**GIVEN** il login è andato a buon fine  
**WHEN** ricevo la risposta  
**THEN** vedo toast verde "Login effettuato con successo!"  
**AND** vengo reindirizzato alla dashboard  
**AND** il toast scompare dopo 4 secondi  

#### Scenario 3: Error Feedback
**GIVEN** il login fallisce  
**WHEN** ricevo errore  
**THEN** vedo toast rosso con messaggio errore  
**AND** il form torna abilitato  
**AND** posso riprovare  

### Functional Requirements
- [ ] Spinner nel pulsante durante submit
- [ ] Disabilitazione form durante loading
- [ ] Toast notifications per success/error
- [ ] Auto-dismiss toast dopo 4s
- [ ] Re-enable form su errore

### UI/UX Requirements
- **Spinner**: SVG animato, 20px
- **Toast**: Fixed top-right, slide in animation
- **Colors**: Success green, Error red
- **Duration**: 4s auto-dismiss

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 140
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 5 SP
- **Hours**: 8 ore

---

## US-007: Accessibilità Completa

### Story
**Come** utente con disabilità visive o motorie,  
**voglio** poter usare il form di login con screen reader e tastiera,  
**per** accedere al sistema indipendentemente dalle mie capacità.

### Context
Sistema deve essere accessibile per conformità WCAG 2.1 AA. Utenti possono avere disabilità visive, motorie o cognitive.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Screen Reader Navigation
**GIVEN** uso uno screen reader  
**WHEN** navigo il form con Tab  
**THEN** ogni elemento è annunciato correttamente  
**AND** i label sono associati ai campi  
**AND** gli errori sono annunciati quando appaiono  

#### Scenario 2: Keyboard Only
**GIVEN** uso solo la tastiera  
**WHEN** navigo con Tab/Shift+Tab  
**THEN** posso raggiungere tutti gli elementi interattivi  
**AND** il focus è sempre visibile  
**AND** posso attivare pulsanti con Enter/Space  

#### Scenario 3: High Contrast
**GIVEN** uso high contrast mode  
**WHEN** visualizzo il form  
**THEN** tutti gli elementi sono distinguibili  
**AND** il contrast ratio è ≥4.5:1 per testo normale  
**AND** il contrast ratio è ≥3:1 per testo grande  

### Functional Requirements
- [ ] Label associati a tutti gli input
- [ ] Aria-label su elementi icon-only
- [ ] Aria-invalid su campi con errore
- [ ] Aria-describedby per messaggi errore
- [ ] Focus visible su tutti gli elementi
- [ ] Skip link per saltare al contenuto

### UI/UX Requirements
- **Focus ring**: Blue-500, 2px width
- **Contrast**: ≥4.5:1 per testo, ≥3:1 per UI
- **Touch targets**: ≥44px per mobile
- **Font size**: ≥16px per leggibilità

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 180
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 8 SP
- **Hours**: 12 ore

---

## US-008: Responsive Design Mobile

### Story
**Come** utente che accede da mobile,  
**voglio** che il form di login sia ottimizzato per touch,  
**per** poter accedere comodamente anche da smartphone.

### Context
40% degli utenti accede da mobile. Form deve essere touch-friendly e leggibile su schermi piccoli.

### Acceptance Criteria (Definition of Done)

#### Scenario 1: Mobile Layout
**GIVEN** accedo da smartphone (320px width)  
**WHEN** visualizzo la pagina di login  
**THEN** il form occupa tutta la larghezza disponibile  
**AND** i campi hanno altezza ≥44px per touch  
**AND** il testo è leggibile senza zoom  

#### Scenario 2: Tablet Layout
**GIVEN** accedo da tablet (768px width)  
**WHEN** visualizzo la pagina di login  
**THEN** il form è centrato con larghezza fissa  
**AND** mantiene proporzioni desktop  
**AND** touch targets sono ottimizzati  

### Functional Requirements
- [ ] Layout responsive 320px-1920px
- [ ] Touch targets ≥44px
- [ ] Font size ≥16px per evitare zoom
- [ ] Spacing ottimizzato per touch
- [ ] No scroll orizzontale

### UI/UX Requirements
- **Breakpoints**: sm(640px), md(768px), lg(1024px)
- **Mobile**: Full width, padding 16px
- **Desktop**: Max width 400px, centrato
- **Touch**: 44px min height per input

### Priority
- **MoSCoW**: MUST (P0)
- **RICE Score**: 160
- **Sprint**: Sprint 1 (MVP)

### Estimate
- **Story Points**: 6 SP
- **Hours**: 10 ore

---

## SUMMARY METRICHE

### User Stories Complete
- **Totale**: 8 stories
- **MUST (P0)**: 6 stories
- **SHOULD (P1)**: 1 story  
- **WON'T (v1.1)**: 1 story

### Effort Estimation
- **Story Points Totali**: 39 SP
- **Ore Totali**: 64 ore
- **Sprint 1**: 37 SP (58 ore)
- **Sprint 2**: 2 SP (2 ore)

### Quality Targets
- **Task Success Rate**: ≥90% per flow critici
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Login ≤2s end-to-end
- **Mobile**: Touch targets ≥44px, responsive 320px+

### Dependencies
- **Agente 4**: Backend API con CSRF e rate limiting
- **Agente 5**: Frontend components con validazione
- **Agente 6**: E2E tests per tutti gli scenari

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per handoff ad Agente 5
