# INFORMATION ARCHITECTURE - Login Hardening Auth Flow

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Micro-area A1 - UI Login Form

---

## Site Map

```
Dashboard (Home)
├── Auth Section
│   ├── Login Page (/login)
│   │   ├── Login Form (default state)
│   │   ├── Loading State (during submit)
│   │   ├── Error State (validation/server errors)
│   │   ├── Rate Limit State (too many attempts)
│   │   └── Success State (redirect to dashboard)
│   ├── Recovery Page (/recovery)
│   │   ├── Request Form (email input)
│   │   ├── Success State (email sent confirmation)
│   │   └── Error State (rate limit/invalid email)
│   ├── Recovery Confirm Page (/recovery/confirm)
│   │   ├── Token Verification (pre-check)
│   │   ├── Password Reset Form (new password)
│   │   ├── Success State (redirect to login)
│   │   └── Error State (invalid/expired token)
│   ├── Invite Accept Page (/invite/accept)
│   │   ├── Token Verification (pre-check)
│   │   ├── Account Creation Form (name + password)
│   │   ├── Success State (redirect to dashboard)
│   │   └── Error State (invalid/expired invite)
│   └── Session Management
│       ├── Session Info (current user)
│       ├── Timeout Warning (5min before expiry)
│       └── Logout Confirmation
└── Global Components
    ├── Toast Notifications (success/error)
    ├── Loading Overlay (global)
    └── Error Boundary (fallback)
```

---

## Navigation Structure

### Primary Navigation (Top Nav / Sidebar)
```markdown
- Dashboard (home icon) - Solo se autenticato
- Attività/Calendario - Solo se autenticato
- Conservazione - Solo se autenticato
- Inventario - Solo se autenticato
- Liste Spesa - Solo se autenticato
- Impostazioni - Solo se autenticato
- Login - Solo se NON autenticato
```

### Secondary Navigation (Breadcrumb)
```markdown
Login Page: "Accedi al sistema"
Recovery Page: "Recupera password"
Recovery Confirm: "Recupera password > Conferma"
Invite Accept: "Accetta invito"
```

### Contextual Navigation (Actions)
```markdown
- Login Form: "Accedi" (primary), "Password dimenticata?" (link)
- Recovery Form: "Invia email" (primary), "Torna al login" (link)
- Recovery Confirm: "Conferma password" (primary), "Torna al login" (link)
- Invite Accept: "Crea account" (primary), "Torna al login" (link)
```

### Search & Filter
```markdown
- N/A per auth flow (no search/filter needed)
```

---

## Content Hierarchy

### Login Page Structure
```
1. Page Header
   - Logo BHM v.2
   - Title: "Accedi al sistema"
   - Subtitle: "Gestione sicurezza alimentare HACCP"

2. Login Form Card
   - Rate Limit Warning (se attivo)
   - General Error Message (se presente)
   - Email Field
     - Label: "Email *"
     - Input: email type, placeholder "mario@esempio.com"
     - Error: sotto il campo se presente
   - Password Field
     - Label: "Password *"
     - Input: password type, placeholder "••••••••"
     - Toggle: eye icon per show/hide
     - Error: sotto il campo se presente
   - Remember Me Checkbox (disabilitata v1)
   - Submit Button: "Accedi" con loading state
   - Recovery Link: "Password dimenticata?"

3. Page Footer
   - Copyright info
   - Privacy policy link
```

### Recovery Page Structure
```
1. Page Header
   - Logo BHM v.2
   - Title: "Recupera password"
   - Subtitle: "Inserisci la tua email per ricevere il link di reset"

2. Recovery Form Card
   - General Error Message (se presente)
   - Email Field
     - Label: "Email *"
     - Input: email type, placeholder "mario@esempio.com"
     - Error: sotto il campo se presente
   - Submit Button: "Invia email" con loading state
   - Back Link: "Torna al login"

3. Success State (se email inviata)
   - Success Icon
   - Message: "Email inviata! Controlla la tua casella"
   - Instructions: "Clicca sul link nell'email per reimpostare la password"
   - Back Link: "Torna al login"
```

### Recovery Confirm Page Structure
```
1. Page Header
   - Logo BHM v.2
   - Title: "Reimposta password"
   - Subtitle: "Inserisci la nuova password"

2. Password Reset Form Card
   - Token Verification (hidden, pre-checked)
   - General Error Message (se presente)
   - New Password Field
     - Label: "Nuova password *"
     - Input: password type
     - Policy Info: "Minimo 12 caratteri, solo lettere"
     - Toggle: eye icon per show/hide
     - Error: sotto il campo se presente
   - Confirm Password Field
     - Label: "Conferma password *"
     - Input: password type
     - Error: sotto il campo se presente
   - Submit Button: "Conferma password" con loading state
   - Back Link: "Torna al login"

3. Success State (se password cambiata)
   - Success Icon
   - Message: "Password cambiata con successo!"
   - Redirect: "Reindirizzamento al login..."
```

---

## Empty States

### No Session (Not Logged In)
```markdown
**Illustration**: Lock icon
**Headline**: "Accedi per continuare"
**Description**: "Inserisci le tue credenziali per accedere al sistema BHM"
**CTA**: Button "Vai al login" (primary)
```

### Session Expired
```markdown
**Illustration**: Clock icon
**Headline**: "Sessione scaduta"
**Description**: "La tua sessione è scaduta per sicurezza. Accedi di nuovo per continuare"
**CTA**: Button "Accedi di nuovo" (primary)
```

### Rate Limited
```markdown
**Illustration**: Shield icon
**Headline**: "Troppi tentativi di accesso"
**Description**: "Per sicurezza, devi attendere prima di riprovare"
**CTA**: Countdown timer + "Riprova tra X secondi"
```

---

## Error States

### Validation Error
```markdown
**Location**: Sotto il campo specifico
**Style**: Red text, 14px
**Content**: Messaggio specifico (es. "Formato email non valido")
**Behavior**: Appare on blur, scompare on change
```

### Server Error
```markdown
**Location**: Sopra il form
**Style**: Red banner con icona
**Content**: Messaggio generico (es. "Credenziali non valide")
**Behavior**: Persiste fino a nuovo tentativo
```

### Network Error
```markdown
**Location**: Sopra il form
**Style**: Orange banner con icona
**Content**: "Errore di connessione. Riprova"
**Behavior**: Persiste fino a nuovo tentativo
```

### Rate Limit Error
```markdown
**Location**: Sopra il form
**Style**: Orange banner con icona
**Content**: "Troppi tentativi. Riprova tra X secondi"
**Behavior**: Countdown timer, auto-dismiss
```

---

## Loading States

### Form Submit Loading
```markdown
**Location**: Nel pulsante submit
**Style**: Spinner + testo "Accesso in corso..."
**Behavior**: Disabilita tutto il form
**Duration**: Fino a risposta server
```

### Page Load Loading
```markdown
**Location**: Centro pagina
**Style**: Skeleton loader per form
**Behavior**: Mostra struttura base
**Duration**: Fino a caricamento completo
```

### Token Verification Loading
```markdown
**Location**: Centro pagina
**Style**: Spinner + testo "Verifica token..."
**Behavior**: Blocca interazione
**Duration**: Fino a verifica token
```

---

## Success States

### Login Success
```markdown
**Location**: Toast top-right
**Style**: Green background, check icon
**Content**: "Login effettuato con successo!"
**Behavior**: Auto-dismiss dopo 4s, redirect a dashboard
```

### Recovery Email Sent
```markdown
**Location**: Sostituisce il form
**Style**: Green card con icona
**Content**: "Email inviata! Controlla la tua casella"
**Behavior**: Persiste, link "Torna al login"
```

### Password Reset Success
```markdown
**Location**: Sostituisce il form
**Style**: Green card con icona
**Content**: "Password cambiata con successo!"
**Behavior**: Auto-redirect a login dopo 3s
```

### Invite Accepted
```markdown
**Location**: Toast top-right
**Style**: Green background, check icon
**Content**: "Account creato con successo!"
**Behavior**: Auto-dismiss dopo 4s, redirect a dashboard
```

---

## Accessibility Requirements

### Screen Reader Support
- **Page Title**: `<title>` descrittivo per ogni pagina
- **Headings**: `<h1>` per titolo pagina, `<h2>` per sezioni
- **Labels**: Ogni input ha `<label>` associato
- **Error Messages**: `aria-describedby` per associare errori ai campi
- **Live Regions**: `aria-live="polite"` per messaggi dinamici

### Keyboard Navigation
- **Tab Order**: Logico, left-to-right, top-to-bottom
- **Focus Visible**: Ring blu 2px su tutti gli elementi interattivi
- **Skip Links**: "Salta al contenuto" all'inizio pagina
- **Escape Key**: Chiude modal/overlay se presenti

### Visual Accessibility
- **Contrast Ratio**: ≥4.5:1 per testo normale, ≥3:1 per testo grande
- **Font Size**: ≥16px per evitare zoom automatico
- **Touch Targets**: ≥44px per mobile
- **Color Independence**: Informazioni non solo tramite colore

### Motor Accessibility
- **Large Touch Targets**: ≥44px per tutti gli elementi cliccabili
- **No Hover Required**: Tutte le funzioni accessibili senza hover
- **No Time Limits**: Nessun timeout automatico
- **Error Prevention**: Conferme per azioni distruttive

---

## Responsive Breakpoints

### Mobile (320px - 639px)
- **Layout**: Full width, padding 16px
- **Form**: Single column, full width
- **Touch Targets**: ≥44px height
- **Font Size**: 16px base
- **Spacing**: 16px tra elementi

### Tablet (640px - 1023px)
- **Layout**: Centrato, max width 500px
- **Form**: Single column, padding 24px
- **Touch Targets**: ≥44px height
- **Font Size**: 16px base
- **Spacing**: 20px tra elementi

### Desktop (1024px+)
- **Layout**: Centrato, max width 400px
- **Form**: Single column, padding 32px
- **Touch Targets**: ≥44px height
- **Font Size**: 16px base
- **Spacing**: 24px tra elementi

---

## Performance Considerations

### Loading Optimization
- **Lazy Loading**: Carica componenti auth solo quando necessario
- **Code Splitting**: Separa auth bundle dal main bundle
- **Preloading**: Precarica pagine auth dopo login successo
- **Caching**: Cache static assets (CSS, JS, images)

### Bundle Size
- **Tree Shaking**: Rimuovi codice non utilizzato
- **Minification**: Minifica CSS e JS
- **Compression**: Gzip/Brotli per assets
- **CDN**: Serve assets da CDN

### Runtime Performance
- **Debouncing**: Debounce input validation (300ms)
- **Memoization**: Memoizza componenti pesanti
- **Virtual Scrolling**: Per liste lunghe (se presenti)
- **Image Optimization**: WebP format, lazy loading

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per wireframe
