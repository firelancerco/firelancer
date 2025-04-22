import z from 'zod';
import { ID } from './common-types.schema';
import { LanguageCode } from './language-code.schema';

export const CollectionBreadcrumb = z.object({
    id: ID,
    name: z.string(),
    slug: z.string(),
});

export const CollectionTranslation = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    languageCode: LanguageCode,
    name: z.string(),
    slug: z.string(),
});
