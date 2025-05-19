import { JobPostListOptions, JobPostState, JobPostVisibility } from '@firelancerco/common/lib/generated-shop-schema';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';

import { RequestContext } from '../../../../common/request-context';
import { JobPostService } from '../../../../service';
import { Ctx } from '../../../decorators/request-context.decorator';
import { coreSchemas } from '../../../schema/core-schemas';

@Controller('job-posts')
export class JobPostEntityController {
    constructor(private jobPostService: JobPostService) {}

    @Get()
    @ZodSerializerDto(coreSchemas.shop.JobPostList)
    async jobPostsList(
        @Ctx() ctx: RequestContext,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions))
        options: JobPostListOptions,
    ) {
        options = {
            ...options,
            filter: {
                ...(options ? options.filter : {}),
                visibility: { eq: JobPostVisibility.PUBLIC },
                state: { eq: JobPostState.OPEN },
            },
        };
        return this.jobPostService.findAll(ctx, options);
    }
}
