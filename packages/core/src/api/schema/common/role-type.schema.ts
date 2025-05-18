import z from 'zod';
import { Permission } from './common-enums.schema';
import { ID } from './common-types.schema';
import { LogicalOperator, SortOrder } from '../common/common-enums.schema';
import { DateOperators, IdOperators, StringOperators } from '../common/common-types.schema';

export const Role = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    description: z.string(),
    permissions: z.array(Permission),
});

export const RoleList = z.object({
    items: z.array(Role),
    totalItems: z.number(),
});

export const RoleSortParameter = z.object({
    id: SortOrder.optional(),
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    description: SortOrder.optional(),
    code: SortOrder.optional(),
});

export const RoleFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(RoleFilterParameter).optional()),
    _or: z.lazy(() => z.array(RoleFilterParameter).optional()),
    id: IdOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    slug: StringOperators.optional(),
    code: StringOperators.optional(),
});

export const RoleListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: RoleSortParameter.optional(),
    filter: RoleFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
});
