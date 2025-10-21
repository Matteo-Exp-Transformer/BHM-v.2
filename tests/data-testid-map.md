# 🔐 Data-TestID Map - Auth Hardening

**Versione**: 1.0  
**Data**: 2025-01-27  
**Autore**: Agente 5 - Frontend Developer  
**Scopo**: Mappa completa dei data-testid per test E2E del sistema di hardening autenticazione

---

## 📋 **CONVENZIONI NAMING**

### **Formato Standard**
```
data-testid="{component}-{element}-{variant?}"
```

### **Componenti Principali**
- `login` - Form di login
- `recovery` - Form di recupero password
- `invite` - Form di accettazione invito
- `error` - Banner di errore
- `success` - Banner di successo
- `rate-limit` - Banner rate limiting
- `csrf` - Elementi CSRF
- `loading` - Elementi di caricamento

### **Elementi**
- `input` - Campi di input
- `button` - Pulsanti
- `banner` - Banner di notifica
- `spinner` - Indicatori di caricamento
- `countdown` - Timer countdown
- `form` - Form container
- `field` - Campo form con label

### **Varianti**
- `primary` - Pulsante principale
- `secondary` - Pulsante secondario
- `error` - Stato di errore
- `success` - Stato di successo
- `warning` - Stato di avviso
- `info` - Stato informativo

---

## 🎯 **MAPPA COMPLETA DATA-TESTID**

### **LOGIN PAGE (`/login`)**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `login-form` | `<form>` | Container form login | Verifica presenza form |
| `login-email-input` | `<input>` | Campo email | Compilazione email |
| `login-password-input` | `<input>` | Campo password | Compilazione password |
| `login-remember-checkbox` | `<input>` | Checkbox "Ricordami" | Toggle remember me |
| `login-button` | `<button>` | Pulsante login | Invio form |
| `login-button-loading` | `<button>` | Pulsante durante caricamento | Verifica stato loading |
| `login-forgot-link` | `<a>` | Link "Password dimenticata" | Navigazione recovery |
| `login-register-link` | `<a>` | Link "Registrati" | Navigazione registrazione |

### **RECOVERY PAGE (`/forgot-password`)**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `recovery-form` | `<form>` | Container form recovery | Verifica presenza form |
| `recovery-email-input` | `<input>` | Campo email recovery | Compilazione email |
| `recovery-button` | `<button>` | Pulsante invio recovery | Invio richiesta |
| `recovery-button-loading` | `<button>` | Pulsante durante caricamento | Verifica stato loading |
| `recovery-back-link` | `<a>` | Link "Torna al login" | Navigazione login |
| `recovery-resend-button` | `<button>` | Pulsante "Invia di nuovo" | Reinvio email |

### **RECOVERY CONFIRM PAGE (`/reset-password`)**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `recovery-confirm-form` | `<form>` | Container form conferma | Verifica presenza form |
| `recovery-confirm-password-input` | `<input>` | Campo nuova password | Compilazione password |
| `recovery-confirm-password-confirm-input` | `<input>` | Campo conferma password | Conferma password |
| `recovery-confirm-button` | `<button>` | Pulsante conferma | Invio conferma |
| `recovery-confirm-button-loading` | `<button>` | Pulsante durante caricamento | Verifica stato loading |

### **INVITE ACCEPT PAGE (`/invite/accept`)**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `invite-form` | `<form>` | Container form invito | Verifica presenza form |
| `invite-firstname-input` | `<input>` | Campo nome | Compilazione nome |
| `invite-lastname-input` | `<input>` | Campo cognome | Compilazione cognome |
| `invite-password-input` | `<input>` | Campo password | Compilazione password |
| `invite-password-confirm-input` | `<input>` | Campo conferma password | Conferma password |
| `invite-button` | `<button>` | Pulsante accetta invito | Invio accettazione |
| `invite-button-loading` | `<button>` | Pulsante durante caricamento | Verifica stato loading |

### **ERROR BANNERS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `error-banner` | `<div>` | Banner errore generico | Verifica errori |
| `error-banner-auth` | `<div>` | Banner errore autenticazione | Verifica errori auth |
| `error-banner-validation` | `<div>` | Banner errore validazione | Verifica errori validazione |
| `error-banner-network` | `<div>` | Banner errore rete | Verifica errori rete |
| `error-banner-csrf` | `<div>` | Banner errore CSRF | Verifica errori CSRF |
| `error-banner-dismiss` | `<button>` | Pulsante chiudi errore | Chiusura banner |

### **SUCCESS BANNERS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `success-banner` | `<div>` | Banner successo generico | Verifica successi |
| `success-banner-login` | `<div>` | Banner successo login | Verifica login riuscito |
| `success-banner-recovery` | `<div>` | Banner successo recovery | Verifica recovery inviata |
| `success-banner-invite` | `<div>` | Banner successo invito | Verifica invito accettato |
| `success-banner-dismiss` | `<button>` | Pulsante chiudi successo | Chiusura banner |

### **RATE LIMITING BANNERS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `rate-limit-banner` | `<div>` | Banner rate limiting | Verifica rate limiting |
| `rate-limit-banner-login` | `<div>` | Banner rate limiting login | Verifica rate limiting login |
| `rate-limit-banner-recovery` | `<div>` | Banner rate limiting recovery | Verifica rate limiting recovery |
| `rate-limit-countdown` | `<span>` | Timer countdown | Verifica countdown |
| `rate-limit-message` | `<p>` | Messaggio rate limiting | Verifica messaggio |
| `rate-limit-dismiss` | `<button>` | Pulsante chiudi rate limit | Chiusura banner |

### **LOADING STATES**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `loading-spinner` | `<div>` | Spinner generico | Verifica caricamento |
| `loading-spinner-button` | `<div>` | Spinner in pulsante | Verifica caricamento pulsante |
| `loading-spinner-page` | `<div>` | Spinner pagina | Verifica caricamento pagina |
| `loading-skeleton` | `<div>` | Skeleton loader | Verifica skeleton |
| `loading-overlay` | `<div>` | Overlay caricamento | Verifica overlay |

### **CSRF ELEMENTS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `csrf-token` | `<input type="hidden">` | Token CSRF nascosto | Verifica presenza token |
| `csrf-refresh-button` | `<button>` | Pulsante refresh CSRF | Refresh manuale token |
| `csrf-status` | `<span>` | Status token CSRF | Verifica stato token |
| `csrf-expiry` | `<span>` | Scadenza token CSRF | Verifica scadenza |

### **PASSWORD FIELDS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `password-input` | `<input>` | Campo password generico | Compilazione password |
| `password-toggle` | `<button>` | Pulsante mostra/nascondi | Toggle visibilità |
| `password-strength` | `<div>` | Indicatore forza password | Verifica forza password |
| `password-policy` | `<div>` | Policy password | Verifica policy |
| `password-error` | `<span>` | Errore password | Verifica errori password |

### **FORM VALIDATION**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `field-error` | `<span>` | Errore campo generico | Verifica errori campo |
| `field-error-email` | `<span>` | Errore campo email | Verifica errori email |
| `field-error-password` | `<span>` | Errore campo password | Verifica errori password |
| `field-error-required` | `<span>` | Errore campo obbligatorio | Verifica campi obbligatori |
| `field-error-format` | `<span>` | Errore formato campo | Verifica formato |
| `field-error-length` | `<span>` | Errore lunghezza campo | Verifica lunghezza |

### **NAVIGATION ELEMENTS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `nav-login` | `<a>` | Link navigazione login | Navigazione login |
| `nav-recovery` | `<a>` | Link navigazione recovery | Navigazione recovery |
| `nav-invite` | `<a>` | Link navigazione invito | Navigazione invito |
| `nav-dashboard` | `<a>` | Link navigazione dashboard | Navigazione dashboard |
| `nav-logout` | `<button>` | Pulsante logout | Logout utente |

### **USER INTERFACE ELEMENTS**

| Data-TestID | Elemento | Descrizione | Utilizzo Test |
|-------------|----------|-------------|---------------|
| `user-menu` | `<div>` | Menu utente | Verifica menu utente |
| `user-avatar` | `<img>` | Avatar utente | Verifica avatar |
| `user-name` | `<span>` | Nome utente | Verifica nome utente |
| `user-role` | `<span>` | Ruolo utente | Verifica ruolo utente |
| `user-status` | `<span>` | Status utente | Verifica status utente |

---

## 🧪 **ESEMPI DI UTILIZZO**

### **Test Login Semplice**
```typescript
// Compila form login
await page.fill('[data-testid="login-email-input"]', 'user@test.com')
await page.fill('[data-testid="login-password-input"]', 'password123')
await page.click('[data-testid="login-button"]')

// Verifica successo
await expect(page.locator('[data-testid="success-banner-login"]')).toBeVisible()
```

### **Test Rate Limiting**
```typescript
// Simula tentativi multipli
for (let i = 0; i < 6; i++) {
  await page.fill('[data-testid="login-email-input"]', 'user@test.com')
  await page.fill('[data-testid="login-password-input"]', 'wrongpassword')
  await page.click('[data-testid="login-button"]')
}

// Verifica rate limiting
await expect(page.locator('[data-testid="rate-limit-banner-login"]')).toBeVisible()
await expect(page.locator('[data-testid="rate-limit-countdown"]')).toBeVisible()
```

### **Test CSRF Protection**
```typescript
// Verifica presenza token CSRF
const csrfToken = await page.getAttribute('[data-testid="csrf-token"]', 'value')
expect(csrfToken).toBeTruthy()

// Verifica errore senza token
await page.evaluate(() => {
  document.querySelector('[data-testid="csrf-token"]')?.remove()
})
await page.click('[data-testid="login-button"]')
await expect(page.locator('[data-testid="error-banner-csrf"]')).toBeVisible()
```

### **Test Loading States**
```typescript
// Verifica loading durante login
await page.fill('[data-testid="login-email-input"]', 'user@test.com')
await page.fill('[data-testid="login-password-input"]', 'password123')
await page.click('[data-testid="login-button"]')

// Verifica stato loading
await expect(page.locator('[data-testid="login-button-loading"]')).toBeVisible()
await expect(page.locator('[data-testid="loading-spinner-button"]')).toBeVisible()
```

---

## 📝 **BEST PRACTICES**

### **✅ DO**
- Usa sempre data-testid invece di selettori CSS
- Mantieni naming consistente e descrittivo
- Raggruppa elementi correlati con prefisso comune
- Usa varianti per stati diversi dello stesso elemento
- Documenta ogni nuovo data-testid aggiunto

### **❌ DON'T**
- Non usare selettori CSS fragili (`[class*="..."]`)
- Non usare ID o classi che potrebbero cambiare
- Non creare data-testid troppo generici
- Non dimenticare di aggiornare questa mappa
- Non usare data-testid per styling

### **🔧 MAINTENANCE**
- Aggiorna questa mappa ad ogni nuovo componente
- Verifica che tutti i data-testid siano utilizzati nei test
- Rimuovi data-testid non più utilizzati
- Mantieni la documentazione sincronizzata con il codice

---

## 🚀 **INTEGRAZIONE CON PLAYWRIGHT**

### **Configurazione Base**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    testIdAttribute: 'data-testid'
  }
})
```

### **Helper Functions**
```typescript
// test-helpers.ts
export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('[data-testid="login-email-input"]', email)
  await page.fill('[data-testid="login-password-input"]', password)
}

export async function expectErrorBanner(page: Page, message: string) {
  await expect(page.locator('[data-testid="error-banner"]')).toBeVisible()
  await expect(page.locator('[data-testid="error-banner"]')).toContainText(message)
}
```

---

**📋 Nota**: Questa mappa deve essere mantenuta aggiornata con ogni modifica ai componenti di autenticazione. Ogni nuovo data-testid deve essere documentato qui per garantire la tracciabilità e la manutenibilità dei test E2E.
