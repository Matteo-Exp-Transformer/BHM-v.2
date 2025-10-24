// =============================================================================
// VALIDATION LOGIC - Auth System
// Regole da USER_STORIES e COMPONENT_SPECS di Agente 3
// =============================================================================

import { 
    LoginRequest, 
    RecoveryRequestRequest, 
    RecoveryConfirmRequest, 
    InviteAcceptRequest
} from './types.ts';

/**
 * Validation error class
 */
export class ValidationError extends Error {
    constructor(
        public field: string,
        public rule: string,
        message: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Aggregate validation error (multiple errors)
 */
export class AggregateValidationError extends Error {
    constructor(public errors: ValidationError[]) {
        super('Validation failed');
        this.name = 'AggregateValidationError';
    }

    toJSON() {
        return {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: this.errors.map(e => ({
                field: e.field,
                rule: e.rule,
                message: e.message
            }))
        };
    }
}

/**
 * Validate LOGIN request
 * Basato su acceptance criteria di Agente 3
 */
export function validateLoginRequest(data: LoginRequest): void {
    const errors: ValidationError[] = [];

    // Email: Required, valid format (RFC 5322)
    if (!data.email || typeof data.email !== 'string') {
        errors.push(new ValidationError('email', 'required', 'Email is required'));
    } else if (!isValidEmail(data.email)) {
        errors.push(new ValidationError('email', 'format', 'Email format is invalid'));
    }

    // Password: Required, min 12 chars, only letters
    if (!data.password || typeof data.password !== 'string') {
        errors.push(new ValidationError('password', 'required', 'Password is required'));
    } else if (data.password.length < 12) {
        errors.push(new ValidationError('password', 'min_length', 'Password must be at least 12 characters'));
    } else if (data.password.length > 128) {
        errors.push(new ValidationError('password', 'max_length', 'Password must be at most 128 characters'));
    } else if (!/^[A-Za-z]+$/.test(data.password)) {
        errors.push(new ValidationError('password', 'format', 'Password must contain only letters'));
    }

    // CSRF Token: Required, valid format
    if (!data.csrf_token || typeof data.csrf_token !== 'string') {
        errors.push(new ValidationError('csrf_token', 'required', 'CSRF token is required'));
    } else if (!isValidToken(data.csrf_token)) {
        errors.push(new ValidationError('csrf_token', 'format', 'CSRF token format is invalid'));
    }

    if (errors.length > 0) {
        throw new AggregateValidationError(errors);
    }
}

/**
 * Validate RECOVERY REQUEST
 */
export function validateRecoveryRequest(data: RecoveryRequestRequest): void {
    const errors: ValidationError[] = [];

    // Email: Required, valid format
    if (!data.email || typeof data.email !== 'string') {
        errors.push(new ValidationError('email', 'required', 'Email is required'));
    } else if (!isValidEmail(data.email)) {
        errors.push(new ValidationError('email', 'format', 'Email format is invalid'));
    }

    // CSRF Token: Required
    if (!data.csrf_token || typeof data.csrf_token !== 'string') {
        errors.push(new ValidationError('csrf_token', 'required', 'CSRF token is required'));
    } else if (!isValidToken(data.csrf_token)) {
        errors.push(new ValidationError('csrf_token', 'format', 'CSRF token format is invalid'));
    }

    if (errors.length > 0) {
        throw new AggregateValidationError(errors);
    }
}

/**
 * Validate RECOVERY CONFIRM request
 */
export function validateRecoveryConfirm(data: RecoveryConfirmRequest): void {
    const errors: ValidationError[] = [];

    // Token: Required, valid format
    if (!data.token || typeof data.token !== 'string') {
        errors.push(new ValidationError('token', 'required', 'Recovery token is required'));
    } else if (!isValidToken(data.token)) {
        errors.push(new ValidationError('token', 'format', 'Recovery token format is invalid'));
    }

    // Password: Required, min 12 chars, only letters
    if (!data.password || typeof data.password !== 'string') {
        errors.push(new ValidationError('password', 'required', 'Password is required'));
    } else if (data.password.length < 12) {
        errors.push(new ValidationError('password', 'min_length', 'Password must be at least 12 characters'));
    } else if (data.password.length > 128) {
        errors.push(new ValidationError('password', 'max_length', 'Password must be at most 128 characters'));
    } else if (!/^[A-Za-z]+$/.test(data.password)) {
        errors.push(new ValidationError('password', 'format', 'Password must contain only letters'));
    }

    // CSRF Token: Required
    if (!data.csrf_token || typeof data.csrf_token !== 'string') {
        errors.push(new ValidationError('csrf_token', 'required', 'CSRF token is required'));
    } else if (!isValidToken(data.csrf_token)) {
        errors.push(new ValidationError('csrf_token', 'format', 'CSRF token format is invalid'));
    }

    if (errors.length > 0) {
        throw new AggregateValidationError(errors);
    }
}

/**
 * Validate INVITE ACCEPT request
 */
export function validateInviteAccept(data: InviteAcceptRequest): void {
    const errors: ValidationError[] = [];

    // Token: Required, valid format
    if (!data.token || typeof data.token !== 'string') {
        errors.push(new ValidationError('token', 'required', 'Invite token is required'));
    } else if (!isValidToken(data.token)) {
        errors.push(new ValidationError('token', 'format', 'Invite token format is invalid'));
    }

    // First Name: Required, min 2 chars, max 100
    if (!data.first_name || typeof data.first_name !== 'string') {
        errors.push(new ValidationError('first_name', 'required', 'First name is required'));
    } else if (data.first_name.trim().length < 2) {
        errors.push(new ValidationError('first_name', 'min_length', 'First name must be at least 2 characters'));
    } else if (data.first_name.length > 100) {
        errors.push(new ValidationError('first_name', 'max_length', 'First name must be at most 100 characters'));
    }

    // Last Name: Required, min 2 chars, max 100
    if (!data.last_name || typeof data.last_name !== 'string') {
        errors.push(new ValidationError('last_name', 'required', 'Last name is required'));
    } else if (data.last_name.trim().length < 2) {
        errors.push(new ValidationError('last_name', 'min_length', 'Last name must be at least 2 characters'));
    } else if (data.last_name.length > 100) {
        errors.push(new ValidationError('last_name', 'max_length', 'Last name must be at most 100 characters'));
    }

    // Password: Required, min 12 chars, only letters
    if (!data.password || typeof data.password !== 'string') {
        errors.push(new ValidationError('password', 'required', 'Password is required'));
    } else if (data.password.length < 12) {
        errors.push(new ValidationError('password', 'min_length', 'Password must be at least 12 characters'));
    } else if (data.password.length > 128) {
        errors.push(new ValidationError('password', 'max_length', 'Password must be at most 128 characters'));
    } else if (!/^[A-Za-z]+$/.test(data.password)) {
        errors.push(new ValidationError('password', 'format', 'Password must contain only letters'));
    }

    // CSRF Token: Required
    if (!data.csrf_token || typeof data.csrf_token !== 'string') {
        errors.push(new ValidationError('csrf_token', 'required', 'CSRF token is required'));
    } else if (!isValidToken(data.csrf_token)) {
        errors.push(new ValidationError('csrf_token', 'format', 'CSRF token format is invalid'));
    }

    if (errors.length > 0) {
        throw new AggregateValidationError(errors);
    }
}

/**
 * Business rule validation (HACCP compliance)
 * DA IMPLEMENTARE basandosi su USER_STORIES di Agente 3
 */
export function validateBusinessRules(
    data: LoginRequest | RecoveryRequestRequest | RecoveryConfirmRequest | InviteAcceptRequest,
    userRole?: string,
    existingUser?: any
): void {
    const errors: ValidationError[] = [];

    // Esempio: Solo admin può creare account per utenti critici
    if ('first_name' in data && userRole && userRole !== 'admin' && userRole !== 'owner') {
        errors.push(new ValidationError(
            'role',
            'insufficient_permissions',
            'Only admins can create new accounts'
        ));
    }

    // Esempio: Rate limiting per recovery requests
    if ('email' in data && 'token' in data === false) {
        // This is a recovery request, check if user is not locked
        if (existingUser && existingUser.locked_until && new Date(existingUser.locked_until) > new Date()) {
            errors.push(new ValidationError(
                'account',
                'locked',
                'Account is temporarily locked due to too many failed attempts'
            ));
        }
    }

    if (errors.length > 0) {
        throw new AggregateValidationError(errors);
    }
}

/**
 * Helper: Check if string is valid email (RFC 5322)
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 255;
}

/**
 * Helper: Check if string is valid token (UUID or similar)
 */
function isValidToken(token: string): boolean {
    // Token should be at least 32 chars and contain only alphanumeric chars and hyphens
    const tokenRegex = /^[a-zA-Z0-9-]{32,}$/;
    return tokenRegex.test(token);
}
