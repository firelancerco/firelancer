import z from 'zod';
import { CustomerRole, User } from '../common';

export const Customer = z.object({
    firstName: z.string().min(2).max(75),
    lastName: z.string().min(2).max(75),
    emailAddress: z.string().email(),
    phoneNumber: z.string().nullable(), // TODO
    role: CustomerRole.nullable(),
    user: User.optional(),
    deletedAt: z.string().datetime().nullable(),
});
