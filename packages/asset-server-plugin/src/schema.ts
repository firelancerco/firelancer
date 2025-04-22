import { z } from 'zod';

export const TransformImageOptions = z.object({
    /** Width of the output image in pixels */
    w: z.number(),

    /** Height of the output image in pixels */
    h: z.number(),

    /** Transformation mode: 'crop' maintains aspect ratio with cropping, 'resize' scales the entire image */
    mode: z.enum(['crop', 'resize']),

    /** Output image format (e.g., 'webp', 'jpeg', 'png') */
    format: z.string(),

    /** Focal point X-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpx: z.number().min(0).max(1),

    /** Focal point Y-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpy: z.number().min(0).max(1),

    /** Predefined transformation preset (e.g., 'tiny', 'thumbnail', 'preview') */
    preset: z.string(),

    /** Compression quality (1-100, lower values mean smaller file size but lower quality) */
    q: z.number().min(1).max(100),
});

export type TransformImageOptions = z.infer<typeof TransformImageOptions>;
