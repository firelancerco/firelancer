import z from 'zod';
import { CustomerType } from '../common/customer-type.schema';
import { ID } from '../common/common-types.schema';

export const RegisterCustomerInput = z.object({
    emailAddress: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional(),
    password: z.string(),
    customerType: CustomerType,
});

// TODO: add avatar
export const UpdateCustomerInput = z.object({
    id: ID,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    emailAddress: z.string().email().optional(),
    customerType: CustomerType.optional(),
});

export const MutationRegisterCustomerAccountArgs = z.object({
    input: RegisterCustomerInput,
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
