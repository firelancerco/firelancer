import z from 'zod';
import { LogicalOperator, SortOrder } from './common-enums.schema';
import { DateOperators, ID, IdOperators, StringOperators } from './common-types.schema';
import { LanguageCode } from './language-code.schema';
import { FacetValue } from './facet-value-type.schema';

export const FacetTranslation = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    name: z.string(),
    languageCode: LanguageCode,
});

export const Facet = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    code: z.string(),
    languageCode: LanguageCode.optional(),
    name: z.string().optional(),
    translations: z.array(FacetTranslation),
    facetValues: z.lazy(() => z.array(FacetValue).optional()),
});

export const FacetList = z.object({
    items: z.array(Facet),
    totalItems: z.number(),
});

export const FacetSortParameter = z.object({
    id: SortOrder.optional(),
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    code: SortOrder.optional(),
    name: SortOrder.optional(),
});

export const FacetFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(FacetFilterParameter).optional()),
    _or: z.lazy(() => z.array(FacetFilterParameter).optional()),
    id: IdOperators.optional(),
    code: StringOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    languageCode: StringOperators.optional(),
    name: StringOperators.optional(),
});

export const FacetListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: FacetSortParameter.optional(),
    filter: FacetFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
});
