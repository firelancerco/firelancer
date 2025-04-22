import z from 'zod';
import { Permission } from '../common/common-enums.schema';
import { ID } from '../common/common-types.schema';

export const CreateRoleInput = z.object({
    code: z.string(),
    description: z.string(),
    permissions: z.array(Permission),
});

export const UpdateRoleInput = z.object({
    id: ID,
    code: z.string().optional(),
    description: z.string().optional(),
    permissions: z.array(Permission).optional(),
});

export const DeleteRoleInput = z.object({
    id: ID,
});

export const DeleteRolesInput = z.object({
    ids: z.array(ID),
});

export const MutationCreateRoleArgs = z.object({
    input: CreateRoleInput,
});

export const MutationUpdateRoleArgs = z.object({
    input: UpdateRoleInput,
});

export const MutationDeleteRoleArgs = z.object({
    input: DeleteRoleInput,
});

export const MutationDeleteRolesArgs = z.object({
    input: DeleteRolesInput,
});
