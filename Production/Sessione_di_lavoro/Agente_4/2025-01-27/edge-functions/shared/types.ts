// =============================================================================
// SHARED TYPES - Auth System
// =============================================================================

/**
 * User role enum (from auth system)
 */
export enum UserRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MANAGER = 'manager',
    OPERATOR = 'operator'
}

/**
 * Session status enum
 */
export enum SessionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    REVOKED = 'revoked'
}

/**
 * Rate limit bucket types
 */
export enum RateLimitType {
    IP = 'ip',
    EMAIL = 'email',
    USER_AGENT = 'user_agent',
    GLOBAL = 'global'
}

/**
 * Database row type for users
 */
export interface UserRow {
    id: string; // UUID
    email: string;
    password_hash: string;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
    email_verified: boolean;
    last_login_at: string | null; // ISO8601
    failed_login_attempts: number;
    locked_until: string | null; // ISO8601
    created_at: string; // ISO8601
    updated_at: string; // ISO8601
}

/**
 * Database row type for sessions
 */
export interface SessionRow {
    id: string; // UUID
    user_id: string; // UUID
    token: string;
    csrf_token: string;
    ip_address: string | null;
    user_agent: string | null;
    is_active: boolean;
    expires_at: string; // ISO8601
    last_activity_at: string; // ISO8601
    created_at: string; // ISO8601
}

/**
 * Database row type for rate limit buckets
 */
export interface RateLimitBucketRow {
    id: string; // UUID
    bucket_key: string;
    bucket_type: RateLimitType;
    request_count: number;
    window_start: string; // ISO8601
    window_size: number; // seconds
    max_requests: number;
    is_blocked: boolean;
    blocked_until: string | null; // ISO8601
    created_at: string; // ISO8601
    updated_at: string; // ISO8601
}

/**
 * API request body for LOGIN
 */
export interface LoginRequest {
    email: string;
    password: string;
    csrf_token: string;
}

/**
 * API request body for RECOVERY REQUEST
 */
export interface RecoveryRequestRequest {
    email: string;
    csrf_token: string;
}

/**
 * API request body for RECOVERY CONFIRM
 */
export interface RecoveryConfirmRequest {
    token: string;
    password: string;
    csrf_token: string;
}

/**
 * API request body for INVITE ACCEPT
 */
export interface InviteAcceptRequest {
    token: string;
    first_name: string;
    last_name: string;
    password: string;
    csrf_token: string;
}

/**
 * API request body for CSRF TOKEN
 */
export interface CsrfTokenRequest {
    // No body needed, just GET request
}

/**
 * API response for LOGIN success
 */
export interface LoginResponse {
    success: true;
    user: {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        role: string;
        tenant_id: string;
    };
    session: {
        token: string;
        csrf_token: string;
        expires_at: string;
    };
}

/**
 * API response for CSRF TOKEN
 */
export interface CsrfTokenResponse {
    csrf_token: string;
    expires_at: string;
}

/**
 * API response for RECOVERY REQUEST success
 */
export interface RecoveryRequestResponse {
    success: true;
    message: string;
}

/**
 * API response for RECOVERY CONFIRM success
 */
export interface RecoveryConfirmResponse {
    success: true;
    message: string;
}

/**
 * API response for INVITE ACCEPT success
 */
export interface InviteAcceptResponse {
    success: true;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        tenant_id: string;
    };
    session: {
        token: string;
        csrf_token: string;
        expires_at: string;
    };
}

/**
 * API response for LOGOUT success
 */
export interface LogoutResponse {
    success: true;
    message: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number; // timestamp
    retry_after?: number; // seconds
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
    user_id?: string;
    tenant_id?: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
}
