/* eslint-disable @typescript-eslint/no-unused-vars */
import { InternalServerException, RequestContext } from '../../../../common';
import { AssetPreviewStrategy } from '../asset-preview-strategy';

/**
 * A placeholder strategy which will simply throw an error when used.
 */
export class NoAssetPreviewStrategy implements AssetPreviewStrategy {
    generatePreviewImage(ctx: RequestContext, mimeType: string, data: Buffer): Promise<Buffer> {
        throw new InternalServerException('error.no-asset-preview-strategy-configured');
    }
}
