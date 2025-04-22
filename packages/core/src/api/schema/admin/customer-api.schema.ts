import z from 'zod';
import { ID } from '../common/common-types.schema';
import { CustomerType } from '../common/customer-type.schema';

export const CreateCustomerInput = z.object({
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
    customerType: CustomerType,
    phoneNumber: z.string().optional(),
});

export const UpdateCustomerInput = z.object({
    id: ID,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    emailAddress: z.string().email().optional(),
    customerType: CustomerType.optional(),
});

export const MutationCreateCustomerArgs = z.object({
    input: CreateCustomerInput,
});

export const MutationUpdateCustomerArgs = z.object({
    input: UpdateCustomerInput,
});
