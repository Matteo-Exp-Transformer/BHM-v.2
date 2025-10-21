# WIREFRAME - Login Hardening Auth Flow

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Micro-area A1 - UI Login Form

---

## WIREFRAME 1: Login Page - Default State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │ ← Header Logo
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │ ← Page Title (h1)
│              Gestione sicurezza alimentare HACCP                │ ← Subtitle
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │ ← Form Card
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │ ← Email Input
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │ ← Password Input + Toggle
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │ ← Disabled Checkbox
│  │                                                         │   │
│  │  [                    Accedi                    ]      │   │ ← Submit Button
│  │                                                         │   │
│  │              Password dimenticata?                       │   │ ← Recovery Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │ ← Footer
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Layout**: Centrato, max width 400px su desktop
- **Spacing**: 24px tra sezioni, 16px tra campi
- **Colors**: Primary blue (#3B82F6), Gray borders (#E5E7EB)
- **Typography**: Inter font, 16px base, 24px title
- **Accessibility**: Labels associati, focus visible, aria-labels

---

## WIREFRAME 2: Login Page - Validation Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │
│              Gestione sicurezza alimentare HACCP                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │ ← Red Border
│  │  ❌ Formato email non valido                           │   │ ← Error Message
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │
│  │                                                         │   │
│  │  [                    Accedi                    ]      │   │ ← Disabled Button
│  │                                                         │   │
│  │              Password dimenticata?                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Error State**: Bordo rosso su campo con errore
- **Error Message**: Sotto il campo, testo rosso 14px
- **Button State**: Disabilitato se ci sono errori di validazione
- **Focus Management**: Focus sul primo campo con errore
- **Screen Reader**: aria-invalid="true", aria-describedby per errore

---

## WIREFRAME 3: Login Page - Server Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │
│              Gestione sicurezza alimentare HACCP                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Credenziali non valide                              │   │ ← Error Banner
│  │                                                         │   │
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │
│  │                                                         │   │
│  │  [                    Accedi                    ]      │   │
│  │                                                         │   │
│  │              Password dimenticata?                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Error Banner**: Sopra il form, background rosso chiaro
- **Icon**: Warning triangle, colore rosso
- **Message**: Generico per evitare enumeration
- **Persistence**: Rimane fino a nuovo tentativo
- **Accessibility**: role="alert", aria-live="polite"

---

## WIREFRAME 4: Login Page - Rate Limiting State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │
│              Gestione sicurezza alimentare HACCP                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🛡️ Troppi tentativi di accesso                        │   │ ← Rate Limit Banner
│  │     Riprova tra 45 secondi                               │   │ ← Countdown Timer
│  │                                                         │   │
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │
│  │                                                         │   │
│  │  [                    Accedi                    ]      │   │ ← Disabled Button
│  │                                                         │   │
│  │              Password dimenticata?                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Rate Limit Banner**: Background arancione, icona scudo
- **Countdown**: Timer in secondi, aggiornamento real-time
- **Button State**: Disabilitato durante rate limiting
- **Auto-dismiss**: Banner scompare quando scade il timer
- **Accessibility**: aria-live="polite" per countdown

---

## WIREFRAME 5: Login Page - Loading State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │
│              Gestione sicurezza alimentare HACCP                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │ ← Disabled
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │ ← Disabled
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │ ← Disabled
│  │                                                         │   │
│  │  [🔄 Accesso in corso...]                              │   │ ← Loading Button
│  │                                                         │   │
│  │              Password dimenticata?                       │   │ ← Disabled Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Loading State**: Spinner nel pulsante, testo "Accesso in corso..."
- **Form Disabled**: Tutti i campi disabilitati durante submit
- **Visual Feedback**: Spinner animato, opacity ridotta
- **Accessibility**: aria-busy="true" sul form
- **Duration**: Fino a risposta server

---

## WIREFRAME 6: Recovery Request Page - Default State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Recupera password                            │ ← Page Title
│        Inserisci la tua email per ricevere il link di reset     │ ← Subtitle
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │ ← Email Input
│  │                                                         │   │
│  │  [                Invia email                  ]      │   │ ← Submit Button
│  │                                                         │   │
│  │              Torna al login                             │   │ ← Back Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Layout**: Simile a login, più semplice
- **Single Field**: Solo email per recovery request
- **Navigation**: Link per tornare al login
- **Validation**: Stesso schema email del login
- **Error Handling**: Messaggi generici per evitare enumeration

---

## WIREFRAME 7: Recovery Request Page - Success State

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Recupera password                            │
│        Inserisci la tua email per ricevere il link di reset     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    ✅ Email inviata!                    │   │ ← Success Icon
│  │                                                         │   │
│  │        Controlla la tua casella di posta               │   │ ← Success Message
│  │                                                         │   │
│  │    Clicca sul link nell'email per reimpostare          │   │ ← Instructions
│  │                    la password                          │   │
│  │                                                         │   │
│  │              Torna al login                             │   │ ← Back Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Success State**: Sostituisce il form
- **Icon**: Checkmark verde
- **Message**: Conferma email inviata
- **Instructions**: Cosa fare dopo
- **Navigation**: Solo link per tornare al login

---

## WIREFRAME 8: Recovery Confirm Page - Password Reset Form

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Reimposta password                           │ ← Page Title
│                    Inserisci la nuova password                  │ ← Subtitle
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Nuova password *                                      │   │
│  │  [_____________________________________] [👁️]         │   │ ← Password Input
│  │  Minimo 12 caratteri, solo lettere                     │   │ ← Policy Info
│  │                                                         │   │
│  │  Conferma password *                                   │   │
│  │  [_____________________________________] [👁️]         │   │ ← Confirm Input
│  │                                                         │   │
│  │  [              Conferma password              ]      │   │ ← Submit Button
│  │                                                         │   │
│  │              Torna al login                             │   │ ← Back Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Password Fields**: Due campi per conferma
- **Policy Info**: Sotto il primo campo password
- **Validation**: Password match validation
- **Toggle**: Eye icon per entrambi i campi password
- **Token**: Verificato in background, non visibile all'utente

---

## WIREFRAME 9: Invite Accept Page - Account Creation Form

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accetta invito                               │ ← Page Title
│              Completa la creazione del tuo account            │ ← Subtitle
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Nome *                                                │   │
│  │  [_____________________________________]               │   │ ← First Name
│  │                                                         │   │
│  │  Cognome *                                             │   │
│  │  [_____________________________________]               │   │ ← Last Name
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │ ← Password Input
│  │  Minimo 12 caratteri, solo lettere                     │   │ ← Policy Info
│  │                                                         │   │
│  │  Conferma password *                                   │   │
│  │  [_____________________________________] [👁️]         │   │ ← Confirm Input
│  │                                                         │   │
│  │  [                Crea account                 ]      │   │ ← Submit Button
│  │                                                         │   │
│  │              Torna al login                             │   │ ← Back Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Account Creation**: Nome, cognome, password
- **Token Verification**: Pre-verificato, non visibile
- **Password Policy**: Stessa del recovery
- **Validation**: Tutti i campi obbligatori
- **Success**: Redirect automatico a dashboard

---

## WIREFRAME 10: Mobile Layout - Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │ ← Header Logo
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │ ← Page Title
│              Gestione sicurezza alimentare HACCP                │ ← Subtitle
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │ ← Full Width Card
│  │  Email *                                               │   │
│  │  [_____________________________________]               │   │ ← Full Width Input
│  │                                                         │   │
│  │  Password *                                            │   │
│  │  [_____________________________________] [👁️]         │   │ ← Full Width Input
│  │                                                         │   │
│  │  ☐ Ricordami (disponibile in versione futura)          │   │
│  │                                                         │   │
│  │  [                    Accedi                    ]      │   │ ← Full Width Button
│  │                                                         │   │
│  │              Password dimenticata?                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │ ← Footer
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Mobile Layout**: Full width, padding 16px
- **Touch Targets**: ≥44px height per tutti gli elementi
- **Font Size**: 16px base per evitare zoom
- **Spacing**: 16px tra elementi
- **Responsive**: Stesso layout per tablet/desktop con max-width

---

## WIREFRAME 11: Toast Notifications

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← Fixed Top-Right
│  │  ✅ Login effettuato con successo!                      │   │ ← Success Toast
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ❌ Credenziali non valide                               │   │ ← Error Toast
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Troppi tentativi. Riprova più tardi                 │   │ ← Warning Toast
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Position**: Fixed top-right, z-index alto
- **Animation**: Slide in da destra, fade out
- **Duration**: 4s auto-dismiss per success, persistente per errori
- **Colors**: Green per success, red per error, orange per warning
- **Accessibility**: aria-live="polite" per screen reader

---

## WIREFRAME 12: Loading Skeleton

```
┌─────────────────────────────────────────────────────────────────┐
│                           BHM v.2                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Accedi al sistema                            │
│              Gestione sicurezza alimentare HACCP                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │ ← Skeleton Input
│  │                                                         │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │ ← Skeleton Input
│  │                                                         │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │ ← Skeleton Button
│  │                                                         │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │ ← Skeleton Link
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    © 2025 BHM v.2 - Privacy Policy             │
└─────────────────────────────────────────────────────────────────┘
```

**Annotazioni**:
- **Skeleton Loading**: Placeholder durante caricamento iniziale
- **Animation**: Pulse effect per indicare caricamento
- **Structure**: Mantiene layout finale
- **Duration**: Fino a caricamento completo
- **Accessibility**: aria-busy="true" sulla pagina

---

## INTERACTION FLOWS

### Login Success Flow
1. **User**: Compila email e password
2. **System**: Validazione real-time
3. **User**: Clicca "Accedi"
4. **System**: Loading state, submit form
5. **System**: Success response, toast notification
6. **System**: Redirect a dashboard

### Login Error Flow
1. **User**: Compila credenziali sbagliate
2. **User**: Clicca "Accedi"
3. **System**: Loading state, submit form
4. **System**: Error response, error banner
5. **User**: Può riprovare immediatamente

### Rate Limiting Flow
1. **User**: Fa 5 tentativi falliti
2. **System**: Attiva rate limiting
3. **System**: Mostra banner con countdown
4. **System**: Disabilita form per 10 minuti
5. **System**: Auto-dismiss quando scade

### Recovery Flow
1. **User**: Clicca "Password dimenticata?"
2. **System**: Naviga a recovery page
3. **User**: Inserisce email
4. **System**: Invia email con token
5. **System**: Mostra success state
6. **User**: Clicca link in email
7. **System**: Naviga a recovery confirm
8. **User**: Inserisce nuova password
9. **System**: Conferma password, redirect a login

---

## DESIGN PATTERNS

### Form Validation Pattern
- **Real-time**: Validazione on blur
- **Error Display**: Sotto il campo specifico
- **Error Clearing**: On field change
- **Focus Management**: Focus sul primo errore

### Error Handling Pattern
- **Generic Messages**: No information leakage
- **Error Persistence**: Fino a nuovo tentativo
- **Error Hierarchy**: Field errors > General errors
- **Error Recovery**: Clear path to resolution

### Loading State Pattern
- **Button Loading**: Spinner + disabled text
- **Form Disabled**: Tutti i campi durante submit
- **Visual Feedback**: Opacity ridotta, spinner animato
- **Accessibility**: aria-busy="true"

### Success State Pattern
- **Toast Notification**: Top-right, auto-dismiss
- **Redirect**: Automatico dopo successo
- **Confirmation**: Messaggio di successo
- **Next Steps**: Chiaro cosa succede dopo

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per design tokens
