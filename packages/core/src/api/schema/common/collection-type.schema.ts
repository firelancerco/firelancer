import z from 'zod';
import { ID } from './common-types.schema';

export const CollectionBreadcrumb = z.object({
    id: ID,
    name: z.string(),
    slug: z.string(),
});
