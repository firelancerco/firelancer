import z from 'zod';
import { CustomerRole, User } from '../common';
import { LogicalOperator, SortOrder } from '../common/common-enums.schema';
import { DateOperators, ID, IdOperators, StringOperators } from '../common/common-types.schema';
import { HistoryEntry } from './history-entry-type.schema';

export const Customer = z.object({
    id: ID,
    firstName: z.string().min(2).max(75),
    lastName: z.string().min(2).max(75),
    emailAddress: z.string().email(),
    role: CustomerRole.nullable(),
    phoneNumber: z.string().nullable(), // TODO
    user: User.optional(),
    deletedAt: z.coerce.date().nullable(),
    history: z.array(HistoryEntry),
});

export const CustomerList = z.object({
    items: z.array(Customer),
    totalItems: z.number(),
});

export const CustomerSortParameter = z.object({
    id: SortOrder.optional(),
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    firstName: SortOrder.optional(),
    lastName: SortOrder.optional(),
    emailAddress: SortOrder.optional(),
    phoneNumber: SortOrder.optional(),
});

export const CustomerFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(CustomerFilterParameter).optional()),
    _or: z.lazy(() => z.array(CustomerFilterParameter).optional()),
    id: IdOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    firstName: StringOperators.optional(),
    lastName: StringOperators.optional(),
    emailAddress: StringOperators.optional(),
    phoneNumber: StringOperators.optional(),
});

export const CustomerListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: CustomerSortParameter.optional(),
    filter: CustomerFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
});
