import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { EntityNotFoundException, ForbiddenException, RequestContext } from '../../../common';
import {
    JobPostListOptions,
    MutationCloseJobPostArgs,
    MutationCreateJobPostArgs,
    MutationDeleteDraftJobPostArgs,
    MutationEditDraftJobPostArgs,
    MutationEditPublishedJobPostArgs,
    MutationPublishJobPostArgs,
    Permission,
} from '../../../common/shared-schema';
import { CustomerService } from '../../../service';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('hiring/job-posts')
export class HiringJobPostController {
    constructor(
        private jobPostService: JobPostService,
        private customerService: CustomerService,
    ) {}

    @Get()
    @Allow(Permission.PublishJobPost)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getJobPostsList(@Ctx() ctx: RequestContext, @Query() options: JobPostListOptions) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const customerFilter = { customerId: { eq: String(customer.id) } };
        const mergedFilter = options.filter ? { _and: [options.filter, customerFilter] } : customerFilter;

        return this.jobPostService.findAll(ctx, { ...options, filter: mergedFilter });
    }

    @Get(':id')
    @Allow(Permission.PublishJobPost)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getJobPost(@Ctx() ctx: RequestContext, @Param() params: { id: string }) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, params.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', params.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return jobPost;
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.PublishJobPost)
    async createJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationCreateJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        return this.jobPostService.create(ctx, { ...args.input, customerId: customer.id });
    }

    @Transaction()
    @Patch('edit-draft')
    @Allow(Permission.PublishJobPost)
    async editDraftJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationEditDraftJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.editDraft(ctx, args.input);
    }

    @Transaction()
    @Delete('delete-draft')
    @Allow(Permission.PublishJobPost)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async deleteJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationDeleteDraftJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        await this.jobPostService.deleteDraft(ctx, args.input);
        return { success: true };
    }

    @Transaction()
    @Post('publish')
    @Allow(Permission.PublishJobPost)
    async publishJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationPublishJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.publish(ctx, args.input);
    }

    @Transaction()
    @Patch('edit-published')
    @Allow(Permission.PublishJobPost)
    async editPublishedJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationEditPublishedJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.editPublished(ctx, args.input);
    }

    @Transaction()
    @Post('close')
    @Allow(Permission.PublishJobPost)
    async closeJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationCloseJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.close(ctx, args.input);
    }
}
