/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { Stream } from 'stream';
import { AssetStorageStrategy } from '../asset-storage-strategy';
import { InternalServerException } from '../../../../common';

const errorMessage = 'error.no-asset-storage-strategy-configured';

/**
 * A placeholder strategy which will simply throw an error when used.
 */
export class NoAssetStorageStrategy implements AssetStorageStrategy {
    writeFileFromStream(fileName: string, data: Stream): Promise<string> {
        throw new InternalServerException(errorMessage as any);
    }

    writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
        throw new InternalServerException(errorMessage as any);
    }

    readFileToBuffer(identifier: string): Promise<Buffer> {
        throw new InternalServerException(errorMessage as any);
    }

    readFileToStream(identifier: string): Promise<Stream> {
        throw new InternalServerException(errorMessage as any);
    }

    deleteFile(identifier: string): Promise<void> {
        throw new InternalServerException(errorMessage as any);
    }

    toAbsoluteUrl(request: Request, identifier: string): string {
        throw new InternalServerException(errorMessage as any);
    }

    fileExists(fileName: string): Promise<boolean> {
        throw new InternalServerException(errorMessage as any);
    }
}
