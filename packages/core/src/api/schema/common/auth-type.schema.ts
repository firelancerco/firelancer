import z from 'zod';
import { ID } from './common-types.schema';
import { Permission } from './common-enums.schema';

export const CurrentUserRole = z.object({
    code: z.string(),
    description: z.string(),
});

export const CurrentUser = z.object({
    id: ID,
    identifier: z.string(),
    verified: z.boolean(),
    roles: z.array(CurrentUserRole),
    permissions: z.array(Permission),
});
