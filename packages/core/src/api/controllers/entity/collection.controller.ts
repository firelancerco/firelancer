import {
    CollectionListOptions,
    ID,
    JobPostListOptions,
    JobPostState,
    JobPostVisibility,
} from '@firelancerco/common/lib/generated-schema';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { Controller, Get, Param, Query } from '@nestjs/common';

import z from 'zod';
import { Api } from '../../../api/decorators/api.decorator';
import { FieldsDecoratorConfig, RelationPaths, Relations } from '../../../api/decorators/relations.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { coreSchemas } from '../../../api/schema/core-schemas';
import { ApiType, RequestContext, Translated } from '../../../common';
import { Collection, JobPost } from '../../../entity';
import { CollectionService, JobPostService } from '../../../service';
import { ZodValidationPipe } from '../../middlewares/zod-validation-pipe';
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
    ): Promise<PaginatedList<Translated<Collection>>> {
        options = { ...options, filter: { ...(options && options.filter), isPrivate: { eq: false } } };
        const result = await this.collectionService.findAll(ctx, options || undefined, relations);
        result.items.forEach(collection => this.resolveCollection(ctx, collection, apiType));
        return result;
    }

    @Get(':id')
    async collection(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOne(ctx, id, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, apiType);
        return collection;
    }

    @Get('slug/:slug')
    async collectionBySlug(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('slug', new ZodValidationPipe(z.string())) slug: string,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOneBySlug(ctx, slug, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, apiType);
        return collection;
    }

    @Get(':id/job-posts')
    async getJobPostsByCollectionId(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param('id', new ZodValidationPipe(schema.ID)) id: ID,
        @Query(new ZodValidationPipe(coreSchemas.shop.JobPostListOptions)) options: JobPostListOptions,
        @Relations({ entity: JobPost, omit: ['assets'] }) relations: RelationPaths<JobPost>,
    ): Promise<PaginatedList<JobPost>> {
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
        return this.jobPostService.getJobPostsByCollectionId(ctx, id, options, relations);
    }

    private async resolveCollection(ctx: RequestContext, collection: Collection, apiType: ApiType) {
        if (apiType === 'shop') {
            collection.filters = undefined as any;
            collection.position = undefined as any;
            collection.inheritFilters = undefined as any;
            collection.isPrivate = undefined as any;
            collection.isRoot = undefined as any;
        }
        const breadcrumbs = await this.collectionService.getBreadcrumbs(ctx, collection);
        return { ...collection, breadcrumbs };
    }
}
