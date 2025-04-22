import z from 'zod';
import { User } from '../common';

export const Customer = z.object({
    deletedAt: z.string().datetime().optional(),
    firstName: z.string().min(2).max(75),
    lastName: z.string().min(2).max(75),
    emailAddress: z.string().email(),
    phoneNumber: z.string().optional(), // TODO
    user: User.optional(),
});
