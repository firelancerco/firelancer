import {
    CollectionListOptions,
    ID,
    JobPostListOptions,
    JobPostState,
    JobPostVisibility,
} from '@firelancerco/common/lib/generated-schema';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';

import z from 'zod';
import { Api } from '../../../api/decorators/api.decorator';
import { FieldsDecoratorConfig, RelationPaths, Relations } from '../../../api/decorators/relations.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { coreSchemas } from '../../../api/schema/core-schemas';
import { ApiType, RequestContext } from '../../../common';
import { Collection, JobPost } from '../../../entity';
import { CollectionService, JobPostService } from '../../../service';
import * as schema from '../../schema/common';

const relationsOptions: FieldsDecoratorConfig<Collection> = {
    entity: Collection,
    omit: ['jobPosts', 'parent.jobPosts', 'children', 'children.jobPosts'],
    depth: 1,
};

@Controller('collections')
export class CollectionEntityController {
    constructor(
        private collectionService: CollectionService,
        private jobPostService: JobPostService,
    ) {}

    @Get()
    async collections(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Query(new ZodValidationPipe(coreSchemas.shop.CollectionListOptions)) options: CollectionListOptions,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const schema = apiType === 'admin' ? coreSchemas.admin.CollectionList : coreSchemas.shop.CollectionList;
        const privacyFilter = apiType === 'admin' ? {} : { isPrivate: { eq: false } };

        options = { ...options, filter: { ...(options && options.filter), ...privacyFilter } };
        const result = await this.collectionService.findAll(ctx, options || undefined, relations);
        return schema.parse(result);
    }

    @Get(':id')
    async collection(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const schema = apiType === 'admin' ? coreSchemas.admin.Collection : coreSchemas.shop.Collection;

        const collection = await this.collectionService.findOne(ctx, id, relations);
        if (!collection || (apiType !== 'admin' && collection.isPrivate)) {
            return undefined;
        }
        return schema.parse(collection);
    }

    @Get('slug/:slug')
    async collectionBySlug(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('slug', new ZodValidationPipe(z.string())) slug: string,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const schema = apiType === 'admin' ? coreSchemas.admin.Collection : coreSchemas.shop.Collection;

        const collection = await this.collectionService.findOneBySlug(ctx, slug, relations);
        if (!collection || (apiType !== 'admin' && collection.isPrivate)) {
            return undefined;
        }
        return schema.parse(collection);
    }

    @Get(':id/job-posts')
    async getJobPostsByCollectionId(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions)) options: JobPostListOptions,
        @Relations({ entity: JobPost, omit: ['assets'] }) relations: RelationPaths<JobPost>,
    ) {
        const schema = apiType === 'admin' ? coreSchemas.admin.JobPostList : coreSchemas.shop.JobPostList;

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
        const result = await this.jobPostService.getJobPostsByCollectionId(ctx, id, options, relations);
        return schema.parse(result);
    }

    @Get(':id/breadcrumbs')
    @ZodSerializerDto(coreSchemas.common.CollectionBreadcrumb)
    async getCollectionBreadcrumbs(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const collection = await this.collectionService.findOne(ctx, id, relations);
        if (!collection || (apiType !== 'admin' && collection.isPrivate)) {
            return undefined;
        }

        const breadcrumbs = await this.collectionService.getBreadcrumbs(ctx, collection);

        return breadcrumbs;
    }
}
