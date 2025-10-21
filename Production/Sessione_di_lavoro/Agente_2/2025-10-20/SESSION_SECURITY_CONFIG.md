# Session Security Configuration - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Configurazione completa per session management sicuro con cookie httpOnly, protezione CSRF e rotazione sessione. Implementa best practices 2025 per sicurezza web.

---

## Cookie Configuration

### Session Cookie Settings
```typescript
interface SessionCookieConfig {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  domain?: string;
  maxAge: number;
  expires?: Date;
}

const SESSION_COOKIE_CONFIG: SessionCookieConfig = {
  name: 'bhm_session',
  httpOnly: true,           // Prevents XSS access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',       // Prevents CSRF attacks
  path: '/',
  maxAge: 30 * 60 * 1000,   // 30 minutes in milliseconds
  domain: process.env.COOKIE_DOMAIN // Optional domain restriction
};
```

### CSRF Cookie Settings
```typescript
const CSRF_COOKIE_CONFIG: SessionCookieConfig = {
  name: 'bhm_csrf_token',
  httpOnly: false,          // Must be accessible to JavaScript for double-submit
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 30 * 60 * 1000,   // 30 minutes
  domain: process.env.COOKIE_DOMAIN
};
```

---

## Session Management

### Session Data Structure
```typescript
interface SessionData {
  id: string;               // UUID session ID
  userId: string;           // UUID user ID
  tenantId?: string;        // UUID tenant ID
  roles: UserRole[];        // User roles in current context
  permissions: string[];    // Computed permissions
  csrfToken: string;        // CSRF protection token
  ip: string;              // Client IP address
  userAgent: string;        // Client user agent
  createdAt: Date;         // Session creation time
  expiresAt: Date;         // Session expiration time
  lastActivity: Date;      // Last activity timestamp
  isActive: boolean;       // Session status
  metadata: {
    loginMethod: 'password' | 'invite' | 'recovery';
    deviceFingerprint?: string;
    rememberMe?: boolean;
  };
}

interface UserRole {
  roleId: string;
  roleName: string;
  tenantId: string;
  tenantName: string;
  permissions: string[];
  assignedAt: Date;
  expiresAt?: Date;
}
```

### Session Creation
```typescript
class SessionManager {
  async createSession(
    userId: string,
    tenantId: string,
    ip: string,
    userAgent: string,
    metadata: SessionMetadata
  ): Promise<SessionData> {
    
    // 1. Generate secure session ID
    const sessionId = crypto.randomUUID();
    
    // 2. Generate CSRF token
    const csrfToken = this.generateCSRFToken();
    
    // 3. Get user roles and permissions
    const roles = await this.getUserRoles(userId, tenantId);
    const permissions = this.computePermissions(roles);
    
    // 4. Calculate expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_COOKIE_CONFIG.maxAge);
    
    // 5. Create session data
    const sessionData: SessionData = {
      id: sessionId,
      userId,
      tenantId,
      roles,
      permissions,
      csrfToken,
      ip,
      userAgent,
      createdAt: now,
      expiresAt,
      lastActivity: now,
      isActive: true,
      metadata
    };
    
    // 6. Store in database
    await this.storeSession(sessionData);
    
    // 7. Set cookies
    this.setSessionCookies(sessionData);
    
    return sessionData;
  }
  
  private generateCSRFToken(): string {
    // Generate cryptographically secure random token
    const bytes = crypto.randomBytes(32);
    return bytes.toString('hex');
  }
  
  private setSessionCookies(session: SessionData): void {
    const sessionCookie = this.serializeCookie(
      SESSION_COOKIE_CONFIG.name,
      session.id,
      SESSION_COOKIE_CONFIG
    );
    
    const csrfCookie = this.serializeCookie(
      CSRF_COOKIE_CONFIG.name,
      session.csrfToken,
      CSRF_COOKIE_CONFIG
    );
    
    // Set both cookies
    this.response.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);
  }
}
```

---

## CSRF Protection

### Double-Submit Cookie Pattern
```typescript
class CSRFProtection {
  // Generate CSRF token for form
  generateToken(sessionId: string): string {
    const secret = process.env.CSRF_SECRET_KEY;
    const timestamp = Date.now();
    const payload = `${sessionId}:${timestamp}`;
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return `${payload}:${signature}`;
  }
  
  // Verify CSRF token
  verifyToken(token: string, sessionId: string): boolean {
    try {
      const [payload, signature] = token.split(':');
      const [tokenSessionId, timestamp] = payload.split(':');
      
      // Check session ID match
      if (tokenSessionId !== sessionId) {
        return false;
      }
      
      // Check token age (max 1 hour)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 3600000) { // 1 hour
        return false;
      }
      
      // Verify signature
      const secret = process.env.CSRF_SECRET_KEY;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      
    } catch (error) {
      return false;
    }
  }
  
  // Middleware to check CSRF token
  csrfMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF check for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }
      
      // Skip CSRF check for public endpoints
      if (this.isPublicEndpoint(req.path)) {
        return next();
      }
      
      const sessionId = req.cookies[SESSION_COOKIE_CONFIG.name];
      const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
      
      if (!sessionId || !csrfToken) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF token required'
          }
        });
      }
      
      if (!this.verifyToken(csrfToken, sessionId)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token'
          }
        });
      }
      
      next();
    };
  }
}
```

### Header-Based CSRF Protection
```typescript
class HeaderBasedCSRF {
  // Alternative: Custom header validation
  validateCSRFHeader(req: Request): boolean {
    const sessionId = req.cookies[SESSION_COOKIE_CONFIG.name];
    const csrfHeader = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies[CSRF_COOKIE_CONFIG.name];
    
    // Both header and cookie must match
    return csrfHeader === csrfCookie && 
           this.verifyToken(csrfHeader, sessionId);
  }
  
  // Middleware for header-based protection
  headerCSRFMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }
      
      if (this.isPublicEndpoint(req.path)) {
        return next();
      }
      
      if (!this.validateCSRFHeader(req)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_HEADER_INVALID',
            message: 'Invalid CSRF header'
          }
        });
      }
      
      next();
    };
  }
}
```

---

## Session Rotation

### Automatic Rotation
```typescript
class SessionRotation {
  async rotateSession(oldSessionId: string): Promise<SessionData> {
    // 1. Get current session
    const oldSession = await this.getSession(oldSessionId);
    if (!oldSession) {
      throw new Error('Session not found');
    }
    
    // 2. Invalidate old session
    await this.invalidateSession(oldSessionId);
    
    // 3. Create new session with same user context
    const newSession = await this.createSession(
      oldSession.userId,
      oldSession.tenantId,
      oldSession.ip,
      oldSession.userAgent,
      {
        ...oldSession.metadata,
        rotatedFrom: oldSessionId
      }
    );
    
    // 4. Log rotation event
    await this.logSessionEvent('session_rotated', {
      oldSessionId,
      newSessionId: newSession.id,
      userId: oldSession.userId
    });
    
    return newSession;
  }
  
  // Trigger rotation on sensitive operations
  async requireSessionRotation(
    sessionId: string,
    operation: 'password_change' | 'role_change' | 'permission_elevation'
  ): Promise<SessionData> {
    
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Check if rotation is required
    const rotationRequired = this.isRotationRequired(session, operation);
    
    if (rotationRequired) {
      return await this.rotateSession(sessionId);
    }
    
    return session;
  }
  
  private isRotationRequired(
    session: SessionData,
    operation: string
  ): boolean {
    // Always rotate on password change
    if (operation === 'password_change') {
      return true;
    }
    
    // Rotate on role/permission changes
    if (['role_change', 'permission_elevation'].includes(operation)) {
      return true;
    }
    
    // Rotate if session is older than 1 hour
    const sessionAge = Date.now() - session.createdAt.getTime();
    if (sessionAge > 3600000) { // 1 hour
      return true;
    }
    
    return false;
  }
}
```

### Rolling Session Extension
```typescript
class RollingSession {
  async extendSession(sessionId: string): Promise<SessionData> {
    const session = await this.getSession(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Session not found or inactive');
    }
    
    // Check if extension is allowed
    const maxAge = Date.now() - session.createdAt.getTime();
    if (maxAge > 8 * 3600000) { // 8 hours max
      throw new Error('Session too old for extension');
    }
    
    // Extend expiration
    const newExpiresAt = new Date(Date.now() + SESSION_COOKIE_CONFIG.maxAge);
    
    // Update session
    await this.updateSession(sessionId, {
      expiresAt: newExpiresAt,
      lastActivity: new Date()
    });
    
    // Update cookie
    this.updateSessionCookie(sessionId, newExpiresAt);
    
    return { ...session, expiresAt: newExpiresAt };
  }
  
  // Auto-extend on activity
  async onActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    
    const timeSinceLastActivity = Date.now() - session.lastActivity.getTime();
    
    // Extend if last activity was more than 5 minutes ago
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      await this.extendSession(sessionId);
    } else {
      // Just update last activity
      await this.updateSession(sessionId, {
        lastActivity: new Date()
      });
    }
  }
}
```

---

## Session Invalidation

### Logout Process
```typescript
class SessionInvalidation {
  async logout(sessionId: string): Promise<void> {
    // 1. Invalidate session in database
    await this.invalidateSession(sessionId);
    
    // 2. Clear cookies
    this.clearSessionCookies();
    
    // 3. Log logout event
    await this.logSessionEvent('logout', {
      sessionId,
      timestamp: new Date()
    });
  }
  
  async logoutAllSessions(userId: string): Promise<void> {
    // Invalidate all sessions for user
    await this.invalidateUserSessions(userId);
    
    // Log mass logout event
    await this.logSessionEvent('logout_all', {
      userId,
      timestamp: new Date()
    });
  }
  
  async logoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    // Invalidate all sessions except current
    await this.invalidateUserSessions(userId, currentSessionId);
    
    // Log selective logout event
    await this.logSessionEvent('logout_others', {
      userId,
      currentSessionId,
      timestamp: new Date()
    });
  }
  
  private clearSessionCookies(): void {
    const sessionCookie = this.serializeCookie(
      SESSION_COOKIE_CONFIG.name,
      '',
      { ...SESSION_COOKIE_CONFIG, maxAge: 0 }
    );
    
    const csrfCookie = this.serializeCookie(
      CSRF_COOKIE_CONFIG.name,
      '',
      { ...CSRF_COOKIE_CONFIG, maxAge: 0 }
    );
    
    this.response.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);
  }
}
```

---

## Session Validation

### Middleware Stack
```typescript
class SessionValidation {
  // Main session validation middleware
  sessionMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionId = req.cookies[SESSION_COOKIE_CONFIG.name];
        
        if (!sessionId) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'NO_SESSION',
              message: 'Session required'
            }
          });
        }
        
        // Validate session
        const session = await this.validateSession(sessionId, req);
        
        if (!session) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_SESSION',
              message: 'Invalid or expired session'
            }
          });
        }
        
        // Attach session to request
        req.session = session;
        
        // Update activity
        await this.updateActivity(sessionId);
        
        next();
        
      } catch (error) {
        console.error('Session validation error:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'SESSION_ERROR',
            message: 'Session validation failed'
          }
        });
      }
    };
  }
  
  private async validateSession(
    sessionId: string,
    req: Request
  ): Promise<SessionData | null> {
    
    // 1. Get session from database
    const session = await this.getSession(sessionId);
    if (!session || !session.isActive) {
      return null;
    }
    
    // 2. Check expiration
    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return null;
    }
    
    // 3. Check IP binding (optional)
    if (process.env.SESSION_BIND_IP === 'true') {
      if (session.ip !== req.ip) {
        await this.logSecurityEvent('ip_mismatch', {
          sessionId,
          expectedIP: session.ip,
          actualIP: req.ip
        });
        return null;
      }
    }
    
    // 4. Check User-Agent binding (optional)
    if (process.env.SESSION_BIND_UA === 'true') {
      if (session.userAgent !== req.headers['user-agent']) {
        await this.logSecurityEvent('ua_mismatch', {
          sessionId,
          expectedUA: session.userAgent,
          actualUA: req.headers['user-agent']
        });
        return null;
      }
    }
    
    return session;
  }
}
```

---

## Configuration

### Environment Variables
```bash
# Session configuration
SESSION_SECRET_KEY=your-secret-key-here
SESSION_COOKIE_NAME=bhm_session
SESSION_COOKIE_DOMAIN=.yourdomain.com
SESSION_MAX_AGE=1800000
SESSION_ROLLING=true

# CSRF configuration
CSRF_SECRET_KEY=your-csrf-secret-key-here
CSRF_COOKIE_NAME=bhm_csrf_token
CSRF_TOKEN_LIFETIME=3600000

# Security settings
SESSION_BIND_IP=false
SESSION_BIND_UA=false
SESSION_ROTATION_ON_PASSWORD_CHANGE=true
SESSION_ROTATION_ON_ROLE_CHANGE=true

# Cleanup settings
SESSION_CLEANUP_INTERVAL=300000
SESSION_CLEANUP_BATCH_SIZE=100
SESSION_MAX_INACTIVE_TIME=3600000
```

### TypeScript Configuration
```typescript
// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      user?: UserData;
    }
  }
}

// Configuration interface
interface SessionConfig {
  cookie: SessionCookieConfig;
  csrf: CSRFConfig;
  rotation: RotationConfig;
  cleanup: CleanupConfig;
}

const config: SessionConfig = {
  cookie: SESSION_COOKIE_CONFIG,
  csrf: CSRF_COOKIE_CONFIG,
  rotation: {
    onPasswordChange: true,
    onRoleChange: true,
    maxAge: 3600000
  },
  cleanup: {
    interval: 300000,
    batchSize: 100,
    maxInactiveTime: 3600000
  }
};
```

---

## Testing

### Unit Tests
```typescript
describe('SessionManager', () => {
  test('should create secure session', async () => {
    const sessionManager = new SessionManager();
    
    const session = await sessionManager.createSession(
      'user123',
      'tenant123',
      '127.0.0.1',
      'Mozilla/5.0...',
      { loginMethod: 'password' }
    );
    
    expect(session.id).toBeDefined();
    expect(session.csrfToken).toBeDefined();
    expect(session.httpOnly).toBe(true);
    expect(session.secure).toBe(process.env.NODE_ENV === 'production');
    expect(session.sameSite).toBe('strict');
  });
  
  test('should validate CSRF token', async () => {
    const csrf = new CSRFProtection();
    const sessionId = 'session123';
    const token = csrf.generateToken(sessionId);
    
    expect(csrf.verifyToken(token, sessionId)).toBe(true);
    expect(csrf.verifyToken(token, 'different-session')).toBe(false);
  });
  
  test('should rotate session on password change', async () => {
    const rotation = new SessionRotation();
    const oldSession = await createTestSession();
    
    const newSession = await rotation.requireSessionRotation(
      oldSession.id,
      'password_change'
    );
    
    expect(newSession.id).not.toBe(oldSession.id);
    expect(newSession.userId).toBe(oldSession.userId);
  });
});
```

### Integration Tests
```typescript
describe('Session Security Integration', () => {
  test('should protect against CSRF attacks', async () => {
    const response = await request(app)
      .post('/api/sensitive-action')
      .set('Cookie', 'session=valid-session')
      .send({ data: 'malicious' });
    
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });
  
  test('should rotate session after sensitive operations', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password' });
    
    const sessionCookie = loginResponse.headers['set-cookie'][0];
    
    const changePasswordResponse = await request(app)
      .post('/auth/change-password')
      .set('Cookie', sessionCookie)
      .set('X-CSRF-Token', 'valid-token')
      .send({ newPassword: 'newpassword' });
    
    // Should get new session cookie
    const newSessionCookie = changePasswordResponse.headers['set-cookie'][0];
    expect(newSessionCookie).not.toBe(sessionCookie);
  });
});
```
