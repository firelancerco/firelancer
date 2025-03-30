import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { Api } from '../../../api/decorators/api.decorator';
import { FieldsDecoratorConfig, RelationPaths, Relations } from '../../../api/decorators/relations.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { ApiType, RequestContext, Translated } from '../../../common';
import { CollectionListOptions, ID, JobPostListOptions } from '../../../common/shared-schema';
import { Collection, JobPost } from '../../../entity';
import { CollectionService, JobPostService } from '../../../service';

const relationsOptions: FieldsDecoratorConfig<Collection> = {
    entity: Collection,
    omit: ['jobPosts', 'parent.jobPosts', 'children', 'children.jobPosts'],
    depth: 1,
};

@Controller('collections')
export class CollectionController {
    constructor(
        private collectionService: CollectionService,
        private jobPostService: JobPostService,
    ) {}

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get()
    async collections(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Query() options: CollectionListOptions,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<PaginatedList<Translated<Collection>>> {
        options = { ...options, filter: { ...(options && options.filter), isPrivate: { eq: false } } };
        const result = await this.collectionService.findAll(ctx, options || undefined, relations);
        result.items.forEach(collection => this.resolveCollection(ctx, collection, apiType));
        return result;
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get(':id')
    async collection(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param() params: { id: ID },
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOne(ctx, params.id, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, apiType);
        return collection;
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('slug/:slug')
    async collectionBySlug(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Param() params: { slug: string },
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOneBySlug(ctx, params.slug, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, apiType);
        return collection;
    }

    @Get(':id/job-posts')
    async productVariants(
        @Ctx() ctx: RequestContext,
        @Api() apiType: ApiType,
        @Query() params: { id: ID },
        @Query() options: JobPostListOptions,
        @Relations({ entity: JobPost, omit: ['assets'] }) relations: RelationPaths<JobPost>,
    ): Promise<PaginatedList<JobPost>> {
        if (apiType === 'shop') {
            options = {
                ...options,
                filter: {
                    ...(options ? options.filter : {}),
                    visibility: { eq: 'PUBLIC' },
                    publishedAt: { isNull: false },
                },
            };
        }
        return this.jobPostService.getJobPostsByCollectionId(ctx, params.id, options, relations);
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
