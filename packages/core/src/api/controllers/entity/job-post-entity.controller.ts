import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { RequestContext } from '../../../common/request-context';
import { JobPostListOptions } from '../../../common/shared-schema';
import { JobPostService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(private jobPostService: JobPostService) {}

    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async jobPostsList(@Ctx() ctx: RequestContext, @Query() options: JobPostListOptions) {
        // Filter for posts that have a publishedAt date (not null)
        const publishedFilter = { filter: { publishedAt: { isNull: false } } };

        const mergedFilter = options.filter
            ? { ...options, filter: { _and: [options.filter, publishedFilter.filter] } }
            : { ...options, filter: publishedFilter.filter };

        return this.jobPostService.findAll(ctx, mergedFilter);
    }
}
