import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { RequestContext } from '../../../common/request-context';
import { JobPostListOptions, JobPostState, JobPostVisibility } from '../../../common/shared-schema';
import { JobPostService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';
import { Api } from '../../decorators/api.decorator';
import { ApiType } from '../../../common';

@Controller('job-posts')
export class JobPostEntityController {
    constructor(private jobPostService: JobPostService) {}

    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async jobPostsList(@Ctx() ctx: RequestContext, @Api() apiType: ApiType, @Query() options: JobPostListOptions) {
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
