import { Logger } from '@firelancerco/core';
import sharp, { FormatEnum, Region, ResizeOptions } from 'sharp';

import { getValidFormat } from './common';
import { loggerCtx } from './constants';
import { TransformImageOptions } from './schema';
import { ImageTransformFormat, ImageTransformPreset } from './types';

export type Dimensions = { w: number; h: number };
export type Point = { x: number; y: number };

/**
 * Applies transforms to the given image according to the query params passed.
 */
export async function transformImage(
    originalImage: Buffer,
    queryParams: TransformImageOptions,
    presets: ImageTransformPreset[],
): Promise<sharp.Sharp> {
    let targetWidth = Math.round(queryParams?.w ?? 0) || undefined;
    let targetHeight = Math.round(queryParams?.h ?? 0) || undefined;
    const quality = queryParams.q != null ? Math.round(Math.max(Math.min(+queryParams.q, 100), 1)) : undefined;
    let mode = queryParams.mode || 'crop';
    const fpx = queryParams?.fpx || undefined;
    const fpy = queryParams?.fpy || undefined;
    const imageFormat = getValidFormat(queryParams.format);
    if (queryParams.preset) {
        const matchingPreset = presets.find(p => p.name === queryParams.preset);
        if (matchingPreset) {
            targetWidth = matchingPreset.width;
            targetHeight = matchingPreset.height;
            mode = matchingPreset.mode;
        }
    }
    const options: ResizeOptions = {};
    if (mode === 'crop') {
        options.position = sharp.strategy.entropy;
    } else {
        options.fit = 'inside';
    }

    const image = sharp(originalImage);
    try {
        await applyFormat(image, imageFormat, quality);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        Logger.error(e.message, loggerCtx, e.stack);
    }
    if (fpx && fpy && targetWidth && targetHeight && mode === 'crop') {
        const metadata = await image.metadata();
        if (metadata.width && metadata.height) {
            const xCenter = fpx * metadata.width;
            const yCenter = fpy * metadata.height;
            const { width, height, region } = resizeToFocalPoint(
                { w: metadata.width, h: metadata.height },
                { w: targetWidth, h: targetHeight },
                { x: xCenter, y: yCenter },
            );
            return image.resize(width, height).extract(region);
        }
    }

    return image.resize(targetWidth, targetHeight, options);
}

async function applyFormat(image: sharp.Sharp, format: ImageTransformFormat | undefined, quality: number | undefined) {
    switch (format) {
        case 'jpg':
        case 'jpeg':
            return image.jpeg({ quality });
        case 'png':
            return image.png();
        case 'webp':
            return image.webp({ quality });
        case 'avif':
            return image.avif({ quality });
        default: {
            if (quality) {
                // If a quality has been specified but no format, we need to determine the format from the image
                // and apply the quality to that format.
                const metadata = await image.metadata();
                if (isImageTransformFormat(metadata.format)) {
                    return applyFormat(image, metadata.format, quality);
                }
            }
            return image;
        }
    }
}

function isImageTransformFormat(input: keyof FormatEnum | undefined): input is ImageTransformFormat {
    return !!input && ['jpg', 'jpeg', 'webp', 'avif'].includes(input);
}

/**
 * Resize an image but keep it centered on the focal point.
 * Based on the method outlined in https://github.com/lovell/sharp/issues/1198#issuecomment-384591756
 */
export function resizeToFocalPoint(
    original: Dimensions,
    target: Dimensions,
    focalPoint: Point,
): { width: number; height: number; region: Region } {
    const { width, height, factor } = getIntermediateDimensions(original, target);
    const region = getExtractionRegion(factor, focalPoint, target, { w: width, h: height });
    return { width, height, region };
}

/**
 * Calculates the dimensions of the intermediate (resized) image.
 */
function getIntermediateDimensions(
    original: Dimensions,
    target: Dimensions,
): { width: number; height: number; factor: number } {
    const hRatio = original.h / target.h;
    const wRatio = original.w / target.w;

    let factor: number;
    let width: number;
    let height: number;

    if (hRatio < wRatio) {
        factor = hRatio;
        height = Math.round(target.h);
        width = Math.round(original.w / factor);
    } else {
        factor = wRatio;
        width = Math.round(target.w);
        height = Math.round(original.h / factor);
    }
    return { width, height, factor };
}

/**
 * Calculates the Region to extract from the intermediate image.
 */
function getExtractionRegion(factor: number, focalPoint: Point, target: Dimensions, intermediate: Dimensions): Region {
    const newXCenter = focalPoint.x / factor;
    const newYCenter = focalPoint.y / factor;
    const region: Region = {
        left: 0,
        top: 0,
        width: target.w,
        height: target.h,
    };

    if (intermediate.h < intermediate.w) {
        region.left = clamp(0, intermediate.w - target.w, Math.round(newXCenter - target.w / 2));
    } else {
        region.top = clamp(0, intermediate.h - target.h, Math.round(newYCenter - target.h / 2));
    }
    return region;
}

/**
 * Limit the input value to the specified min and max values.
 */
function clamp(min: number, max: number, input: number) {
    return Math.min(Math.max(min, input), max);
}
