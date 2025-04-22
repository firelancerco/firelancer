import z from 'zod';
import { ConfigurableOperation, ID } from '../common/common-types.schema';
import { LanguageCode } from '../common/language-code.schema';

export const MoveCollectionInput = z.object({
    collectionId: ID,
    index: z.number(),
    parentId: ID,
});

export const CreateCollectionTranslationInput = z.object({
    languageCode: LanguageCode,
    name: z.string(),
    slug: z.string(),
    description: z.string(),
});

export const UpdateCollectionTranslationInput = z.object({
    id: ID.optional(),
    languageCode: LanguageCode,
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
});

export const CreateCollectionInput = z.object({
    translations: z.array(CreateCollectionTranslationInput),
    featuredAssetId: ID.optional(),
    assetIds: z.array(ID).optional(),
    filters: z.array(ConfigurableOperation),
    inheritFilters: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
    parentId: ID.optional(),
});

export const UpdateCollectionInput = z.object({
    id: ID,
    translations: z.array(UpdateCollectionTranslationInput).optional(),
    featuredAssetId: ID.optional(),
    assetIds: z.array(ID).optional(),
    filters: z.array(ConfigurableOperation).optional(),
    inheritFilters: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
    parentId: ID.optional(),
});

export const MutationMoveCollectionArgs = z.object({
    input: MoveCollectionInput,
});

export const MutationCreateCollectionArgs = z.object({
    input: CreateCollectionInput,
});

export const MutationUpdateCollectionArgs = z.object({
    input: UpdateCollectionInput,
});
