import z from 'zod';
import { ID } from '../common/common-types.schema';
import { User } from '../common/user-type.schema';

export const Administrator = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
    user: User.optional(),
});

export const AdministratorList = z.object({
    items: z.array(Administrator),
    totalItems: z.number(),
});
