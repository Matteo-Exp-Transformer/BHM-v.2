// =============================================================================
// ERROR HANDLING - Auth System
// =============================================================================

import { ApiErrorResponse } from './types.ts';

/**
 * Standard error codes
 */
export enum ErrorCode {
    // Client errors (4xx)
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    CONFLICT = 'CONFLICT',
    RATE_LIMITED = 'RATE_LIMITED',
    CSRF_INVALID = 'CSRF_INVALID',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    TOKEN_INVALID = 'TOKEN_INVALID',

    // Server errors (5xx)
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * API Error class
 */
export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }

    toResponse(): Response {
        const body: ApiErrorResponse = {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                details: this.details
            }
        };

        return new Response(
            JSON.stringify(body),
            {
                status: this.statusCode,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                }
            }
        );
    }
}

/**
 * Helper: Create error response
 */
export function errorResponse(
    code: ErrorCode,
    statusCode: number,
    message: string,
    details?: any
): Response {
    return new ApiError(code, statusCode, message, details).toResponse();
}

/**
 * Helper: Handle unknown errors
 */
export function handleUnknownError(error: unknown): Response {
    console.error('Unhandled error:', error);

    if (error instanceof ApiError) {
        return error.toResponse();
    }

    // Default internal error
    return errorResponse(
        ErrorCode.INTERNAL_ERROR,
        500,
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined
    );
}

/**
 * Helper: Create rate limit error response
 */
export function rateLimitError(
    retryAfter: number,
    limit: number,
    remaining: number,
    reset: number
): Response {
    return errorResponse(
        ErrorCode.RATE_LIMITED,
        429,
        'Too many requests. Please try again later.',
        {
            retry_after: retryAfter,
            limit,
            remaining,
            reset
        }
    );
}

/**
 * Helper: Create CSRF error response
 */
export function csrfError(): Response {
    return errorResponse(
        ErrorCode.CSRF_INVALID,
        403,
        'Invalid CSRF token. Please refresh the page and try again.'
    );
}

/**
 * Helper: Create account locked error response
 */
export function accountLockedError(lockedUntil: string): Response {
    return errorResponse(
        ErrorCode.ACCOUNT_LOCKED,
        423,
        'Account is temporarily locked due to too many failed login attempts.',
        {
            locked_until: lockedUntil
        }
    );
}

/**
 * Helper: Create invalid credentials error response
 */
export function invalidCredentialsError(): Response {
    return errorResponse(
        ErrorCode.INVALID_CREDENTIALS,
        401,
        'Invalid email or password.'
    );
}

/**
 * Helper: Create token expired error response
 */
export function tokenExpiredError(): Response {
    return errorResponse(
        ErrorCode.TOKEN_EXPIRED,
        401,
        'Token has expired. Please request a new one.'
    );
}

/**
 * Helper: Create token invalid error response
 */
export function tokenInvalidError(): Response {
    return errorResponse(
        ErrorCode.TOKEN_INVALID,
        400,
        'Invalid token. Please check your link and try again.'
    );
}
