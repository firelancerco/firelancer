import { z } from 'zod';

export const TransformImageOptions = z.object({
    /** Width of the output image in pixels */
    w: z.coerce.number().optional(),

    /** Height of the output image in pixels */
    h: z.coerce.number().optional(),

    /** Transformation mode: 'crop' maintains aspect ratio with cropping, 'resize' scales the entire image */
    mode: z.enum(['crop', 'resize']).optional(),

    /** Output image format (e.g., 'webp', 'jpeg', 'png') */
    format: z.string().optional(),

    /** Focal point X-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpx: z.coerce.number().min(0).max(1).optional(),

    /** Focal point Y-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpy: z.coerce.number().min(0).max(1).optional(),

    /** Predefined transformation preset (e.g., 'tiny', 'thumbnail', 'preview') */
    preset: z.string().optional(),

    /** Compression quality (1-100, lower values mean smaller file size but lower quality) */
    q: z.coerce.number().min(1).max(100).optional(),
});

export type TransformImageOptions = z.infer<typeof TransformImageOptions>;
