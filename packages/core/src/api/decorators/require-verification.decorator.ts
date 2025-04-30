import { SetMetadata } from '@nestjs/common';

export const VERIFICATION_METADATA_KEY = '__verification__';
export enum Verification {
    EMAIL = 'EMAIL',
}

/**
 * @description
 * Attaches metadata to the resolver or route handler defining which verifications are required
 * to execute the operation, using one or more Verification values.
 *
 * This decorator works in conjunction with the verification guard to ensure that users have
 * completed the necessary verification steps before accessing protected resources.
 *
 * @example
 * ```ts
 *  \@RequireVerification(Verifications.EMAIL)
 *  \@Get()
 *  getProtectedResource() {
 *      // This route will only be accessible to users who have verified their email
 *  }
 * ```
 */
export const RequireVerification = (...verifications: Verification[]) =>
    SetMetadata(VERIFICATION_METADATA_KEY, verifications);
