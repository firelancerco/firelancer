export class TransformImageOptions {
    /** Width of the output image in pixels */
    w: number;

    /** Height of the output image in pixels */
    h: number;

    /** Transformation mode: 'crop' maintains aspect ratio with cropping, 'resize' scales the entire image */
    mode: 'crop' | 'resize';

    /** Output image format (e.g., 'webp', 'jpeg', 'png') */
    format: string;

    /** Focal point X-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpx: number;

    /** Focal point Y-coordinate (0.0 to 1.0) - controls which part of the image to preserve when cropping */
    fpy: number;

    /** Predefined transformation preset (e.g., 'tiny', 'thumbnail', 'preview') */
    preset: string;

    /** Compression quality (1-100, lower values mean smaller file size but lower quality) */
    q: number;
}
