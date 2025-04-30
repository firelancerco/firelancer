import z from 'zod';
import { CustomerRole } from '../common';

export const RegisterCustomerInput = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    emailAddress: z.string().email(),
    phoneNumber: z.string().optional(),
    role: CustomerRole.optional(),
    password: z.string(),
});

// TODO: add avatar
export const UpdateCustomerInput = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    role: CustomerRole.optional(),
});

export const MutationRegisterCustomerAccountArgs = z.object({
    input: RegisterCustomerInput,
});

export const MutationUpdateCustomerArgs = z.object({
    input: UpdateCustomerInput,
});

export const MutationVerifyCustomerAccountArgs = z.object({
    token: z.string(),
    password: z.string().optional(),
});

export const MutationRefreshCustomerVerificationArgs = z.object({
    emailAddress: z.string().email(),
});

export const MutationRequestPasswordResetArgs = z.object({
    emailAddress: z.string().email(),
});

export const MutationResetPasswordArgs = z.object({
    token: z.string(),
    password: z.string(),
});

export const MutationUpdateCustomerPasswordArgs = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
});

export const MutationRequestUpdateCustomerEmailAddressArgs = z.object({
    password: z.string(),
    newEmailAddress: z.string().email(),
});

export const MutationUpdateCustomerEmailAddressArgs = z.object({
    token: z.string(),
});

export const MutationValidateEmailAddressArgs = z.object({
    emailAddress: z.string().email(),
});
