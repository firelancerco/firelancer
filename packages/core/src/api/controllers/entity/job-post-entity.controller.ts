import { JobPostListOptions, JobPostState, JobPostVisibility } from '@firelancerco/common/lib/generated-shop-schema';
import { Controller, Get, Query } from '@nestjs/common';

import { ZodValidationPipe } from 'nestjs-zod';
import { coreSchemas } from '../../../api/schema/core-schemas';
import { ApiType } from '../../../common';
import { RequestContext } from '../../../common/request-context';
import { JobPostService } from '../../../service';
import { Api } from '../../decorators/api.decorator';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('job-posts')
export class JobPostEntityController {
    constructor(private jobPostService: JobPostService) {}

    @Get()
    async jobPostsList(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions))
        options: JobPostListOptions,
    ) {
        if (apiType === 'shop') {
            options = {
                ...options,
                filter: {
                    ...(options ? options.filter : {}),
                    visibility: { eq: JobPostVisibility.PUBLIC },
                    state: { eq: JobPostState.OPEN },
                },
            };
        }

        return this.jobPostService.findAll(ctx, options);
    }
}
