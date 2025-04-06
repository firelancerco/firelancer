import { Body, Controller, Post } from '@nestjs/common';

import { EntityNotFoundException, RequestContext } from '../../../common';
import { MutationPublishJobPostArgs, Permission } from '../../../common/shared-schema';
import { CustomerService } from '../../../service';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(
        private jobPostService: JobPostService,
        private customerService: CustomerService,
    ) {}

    // TODO: This is a temporary endpoint to publish a job post. change required permissions
    @Transaction()
    @Post('verify-publish')
    @Allow(Permission.CreateJobPost)
    async verifyPublish(@Ctx() ctx: RequestContext, @Body() args: MutationPublishJobPostArgs) {
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        return this.jobPostService.publish(ctx, args.input.id);
    }
}
