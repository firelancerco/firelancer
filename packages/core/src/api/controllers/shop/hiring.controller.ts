import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { EntityNotFoundException, ForbiddenException, RequestContext } from '../../../common';
import {
    CreateJobPostInput,
    JobPostListOptions,
    MutationCreateJobPostArgs,
    MutationEditJobPostArgs,
    MutationPublishJobPostArgs,
    Permission,
    UpdateJobPostInput,
} from '../../../common/shared-schema';
import { AssetService, CustomerService } from '../../../service';
import { JobPostService } from '../../../service/services/job-post.service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Controller('hiring')
export class ShopHiringController {
    constructor(
        private jobPostService: JobPostService,
        private assetService: AssetService,
        private customerService: CustomerService,
    ) {}

    @Transaction()
    @Post('job-posts/create')
    @Allow(Permission.Owner, Permission.PublishJobPost)
    @UseInterceptors(FilesInterceptor('files'))
    async createJobPost(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationCreateJobPostArgs,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const input: CreateJobPostInput = { ...args, customerId: customer.id, assetIds: [] };
        if (files && files.length > 0) {
            for (const file of files) {
                const asset = await this.assetService.create(ctx, { file });
                input?.assetIds?.push(asset.id);
            }
        }
        return this.jobPostService.create(ctx, input);
    }

    @Transaction()
    @Post('job-posts/publish')
    @Allow(Permission.Owner, Permission.PublishJobPost)
    async publishJobPost(@Ctx() ctx: RequestContext, @Body() args: MutationPublishJobPostArgs) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        return this.jobPostService.publish(ctx, { id: args.id });
    }

    @Transaction()
    @Patch('job-posts/edit')
    @Allow(Permission.Owner)
    @UseInterceptors(FilesInterceptor('files'))
    async editJobPost(
        @Ctx() ctx: RequestContext,
        @Body() args: MutationEditJobPostArgs,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const jobPost = await this.jobPostService.findOne(ctx, args.id);
        if (!jobPost) {
            throw new EntityNotFoundException('JobPost', args.id);
        }
        if (jobPost.customerId !== customer.id) {
            throw new ForbiddenException();
        }
        const input: UpdateJobPostInput = { ...args, assetIds: [] };
        if (files && files.length > 0) {
            for (const file of files) {
                const asset = await this.assetService.create(ctx, { file });
                input?.assetIds?.push(asset.id);
            }
        }
        return this.jobPostService.update(ctx, input);
    }

    @Get('job-posts')
    @Allow(Permission.Owner)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async jobPostsList(@Ctx() ctx: RequestContext, @Query() options: JobPostListOptions) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        const customerFilter = { customerId: { eq: String(customer.id) } };
        const mergedFilter = options.filter ? { _and: [options.filter, customerFilter] } : customerFilter;

        return this.jobPostService.findAll(ctx, { ...options, filter: mergedFilter });
    }
}
