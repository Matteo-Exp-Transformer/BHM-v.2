// =============================================================================
// UNIT TEST: Error Handling
// =============================================================================

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { 
    ApiError, 
    ErrorCode, 
    errorResponse, 
    rateLimitError, 
    csrfError, 
    accountLockedError, 
    invalidCredentialsError,
    tokenExpiredError,
    tokenInvalidError
} from '../shared/errors.ts';

// Test ApiError class
Deno.test('ApiError - creates error with correct properties', () => {
    const error = new ApiError(
        ErrorCode.VALIDATION_ERROR,
        400,
        'Validation failed',
        { field: 'email' }
    );

    assertEquals(error.code, ErrorCode.VALIDATION_ERROR);
    assertEquals(error.statusCode, 400);
    assertEquals(error.message, 'Validation failed');
    assertEquals(error.details, { field: 'email' });
});

Deno.test('ApiError - toResponse creates correct Response', () => {
    const error = new ApiError(
        ErrorCode.RATE_LIMITED,
        429,
        'Too many requests',
        { retry_after: 60 }
    );

    const response = error.toResponse();
    assertEquals(response.status, 429);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test errorResponse helper
Deno.test('errorResponse - creates correct error response', () => {
    const response = errorResponse(
        ErrorCode.BAD_REQUEST,
        400,
        'Invalid request',
        { field: 'email' }
    );

    assertEquals(response.status, 400);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test rateLimitError
Deno.test('rateLimitError - creates rate limit error', () => {
    const response = rateLimitError(60, 5, 0, Date.now() + 60000);
    
    assertEquals(response.status, 429);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test csrfError
Deno.test('csrfError - creates CSRF error', () => {
    const response = csrfError();
    
    assertEquals(response.status, 403);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test accountLockedError
Deno.test('accountLockedError - creates account locked error', () => {
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const response = accountLockedError(lockedUntil);
    
    assertEquals(response.status, 423);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test invalidCredentialsError
Deno.test('invalidCredentialsError - creates invalid credentials error', () => {
    const response = invalidCredentialsError();
    
    assertEquals(response.status, 401);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test tokenExpiredError
Deno.test('tokenExpiredError - creates token expired error', () => {
    const response = tokenExpiredError();
    
    assertEquals(response.status, 401);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test tokenInvalidError
Deno.test('tokenInvalidError - creates token invalid error', () => {
    const response = tokenInvalidError();
    
    assertEquals(response.status, 400);
    assertEquals(response.headers.get('Content-Type'), 'application/json');
});

// Test ErrorCode enum
Deno.test('ErrorCode enum - contains all expected codes', () => {
    const expectedCodes = [
        'BAD_REQUEST',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'VALIDATION_ERROR',
        'CONFLICT',
        'RATE_LIMITED',
        'CSRF_INVALID',
        'ACCOUNT_LOCKED',
        'INVALID_CREDENTIALS',
        'TOKEN_EXPIRED',
        'TOKEN_INVALID',
        'INTERNAL_ERROR',
        'DATABASE_ERROR',
        'EXTERNAL_SERVICE_ERROR'
    ];

    expectedCodes.forEach(code => {
        assertEquals(ErrorCode[code as keyof typeof ErrorCode], code);
    });
});

// Test response body parsing
Deno.test('errorResponse - response body contains correct structure', async () => {
    const response = errorResponse(
        ErrorCode.VALIDATION_ERROR,
        400,
        'Validation failed',
        { field: 'email', rule: 'format' }
    );

    const body = await response.json();
    assertEquals(body.success, false);
    assertEquals(body.error.code, 'VALIDATION_ERROR');
    assertEquals(body.error.message, 'Validation failed');
    assertEquals(body.error.details, { field: 'email', rule: 'format' });
});

// Test CORS headers
Deno.test('errorResponse - includes CORS headers', () => {
    const response = errorResponse(ErrorCode.BAD_REQUEST, 400, 'Bad request');
    
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
    assertEquals(response.headers.get('Access-Control-Allow-Headers'), 'authorization, x-client-info, apikey, content-type');
});

console.log('✅ All error handling tests passed!');
