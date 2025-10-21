# COMPONENT SPECIFICATIONS - Login Hardening Auth Flow

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Specifiche dettagliate per Agente 5 (Frontend)

---

## COMPONENT 1: LoginForm

### Purpose
Form di login con validazione Zod, CSRF protection, rate limiting feedback e accessibility AA compliance.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSuccess | Function | No | - | Callback on successful login |
| onError | Function | No | - | Callback on login error |
| className | string | No | '' | Additional CSS classes |
| initialEmail | string | No | '' | Pre-filled email value |
| disabled | boolean | No | false | Disable entire form |

### States
- **Default**: Empty form, ready for input
- **Filling**: User typing, real-time validation
- **Validating**: Zod schema validation in progress
- **Submitting**: Form submitted, loading state
- **Success**: Login successful, redirecting
- **Error**: Login failed, error displayed
- **Rate Limited**: Too many attempts, countdown active

### Variants
- **Default**: Standard login form
- **Compact**: Smaller version for embedded use
- **Disabled**: Form disabled (rate limiting, loading)

### Visual Specs
```css
.login-form {
  max-width: 400px;
  width: 100%;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.login-form__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.login-form__subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin-bottom: 24px;
}

.login-form__field {
  margin-bottom: 24px;
}

.login-form__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.login-form__input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 200ms ease;
}

.login-form__input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.login-form__input--error {
  border-color: #EF4444;
}

.login-form__error {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #EF4444;
}

.login-form__button {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3B82F6, #10B981);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
}

.login-form__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### Accessibility
- **Semantic**: Use <form> tag with proper labels
- **ARIA**: aria-invalid, aria-describedby for errors
- **Keyboard**: Full keyboard navigation support
- **Focus**: Visible focus ring on all interactive elements

### Example Usage
```jsx
<LoginForm
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => console.error('Login failed:', error)}
  initialEmail="user@example.com"
/>
```

---

## COMPONENT 2: RecoveryRequestForm

### Purpose
Form per richiedere reset password con validazione email e feedback successo.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSuccess | Function | No | - | Callback on email sent |
| onError | Function | No | - | Callback on error |
| className | string | No | '' | Additional CSS classes |
| initialEmail | string | No | '' | Pre-filled email value |

### States
- **Default**: Empty form, ready for input
- **Submitting**: Email sending in progress
- **Success**: Email sent, success state displayed
- **Error**: Error occurred, error displayed

### Visual Specs
```css
.recovery-form {
  max-width: 400px;
  width: 100%;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.recovery-form__success {
  text-align: center;
  padding: 24px;
}

.recovery-form__success-icon {
  width: 48px;
  height: 48px;
  color: #10B981;
  margin: 0 auto 16px;
}

.recovery-form__success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.recovery-form__success-message {
  font-size: 1rem;
  color: #6B7280;
  margin-bottom: 16px;
}

.recovery-form__success-instructions {
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.5;
}
```

### Example Usage
```jsx
<RecoveryRequestForm
  onSuccess={() => setShowSuccess(true)}
  onError={(error) => setError(error)}
  initialEmail="user@example.com"
/>
```

---

## COMPONENT 3: RecoveryConfirmForm

### Purpose
Form per confermare reset password con token e nuova password.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| token | string | Yes | - | Recovery token from URL |
| onSuccess | Function | No | - | Callback on password changed |
| onError | Function | No | - | Callback on error |
| className | string | No | '' | Additional CSS classes |

### States
- **Verifying**: Token verification in progress
- **Default**: Token valid, ready for password input
- **Submitting**: Password change in progress
- **Success**: Password changed, redirecting
- **Error**: Error occurred, error displayed

### Visual Specs
```css
.recovery-confirm-form {
  max-width: 400px;
  width: 100%;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.recovery-confirm-form__policy {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 8px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 6px;
  border-left: 4px solid #3B82F6;
}

.recovery-confirm-form__password-match {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #10B981;
}

.recovery-confirm-form__password-mismatch {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #EF4444;
}
```

### Example Usage
```jsx
<RecoveryConfirmForm
  token={searchParams.get('token')}
  onSuccess={() => navigate('/login')}
  onError={(error) => setError(error)}
/>
```

---

## COMPONENT 4: InviteAcceptForm

### Purpose
Form per accettare invito e creare account con nome, cognome e password.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| token | string | Yes | - | Invite token from URL |
| onSuccess | Function | No | - | Callback on account created |
| onError | Function | No | - | Callback on error |
| className | string | No | '' | Additional CSS classes |

### States
- **Verifying**: Token verification in progress
- **Default**: Token valid, ready for account creation
- **Submitting**: Account creation in progress
- **Success**: Account created, redirecting
- **Error**: Error occurred, error displayed

### Visual Specs
```css
.invite-accept-form {
  max-width: 400px;
  width: 100%;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.invite-accept-form__header {
  text-align: center;
  margin-bottom: 24px;
}

.invite-accept-form__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.invite-accept-form__subtitle {
  font-size: 1rem;
  color: #6B7280;
}

.invite-accept-form__name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
```

### Example Usage
```jsx
<InviteAcceptForm
  token={searchParams.get('token')}
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => setError(error)}
/>
```

---

## COMPONENT 5: ErrorBanner

### Purpose
Banner per mostrare errori generici sopra i form.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | string | Yes | - | Error message to display |
| type | 'error' \| 'warning' \| 'info' | No | 'error' | Banner type |
| onDismiss | Function | No | - | Callback on dismiss |
| className | string | No | '' | Additional CSS classes |

### States
- **Visible**: Banner displayed with message
- **Dismissing**: Banner fading out
- **Hidden**: Banner not displayed

### Visual Specs
```css
.error-banner {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-banner--error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.error-banner--warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
}

.error-banner--info {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  color: #075985;
}

.error-banner__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-banner__message {
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
}

.error-banner__dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.error-banner__dismiss:hover {
  background: rgba(0, 0, 0, 0.1);
}
```

### Example Usage
```jsx
<ErrorBanner
  message="Credenziali non valide"
  type="error"
  onDismiss={() => setError(null)}
/>
```

---

## COMPONENT 6: RateLimitBanner

### Purpose
Banner per mostrare rate limiting con countdown timer.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| secondsUntilReset | number | Yes | - | Seconds until rate limit resets |
| onReset | Function | No | - | Callback when rate limit resets |
| className | string | No | '' | Additional CSS classes |

### States
- **Active**: Rate limit active, countdown running
- **Expired**: Rate limit expired, banner hidden

### Visual Specs
```css
.rate-limit-banner {
  padding: 16px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rate-limit-banner__icon {
  width: 20px;
  height: 20px;
  color: #F59E0B;
  flex-shrink: 0;
}

.rate-limit-banner__content {
  flex: 1;
}

.rate-limit-banner__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #92400E;
  margin-bottom: 4px;
}

.rate-limit-banner__countdown {
  font-size: 0.75rem;
  color: #B45309;
}

.rate-limit-banner__timer {
  font-weight: 600;
  color: #92400E;
}
```

### Example Usage
```jsx
<RateLimitBanner
  secondsUntilReset={45}
  onReset={() => setRateLimited(false)}
/>
```

---

## COMPONENT 7: PasswordInput

### Purpose
Input field per password con toggle show/hide e validazione.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | Yes | - | Password value |
| onChange | Function | Yes | - | Change handler |
| placeholder | string | No | '••••••••' | Placeholder text |
| error | string | No | - | Error message |
| disabled | boolean | No | false | Disable input |
| className | string | No | '' | Additional CSS classes |

### States
- **Default**: Password hidden, eye icon visible
- **Visible**: Password visible, eye-off icon visible
- **Error**: Error state with red border and message
- **Disabled**: Input disabled

### Visual Specs
```css
.password-input {
  position: relative;
}

.password-input__field {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 200ms ease;
}

.password-input__field:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-input__field--error {
  border-color: #EF4444;
}

.password-input__toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 200ms ease;
}

.password-input__toggle:hover {
  color: #6B7280;
}

.password-input__toggle:focus {
  outline: none;
  color: #3B82F6;
}

.password-input__error {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #EF4444;
}
```

### Example Usage
```jsx
<PasswordInput
  value={password}
  onChange={setPassword}
  placeholder="Inserisci password"
  error={passwordError}
  disabled={isSubmitting}
/>
```

---

## COMPONENT 8: ToastNotification

### Purpose
Toast notification per success/error messages con auto-dismiss.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | string | Yes | - | Toast message |
| type | 'success' \| 'error' \| 'warning' \| 'info' | No | 'info' | Toast type |
| duration | number | No | 4000 | Auto-dismiss duration (ms) |
| onDismiss | Function | No | - | Callback on dismiss |
| className | string | No | '' | Additional CSS classes |

### States
- **Entering**: Toast sliding in
- **Visible**: Toast displayed
- **Exiting**: Toast sliding out
- **Hidden**: Toast not displayed

### Visual Specs
```css
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1080;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateX(100%);
  transition: transform 300ms ease;
}

.toast-notification--visible {
  transform: translateX(0);
}

.toast-notification--success {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
}

.toast-notification--error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.toast-notification--warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
}

.toast-notification--info {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  color: #075985;
}

.toast-notification__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-notification__message {
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
}

.toast-notification__dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 200ms ease;
}

.toast-notification__dismiss:hover {
  opacity: 1;
}
```

### Example Usage
```jsx
<ToastNotification
  message="Login effettuato con successo!"
  type="success"
  duration={4000}
  onDismiss={() => setToast(null)}
/>
```

---

## COMPONENT 9: LoadingSpinner

### Purpose
Spinner per loading states con accessibilità.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | Spinner size |
| color | string | No | 'currentColor' | Spinner color |
| className | string | No | '' | Additional CSS classes |

### Visual Specs
```css
.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.loading-spinner--sm {
  width: 16px;
  height: 16px;
}

.loading-spinner--md {
  width: 20px;
  height: 20px;
}

.loading-spinner--lg {
  width: 24px;
  height: 24px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### Example Usage
```jsx
<LoadingSpinner size="md" color="#3B82F6" />
```

---

## COMPONENT 10: AuthLayout

### Purpose
Layout wrapper per pagine auth con header, footer e responsive design.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Page title |
| subtitle | string | No | - | Page subtitle |
| children | ReactNode | Yes | - | Page content |
| className | string | No | '' | Additional CSS classes |

### Visual Specs
```css
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
}

.auth-layout__header {
  padding: 24px;
  text-align: center;
}

.auth-layout__logo {
  width: 120px;
  height: 40px;
  margin: 0 auto 16px;
}

.auth-layout__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-layout__card {
  width: 100%;
  max-width: 400px;
}

.auth-layout__footer {
  padding: 24px;
  text-align: center;
  color: #6B7280;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .auth-layout__content {
    padding: 16px;
  }
  
  .auth-layout__card {
    max-width: 100%;
  }
}
```

### Example Usage
```jsx
<AuthLayout
  title="Accedi al sistema"
  subtitle="Gestione sicurezza alimentare HACCP"
>
  <LoginForm />
</AuthLayout>
```

---

## IMPLEMENTATION NOTES

### State Management
- **Form State**: Use React useState per form data
- **Validation State**: Use Zod per validation
- **Error State**: Centralized error handling
- **Loading State**: Per component loading states

### Event Handling
- **Form Submit**: Prevent default, validate, submit
- **Input Change**: Real-time validation on blur
- **Error Recovery**: Clear errors on input change
- **Success Handling**: Toast + redirect

### Accessibility Implementation
- **Labels**: Every input has associated label
- **ARIA**: Proper ARIA attributes for errors
- **Keyboard**: Full keyboard navigation
- **Focus**: Visible focus management

### Performance Considerations
- **Debouncing**: 300ms debounce per validation
- **Memoization**: Memoize expensive components
- **Lazy Loading**: Lazy load auth components
- **Bundle Size**: Tree shake unused code

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per handoff ad Agente 5
