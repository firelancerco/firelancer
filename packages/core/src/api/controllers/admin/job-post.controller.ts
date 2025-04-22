import { MutationVerifyRequestedJobPostArgs, Permission } from '@firelancerco/common/lib/generated-schema';
import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { coreSchemas } from '../../../api/schema/core-schemas';
import { EntityNotFoundException, RequestContext } from '../../../common';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(private jobPostService: JobPostService) {}

    @Transaction()
    @Post('verify-publish')
    @Allow(Permission.CreateJobPost)
    async verifyPublish(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.VerifyRequestedJobPostInput))
        args: MutationVerifyRequestedJobPostArgs,
    ) {
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        return this.jobPostService.publish(ctx, args.input.id);
    }
}
