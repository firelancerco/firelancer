import z from 'zod';
import { ID } from '../common/common-types.schema';

export const File = z.object({
    originalname: z.string(),
    mimetype: z.string(),
    buffer: z.any(),
    size: z.number(),
});

export const CoordinateInput = z.object({
    x: z.number(),
    y: z.number(),
});

export const CreateAssetInput = z.object({
    file: File,
});

export const DeleteAssetInput = z.object({
    assetId: ID,
    force: z.boolean().optional(),
});

export const DeleteAssetsInput = z.object({
    assetId: z.array(ID),
    force: z.boolean().optional(),
});

export const UpdateAssetInput = z.object({
    id: ID,
    name: z.string().optional(),
    focalPoint: CoordinateInput.optional(),
});
