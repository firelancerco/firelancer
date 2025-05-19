import z from 'zod';
import { Facet } from './facet-type.schema';
import { DateOperators, ID, IdOperators, LanguageCode, LogicalOperator, SortOrder, StringOperators } from '../common';

export const FacetValueTranslation = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    languageCode: LanguageCode,
    name: z.string(),
});

export const FacetValue: z.ZodType<any> = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    code: z.string(),
    facetId: ID,
    languageCode: LanguageCode.optional(),
    name: z.string().optional(),
    translations: z.array(FacetValueTranslation),
    facet: z.lazy(() => Facet.optional()),
});

export const FacetValueList = z.object({
    items: z.array(FacetValue),
    totalItems: z.number(),
});

export const FacetValueSortParameter = z.object({
    id: SortOrder.optional(),
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    code: SortOrder.optional(),
    facetId: SortOrder.optional(),
    name: SortOrder.optional(),
});

export const FacetValueFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(FacetValueFilterParameter).optional()),
    _or: z.lazy(() => z.array(FacetValueFilterParameter).optional()),
    id: IdOperators.optional(),
    code: StringOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    languageCode: StringOperators.optional(),
    name: StringOperators.optional(),
    facetId: IdOperators.optional(),
});

export const FacetValueListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: FacetValueSortParameter.optional(),
    filter: FacetValueFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
});
