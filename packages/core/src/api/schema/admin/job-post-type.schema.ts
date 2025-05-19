import z from 'zod';
import { JobPostState, JobPostVisibility, LogicalOperator, OrderableAsset, SortOrder } from '../common';
import { DateOperators, ID, IdOperators, NumberOperators, StringOperators } from '../common/common-types.schema';
import { Collection } from './collection-type.schema';
import { Customer } from './customer-type.schema';
import { FacetValue } from './facet-value-type.schema';

export const JobPost: z.ZodType<any> = z.object({
    id: ID,
    customerId: ID,
    customer: Customer.optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    deletedAt: z.coerce.date().nullable().optional(),
    publishedAt: z.coerce.date().nullable().optional(),
    closedAt: z.coerce.date().nullable().optional(),
    rejectedAt: z.coerce.date().nullable().optional(),
    editedAt: z.coerce.date().nullable().optional(),
    state: JobPostState,
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    visibility: JobPostVisibility,
    budget: z.number().int().nullable().optional(),
    currencyCode: z.string().nullable().optional(),
    requiredSkills: z.array(FacetValue),
    requiredCategory: FacetValue.nullable().optional(),
    requiredExperienceLevel: FacetValue.nullable().optional(),
    requiredJobDuration: FacetValue.nullable().optional(),
    requiredJobScope: FacetValue.nullable().optional(),
    facetValues: z.array(FacetValue).optional(),
    assets: z.lazy(() => z.array(JobPostAsset).optional()),
    collections: z.lazy(() => z.array(Collection).optional()),
});

export const JobPostAsset = OrderableAsset.extend({
    jobPostId: ID,
    jobPost: JobPost.optional(),
});

export const JobPostList = z.object({
    items: z.array(JobPost),
    totalItems: z.number(),
});

export const JobPostSortParameter = z.object({
    id: SortOrder.optional(),
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    closedAt: SortOrder.optional(),
    publishedAt: SortOrder.optional(),
});

export const JobPostFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(JobPostFilterParameter).optional()),
    _or: z.lazy(() => z.array(JobPostFilterParameter).optional()),
    id: IdOperators.optional(),
    title: StringOperators.optional(),
    description: StringOperators.optional(),
    budget: NumberOperators.optional(),
    facetValueId: IdOperators.optional(),
    visibility: StringOperators.optional(),
    state: StringOperators.optional(),
    publishedAt: DateOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    closedAt: DateOperators.optional(),
});

export const JobPostListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: JobPostSortParameter.optional(),
    filter: JobPostFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
});
