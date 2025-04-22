import { ID } from '@firelancerco/common/lib/generated-schema';
import { HttpStatus } from '@nestjs/common';
import { ParseKeys } from 'i18next';

import { LogLevel } from '../../config';
import { coreEntitiesMap } from '../../entity';
import { I18nException } from '../../i18n';
import { JobPostState } from '../../service';

/**
 * @description
 * This error should be thrown when some unexpected and exceptional case is encountered.
 */
export class InternalServerException extends I18nException {
    constructor(key: ParseKeys, variables: { [key: string]: string | number } = {}) {
        super(key, HttpStatus.INTERNAL_SERVER_ERROR, variables, LogLevel.Error);
    }
}

/**
 * @description
 * This error should be thrown when user input is not as expected.
 */
export class UserInputException extends I18nException {
    constructor(key: ParseKeys, variables: { [key: string]: string | number } = {}) {
        super(key, HttpStatus.BAD_REQUEST, variables, LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an operation is attempted which is not allowed.
 */
export class IllegalOperationException extends I18nException {
    constructor(key: ParseKeys, variables: { [key: string]: string | number } = {}) {
        super(key, HttpStatus.FORBIDDEN, variables, LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when the user's authentication credentials do not match.
 */
export class UnauthorizedException extends I18nException {
    constructor() {
        super('error.unauthorized', HttpStatus.UNAUTHORIZED, {}, LogLevel.Info);
    }
}

/**
 * @description
 * This error should be thrown when a user attempts to access a resource which is outside of
 * his or her privileges.
 */
export class ForbiddenException extends I18nException {
    constructor(logLevel: LogLevel = LogLevel.Warn) {
        super('error.forbidden', HttpStatus.FORBIDDEN, {}, logLevel);
    }
}

/**
 * @description
 * This error should be thrown when an entity cannot be found in the database, i.e. no entity of
 * the given entityName (Product, User etc.) exists with the provided id.
 */
export class EntityNotFoundException extends I18nException {
    constructor(entityName: keyof typeof coreEntitiesMap | string, id: ID) {
        super('error.entity-with-id-not-found', HttpStatus.NOT_FOUND, { entityName, id }, LogLevel.Warn);
    }
}

export class InvalidCredentialsException extends I18nException {
    constructor(authenticationError: ParseKeys = 'error.invalid-credentials') {
        super(authenticationError, HttpStatus.UNAUTHORIZED, {});
    }
}

export class NotVerifiedException extends I18nException {
    readonly refundId: ID;
    constructor() {
        super('error.not-verified', HttpStatus.FORBIDDEN, {});
    }
}

export class PasswordValidationException extends I18nException {
    readonly validationErrorMessage: string;
    constructor(input: { validationErrorMessage: string }) {
        super('error.password-validation', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
        this.validationErrorMessage = input.validationErrorMessage;
    }
}

export class NativeAuthStrategyException extends I18nException {
    constructor() {
        super('errorResult.NATIVE_AUTH_STRATEGY_ERROR', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class EmailAddressConflictException extends I18nException {
    constructor() {
        super('error.email-address-conflict', HttpStatus.CONFLICT, {}, LogLevel.Warn);
    }
}

export class MissingPasswordException extends I18nException {
    constructor() {
        super('error.missing-password', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class PasswordAlreadySetException extends I18nException {
    constructor(public description: string = 'PASSWORD_ALREADY_SET_ERROR') {
        super('error.password-already-set', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class VerificationTokenExpiredException extends I18nException {
    constructor() {
        super('error.verification-token-expired', HttpStatus.GONE, {}, LogLevel.Warn);
    }
}

export class VerificationTokenInvalidException extends I18nException {
    constructor() {
        super('error.verification-token-invalid', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class PasswordResetTokenInvalidException extends I18nException {
    constructor() {
        super('error.password-reset-token-invalid', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class PasswordResetTokenExpiredException extends I18nException {
    constructor() {
        super('error.password-reset-token-expired', HttpStatus.GONE, {}, LogLevel.Warn);
    }
}

export class IdentifierChangeTokenInvalidException extends I18nException {
    constructor() {
        super('errorResult.IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR', HttpStatus.BAD_REQUEST, {}, LogLevel.Warn);
    }
}

export class IdentifierChangeTokenExpiredException extends I18nException {
    constructor() {
        super('errorResult.IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR', HttpStatus.GONE, {}, LogLevel.Warn);
    }
}

export class JobPostStateTransitionException extends I18nException {
    constructor(input: { fromState: JobPostState; toState: JobPostState; transitionError: ParseKeys }) {
        super(input.transitionError, HttpStatus.BAD_REQUEST, input, LogLevel.Warn);
    }
}

export class MimeTypeException extends I18nException {
    constructor(input: { fileName: string; mimeType: string }) {
        super('errorResult.MIME_TYPE_ERROR', HttpStatus.BAD_REQUEST, input, LogLevel.Warn);
    }
}
