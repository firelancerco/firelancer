import z from 'zod';
import { ID } from '../common/common-types.schema';
import { CustomerRole } from '../common';

export const CreateCustomerInput = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    emailAddress: z.string().email(),
    role: CustomerRole,
    phoneNumber: z.string().optional(),
});

export const UpdateCustomerInput = z.object({
    id: ID,
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phoneNumber: z.string().optional(),
    role: CustomerRole.optional(),
    emailAddress: z.string().email().optional(),
});

export const MutationCreateCustomerArgs = z.object({
    input: CreateCustomerInput,
});

export const MutationUpdateCustomerArgs = z.object({
    input: UpdateCustomerInput,
});
