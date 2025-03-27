import { Controller, Get } from '@nestjs/common';

import { RequestContext } from '../../../common/request-context';
import { Permission } from '../../../common/shared-schema';
import { JobPostService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(private jobPostService: JobPostService) {}
    @Get()
    @Allow(Permission.Public)
    async getJobPosts(@Ctx() ctx: RequestContext) {
        return this.jobPostService.findAll(ctx);
    }
}
