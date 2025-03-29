import { Controller, Get, Query } from '@nestjs/common';

import { RequestContext } from '../../../common/request-context';
import { JobPostListOptions, Permission } from '../../../common/shared-schema';
import { JobPostService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(private jobPostService: JobPostService) {}
    @Get()
    @Allow(Permission.Public)
    async getJobPosts(@Ctx() ctx: RequestContext, @Query() options: JobPostListOptions) {
        // Filter for posts that have a publioptionshedAt date (not null)
        const publishedFilter = { filter: { publishedAt: { isNull: false } } };

        const mergedFilter = options.filter
            ? { ...options, filter: { _and: [options.filter, publishedFilter.filter] } }
            : { ...options, filter: publishedFilter.filter };

        return this.jobPostService.findAll(ctx, mergedFilter);
    }
}
