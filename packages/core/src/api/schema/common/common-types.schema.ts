import z from 'zod';
import { SortOrder } from './common-enums.schema';
import { LanguageCode } from './language-code.schema';

export const ID = z.string().uuid().or(z.coerce.number());

export const PaginatedList = z.object({
    items: z.array(z.any()),
    totalItems: z.number(),
});

export const LocalizedString = z.object({
    languageCode: LanguageCode,
    value: z.string(),
});

export const ConfigArg = z.object({
    name: z.string(),
    value: z.string(),
});

export const ConfigArgDefinition = z.object({
    defaultValue: z.string().optional(),
    description: z.string().optional(),
    label: z.string().optional(),
    list: z.boolean(),
    name: z.string(),
    required: z.boolean(),
    type: z.string(),
});

export const ConfigurableOperation = z.object({
    args: z.array(ConfigArg),
    code: z.string(),
});

export const ConfigArgInput = z.object({
    name: z.string(),
    // A JSON stringified representation of the actual value
    value: z.string(),
});

export const ConfigurableOperationInput = z.object({
    arguments: z.array(ConfigArgInput),
    code: z.string(),
});

export const ConfigurableOperationDefinition = z.object({
    args: z.array(ConfigArgDefinition),
    code: z.string(),
    description: z.string(),
});

// Operators for filtering on a String field
export const StringOperators = z.object({
    eq: z.string().optional(),
    notEq: z.string().optional(),
    contains: z.string().optional(),
    notContains: z.string().optional(),
    in: z.array(z.string()).optional(),
    notIn: z.array(z.string()).optional(),
    regex: z.string().optional(),
    isNull: z.boolean().optional(),
});

// Operators for filtering on an ID field
export const IdOperators = z.object({
    eq: z.string().optional(),
    notEq: z.string().optional(),
    in: z.array(z.string()).optional(),
    notIn: z.array(z.string()).optional(),
    isNull: z.boolean().optional(),
});

// Operators for filtering on a Boolean field
export const BooleanOperators = z.object({
    eq: z.boolean().optional(),
    isNull: z.boolean().optional(),
});

export const NumberRange = z.object({
    end: z.number(),
    start: z.number(),
});

// Operators for filtering on a Int or Float field
export const NumberOperators = z.object({
    eq: z.number().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    between: NumberRange.optional(),
    isNull: z.boolean().optional(),
});

export const DateRange = z.object({
    end: z.string().datetime(),
    start: z.string().datetime(),
});

// Operators for filtering on a DateTime field
export const DateOperators = z.object({
    after: z.string().datetime().optional(),
    before: z.string().datetime().optional(),
    between: DateRange.optional(),
    eq: z.string().datetime().optional(),
    isNull: z.boolean().optional(),
});

/**
 *Used to construct boolean expressions for filtering search results
 *by FacetValue ID. Examples:
 * ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
 * ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
 * ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }`
 */
export const FacetValueFilterInput = z.object({
    and: ID.optional(),
    or: z.array(ID).optional(),
});

export const SearchIndex = z.enum(['JobPost', 'Profile']);

export const BaseSearchResultSortParameter = z.object({});

// TODO
export const JobPostSearchResultSortParameter = BaseSearchResultSortParameter.extend({
    title: SortOrder.optional(),
});

// TODO
export const ProfileSearchResultSortParameter = BaseSearchResultSortParameter.extend({
    title: SortOrder.optional(),
    overview: SortOrder.optional(),
});

export const BaseSearchResult = z.object({
    id: ID,
    collectionIds: z.array(ID),
    facetIds: z.array(ID),
    facetValueIds: z.array(ID),
    score: z.number(),
});

export const JobPostSearchResult = BaseSearchResult.extend({
    title: z.string(),
    description: z.string(),
    currencyCode: z.string(),
    budget: z.number().int(),
});

export const ProfileSearchResult = BaseSearchResult.extend({
    title: z.string(),
    overview: z.string(),
});

export const BaseSearchInput = z.object({
    index: SearchIndex,
    collectionId: ID.optional(),
    collectionSlug: z.string().optional(),
    facetValueFilters: z.array(FacetValueFilterInput).optional(),
    skip: z.number().optional(),
    take: z.number().optional(),
    term: z.string().optional(),
});

export const JobPostSearchInput = BaseSearchInput.extend({
    sort: JobPostSearchResultSortParameter.optional(),
});

export const ProfileSearchInput = BaseSearchInput.extend({
    sort: ProfileSearchResultSortParameter.optional(),
});

export const SearchResult = z.object({
    index: SearchIndex,
    result: z.array(z.union([ProfileSearchResult, JobPostSearchResult])),
});

export const SearchInput = z.object({
    search: z.discriminatedUnion('index', [
        JobPostSearchInput.extend({ index: z.literal('JobPost') }),
        ProfileSearchInput.extend({ index: z.literal('Profile') }),
    ]),
});
