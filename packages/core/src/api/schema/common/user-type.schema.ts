import z from 'zod';
import { ID } from './common-types.schema';
import { Role } from './role-type.schema';

export const AuthenticationMethod = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    strategy: z.string().optional(),
    // TODO
    user: z.any(),
});

export const User = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    authenticationMethods: z.array(AuthenticationMethod).optional(),
    identifier: z.string(),
    lastLogin: z.coerce.date().optional(),
    verified: z.boolean(),
    roles: z.array(Role),
});
