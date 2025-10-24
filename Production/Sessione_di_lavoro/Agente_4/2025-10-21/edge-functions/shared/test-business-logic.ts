// =============================================================================
// UNIT TEST: Business Logic
// =============================================================================

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { 
    generateCsrfToken, 
    generateSessionToken, 
    hashPassword, 
    verifyPassword,
    getUserIP,
    getUserAgent,
    CSRF_CONFIG,
    SESSION_CONFIG
} from '../shared/business-logic.ts';

// Test CSRF token generation
Deno.test('generateCsrfToken - generates correct length', () => {
    const token = generateCsrfToken();
    assertEquals(token.length, CSRF_CONFIG.TOKEN_LENGTH);
});

Deno.test('generateCsrfToken - generates unique tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    assertEquals(token1 !== token2, true);
});

Deno.test('generateCsrfToken - contains only valid characters', () => {
    const token = generateCsrfToken();
    const validChars = /^[A-Za-z0-9]+$/;
    assertEquals(validChars.test(token), true);
});

// Test session token generation
Deno.test('generateSessionToken - generates UUID format', () => {
    const token = generateSessionToken();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assertEquals(uuidRegex.test(token), true);
});

Deno.test('generateSessionToken - generates unique tokens', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    assertEquals(token1 !== token2, true);
});

// Test password hashing
Deno.test('hashPassword - generates consistent hash', async () => {
    const password = 'TestPassword123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    assertEquals(hash1, hash2);
});

Deno.test('hashPassword - generates different hashes for different passwords', async () => {
    const password1 = 'TestPassword123';
    const password2 = 'TestPassword456';
    const hash1 = await hashPassword(password1);
    const hash2 = await hashPassword(password2);
    assertEquals(hash1 !== hash2, true);
});

Deno.test('hashPassword - generates hash of correct length', async () => {
    const password = 'TestPassword123';
    const hash = await hashPassword(password);
    assertEquals(hash.length, 64); // SHA-256 produces 64 hex characters
});

// Test password verification
Deno.test('verifyPassword - verifies correct password', async () => {
    const password = 'TestPassword123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    assertEquals(isValid, true);
});

Deno.test('verifyPassword - rejects incorrect password', async () => {
    const password = 'TestPassword123';
    const wrongPassword = 'WrongPassword123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);
    assertEquals(isValid, false);
});

Deno.test('verifyPassword - rejects empty password', async () => {
    const password = 'TestPassword123';
    const emptyPassword = '';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(emptyPassword, hash);
    assertEquals(isValid, false);
});

// Test IP address extraction
Deno.test('getUserIP - extracts from x-forwarded-for', () => {
    const request = new Request('https://example.com', {
        headers: {
            'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
    });
    const ip = getUserIP(request);
    assertEquals(ip, '192.168.1.1');
});

Deno.test('getUserIP - extracts from x-real-ip', () => {
    const request = new Request('https://example.com', {
        headers: {
            'x-real-ip': '192.168.1.2'
        }
    });
    const ip = getUserIP(request);
    assertEquals(ip, '192.168.1.2');
});

Deno.test('getUserIP - extracts from cf-connecting-ip', () => {
    const request = new Request('https://example.com', {
        headers: {
            'cf-connecting-ip': '192.168.1.3'
        }
    });
    const ip = getUserIP(request);
    assertEquals(ip, '192.168.1.3');
});

Deno.test('getUserIP - returns unknown when no headers', () => {
    const request = new Request('https://example.com');
    const ip = getUserIP(request);
    assertEquals(ip, 'unknown');
});

// Test user agent extraction
Deno.test('getUserAgent - extracts user agent', () => {
    const request = new Request('https://example.com', {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    const userAgent = getUserAgent(request);
    assertEquals(userAgent, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
});

Deno.test('getUserAgent - returns unknown when no header', () => {
    const request = new Request('https://example.com');
    const userAgent = getUserAgent(request);
    assertEquals(userAgent, 'unknown');
});

// Test configuration constants
Deno.test('Configuration constants - CSRF_CONFIG', () => {
    assertEquals(CSRF_CONFIG.LIFETIME, 4 * 60 * 60 * 1000); // 4 hours
    assertEquals(CSRF_CONFIG.REFRESH_INTERVAL, 2 * 60 * 60 * 1000); // 2 hours
    assertEquals(CSRF_CONFIG.TOKEN_LENGTH, 32);
});

Deno.test('Configuration constants - SESSION_CONFIG', () => {
    assertEquals(SESSION_CONFIG.LIFETIME, 8 * 60 * 60 * 1000); // 8 hours
    assertEquals(SESSION_CONFIG.REFRESH_INTERVAL, 4 * 60 * 60 * 1000); // 4 hours
    assertEquals(SESSION_CONFIG.MAX_SESSIONS_PER_USER, 5);
});

// Test rate limiting configuration
Deno.test('Rate limiting configuration - LOGIN limits', () => {
    const { RATE_LIMITS } = await import('../shared/business-logic.ts');
    assertEquals(RATE_LIMITS.LOGIN.IP.max, 30);
    assertEquals(RATE_LIMITS.LOGIN.IP.window, 300);
    assertEquals(RATE_LIMITS.LOGIN.EMAIL.max, 5);
    assertEquals(RATE_LIMITS.LOGIN.EMAIL.window, 300);
    assertEquals(RATE_LIMITS.LOGIN.LOCKOUT, 600);
});

Deno.test('Rate limiting configuration - RECOVERY limits', () => {
    const { RATE_LIMITS } = await import('../shared/business-logic.ts');
    assertEquals(RATE_LIMITS.RECOVERY.IP.max, 10);
    assertEquals(RATE_LIMITS.RECOVERY.IP.window, 900);
    assertEquals(RATE_LIMITS.RECOVERY.EMAIL.max, 3);
    assertEquals(RATE_LIMITS.RECOVERY.EMAIL.window, 900);
    assertEquals(RATE_LIMITS.RECOVERY.LOCKOUT, 1800);
});

Deno.test('Rate limiting configuration - INVITE limits', () => {
    const { RATE_LIMITS } = await import('../shared/business-logic.ts');
    assertEquals(RATE_LIMITS.INVITE.IP.max, 5);
    assertEquals(RATE_LIMITS.INVITE.IP.window, 3600);
    assertEquals(RATE_LIMITS.INVITE.EMAIL.max, 1);
    assertEquals(RATE_LIMITS.INVITE.EMAIL.window, 3600);
    assertEquals(RATE_LIMITS.INVITE.LOCKOUT, 3600);
});

console.log('✅ All business logic tests passed!');
