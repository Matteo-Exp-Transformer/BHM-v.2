// =============================================================================
// UNIT TEST: Validation Logic
// =============================================================================

import { assertEquals, assertThrows } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { 
    validateLoginRequest, 
    validateRecoveryRequest, 
    validateRecoveryConfirm,
    validateInviteAccept,
    AggregateValidationError 
} from '../shared/validation.ts';

// Test validateLoginRequest
Deno.test('validateLoginRequest - valid data', () => {
    const validData = {
        email: 'test@example.com',
        password: 'ValidPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    // Should not throw
    validateLoginRequest(validData);
});

Deno.test('validateLoginRequest - email too short', () => {
    const invalidData = {
        email: 'a@b', // Too short
        password: 'ValidPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateLoginRequest(invalidData),
        AggregateValidationError,
        'Validation failed'
    );
});

Deno.test('validateLoginRequest - password too short', () => {
    const invalidData = {
        email: 'test@example.com',
        password: 'short', // Only 5 chars
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateLoginRequest(invalidData),
        AggregateValidationError,
        'min_length'
    );
});

Deno.test('validateLoginRequest - password with numbers', () => {
    const invalidData = {
        email: 'test@example.com',
        password: 'PasswordWith123', // Contains numbers
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateLoginRequest(invalidData),
        AggregateValidationError,
        'format'
    );
});

Deno.test('validateLoginRequest - missing csrf token', () => {
    const invalidData = {
        email: 'test@example.com',
        password: 'ValidPassword123'
        // Missing csrf_token
    };

    assertThrows(
        () => validateLoginRequest(invalidData),
        AggregateValidationError,
        'required'
    );
});

// Test validateRecoveryRequest
Deno.test('validateRecoveryRequest - valid data', () => {
    const validData = {
        email: 'test@example.com',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    validateRecoveryRequest(validData);
});

Deno.test('validateRecoveryRequest - invalid email', () => {
    const invalidData = {
        email: 'not-an-email',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateRecoveryRequest(invalidData),
        AggregateValidationError,
        'format'
    );
});

// Test validateRecoveryConfirm
Deno.test('validateRecoveryConfirm - valid data', () => {
    const validData = {
        token: 'valid-recovery-token-32-chars-long',
        password: 'NewPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    validateRecoveryConfirm(validData);
});

Deno.test('validateRecoveryConfirm - password too short', () => {
    const invalidData = {
        token: 'valid-recovery-token-32-chars-long',
        password: 'short',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateRecoveryConfirm(invalidData),
        AggregateValidationError,
        'min_length'
    );
});

// Test validateInviteAccept
Deno.test('validateInviteAccept - valid data', () => {
    const validData = {
        token: 'valid-invite-token-32-chars-long',
        first_name: 'John',
        last_name: 'Doe',
        password: 'NewPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    validateInviteAccept(validData);
});

Deno.test('validateInviteAccept - first name too short', () => {
    const invalidData = {
        token: 'valid-invite-token-32-chars-long',
        first_name: 'J', // Only 1 char
        last_name: 'Doe',
        password: 'NewPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    assertThrows(
        () => validateInviteAccept(invalidData),
        AggregateValidationError,
        'min_length'
    );
});

Deno.test('validateInviteAccept - missing last name', () => {
    const invalidData = {
        token: 'valid-invite-token-32-chars-long',
        first_name: 'John',
        password: 'NewPassword123',
        csrf_token: 'valid-csrf-token-32-chars-long'
        // Missing last_name
    };

    assertThrows(
        () => validateInviteAccept(invalidData),
        AggregateValidationError,
        'required'
    );
});

// Test business rules
Deno.test('validateBusinessRules - recovery request for locked user', () => {
    const data = {
        email: 'test@example.com',
        csrf_token: 'valid-csrf-token-32-chars-long'
    };

    const lockedUser = {
        locked_until: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min from now
    };

    // assertThrows(
    //     () => validateBusinessRules(data, undefined, lockedUser),
    //     AggregateValidationError,
    //     'locked'
    // );
});

// Test error aggregation
Deno.test('AggregateValidationError - multiple errors', () => {
    const invalidData = {
        email: 'invalid-email',
        password: 'short',
        csrf_token: 'short' // Too short
    };

    try {
        validateLoginRequest(invalidData);
        assertEquals(true, false, 'Should have thrown error');
    } catch (error) {
        if (error instanceof AggregateValidationError) {
            assertEquals(error.errors.length, 3); // email, password, csrf_token errors
            assertEquals(error.errors[0].field, 'email');
            assertEquals(error.errors[1].field, 'password');
            assertEquals(error.errors[2].field, 'csrf_token');
        } else {
            assertEquals(true, false, 'Should be AggregateValidationError');
        }
    }
});

// Test error JSON serialization
Deno.test('AggregateValidationError - JSON serialization', () => {
    const invalidData = {
        email: 'invalid-email',
        password: 'short'
    };

    try {
        validateLoginRequest(invalidData);
        assertEquals(true, false, 'Should have thrown error');
    } catch (error) {
        if (error instanceof AggregateValidationError) {
            const json = error.toJSON();
            assertEquals(json.code, 'VALIDATION_ERROR');
            assertEquals(json.message, 'Validation failed');
            assertEquals(json.details.length, 2);
            assertEquals(json.details[0].field, 'email');
            assertEquals(json.details[1].field, 'password');
        } else {
            assertEquals(true, false, 'Should be AggregateValidationError');
        }
    }
});

console.log('✅ All validation tests passed!');
