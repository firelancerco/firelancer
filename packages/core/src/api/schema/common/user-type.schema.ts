import z from 'zod';
import { ID } from './common-types.schema';
import { Role } from './role-type.schema';

export const AuthenticationMethod = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    strategy: z.string().optional(),
    // TODO
    user: z.any(),
});

export const User = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    authenticationMethods: z.array(AuthenticationMethod),
    identifier: z.string(),
    lastLogin: z.string().datetime().optional(),
    verified: z.boolean(),
    roles: z.array(Role),
});
