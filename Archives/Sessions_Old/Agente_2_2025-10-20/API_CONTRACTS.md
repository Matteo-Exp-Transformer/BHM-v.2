# API Contracts - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Contratti API completi per il sistema di autenticazione hardening. Tutti gli endpoint seguono principi di sicurezza:
- Messaggi di errore generici (no information leakage)
- Rate limiting integrato
- Validazione schema-based
- Audit logging automatico
- Session management sicuro

---

## Authentication Endpoints

### POST `/auth/login`

**Descrizione**: Autenticazione utente con email e password.

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "remember_me": false
}
```

#### Request Schema
```typescript
interface LoginRequest {
  email: string;           // RFC 5322 format
  password: string;        // Min 12 chars, mixed case, numbers, symbols
  remember_me?: boolean;   // Optional, default: false
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_verified": true,
      "profile": {},
      "roles": [
        {
          "role_name": "admin",
          "tenant_id": "uuid",
          "tenant_name": "Company Name",
          "permissions": ["read", "write", "admin"]
        }
      ]
    },
    "session": {
      "expires_at": "2025-01-20T15:30:00Z"
    }
  }
}
```

#### Error Responses
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request format"
  }
}

// 401 - Authentication failed
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid credentials"
  }
}

// 423 - Account locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked",
    "retry_after": 900
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "retry_after": 60
  }
}
```

#### Headers
- `Set-Cookie`: Session cookie (httpOnly, secure, sameSite=strict)
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

### POST `/auth/logout`

**Descrizione**: Logout utente e invalidazione sessione.

#### Request
```json
{}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Headers
- `Set-Cookie`: Clear session cookie

---

### POST `/auth/recovery/request`

**Descrizione**: Richiesta reset password.

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Request Schema
```typescript
interface RecoveryRequest {
  email: string;  // RFC 5322 format
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Recovery email sent if account exists"
}
```

#### Error Responses
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid email format"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many recovery requests",
    "retry_after": 300
  }
}
```

---

### POST `/auth/recovery/confirm`

**Descrizione**: Conferma reset password con token.

#### Request
```json
{
  "token": "recovery_token_here",
  "new_password": "NewSecurePassword123!"
}
```

#### Request Schema
```typescript
interface RecoveryConfirm {
  token: string;      // Recovery token
  new_password: string; // Min 12 chars, mixed case, numbers, symbols
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### Error Responses
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request format"
  }
}

// 410 - Token expired/invalid
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Recovery token is invalid or expired"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "retry_after": 60
  }
}
```

---

## Invitation Endpoints

### POST `/invites/create`

**Descrizione**: Crea invito utente (admin only).

#### Request
```json
{
  "email": "newuser@example.com",
  "role_id": "uuid",
  "tenant_id": "uuid",
  "expires_in_hours": 24
}
```

#### Request Schema
```typescript
interface CreateInvite {
  email: string;              // RFC 5322 format
  role_id: string;           // UUID of role
  tenant_id: string;         // UUID of tenant
  expires_in_hours?: number; // Default: 24, Max: 168 (7 days)
}
```

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "invite_id": "uuid",
    "email": "newuser@example.com",
    "expires_at": "2025-01-21T10:00:00Z",
    "status": "pending"
  }
}
```

#### Error Responses
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request format"
  }
}

// 403 - Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}

// 409 - User already exists
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User already exists"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many invite requests",
    "retry_after": 60
  }
}
```

---

### POST `/invites/accept`

**Descrizione**: Accetta invito e crea account.

#### Request
```json
{
  "token": "invite_token_here",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123!"
  }
}
```

#### Request Schema
```typescript
interface AcceptInvite {
  token: string;  // Invitation token
  profile: {
    first_name: string;
    last_name: string;
    password: string;  // Min 12 chars, mixed case, numbers, symbols
  };
}
```

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "profile": {
        "first_name": "John",
        "last_name": "Doe"
      }
    },
    "session": {
      "expires_at": "2025-01-20T15:30:00Z"
    }
  }
}
```

#### Error Responses
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request format"
  }
}

// 410 - Token expired/invalid
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invitation token is invalid or expired"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "retry_after": 60
  }
}
```

#### Headers
- `Set-Cookie`: Session cookie (httpOnly, secure, sameSite=strict)

---

### GET `/invites/{token}`

**Descrizione**: Verifica validità token invito (anonimo).

#### Request
```
GET /invites/abc123def456
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "valid": true,
    "email": "newuser@example.com",
    "tenant_name": "Company Name",
    "role_name": "admin",
    "expires_at": "2025-01-21T10:00:00Z"
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invitation token not found or expired"
  }
}
```

---

## Session Endpoints

### GET `/session`

**Descrizione**: Informazioni sessione corrente.

#### Request
```
GET /session
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_verified": true,
      "profile": {},
      "roles": [
        {
          "role_name": "admin",
          "tenant_id": "uuid",
          "tenant_name": "Company Name",
          "permissions": ["read", "write", "admin"]
        }
      ]
    },
    "session": {
      "created_at": "2025-01-20T10:00:00Z",
      "expires_at": "2025-01-20T15:30:00Z",
      "last_activity": "2025-01-20T12:30:00Z"
    }
  }
}
```

#### Error Response (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired session"
  }
}
```

---

### POST `/session/refresh`

**Descrizione**: Rinnova sessione corrente.

#### Request
```json
{}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "session": {
      "expires_at": "2025-01-20T16:30:00Z"
    }
  }
}
```

#### Headers
- `Set-Cookie`: Updated session cookie

---

## Common Error Model

### Error Response Structure
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message (generic)
    retry_after?: number;   // Seconds to wait before retry (rate limiting)
    correlation_id?: string; // For debugging (internal use only)
  };
}
```

### Error Codes
- `INVALID_INPUT`: Request validation failed
- `AUTH_FAILED`: Authentication failed (generic)
- `FORBIDDEN`: Insufficient permissions
- `ACCOUNT_LOCKED`: Account temporarily locked
- `TOKEN_INVALID`: Token expired or invalid
- `USER_EXISTS`: User already exists
- `RATE_LIMITED`: Rate limit exceeded
- `UNAUTHORIZED`: Invalid or expired session
- `INTERNAL_ERROR`: Server error (generic)

---

## Rate Limiting Headers

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Buckets
1. **IP-based**: 30 requests/minute
2. **User-based**: 10 requests/minute (authenticated)
3. **Endpoint-specific**: 
   - `/auth/login`: 5 attempts/minute per IP
   - `/auth/recovery/*`: 3 requests/hour per IP
   - `/invites/create`: 10 requests/hour per user

---

## Security Considerations

### Request Validation
- All inputs validated with Zod schemas
- Email format validation (RFC 5322)
- Password strength validation
- Token format validation

### Response Security
- Generic error messages (no information leakage)
- Consistent response times
- No sensitive data in responses
- Audit logging for all operations

### Session Security
- HttpOnly cookies
- Secure flag in production
- SameSite=Strict
- Short expiration with rolling renewal
- CSRF protection

### Token Security
- Cryptographically secure random tokens
- Short expiration times (15-60 minutes)
- One-time use tokens
- Secure hash storage
- Device binding (IP + User-Agent)

---

## Testing Examples

### Successful Login Flow
```bash
# 1. Login request
curl -X POST /auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# 2. Check session
curl -X GET /session \
  -H "Cookie: session=abc123"

# 3. Logout
curl -X POST /auth/logout \
  -H "Cookie: session=abc123"
```

### Invitation Flow
```bash
# 1. Create invite (admin)
curl -X POST /invites/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session=admin_session" \
  -d '{"email":"newuser@example.com","role_id":"role_uuid","tenant_id":"tenant_uuid"}'

# 2. Verify invite token
curl -X GET /invites/invite_token_here

# 3. Accept invite
curl -X POST /invites/accept \
  -H "Content-Type: application/json" \
  -d '{"token":"invite_token_here","profile":{"first_name":"John","last_name":"Doe","password":"NewPassword123!"}}'
```

### Password Recovery Flow
```bash
# 1. Request recovery
curl -X POST /auth/recovery/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Confirm recovery
curl -X POST /auth/recovery/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"recovery_token","new_password":"NewPassword123!"}'
```
