import z from 'zod';
import { ID } from '../common/common-types.schema';

export const CreateAdministratorInput = z.object({
    emailAddress: z.string().email(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    password: z.string(),
    roleIds: z.array(ID),
});

export const UpdateAdministratorInput = z.object({
    id: ID,
    emailAddress: z.string().email().optional(),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    password: z.string().optional(),
    roleIds: z.array(ID).optional(),
});

export const UpdateActiveAdministratorInput = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    emailAddress: z.string().email().optional(),
    password: z.string().optional(),
});

export const AssignRoleToAdministratorInput = z.object({
    administratorId: ID,
    roleId: ID,
});

export const DeleteAdministratorInput = z.object({
    id: ID,
});

export const DeleteAdministratorsInput = z.object({
    ids: z.array(ID),
});

export const MutationCreateAdministratorArgs = z.object({
    input: CreateAdministratorInput,
});

export const MutationUpdateAdministratorArgs = z.object({
    input: UpdateAdministratorInput,
});

export const MutationUpdateActiveAdministratorArgs = z.object({
    input: UpdateActiveAdministratorInput,
});

export const MutationAssignRoleToAdministratorArgs = z.object({
    input: AssignRoleToAdministratorInput,
});

export const MutationDeleteAdministratorArgs = z.object({
    input: DeleteAdministratorInput,
});

export const MutationDeleteAdministratorsArgs = z.object({
    input: DeleteAdministratorsInput,
});
