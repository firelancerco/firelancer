import { internal_getRequestContext } from '@firelancerco/core';
import { Request } from 'express';
import { AssetServerOptions, ImageTransformFormat } from './types';

export function getAssetUrlPrefixFn(options: AssetServerOptions) {
    const { assetUrlPrefix, route } = options;
    if (assetUrlPrefix == null) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (request: Request, identifier: string) => {
            const protocol = request.headers['x-forwarded-proto'] ?? request.protocol;
            return `${Array.isArray(protocol) ? protocol[0] : protocol}://${request.get('host') ?? 'could-not-determine-host'}/${route}/`;
        };
    }
    if (typeof assetUrlPrefix === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
        return (...args: any[]) => assetUrlPrefix;
    }
    if (typeof assetUrlPrefix === 'function') {
        return (request: Request, identifier: string) => {
            const ctx = internal_getRequestContext(request);
            if (ctx) return assetUrlPrefix(ctx, identifier);
            throw new Error('unexpected error');
        };
    }
    throw new Error(`The assetUrlPrefix option was of an unexpected type: ${JSON.stringify(assetUrlPrefix)}`);
}

export function getValidFormat(format?: unknown): ImageTransformFormat | undefined {
    if (typeof format !== 'string') {
        return undefined;
    }
    switch (format) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'webp':
        case 'avif':
            return format;
        default:
            return undefined;
    }
}
