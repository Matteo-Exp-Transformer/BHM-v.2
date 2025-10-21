# API Specification v1.0 - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0  
**Base URL**: `https://api.yourdomain.com`

## Overview

Specifica API completa per il sistema di autenticazione hardening. Include tutti gli endpoint, schemi request/response, error handling e rate limiting.

---

## Authentication Endpoints

### POST `/auth/login`

**Descrizione**: Autenticazione utente con email e password.

#### Request Schema
```typescript
interface LoginRequest {
  email: string;           // RFC 5322 format, required
  password: string;        // Min 12 chars, letters only, required
  remember_me?: boolean;   // Optional, default: false
}
```

#### Request Example
```json
{
  "email": "user@example.com",
  "password": "MySecurePassword",
  "remember_me": false
}
```

#### Success Response (200)
```typescript
interface LoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      email_verified: boolean;
      profile: {
        first_name?: string;
        last_name?: string;
      };
      roles: Array<{
        role_id: string;
        role_name: string;
        tenant_id: string;
        tenant_name: string;
        permissions: string[];
        assigned_at: string;
        expires_at?: string;
      }>;
    };
    session: {
      id: string;
      expires_at: string;
      csrf_token: string;
    };
  };
}
```

#### Response Headers
```
Set-Cookie: bhm_session=session_token; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
Set-Cookie: bhm_csrf_token=csrf_token; Secure; SameSite=Strict; Path=/; Max-Age=1800
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200
X-Correlation-ID: uuid
```

#### Error Responses
```typescript
// 400 - Invalid input
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    correlation_id: string;
  };
}

// 401 - Authentication failed
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid credentials",
    "correlation_id": "uuid"
  }
}

// 423 - Account locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked",
    "correlation_id": "uuid",
    "retry_after": 600
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "correlation_id": "uuid",
    "retry_after": 300
  }
}
```

#### Rate Limiting
- **Account**: 5 attempts per 5 minutes
- **IP**: 30 requests per 5 minutes
- **UA**: 20 requests per 5 minutes

---

### POST `/auth/logout`

**Descrizione**: Logout utente e invalidazione sessione.

#### Request Schema
```typescript
interface LogoutRequest {
  // Empty body
}
```

#### Request Headers
```
X-CSRF-Token: csrf_token  // Required
Cookie: bhm_session=session_token
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "correlation_id": "uuid"
}
```

#### Response Headers
```
Set-Cookie: bhm_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: bhm_csrf_token=; Secure; SameSite=Strict; Path=/; Max-Age=0
```

#### Error Responses
```typescript
// 403 - CSRF token missing/invalid
{
  "success": false,
  "error": {
    "code": "CSRF_TOKEN_MISSING",
    "message": "CSRF token required",
    "correlation_id": "uuid"
  }
}

// 401 - Invalid session
{
  "success": false,
  "error": {
    "code": "INVALID_SESSION",
    "message": "Invalid or expired session",
    "correlation_id": "uuid"
  }
}
```

#### Rate Limiting
- **Account**: 10 requests per 5 minutes
- **IP**: 50 requests per 5 minutes

---

## Password Recovery Endpoints

### POST `/auth/recovery/request`

**Descrizione**: Richiesta reset password.

#### Request Schema
```typescript
interface RecoveryRequestRequest {
  email: string;  // RFC 5322 format, required
}
```

#### Request Example
```json
{
  "email": "user@example.com"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Recovery email sent if account exists",
  "correlation_id": "uuid"
}
```

#### Error Responses
```typescript
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid email format",
    "correlation_id": "uuid"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many recovery requests",
    "correlation_id": "uuid",
    "retry_after": 300
  }
}
```

#### Rate Limiting
- **Account**: 3 requests per 5 minutes
- **IP**: 10 requests per 5 minutes

---

### POST `/auth/recovery/confirm`

**Descrizione**: Conferma reset password con token.

#### Request Schema
```typescript
interface RecoveryConfirmRequest {
  token: string;      // Recovery token, required
  new_password: string; // Min 12 chars, letters only, required
}
```

#### Request Example
```json
{
  "token": "recovery_token_here",
  "new_password": "NewSecurePassword"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully",
  "correlation_id": "uuid"
}
```

#### Error Responses
```typescript
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request format",
    "correlation_id": "uuid"
  }
}

// 410 - Token expired/invalid
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Recovery token is invalid or expired",
    "correlation_id": "uuid"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "correlation_id": "uuid",
    "retry_after": 300
  }
}
```

#### Rate Limiting
- **IP**: 5 attempts per 5 minutes
- **Token**: 1 use only

---

## Invitation Endpoints

### POST `/invites/create`

**Descrizione**: Crea invito utente (admin only).

#### Request Schema
```typescript
interface CreateInviteRequest {
  email: string;              // RFC 5322 format, required
  role_id: string;           // UUID of role, required
  tenant_id: string;         // UUID of tenant, required
  expires_in_hours?: number; // Default: 12, Max: 168 (7 days)
}
```

#### Request Headers
```
X-CSRF-Token: csrf_token  // Required
Cookie: bhm_session=session_token
Authorization: Bearer session_token
```

#### Request Example
```json
{
  "email": "newuser@example.com",
  "role_id": "role-admin-uuid",
  "tenant_id": "tenant-uuid",
  "expires_in_hours": 24
}
```

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "invite_id": "uuid",
    "email": "newuser@example.com",
    "role_name": "admin",
    "tenant_name": "Company Name",
    "expires_at": "2025-01-21T10:00:00Z",
    "status": "pending"
  },
  "correlation_id": "uuid"
}
```

#### Error Responses
```typescript
// 403 - Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "correlation_id": "uuid"
  }
}

// 409 - User already exists
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User already exists",
    "correlation_id": "uuid"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many invite requests",
    "correlation_id": "uuid",
    "retry_after": 300
  }
}
```

#### Rate Limiting
- **User**: 10 requests per hour
- **IP**: 20 requests per hour

---

### POST `/invites/accept`

**Descrizione**: Accetta invito e crea account.

#### Request Schema
```typescript
interface AcceptInviteRequest {
  token: string;  // Invitation token, required
  profile: {
    first_name: string;  // Required
    last_name: string;   // Required
    password: string;    // Min 12 chars, letters only, required
  };
}
```

#### Request Example
```json
{
  "token": "invite_token_here",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123"
  }
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
      "id": "uuid",
      "expires_at": "2025-01-20T15:30:00Z",
      "csrf_token": "csrf_token"
    }
  },
  "correlation_id": "uuid"
}
```

#### Response Headers
```
Set-Cookie: bhm_session=session_token; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
Set-Cookie: bhm_csrf_token=csrf_token; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

#### Error Responses
```typescript
// 410 - Token expired/invalid
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invitation token is invalid or expired",
    "correlation_id": "uuid"
  }
}

// 429 - Rate limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts",
    "correlation_id": "uuid",
    "retry_after": 300
  }
}
```

#### Rate Limiting
- **IP**: 5 attempts per 5 minutes
- **Token**: 3 attempts max

---

### GET `/invites/{token}`

**Descrizione**: Verifica validità token invito (anonimo).

#### Request Example
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
    "message": "Invitation token not found or expired",
    "correlation_id": "uuid"
  }
}
```

---

## Session Endpoints

### GET `/session`

**Descrizione**: Informazioni sessione corrente.

#### Request Headers
```
Cookie: bhm_session=session_token
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
      "profile": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "roles": [
        {
          "role_id": "uuid",
          "role_name": "admin",
          "tenant_id": "uuid",
          "tenant_name": "Company Name",
          "permissions": ["read", "write", "admin"],
          "assigned_at": "2025-01-20T10:00:00Z"
        }
      ]
    },
    "session": {
      "id": "uuid",
      "created_at": "2025-01-20T10:00:00Z",
      "expires_at": "2025-01-20T15:30:00Z",
      "last_activity": "2025-01-20T12:30:00Z"
    }
  },
  "correlation_id": "uuid"
}
```

#### Error Response (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired session",
    "correlation_id": "uuid"
  }
}
```

---

### POST `/session/refresh`

**Descrizione**: Rinnova sessione corrente.

#### Request Headers
```
X-CSRF-Token: csrf_token  // Required
Cookie: bhm_session=session_token
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "expires_at": "2025-01-20T16:30:00Z"
    }
  },
  "correlation_id": "uuid"
}
```

#### Response Headers
```
Set-Cookie: bhm_session=new_session_token; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
Set-Cookie: bhm_csrf_token=new_csrf_token; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

---

## Common Error Model

### Error Response Structure
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message (generic)
    correlation_id: string; // For debugging (internal use only)
    retry_after?: number;   // Seconds to wait before retry (rate limiting)
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
- `CSRF_TOKEN_MISSING`: CSRF token required
- `CSRF_TOKEN_INVALID`: Invalid CSRF token
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

### Rate Limit Configuration
```typescript
interface RateLimitConfig {
  account: {
    attempts: 5;
    window: 300; // 5 minutes
    lock: 600;   // 10 minutes
  };
  ip: {
    requests: 30;
    window: 300; // 5 minutes
    lock: 600;   // 10 minutes
  };
  ua: {
    requests: 20;
    window: 300; // 5 minutes
  };
}
```

---

## Security Considerations

### Request Validation
- All inputs validated with Zod schemas
- Email format validation (RFC 5322)
- Password strength validation (letters only, min 12 chars)
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
- Short expiration (30 min) with rolling renewal
- CSRF protection with double-submit pattern

### Token Security
- Cryptographically secure random tokens
- Short expiration times (15-60 minutes)
- One-time use tokens
- Secure hash storage
- Device binding (IP + User-Agent)

---

## Performance Requirements

### Backend Performance
- **p50**: < 300 ms per endpoint
- **p95**: < 600 ms per endpoint
- **p99**: < 1200 ms per endpoint

### End-to-End Performance
- **Login flow**: ≤ 2 seconds total
- **Recovery flow**: ≤ 3 seconds total
- **Invite flow**: ≤ 2 seconds total

### Rate Limiting Overhead
- **CPU overhead**: < 5% on target load
- **Memory overhead**: < 10MB for rate limit buckets
- **Cleanup interval**: Every 5 minutes

---

## Testing Examples

### Successful Login Flow
```bash
# 1. Login request
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MySecurePassword"}'

# 2. Check session
curl -X GET https://api.yourdomain.com/session \
  -H "Cookie: bhm_session=session_token"

# 3. Logout
curl -X POST https://api.yourdomain.com/auth/logout \
  -H "X-CSRF-Token: csrf_token" \
  -H "Cookie: bhm_session=session_token"
```

### Invitation Flow
```bash
# 1. Create invite (admin)
curl -X POST https://api.yourdomain.com/invites/create \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: csrf_token" \
  -H "Cookie: bhm_session=admin_session" \
  -d '{"email":"newuser@example.com","role_id":"role-uuid","tenant_id":"tenant-uuid"}'

# 2. Verify invite token
curl -X GET https://api.yourdomain.com/invites/invite_token_here

# 3. Accept invite
curl -X POST https://api.yourdomain.com/invites/accept \
  -H "Content-Type: application/json" \
  -d '{"token":"invite_token_here","profile":{"first_name":"John","last_name":"Doe","password":"NewPassword123"}}'
```

### Password Recovery Flow
```bash
# 1. Request recovery
curl -X POST https://api.yourdomain.com/auth/recovery/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Confirm recovery
curl -X POST https://api.yourdomain.com/auth/recovery/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"recovery_token","new_password":"NewPassword123"}'
```
