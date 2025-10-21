# Rate Limiting Strategy - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Strategia di rate limiting multi-bucket per proteggere il sistema di autenticazione da attacchi brute-force e abuse. Implementa sliding window con backoff progressivo e gestione intelligente dei lockout.

---

## Architecture

### Multi-Bucket System
Il sistema utilizza 3 bucket principali che si sovrappongono per massima protezione:

1. **IP Bucket**: Limita per indirizzo IP
2. **User Bucket**: Limita per utente autenticato
3. **Fingerprint Bucket**: Limita per combinazione IP + User-Agent

### Bucket Types
```typescript
enum BucketType {
  IP = 'ip',                    // Per indirizzo IP
  USER = 'user',               // Per utente autenticato
  FINGERPRINT = 'fingerprint'   // Per fingerprint device
}
```

---

## Rate Limits Configuration

### Default Thresholds

#### IP-Based Limits
```typescript
const IP_LIMITS = {
  // General API calls
  general: {
    requests: 100,        // per minuto
    window: 60,          // secondi
    burst: 20            // burst allowance
  },
  
  // Authentication endpoints
  auth: {
    requests: 30,        // per minuto
    window: 60,          // secondi
    burst: 5             // burst allowance
  },
  
  // Login specific
  login: {
    requests: 5,         // per minuto
    window: 60,          // secondi
    burst: 2             // burst allowance
  },
  
  // Recovery endpoints
  recovery: {
    requests: 3,         // per ora
    window: 3600,        // secondi
    burst: 1             // burst allowance
  }
};
```

#### User-Based Limits (Authenticated)
```typescript
const USER_LIMITS = {
  // General API calls
  general: {
    requests: 200,       // per minuto
    window: 60,          // secondi
    burst: 50            // burst allowance
  },
  
  // Invite creation
  invites: {
    requests: 10,        // per ora
    window: 3600,        // secondi
    burst: 3             // burst allowance
  }
};
```

#### Fingerprint-Based Limits
```typescript
const FINGERPRINT_LIMITS = {
  // Device-based protection
  device: {
    requests: 50,        // per minuto
    window: 60,          // secondi
    burst: 10            // burst allowance
  }
};
```

---

## Backoff Strategy

### Progressive Backoff
Il sistema implementa backoff esponenziale con jitter per evitare thundering herd:

```typescript
interface BackoffConfig {
  baseDelay: number;      // Delay iniziale in secondi
  maxDelay: number;       // Delay massimo in secondi
  multiplier: number;     // Moltiplicatore per backoff
  jitter: boolean;        // Aggiunge randomizzazione
}

const BACKOFF_CONFIG: Record<string, BackoffConfig> = {
  login: {
    baseDelay: 60,        // 1 minuto
    maxDelay: 3600,       // 1 ora
    multiplier: 2,        // Raddoppia ad ogni violazione
    jitter: true          // ±20% randomizzazione
  },
  
  recovery: {
    baseDelay: 300,       // 5 minuti
    maxDelay: 7200,       // 2 ore
    multiplier: 1.5,      // Incremento più graduale
    jitter: true
  },
  
  general: {
    baseDelay: 30,        // 30 secondi
    maxDelay: 1800,       // 30 minuti
    multiplier: 2,
    jitter: true
  }
};
```

### Lockout Levels
```typescript
enum LockoutLevel {
  WARNING = 'warning',      // Avviso, no blocco
  TEMPORARY = 'temporary',  // Blocco temporaneo
  EXTENDED = 'extended',    // Blocco esteso
  PERMANENT = 'permanent'   // Blocco permanente (richiede intervento admin)
}

interface LockoutConfig {
  level: LockoutLevel;
  duration: number;         // Durata in secondi
  threshold: number;        // Soglia violazioni
  escalation: boolean;      // Se può escalare al livello successivo
}
```

---

## Implementation Details

### Bucket Management
```sql
-- Rate limit bucket structure
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_key VARCHAR(255) NOT NULL,     -- IP, user_id, o fingerprint
    bucket_type VARCHAR(50) NOT NULL,     -- 'ip', 'user', 'fingerprint'
    endpoint VARCHAR(100),                -- Endpoint specifico (opzionale)
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '1 minute',
    blocked_until TIMESTAMPTZ,
    lockout_level VARCHAR(20) DEFAULT 'warning',
    violation_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_key, bucket_type, endpoint, window_start)
);
```

### Rate Limiting Algorithm
```typescript
class RateLimiter {
  async checkLimit(
    bucketKey: string,
    bucketType: BucketType,
    endpoint: string,
    limits: RateLimitConfig
  ): Promise<RateLimitResult> {
    
    // 1. Clean expired buckets
    await this.cleanExpiredBuckets();
    
    // 2. Check if currently blocked
    const blocked = await this.isBlocked(bucketKey, bucketType, endpoint);
    if (blocked.blocked) {
      return {
        allowed: false,
        reason: 'BLOCKED',
        retryAfter: blocked.retryAfter,
        level: blocked.level
      };
    }
    
    // 3. Get or create bucket
    const bucket = await this.getBucket(bucketKey, bucketType, endpoint);
    
    // 4. Check current window
    const now = new Date();
    const windowStart = this.getWindowStart(now, limits.window);
    
    if (bucket.window_start.getTime() !== windowStart.getTime()) {
      // New window - reset counter
      bucket.request_count = 0;
      bucket.window_start = windowStart;
    }
    
    // 5. Check if limit exceeded
    if (bucket.request_count >= limits.requests) {
      // 6. Apply backoff and lockout
      await this.applyBackoff(bucket, limits);
      
      return {
        allowed: false,
        reason: 'RATE_LIMITED',
        retryAfter: bucket.blocked_until ? 
          Math.ceil((bucket.blocked_until.getTime() - now.getTime()) / 1000) : 
          limits.window,
        level: bucket.lockout_level
      };
    }
    
    // 7. Allow request and increment counter
    bucket.request_count++;
    await this.saveBucket(bucket);
    
    return {
      allowed: true,
      remaining: limits.requests - bucket.request_count,
      resetTime: windowStart.getTime() + (limits.window * 1000)
    };
  }
}
```

---

## Endpoint-Specific Rules

### Authentication Endpoints
```typescript
const ENDPOINT_RULES = {
  '/auth/login': {
    buckets: ['ip', 'fingerprint'],
    limits: IP_LIMITS.login,
    backoff: BACKOFF_CONFIG.login,
    lockout: {
      warning: { threshold: 3, duration: 0 },
      temporary: { threshold: 5, duration: 300 },
      extended: { threshold: 10, duration: 1800 },
      permanent: { threshold: 20, duration: 86400 }
    }
  },
  
  '/auth/recovery/request': {
    buckets: ['ip', 'user'],
    limits: IP_LIMITS.recovery,
    backoff: BACKOFF_CONFIG.recovery,
    lockout: {
      warning: { threshold: 2, duration: 0 },
      temporary: { threshold: 3, duration: 600 },
      extended: { threshold: 5, duration: 3600 },
      permanent: { threshold: 10, duration: 86400 }
    }
  },
  
  '/auth/recovery/confirm': {
    buckets: ['ip', 'fingerprint'],
    limits: IP_LIMITS.auth,
    backoff: BACKOFF_CONFIG.login,
    lockout: {
      warning: { threshold: 3, duration: 0 },
      temporary: { threshold: 5, duration: 300 },
      extended: { threshold: 8, duration: 1800 }
    }
  }
};
```

### Invitation Endpoints
```typescript
const INVITE_RULES = {
  '/invites/create': {
    buckets: ['user'],
    limits: USER_LIMITS.invites,
    backoff: BACKOFF_CONFIG.general,
    requiresAuth: true,
    adminOnly: true
  },
  
  '/invites/accept': {
    buckets: ['ip', 'fingerprint'],
    limits: IP_LIMITS.auth,
    backoff: BACKOFF_CONFIG.login,
    requiresAuth: false
  }
};
```

---

## Monitoring and Alerting

### Metrics Tracked
```typescript
interface RateLimitMetrics {
  // Per endpoint
  requestsTotal: number;
  requestsBlocked: number;
  blockRate: number;
  
  // Per bucket type
  ipBlocks: number;
  userBlocks: number;
  fingerprintBlocks: number;
  
  // Lockout levels
  warningCount: number;
  temporaryCount: number;
  extendedCount: number;
  permanentCount: number;
  
  // Performance
  avgResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
}
```

### Alerting Thresholds
```typescript
const ALERT_THRESHOLDS = {
  // High block rate
  blockRateWarning: 0.05,    // 5%
  blockRateCritical: 0.15,   // 15%
  
  // High lockout rate
  lockoutWarning: 0.01,      // 1%
  lockoutCritical: 0.05,     // 5%
  
  // Performance degradation
  responseTimeWarning: 1000, // 1s
  responseTimeCritical: 3000 // 3s
};
```

---

## Configuration Management

### Environment Variables
```bash
# Rate limiting configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STRICT_MODE=false

# IP-based limits
RATE_LIMIT_IP_GENERAL=100
RATE_LIMIT_IP_AUTH=30
RATE_LIMIT_IP_LOGIN=5
RATE_LIMIT_IP_RECOVERY=3

# User-based limits
RATE_LIMIT_USER_GENERAL=200
RATE_LIMIT_USER_INVITES=10

# Fingerprint-based limits
RATE_LIMIT_FINGERPRINT=50

# Backoff configuration
RATE_LIMIT_BACKOFF_BASE_DELAY=60
RATE_LIMIT_BACKOFF_MAX_DELAY=3600
RATE_LIMIT_BACKOFF_MULTIPLIER=2
RATE_LIMIT_BACKOFF_JITTER=true

# Lockout thresholds
RATE_LIMIT_LOCKOUT_WARNING=3
RATE_LIMIT_LOCKOUT_TEMPORARY=5
RATE_LIMIT_LOCKOUT_EXTENDED=10
RATE_LIMIT_LOCKOUT_PERMANENT=20

# Cleanup intervals
RATE_LIMIT_CLEANUP_INTERVAL=300
RATE_LIMIT_BUCKET_TTL=3600
```

### Dynamic Configuration
```typescript
interface RateLimitConfig {
  // Per-endpoint configuration
  endpoints: Record<string, EndpointConfig>;
  
  // Global settings
  global: {
    enabled: boolean;
    strictMode: boolean;
    cleanupInterval: number;
    bucketTTL: number;
  };
  
  // Emergency controls
  emergency: {
    globalDisable: boolean;
    whitelistIPs: string[];
    blacklistIPs: string[];
    maintenanceMode: boolean;
  };
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('RateLimiter', () => {
  test('should allow requests within limit', async () => {
    const limiter = new RateLimiter();
    
    // Test 4 requests (limit is 5)
    for (let i = 0; i < 4; i++) {
      const result = await limiter.checkLimit('127.0.0.1', 'ip', '/auth/login');
      expect(result.allowed).toBe(true);
    }
  });
  
  test('should block requests over limit', async () => {
    const limiter = new RateLimiter();
    
    // Test 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      const result = await limiter.checkLimit('127.0.0.1', 'ip', '/auth/login');
      if (i < 5) {
        expect(result.allowed).toBe(true);
      } else {
        expect(result.allowed).toBe(false);
        expect(result.reason).toBe('RATE_LIMITED');
      }
    }
  });
  
  test('should apply progressive backoff', async () => {
    const limiter = new RateLimiter();
    
    // First violation
    await limiter.exceedLimit('127.0.0.1', 'ip', '/auth/login');
    const firstBlock = await limiter.getBlockDuration('127.0.0.1', 'ip');
    
    // Second violation
    await limiter.exceedLimit('127.0.0.1', 'ip', '/auth/login');
    const secondBlock = await limiter.getBlockDuration('127.0.0.1', 'ip');
    
    expect(secondBlock).toBeGreaterThan(firstBlock);
  });
});
```

### Integration Tests
```typescript
describe('Rate Limiting Integration', () => {
  test('should work with multiple buckets', async () => {
    // Test IP bucket
    const ipResult = await checkRateLimit('127.0.0.1', 'ip', '/auth/login');
    
    // Test user bucket
    const userResult = await checkRateLimit('user123', 'user', '/auth/login');
    
    // Test fingerprint bucket
    const fpResult = await checkRateLimit('fp123', 'fingerprint', '/auth/login');
    
    // All should be independent
    expect(ipResult.allowed).toBe(true);
    expect(userResult.allowed).toBe(true);
    expect(fpResult.allowed).toBe(true);
  });
});
```

### Load Tests
```typescript
describe('Rate Limiting Load Tests', () => {
  test('should handle high concurrent load', async () => {
    const concurrentRequests = 100;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        checkRateLimit(`127.0.0.${i % 254 + 1}`, 'ip', '/auth/login')
      );
    }
    
    const results = await Promise.all(promises);
    const allowedCount = results.filter(r => r.allowed).length;
    const blockedCount = results.filter(r => !r.allowed).length;
    
    // Should block some requests but not all
    expect(allowedCount).toBeGreaterThan(0);
    expect(blockedCount).toBeGreaterThan(0);
  });
});
```

---

## Rollout Plan

### Phase 1: Soft Launch
- Rate limiting abilitato con soglie permissive
- Monitoring attivo
- Alerting configurato
- Rollback plan pronto

### Phase 2: Gradual Tightening
- Riduzione graduale delle soglie
- Monitoraggio performance
- Ajustment basato su metriche

### Phase 3: Full Production
- Soglie finali implementate
- Monitoring completo
- Alerting ottimizzato
- Documentazione aggiornata

### Rollback Strategy
```typescript
const ROLLBACK_PLAN = {
  emergency: {
    // Disabilita completamente rate limiting
    action: 'DISABLE_ALL',
    command: 'UPDATE rate_limit_config SET enabled = false',
    timeout: '30s'
  },
  
  partial: {
    // Riduce soglie al 50%
    action: 'REDUCE_THRESHOLDS',
    multiplier: 0.5,
    timeout: '2m'
  },
  
  whitelist: {
    // Whitelist IPs problematici
    action: 'WHITELIST_IPS',
    ips: ['127.0.0.1', '10.0.0.0/8'],
    timeout: '1m'
  }
};
```
