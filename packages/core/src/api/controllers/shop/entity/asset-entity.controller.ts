import { Permission } from '@firelancerco/common/lib/generated-schema';
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { RequestContext } from '../../../../common';
import { AssetService } from '../../../../service';
import { Allow } from '../../../decorators/allow.decorator';
import { Ctx } from '../../../decorators/request-context.decorator';
import { Transaction } from '../../../decorators/transaction.decorator';

@Controller('assets')
export class AssetEntityController {
    constructor(private assetService: AssetService) {}

    @Transaction()
    @Post('upload')
    @Allow(Permission.Public)
    @UseInterceptors(FilesInterceptor('files'))
    async upload(@Ctx() ctx: RequestContext, @UploadedFiles() files: Array<Express.Multer.File>) {
        const assets = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const asset = await this.assetService.create(ctx, { file });
                assets.push(asset);
            }
        }

        return assets;
    }
}
