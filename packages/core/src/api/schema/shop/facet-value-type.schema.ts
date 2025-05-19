import z from 'zod';
import { ID, IdOperators, LanguageCode, LogicalOperator, SortOrder, StringOperators } from '../common';
import { Facet } from './facet-type.schema';

export const FacetValueTranslation = z.object({
    languageCode: LanguageCode,
    name: z.string(),
});

export const FacetValue: z.ZodType<any> = z.object({
    id: ID,
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
    code: SortOrder.optional(),
    facetId: SortOrder.optional(),
    name: SortOrder.optional(),
});

export const FacetValueFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(FacetValueFilterParameter).optional()),
    _or: z.lazy(() => z.array(FacetValueFilterParameter).optional()),
    id: IdOperators.optional(),
    code: StringOperators.optional(),
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
