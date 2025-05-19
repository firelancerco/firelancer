import z from 'zod';
import { ID } from './common-types.schema';

export const Coordinate = z.object({
    x: z.number(),
    y: z.number(),
});

export const AssetType = z.enum(['BINARY', 'IMAGE', 'VIDEO']);

export const Asset = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    fileSize: z.number().int().positive(),
    focalPoint: Coordinate.optional(),
    height: z.number().int().positive(),
    mimeType: z.string(),
    name: z.string(),
    preview: z.string(),
    source: z.string(),
    width: z.number().int().positive(),
    type: AssetType,
});

export const AssetList = z.object({
    items: z.array(Asset),
    totalItems: z.number(),
});

export const OrderableAsset = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    assetId: ID,
    asset: Asset.optional(),
    position: z.number().int(),
});
