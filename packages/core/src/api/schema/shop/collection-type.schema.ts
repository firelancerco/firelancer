import z from 'zod';
import { LogicalOperator, SortOrder } from '../common/common-enums.schema';
import {
    BooleanOperators,
    ConfigurableOperation,
    DateOperators,
    ID,
    IdOperators,
    NumberOperators,
    StringOperators,
} from '../common/common-types.schema';
import { CollectionBreadcrumb, CollectionTranslation, LanguageCode, OrderableAsset } from '../common';

export const Collection: z.ZodType<any> = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    languageCode: LanguageCode,
    name: z.string().min(3).max(255),
    slug: z.string().min(3).max(255),
    description: z.string().min(0).max(750),
    breadcrumbs: z.array(CollectionBreadcrumb).optional(),
    filters: z.array(ConfigurableOperation).optional(),
    parent: z.lazy(() => Collection.optional()),
    children: z.lazy(() => Collection.array().optional()),
    assets: z.lazy(() => CollectionAsset.array().optional()),
    translations: z.lazy(() => CollectionTranslation.array().optional()),
});

export const CollectionAsset = OrderableAsset.extend({
    collectionId: ID,
    collection: Collection.optional(),
});

export const CollectionList = z.object({
    items: z.array(Collection),
    totalItems: z.number(),
});

export const CollectionSortParameter = z.object({
    createdAt: SortOrder.optional(),
    updatedAt: SortOrder.optional(),
    name: SortOrder.optional(),
    position: SortOrder.optional(),
    description: SortOrder.optional(),
    slug: SortOrder.optional(),
});

export const CollectionFilterParameter: z.ZodType<any> = z.object({
    _and: z.lazy(() => z.array(CollectionFilterParameter).optional()),
    _or: z.lazy(() => z.array(CollectionFilterParameter).optional()),
    id: IdOperators.optional(),
    createdAt: DateOperators.optional(),
    updatedAt: DateOperators.optional(),
    languageCode: StringOperators.optional(),
    name: StringOperators.optional(),
    slug: StringOperators.optional(),
    position: NumberOperators.optional(),
    description: StringOperators.optional(),
    parentId: IdOperators.optional(),
    topLevelOnly: BooleanOperators.optional(),
});

export const CollectionListOptions = z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
    sort: CollectionSortParameter.optional(),
    filter: CollectionFilterParameter.optional(),
    filterOperator: LogicalOperator.optional(),
    topLevelOnly: z.boolean().optional(),
});
