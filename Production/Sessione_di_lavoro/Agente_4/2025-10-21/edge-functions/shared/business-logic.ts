// =============================================================================
// BUSINESS LOGIC - Auth System
// Regole business specifiche per BHM (HACCP, scadenze, notifiche)
// =============================================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RateLimitBucketRow, RateLimitType, AuditLogEntry } from './types.ts';

/**
 * Rate limiting configuration with escalation
 */
export const RATE_LIMITS = {
    LOGIN: {
        IP: { max: 30, window: 300 }, // 30 requests per 5 minutes per IP
        EMAIL: { max: 5, window: 300 }, // 5 requests per 5 minutes per email
        LOCKOUT: 600 // 10 minutes lockout after limit exceeded
    },
    RECOVERY: {
        IP: { max: 10, window: 900 }, // 10 requests per 15 minutes per IP
        EMAIL: { max: 3, window: 900 }, // 3 requests per 15 minutes per email
        LOCKOUT: 1800 // 30 minutes lockout after limit exceeded
    },
    INVITE: {
        IP: { max: 5, window: 3600 }, // 5 requests per hour per IP
        EMAIL: { max: 1, window: 3600 }, // 1 request per hour per email
        LOCKOUT: 3600 // 1 hour lockout after limit exceeded
    }
};

/**
 * Calculate escalation lockout duration based on failure count
 * Decision #4: Rate Limiting Escalation
 */
export function calculateLockoutDuration(failureCount: number): number {
    if (failureCount === 5) return 5 * 60      // 5 minutes
    if (failureCount === 10) return 15 * 60   // 15 minutes  
    if (failureCount === 15) return 60 * 60   // 1 hour
    if (failureCount >= 20) return 24 * 60 * 60 // 24 hours
    return 0
}

/**
 * CSRF token configuration
 */
export const CSRF_CONFIG = {
    LIFETIME: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    REFRESH_INTERVAL: 2 * 60 * 60 * 1000, // Refresh every 2 hours
    TOKEN_LENGTH: 32 // characters
};

/**
 * Session configuration
 * Decision #19: Sessione durata - 24 ore fisse
 */
export const SESSION_CONFIG = {
    LIFETIME: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    REFRESH_INTERVAL: 12 * 60 * 60 * 1000, // Refresh every 12 hours
    MAX_SESSIONS_PER_USER: 5 // Maximum concurrent sessions per user
};

/**
 * Check rate limiting for a specific bucket
 */
export async function checkRateLimit(
    supabase: SupabaseClient,
    bucketKey: string,
    bucketType: RateLimitType,
    limits: { max: number; window: number; lockout: number }
): Promise<{ allowed: boolean; retryAfter?: number; limit: number; remaining: number; reset: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - limits.window * 1000);

    // Get or create bucket
    const { data: bucket, error } = await supabase
        .from('rate_limit_buckets')
        .select('*')
        .eq('bucket_key', bucketKey)
        .eq('bucket_type', bucketType)
        .single();

    if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Rate limit check error:', error);
        return { allowed: true, limit: limits.max, remaining: limits.max, reset: now.getTime() + limits.window * 1000 };
    }

    // If bucket doesn't exist, create it
    if (!bucket) {
        const newBucket: Partial<RateLimitBucketRow> = {
            bucket_key: bucketKey,
            bucket_type: bucketType,
            request_count: 1,
            window_start: now.toISOString(),
            window_size: limits.window,
            max_requests: limits.max,
            is_blocked: false,
            blocked_until: null
        };

        const { error: insertError } = await supabase
            .from('rate_limit_buckets')
            .insert(newBucket);

        if (insertError) {
            console.error('Failed to create rate limit bucket:', insertError);
            return { allowed: true, limit: limits.max, remaining: limits.max, reset: now.getTime() + limits.window * 1000 };
        }

        return { 
            allowed: true, 
            limit: limits.max, 
            remaining: limits.max - 1, 
            reset: now.getTime() + limits.window * 1000 
        };
    }

    // Check if bucket is blocked
    if (bucket.is_blocked && bucket.blocked_until) {
        const blockedUntil = new Date(bucket.blocked_until);
        if (blockedUntil > now) {
            const retryAfter = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
            return { 
                allowed: false, 
                retryAfter, 
                limit: limits.max, 
                remaining: 0, 
                reset: blockedUntil.getTime() 
            };
        } else {
            // Unblock the bucket
            await supabase
                .from('rate_limit_buckets')
                .update({ 
                    is_blocked: false, 
                    blocked_until: null,
                    request_count: 0,
                    window_start: now.toISOString()
                })
                .eq('id', bucket.id);
        }
    }

    // Check if window has expired
    const bucketWindowStart = new Date(bucket.window_start);
    if (bucketWindowStart < windowStart) {
        // Reset the bucket
        await supabase
            .from('rate_limit_buckets')
            .update({ 
                request_count: 1,
                window_start: now.toISOString(),
                is_blocked: false,
                blocked_until: null
            })
            .eq('id', bucket.id);

        return { 
            allowed: true, 
            limit: limits.max, 
            remaining: limits.max - 1, 
            reset: now.getTime() + limits.window * 1000 
        };
    }

    // Check if limit exceeded
    if (bucket.request_count >= limits.max) {
        // Block the bucket
        const blockedUntil = new Date(now.getTime() + limits.lockout * 1000);
        await supabase
            .from('rate_limit_buckets')
            .update({ 
                is_blocked: true,
                blocked_until: blockedUntil.toISOString()
            })
            .eq('id', bucket.id);

        return { 
            allowed: false, 
            retryAfter: limits.lockout, 
            limit: limits.max, 
            remaining: 0, 
            reset: blockedUntil.getTime() 
        };
    }

    // Increment request count
    await supabase
        .from('rate_limit_buckets')
        .update({ request_count: bucket.request_count + 1 })
        .eq('id', bucket.id);

    return { 
        allowed: true, 
        limit: limits.max, 
        remaining: limits.max - bucket.request_count - 1, 
        reset: bucketWindowStart.getTime() + limits.window * 1000 
    };
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < CSRF_CONFIG.TOKEN_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
    // Generate a UUID-like token
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Hash password using bcrypt
 * Decision #18: Password hash algoritmo - Passare a bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    // Import bcrypt for Deno
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts');
    const SALT_ROUNDS = 10;
    
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * Decision #18: Password hash algoritmo - Passare a bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Import bcrypt for Deno
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts');
    
    return await bcrypt.compare(password, hash);
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
    supabase: SupabaseClient,
    entry: AuditLogEntry
): Promise<void> {
    const { error } = await supabase
        .from('audit_log')
        .insert({
            user_id: entry.user_id || null,
            tenant_id: entry.tenant_id || null,
            action: entry.action,
            resource_type: entry.resource_type || null,
            resource_id: entry.resource_id || null,
            details: entry.details,
            ip_address: entry.ip_address || null,
            user_agent: entry.user_agent || null
        });

    if (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error - audit logging should not break the main flow
    }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(supabase: SupabaseClient): Promise<void> {
    const { error } = await supabase
        .from('sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

    if (error) {
        console.error('Failed to cleanup expired sessions:', error);
    }
}

/**
 * Clean up expired rate limit buckets
 */
export async function cleanupExpiredRateLimitBuckets(supabase: SupabaseClient): Promise<void> {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const { error } = await supabase
        .from('rate_limit_buckets')
        .delete()
        .lt('created_at', cutoffTime.toISOString());

    if (error) {
        console.error('Failed to cleanup expired rate limit buckets:', error);
    }
}

/**
 * Get user IP address from request
 */
export function getUserIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    
    return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
    return request.headers.get('user-agent') || 'unknown';
}
