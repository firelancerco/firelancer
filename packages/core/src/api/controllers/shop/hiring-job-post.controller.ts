import {
    ID,
    JobPostListOptions,
    MutationCloseJobPostArgs,
    MutationCreateJobPostArgs,
    MutationDeleteDraftJobPostArgs,
    MutationEditDraftJobPostArgs,
    MutationEditPublishedJobPostArgs,
    MutationPublishJobPostArgs,
    Permission,
} from '@firelancerco/common/lib/generated-shop-schema';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import * as schema from '../../schema/common';
import { coreSchemas } from '../../schema/core-schemas';
import { EntityNotFoundException, ForbiddenException, RequestContext } from '../../../common';
import { CustomerService } from '../../../service';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('hiring/job-posts')
export class ShopHiringJobPostController {
    constructor(
        private jobPostService: JobPostService,
        private customerService: CustomerService,
    ) {}

    @Get()
    @Allow(Permission.Authenticated)
    async getJobPostsList(
        @Ctx() ctx: RequestContext,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions))
        options: JobPostListOptions,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const customerFilter = { customerId: { eq: String(customer.id) } };
        const mergedFilter = options.filter ? { _and: [options.filter, customerFilter] } : customerFilter;

        return this.jobPostService.findAll(ctx, { ...options, filter: mergedFilter });
    }

    @Get(':id')
    @Allow(Permission.Authenticated)
    async getJobPost(@Ctx() ctx: RequestContext, @Param('id', new ZodValidationPipe(schema.ID)) id: ID) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return jobPost;
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.Authenticated)
    async createJobPost(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationCreateJobPostArgs))
        args: MutationCreateJobPostArgs,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        return this.jobPostService.createDraft(ctx, { ...args.input, customerId: customer.id });
    }

    @Transaction()
    @Patch('edit-draft')
    @Allow(Permission.Authenticated)
    async editDraftJobPost(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationEditDraftJobPostArgs))
        args: MutationEditDraftJobPostArgs,
    ) {
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
    @Allow(Permission.Authenticated)
    async deleteDraftJobPost(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationDeleteDraftJobPostArgs))
        args: MutationDeleteDraftJobPostArgs,
    ) {
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
    @Allow(Permission.Authenticated)
    async requestPublishDraft(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationPublishJobPostArgs))
        args: MutationPublishJobPostArgs,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.requestPublishDraft(ctx, args.input);
    }

    @Transaction()
    @Patch('edit-published')
    @Allow(Permission.Authenticated)
    async editPublishedJobPost(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationEditPublishedJobPostArgs))
        args: MutationEditPublishedJobPostArgs,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.input.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.input.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.edit(ctx, args.input);
    }

    @Transaction()
    @Post('close')
    @Allow(Permission.Authenticated)
    async closePublishedJobPost(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationCloseJobPostArgs))
        args: MutationCloseJobPostArgs,
    ) {
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
