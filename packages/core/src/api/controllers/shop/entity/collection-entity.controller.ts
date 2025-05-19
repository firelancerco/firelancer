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

import { RequestContext } from '../../../../common';
import { Collection, JobPost } from '../../../../entity';
import { CollectionService, JobPostService } from '../../../../service';
import { FieldsDecoratorConfig, RelationPaths, Relations } from '../../../decorators/relations.decorator';
import { Ctx } from '../../../decorators/request-context.decorator';
import * as schema from '../../../schema/common';
import { coreSchemas } from '../../../schema/core-schemas';

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
    @ZodSerializerDto(coreSchemas.shop.CollectionList)
    async collections(
        @Ctx() ctx: RequestContext,
        @Query(new ZodValidationPipe(coreSchemas.shop.CollectionListOptions)) options: CollectionListOptions,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        options = { ...options, filter: { ...(options && options.filter), isPrivate: { eq: false } } };
        const collections = await this.collectionService.findAll(ctx, options || undefined, relations);
        return collections;
    }

    @Get(':id')
    @ZodSerializerDto(coreSchemas.shop.Collection)
    async collection(
        @Ctx() ctx: RequestContext,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const collection = await this.collectionService.findOne(ctx, id, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        return collection;
    }

    @Get('slug/:slug')
    @ZodSerializerDto(coreSchemas.shop.Collection)
    async collectionBySlug(
        @Ctx() ctx: RequestContext,
        @Param('slug', new ZodValidationPipe(z.string())) slug: string,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const collection = await this.collectionService.findOneBySlug(ctx, slug, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        return collection;
    }

    @Get(':id/job-posts')
    @ZodSerializerDto(coreSchemas.shop.JobPostList)
    async getJobPostsByCollectionId(
        @Ctx() ctx: RequestContext,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions)) options: JobPostListOptions,
        @Relations({ entity: JobPost, omit: ['assets'] }) relations: RelationPaths<JobPost>,
    ) {
        options = {
            ...options,
            filter: {
                ...(options ? options.filter : {}),
                visibility: { eq: JobPostVisibility.PUBLIC },
                state: { eq: JobPostState.OPEN },
            },
        };
        const jobPosts = await this.jobPostService.getJobPostsByCollectionId(ctx, id, options, relations);
        return jobPosts;
    }

    @Get(':id/breadcrumbs')
    @ZodSerializerDto(coreSchemas.common.CollectionBreadcrumb)
    async getCollectionBreadcrumbs(
        @Ctx() ctx: RequestContext,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ) {
        const collection = await this.collectionService.findOne(ctx, id, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        const breadcrumbs = await this.collectionService.getBreadcrumbs(ctx, collection);
        return breadcrumbs;
    }
}
