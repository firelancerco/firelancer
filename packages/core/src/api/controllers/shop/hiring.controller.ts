import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { EntityNotFoundException, ForbiddenException, RequestContext } from '../../../common';
import {
    CreateJobPostInput,
    JobPostListOptions,
    MutationCreateJobPostArgs,
    MutationPublishJobPostArgs,
    MutationUpdateJobPostArgs,
    Permission,
} from '../../../common/shared-schema';
import { CustomerService } from '../../../service';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('hiring')
export class ShopHiringController {
    constructor(
        private jobPostService: JobPostService,
        private customerService: CustomerService,
    ) {}

    @Transaction()
    @Post('job-posts/create')
    @Allow(Permission.PublishJobPost)
    async createJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationCreateJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const input: CreateJobPostInput = { ...args, customerId: customer.id };
        return this.jobPostService.create(ctx, input);
    }

    @Transaction()
    @Post('job-posts/publish')
    @Allow(Permission.PublishJobPost)
    async publishJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationPublishJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.publish(ctx, args);
    }

    @Transaction()
    @Patch('job-posts/edit')
    @Allow(Permission.PublishJobPost)
    async editJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationUpdateJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.update(ctx, args);
    }

    @Get('job-posts')
    @Allow(Permission.PublishJobPost)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getJobPostsList(@Ctx() ctx: RequestContext, @Query() options: JobPostListOptions) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const customerFilter = { customerId: { eq: String(customer.id) } };
        const mergedFilter = options.filter ? { _and: [options.filter, customerFilter] } : customerFilter;

        return this.jobPostService.findAll(ctx, { ...options, filter: mergedFilter });
    }

    @Get('job-posts/:id')
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

    @Delete('job-posts/:id')
    @Allow(Permission.PublishJobPost)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async deleteJobPost(@Ctx() ctx: RequestContext, @Param() params: { id: string }) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, params.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', params.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        await this.jobPostService.softDelete(ctx, params.id);
        return { success: true };
    }
}
