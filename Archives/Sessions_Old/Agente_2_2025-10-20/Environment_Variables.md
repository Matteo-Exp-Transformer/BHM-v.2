# Environment Variables - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Elenco completo delle variabili d'ambiente richieste per il sistema di autenticazione hardening. Include solo i nomi delle variabili senza valori per motivi di sicurezza.

---

## Database Configuration

### PostgreSQL Connection
```bash
# Database connection
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# Connection pool settings
DB_POOL_MIN=
DB_POOL_MAX=
DB_POOL_IDLE_TIMEOUT=
DB_POOL_ACQUIRE_TIMEOUT=
```

### Supabase Configuration
```bash
# Supabase project settings
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
```

---

## Authentication & Security

### JWT Configuration
```bash
# JWT signing
JWT_SECRET=
JWT_ISSUER=
JWT_AUDIENCE=
JWT_EXPIRES_IN=

# Session configuration
SESSION_SECRET=
SESSION_EXPIRES_IN=
SESSION_ROTATION_INTERVAL=
```

### Password Policy
```bash
# Password hashing
BCRYPT_ROUNDS=
PASSWORD_MIN_LENGTH=
PASSWORD_MAX_LENGTH=

# Password policy enforcement
PASSWORD_POLICY_ENABLED=
PASSWORD_DENYLIST_FILE=
```

### CSRF Protection
```bash
# CSRF token configuration
CSRF_SECRET=
CSRF_TOKEN_LENGTH=
CSRF_COOKIE_NAME=
CSRF_HEADER_NAME=
```

---

## Rate Limiting

### Rate Limit Configuration
```bash
# General rate limiting
RATE_LIMIT_ENABLED=
RATE_LIMIT_WINDOW_MS=
RATE_LIMIT_CLEANUP_INTERVAL_MS=

# Account-based rate limiting
ACCOUNT_RATE_LIMIT_ATTEMPTS=
ACCOUNT_RATE_LIMIT_WINDOW_MINUTES=
ACCOUNT_LOCKOUT_DURATION_MINUTES=

# IP-based rate limiting
IP_RATE_LIMIT_REQUESTS=
IP_RATE_LIMIT_WINDOW_MINUTES=
IP_LOCKOUT_DURATION_MINUTES=

# User Agent rate limiting
UA_RATE_LIMIT_REQUESTS=
UA_RATE_LIMIT_WINDOW_MINUTES=
```

### Progressive Backoff
```bash
# Backoff configuration
BACKOFF_ENABLED=
BACKOFF_BASE_DELAY_MS=
BACKOFF_MAX_DELAY_MS=
BACKOFF_MULTIPLIER=
BACKOFF_MAX_VIOLATIONS=
```

---

## Email Configuration

### SMTP Settings
```bash
# SMTP server configuration
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=
```

### Email Templates
```bash
# Template configuration
EMAIL_TEMPLATE_DIR=
EMAIL_INVITE_TEMPLATE=
EMAIL_RECOVERY_TEMPLATE=
EMAIL_BASE_URL=
```

### Token Configuration
```bash
# Token settings
INVITE_TOKEN_LENGTH=
INVITE_TOKEN_EXPIRES_HOURS=
RECOVERY_TOKEN_LENGTH=
RECOVERY_TOKEN_EXPIRES_MINUTES=
TOKEN_HASH_ALGORITHM=
```

---

## Session Management

### Cookie Configuration
```bash
# Cookie settings
COOKIE_SECURE=
COOKIE_SAME_SITE=
COOKIE_DOMAIN=
COOKIE_PATH=
COOKIE_HTTP_ONLY=

# Session cookie names
SESSION_COOKIE_NAME=
CSRF_COOKIE_NAME=
```

### Session Security
```bash
# Session rotation
SESSION_ROTATION_ENABLED=
SESSION_ROTATION_TRIGGERS=
SESSION_IDLE_TIMEOUT_MINUTES=
SESSION_ABSOLUTE_TIMEOUT_MINUTES=
```

---

## External Services

### Monitoring & Logging
```bash
# Sentry configuration
SENTRY_DSN=
SENTRY_ENVIRONMENT=
SENTRY_RELEASE=
SENTRY_SAMPLE_RATE=

# Logging configuration
LOG_LEVEL=
LOG_FORMAT=
LOG_FILE_PATH=
LOG_MAX_SIZE_MB=
LOG_MAX_FILES=
```

### Analytics
```bash
# Analytics configuration
ANALYTICS_ENABLED=
ANALYTICS_TRACKING_ID=
ANALYTICS_EVENTS_ENABLED=
```

---

## Application Configuration

### Server Settings
```bash
# Server configuration
NODE_ENV=
PORT=
HOST=
CORS_ORIGIN=
CORS_CREDENTIALS=
CORS_METHODS=
CORS_HEADERS=
```

### Feature Flags
```bash
# Feature toggles
FEATURE_PASSWORD_RECOVERY=
FEATURE_USER_INVITES=
FEATURE_SESSION_ROTATION=
FEATURE_CSRF_PROTECTION=
FEATURE_RATE_LIMITING=
FEATURE_AUDIT_LOGGING=
FEATURE_MULTI_TENANT=
```

### Performance Settings
```bash
# Performance configuration
CACHE_ENABLED=
CACHE_TTL_SECONDS=
CACHE_MAX_SIZE_MB=
CACHE_CLEANUP_INTERVAL_MS=

# Database performance
DB_QUERY_TIMEOUT_MS=
DB_CONNECTION_TIMEOUT_MS=
DB_STATEMENT_TIMEOUT_MS=
```

---

## Security Headers

### Security Configuration
```bash
# Security headers
SECURITY_HEADERS_ENABLED=
HSTS_ENABLED=
HSTS_MAX_AGE_SECONDS=
CSP_ENABLED=
CSP_POLICY=
X_FRAME_OPTIONS=
X_CONTENT_TYPE_OPTIONS=
REFERRER_POLICY=
```

### Content Security Policy
```bash
# CSP configuration
CSP_DEFAULT_SRC=
CSP_SCRIPT_SRC=
CSP_STYLE_SRC=
CSP_IMG_SRC=
CSP_FONT_SRC=
CSP_CONNECT_SRC=
CSP_FRAME_SRC=
CSP_OBJECT_SRC=
CSP_BASE_URI=
CSP_FORM_ACTION=
CSP_FRAME_ANCESTORS=
CSP_UPGRADE_INSECURE_REQUESTS=
```

---

## Development & Testing

### Development Settings
```bash
# Development configuration
DEV_MODE=
DEBUG_ENABLED=
DEBUG_LOG_LEVEL=
DEBUG_LOG_SQL=
DEBUG_LOG_RATE_LIMITS=
DEBUG_LOG_SESSIONS=
```

### Testing Configuration
```bash
# Test environment
TEST_DATABASE_URL=
TEST_SMTP_HOST=
TEST_SMTP_PORT=
TEST_EMAIL_DOMAIN=
TEST_RATE_LIMIT_DISABLED=
TEST_CSRF_DISABLED=
```

### Mock Services
```bash
# Mock configuration for testing
MOCK_SMTP_ENABLED=
MOCK_EMAIL_DIR=
MOCK_SENTRY_ENABLED=
MOCK_ANALYTICS_ENABLED=
```

---

## Multi-Tenant Configuration

### Tenant Settings
```bash
# Multi-tenant configuration
MULTI_TENANT_ENABLED=
DEFAULT_TENANT_ID=
TENANT_ISOLATION_LEVEL=
TENANT_CACHE_ENABLED=
TENANT_CACHE_TTL_SECONDS=
```

### Tenant-Specific Settings
```bash
# Tenant customization
TENANT_CUSTOM_DOMAINS_ENABLED=
TENANT_BRANDING_ENABLED=
TENANT_SETTINGS_CACHE_ENABLED=
TENANT_SETTINGS_CACHE_TTL_SECONDS=
```

---

## Backup & Recovery

### Backup Configuration
```bash
# Database backup
BACKUP_ENABLED=
BACKUP_SCHEDULE=
BACKUP_RETENTION_DAYS=
BACKUP_STORAGE_TYPE=
BACKUP_STORAGE_PATH=
BACKUP_ENCRYPTION_ENABLED=
BACKUP_ENCRYPTION_KEY=
```

### Recovery Settings
```bash
# Recovery configuration
RECOVERY_ENABLED=
RECOVERY_MAX_ATTEMPTS=
RECOVERY_COOLDOWN_MINUTES=
RECOVERY_TOKEN_ENTROPY=
```

---

## Environment-Specific Configurations

### Production Environment
```bash
# Production-specific settings
PROD_SSL_ENABLED=
PROD_SSL_CERT_PATH=
PROD_SSL_KEY_PATH=
PROD_SSL_CA_PATH=
PROD_REDIS_URL=
PROD_CACHE_REDIS_ENABLED=
PROD_CDN_URL=
PROD_STATIC_ASSETS_URL=
```

### Staging Environment
```bash
# Staging-specific settings
STAGING_DEBUG_ENABLED=
STAGING_MOCK_SERVICES=
STAGING_TEST_DATA_ENABLED=
STAGING_EMAIL_REDIRECT=
```

### Development Environment
```bash
# Development-specific settings
DEV_HOT_RELOAD=
DEV_SOURCE_MAPS=
DEV_PROXY_ENABLED=
DEV_PROXY_TARGET=
DEV_MOCK_AUTH=
DEV_SKIP_EMAIL_VERIFICATION=
```

---

## Validation Rules

### Environment Variable Validation
```typescript
// Required variables for production
const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'CSRF_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SENTRY_DSN'
];

// Optional variables with defaults
const OPTIONAL_VARS = {
  'PORT': '3000',
  'NODE_ENV': 'production',
  'LOG_LEVEL': 'info',
  'RATE_LIMIT_ENABLED': 'true',
  'CSRF_PROTECTION_ENABLED': 'true',
  'SESSION_ROTATION_ENABLED': 'true',
  'PASSWORD_POLICY_ENABLED': 'true',
  'MULTI_TENANT_ENABLED': 'true',
  'AUDIT_LOGGING_ENABLED': 'true'
};

// Validation rules
const VALIDATION_RULES = {
  'PORT': /^\d+$/,
  'LOG_LEVEL': /^(error|warn|info|debug|trace)$/,
  'NODE_ENV': /^(development|staging|production|test)$/,
  'DATABASE_URL': /^postgres:\/\/.+/,
  'SMTP_PORT': /^\d+$/,
  'BCRYPT_ROUNDS': /^\d+$/
};
```

---

## Configuration File Structure

### .env.local Example
```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/bhm_auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
CSRF_SECRET=your-csrf-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Feature Flags
FEATURE_PASSWORD_RECOVERY=true
FEATURE_USER_INVITES=true
FEATURE_SESSION_ROTATION=true
FEATURE_CSRF_PROTECTION=true
FEATURE_RATE_LIMITING=true
FEATURE_AUDIT_LOGGING=true
FEATURE_MULTI_TENANT=true
```

---

## Security Notes

### Sensitive Variables
The following variables contain sensitive information and should be:
- Never committed to version control
- Stored in secure environment variable management systems
- Rotated regularly
- Access restricted to authorized personnel only

```bash
# Highly sensitive - requires encryption at rest
JWT_SECRET=
SESSION_SECRET=
CSRF_SECRET=
DATABASE_PASSWORD=
SMTP_PASSWORD=
SUPABASE_SERVICE_ROLE_KEY=
BACKUP_ENCRYPTION_KEY=
```

### Environment Validation
All environment variables should be validated at application startup:
- Required variables must be present
- Format validation for structured values
- Range validation for numeric values
- Enum validation for predefined options
- Fail fast if validation fails

### Secrets Management
For production environments, consider using:
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- Kubernetes Secrets

---

## Documentation References

### Related Documentation
- [API Specification v1.0](./API_Spec_v1.md)
- [System Diagram](./System_Diagram_Auth.md)
- [Test Plan](./Test_Plan_Technico.md)
- [Rollout Plan](./ROLLOUT_PLAN.md)

### External Resources
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
