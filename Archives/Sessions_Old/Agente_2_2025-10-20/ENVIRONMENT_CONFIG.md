# Environment Configuration - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Configurazione completa delle variabili d'ambiente per il sistema di autenticazione hardening. Include tutte le chiavi segrete, configurazioni di sicurezza e impostazioni del sistema.

---

## Environment Files Structure

### .env.local (Development)
```bash
# =============================================
# DATABASE CONFIGURATION
# =============================================

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/bhm_auth
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=30000
DATABASE_SSL_MODE=require

# =============================================
# AUTHENTICATION & SECURITY
# =============================================

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here-min-32-chars
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=bhm-auth-system
JWT_AUDIENCE=bhm-users

# Session Configuration
SESSION_SECRET=your-session-secret-key-here-min-32-chars
SESSION_COOKIE_NAME=bhm_session
SESSION_COOKIE_DOMAIN=.yourdomain.com
SESSION_MAX_AGE=1800000
SESSION_ROLLING=true
SESSION_BIND_IP=false
SESSION_BIND_UA=false

# CSRF Configuration
CSRF_SECRET=your-csrf-secret-key-here-min-32-chars
CSRF_COOKIE_NAME=bhm_csrf_token
CSRF_TOKEN_LIFETIME=3600000

# Password Hashing
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_DENYLIST_ENABLED=true

# =============================================
# RATE LIMITING
# =============================================

# Rate Limiting Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STRICT_MODE=false

# IP-based Limits
RATE_LIMIT_IP_GENERAL=100
RATE_LIMIT_IP_AUTH=30
RATE_LIMIT_IP_LOGIN=5
RATE_LIMIT_IP_RECOVERY=3

# User-based Limits
RATE_LIMIT_USER_GENERAL=200
RATE_LIMIT_USER_INVITES=10

# Fingerprint-based Limits
RATE_LIMIT_FINGERPRINT=50

# Backoff Configuration
RATE_LIMIT_BACKOFF_BASE_DELAY=60
RATE_LIMIT_BACKOFF_MAX_DELAY=3600
RATE_LIMIT_BACKOFF_MULTIPLIER=2
RATE_LIMIT_BACKOFF_JITTER=true

# Lockout Thresholds
RATE_LIMIT_LOCKOUT_WARNING=3
RATE_LIMIT_LOCKOUT_TEMPORARY=5
RATE_LIMIT_LOCKOUT_EXTENDED=10
RATE_LIMIT_LOCKOUT_PERMANENT=20

# Cleanup Configuration
RATE_LIMIT_CLEANUP_INTERVAL=300
RATE_LIMIT_BUCKET_TTL=3600

# =============================================
# EMAIL CONFIGURATION
# =============================================

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password-here
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME="Business HACCP Manager"

# Email Templates
EMAIL_BASE_URL=https://yourdomain.com
EMAIL_SUPPORT_EMAIL=support@yourdomain.com
EMAIL_INVITE_TTL_HOURS=24
EMAIL_RECOVERY_TTL_MINUTES=15

# Email Security
EMAIL_TOKEN_SECRET=your-email-token-secret-here
EMAIL_RATE_LIMIT_PER_HOUR=10
EMAIL_MAX_ATTEMPTS_INVITE=3
EMAIL_MAX_ATTEMPTS_RECOVERY=1

# Email Monitoring
EMAIL_ENABLE_TRACKING=true
EMAIL_BOUNCE_HANDLING=true
EMAIL_COMPLAINT_HANDLING=true

# =============================================
# APPLICATION CONFIGURATION
# =============================================

# Application Settings
NODE_ENV=development
APP_NAME="Business HACCP Manager"
APP_VERSION=2.0.0
APP_PORT=3000
APP_HOST=localhost

# Base URLs
BASE_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://app.yourdomain.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-CSRF-Token

# =============================================
# LOGGING & MONITORING
# =============================================

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/app.log
LOG_FILE_MAX_SIZE=10m
LOG_FILE_MAX_FILES=5

# Audit Logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90

# Sentry Configuration
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=2.0.0
SENTRY_SAMPLE_RATE=1.0

# =============================================
# SECURITY CONFIGURATION
# =============================================

# Security Headers
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
HELMET_CSP_ENABLED=true

# Content Security Policy
CSP_DEFAULT_SRC='self'
CSP_SCRIPT_SRC='self' 'unsafe-inline'
CSP_STYLE_SRC='self' 'unsafe-inline'
CSP_IMG_SRC='self' data: https:
CSP_FONT_SRC='self' https:
CSP_CONNECT_SRC='self' https://your-project.supabase.co

# HSTS Configuration
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# =============================================
# DEVELOPMENT & TESTING
# =============================================

# Development Settings
DEV_MODE=true
DEV_DEBUG=true
DEV_HOT_RELOAD=true
DEV_MOCK_AUTH=false

# Testing Configuration
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/bhm_auth_test
TEST_SMTP_HOST=localhost
TEST_SMTP_PORT=1025
TEST_EMAIL_DOMAIN=test.local

# Test Data
TEST_ADMIN_EMAIL=admin@test.local
TEST_ADMIN_PASSWORD=TestAdmin123!
TEST_USER_EMAIL=user@test.local
TEST_USER_PASSWORD=TestUser123!

# =============================================
# FEATURE FLAGS
# =============================================

# Feature Toggles
FEATURE_MFA_ENABLED=false
FEATURE_SSO_ENABLED=false
FEATURE_DEVICE_TRUST_ENABLED=false
FEATURE_ADVANCED_ANALYTICS=false

# Experimental Features
EXPERIMENTAL_WEBAUTHN=false
EXPERIMENTAL_BIOMETRIC_AUTH=false
EXPERIMENTAL_ADAPTIVE_AUTH=false
```

### .env.production (Production)
```bash
# =============================================
# DATABASE CONFIGURATION
# =============================================

# Supabase Configuration (Production)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Database Connection (Production)
DATABASE_URL=postgresql://user:password@prod-db:5432/bhm_auth_prod
DATABASE_POOL_SIZE=20
DATABASE_POOL_TIMEOUT=30000
DATABASE_SSL_MODE=require

# =============================================
# AUTHENTICATION & SECURITY (Production)
# =============================================

# JWT Configuration (Production)
JWT_SECRET=your-production-jwt-secret-min-64-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=bhm-auth-production
JWT_AUDIENCE=bhm-users-prod

# Session Configuration (Production)
SESSION_SECRET=your-production-session-secret-min-64-chars
SESSION_COOKIE_NAME=bhm_session
SESSION_COOKIE_DOMAIN=.yourdomain.com
SESSION_MAX_AGE=900000
SESSION_ROLLING=true
SESSION_BIND_IP=true
SESSION_BIND_UA=true

# CSRF Configuration (Production)
CSRF_SECRET=your-production-csrf-secret-min-64-chars
CSRF_COOKIE_NAME=bhm_csrf_token
CSRF_TOKEN_LIFETIME=1800000

# Password Hashing (Production)
BCRYPT_ROUNDS=14
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_DENYLIST_ENABLED=true

# =============================================
# RATE LIMITING (Production)
# =============================================

# Rate Limiting Configuration (Production)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STRICT_MODE=true

# IP-based Limits (Production)
RATE_LIMIT_IP_GENERAL=60
RATE_LIMIT_IP_AUTH=20
RATE_LIMIT_IP_LOGIN=3
RATE_LIMIT_IP_RECOVERY=2

# User-based Limits (Production)
RATE_LIMIT_USER_GENERAL=100
RATE_LIMIT_USER_INVITES=5

# Fingerprint-based Limits (Production)
RATE_LIMIT_FINGERPRINT=30

# Backoff Configuration (Production)
RATE_LIMIT_BACKOFF_BASE_DELAY=120
RATE_LIMIT_BACKOFF_MAX_DELAY=7200
RATE_LIMIT_BACKOFF_MULTIPLIER=2
RATE_LIMIT_BACKOFF_JITTER=true

# Lockout Thresholds (Production)
RATE_LIMIT_LOCKOUT_WARNING=2
RATE_LIMIT_LOCKOUT_TEMPORARY=3
RATE_LIMIT_LOCKOUT_EXTENDED=5
RATE_LIMIT_LOCKOUT_PERMANENT=10

# =============================================
# EMAIL CONFIGURATION (Production)
# =============================================

# SMTP Configuration (Production)
SMTP_HOST=smtp.production.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-production-smtp-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME="Business HACCP Manager"

# Email Templates (Production)
EMAIL_BASE_URL=https://yourdomain.com
EMAIL_SUPPORT_EMAIL=support@yourdomain.com
EMAIL_INVITE_TTL_HOURS=12
EMAIL_RECOVERY_TTL_MINUTES=10

# Email Security (Production)
EMAIL_TOKEN_SECRET=your-production-email-token-secret
EMAIL_RATE_LIMIT_PER_HOUR=5
EMAIL_MAX_ATTEMPTS_INVITE=2
EMAIL_MAX_ATTEMPTS_RECOVERY=1

# =============================================
# APPLICATION CONFIGURATION (Production)
# =============================================

# Application Settings (Production)
NODE_ENV=production
APP_NAME="Business HACCP Manager"
APP_VERSION=2.0.0
APP_PORT=3000
APP_HOST=0.0.0.0

# Base URLs (Production)
BASE_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com

# CORS Configuration (Production)
CORS_ORIGIN=https://app.yourdomain.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-CSRF-Token

# =============================================
# LOGGING & MONITORING (Production)
# =============================================

# Logging Configuration (Production)
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/bhm/app.log
LOG_FILE_MAX_SIZE=50m
LOG_FILE_MAX_FILES=10

# Audit Logging (Production)
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=warn
AUDIT_LOG_RETENTION_DAYS=365

# Sentry Configuration (Production)
SENTRY_DSN=your-production-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=2.0.0
SENTRY_SAMPLE_RATE=0.1

# =============================================
# SECURITY CONFIGURATION (Production)
# =============================================

# Security Headers (Production)
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
HELMET_CSP_ENABLED=true

# Content Security Policy (Production)
CSP_DEFAULT_SRC='self'
CSP_SCRIPT_SRC='self'
CSP_STYLE_SRC='self'
CSP_IMG_SRC='self' data: https:
CSP_FONT_SRC='self' https:
CSP_CONNECT_SRC='self' https://your-production-project.supabase.co

# HSTS Configuration (Production)
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# =============================================
# PRODUCTION SETTINGS
# =============================================

# Production Settings
DEV_MODE=false
DEV_DEBUG=false
DEV_HOT_RELOAD=false
DEV_MOCK_AUTH=false

# Feature Flags (Production)
FEATURE_MFA_ENABLED=true
FEATURE_SSO_ENABLED=false
FEATURE_DEVICE_TRUST_ENABLED=true
FEATURE_ADVANCED_ANALYTICS=true

# Experimental Features (Production)
EXPERIMENTAL_WEBAUTHN=false
EXPERIMENTAL_BIOMETRIC_AUTH=false
EXPERIMENTAL_ADAPTIVE_AUTH=false
```

---

## Secret Management

### Secret Generation Guidelines
```bash
# Generate secure secrets (minimum 32 characters)
# JWT Secret (64 characters recommended for production)
openssl rand -hex 32

# Session Secret (64 characters recommended for production)
openssl rand -hex 32

# CSRF Secret (32 characters minimum)
openssl rand -hex 16

# Email Token Secret (32 characters minimum)
openssl rand -hex 16

# Database Password (32 characters minimum)
openssl rand -base64 32

# SMTP Password (16 characters minimum)
openssl rand -base64 12
```

### Secret Rotation Strategy
```typescript
interface SecretRotationConfig {
  // Rotation intervals
  jwtSecret: '90d';        // 90 days
  sessionSecret: '30d';    // 30 days
  csrfSecret: '7d';        // 7 days
  emailTokenSecret: '30d'; // 30 days
  
  // Rotation methods
  methods: {
    jwtSecret: 'rolling';      // Rolling update with overlap
    sessionSecret: 'immediate'; // Immediate replacement
    csrfSecret: 'graceful';    // Graceful transition
    emailTokenSecret: 'rolling'; // Rolling update
  };
  
  // Backup and rollback
  backup: {
    enabled: true;
    retention: '7d';
    encryption: true;
  };
}
```

---

## Environment Validation

### Configuration Validation
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(32),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().min(1).max(65535),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(8),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  BASE_URL: z.string().url(),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.coerce.boolean(),
  RATE_LIMIT_IP_LOGIN: z.coerce.number().min(1).max(100),
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15),
  PASSWORD_MIN_LENGTH: z.coerce.number().min(8).max(32),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
};
```

### Environment Health Check
```typescript
class EnvironmentHealthCheck {
  async checkDatabase(): Promise<boolean> {
    try {
      await db.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
  
  async checkSMTP(): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransporter(smtpConfig);
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
  
  async checkRedis(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      console.error('Redis connection failed:', error);
      return false;
    }
  }
  
  async runHealthCheck(): Promise<HealthCheckResult> {
    const results = {
      database: await this.checkDatabase(),
      smtp: await this.checkSMTP(),
      redis: await this.checkRedis(),
      timestamp: new Date().toISOString()
    };
    
    const healthy = Object.values(results).every(
      (result) => typeof result === 'boolean' ? result : true
    );
    
    return {
      healthy,
      results,
      message: healthy ? 'All systems healthy' : 'Some systems unhealthy'
    };
  }
}
```

---

## Docker Configuration

### Docker Compose Environment
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - CSRF_SECRET=${CSRF_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=bhm_auth_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

volumes:
  postgres_data:
```

### Kubernetes ConfigMap and Secret
```yaml
# k8s-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bhm-auth-config
data:
  NODE_ENV: "production"
  APP_NAME: "Business HACCP Manager"
  APP_VERSION: "2.0.0"
  LOG_LEVEL: "info"
  RATE_LIMIT_ENABLED: "true"
  AUDIT_LOG_ENABLED: "true"

---
# k8s-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: bhm-auth-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  SESSION_SECRET: <base64-encoded-secret>
  CSRF_SECRET: <base64-encoded-secret>
  SMTP_PASS: <base64-encoded-password>
  DB_PASSWORD: <base64-encoded-password>
```

---

## Security Considerations

### Environment Security
```typescript
const SECURITY_REQUIREMENTS = {
  // Secret strength
  secrets: {
    minLength: 32,
    recommendedLength: 64,
    characterSet: 'alphanumeric+symbols',
    entropy: 'high'
  },
  
  // Environment isolation
  isolation: {
    development: 'separate-database',
    staging: 'separate-database',
    production: 'isolated-infrastructure'
  },
  
  // Access control
  access: {
    development: 'team-access',
    staging: 'limited-access',
    production: 'admin-only'
  },
  
  // Monitoring
  monitoring: {
    logAccess: true,
    alertOnChanges: true,
    auditTrail: true
  }
};
```

### Compliance Requirements
```typescript
const COMPLIANCE_CONFIG = {
  gdpr: {
    dataRetention: '90d',
    auditLogging: true,
    dataEncryption: true,
    userConsent: true
  },
  
  iso27001: {
    accessControl: true,
    auditTrail: true,
    incidentResponse: true,
    riskAssessment: true
  },
  
  sox: {
    auditLogging: true,
    dataIntegrity: true,
    accessControl: true,
    changeManagement: true
  }
};
```
