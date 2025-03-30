import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { FieldsDecoratorConfig, RelationPaths, Relations } from '../../../api/decorators/relations.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { ApiType, RequestContext, Translated } from '../../../common';
import { CollectionListOptions, ID } from '../../../common/shared-schema';
import { Collection } from '../../../entity';
import { CollectionService } from '../../../service';

const relationsOptions: FieldsDecoratorConfig<Collection> = {
    entity: Collection,
    omit: ['jobPosts', 'parent.jobPosts', 'children', 'children.jobPosts'],
    depth: 1,
};

@Controller('collections')
export class CollectionController {
    constructor(private collectionService: CollectionService) {}

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get()
    async collections(
        @Ctx() ctx: RequestContext,
        @Query() options: CollectionListOptions,
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<PaginatedList<Translated<Collection>>> {
        options = { ...options, filter: { ...(options && options.filter), isPrivate: { eq: false } } };
        const result = await this.collectionService.findAll(ctx, options || undefined, relations);
        result.items.forEach(collection => this.resolveCollection(ctx, collection, 'shop'));
        return result;
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get(':id')
    async collection(
        @Ctx() ctx: RequestContext,
        @Param() params: { id: ID },
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOne(ctx, params.id, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, 'shop');
        return collection;
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('slug/:slug')
    async collectionBySlug(
        @Ctx() ctx: RequestContext,
        @Param() params: { slug: string },
        @Relations(relationsOptions) relations?: RelationPaths<Collection>,
    ): Promise<Translated<Collection> | undefined> {
        const collection = await this.collectionService.findOneBySlug(ctx, params.slug, relations);
        if (!collection || collection.isPrivate) {
            return undefined;
        }
        this.resolveCollection(ctx, collection, 'shop');
        return collection;
    }

    private async resolveCollection(ctx: RequestContext, collection: Collection, apiType: ApiType) {
        collection.filters = undefined as any;
        collection.position = undefined as any;
        collection.inheritFilters = undefined as any;
        collection.isPrivate = undefined as any;
        collection.isRoot = undefined as any;
        collection.createdAt = undefined as any;
        collection.updatedAt = undefined as any;
        const breadcrumbs = await this.collectionService.getBreadcrumbs(ctx, collection);
        return { ...collection, breadcrumbs };
    }
}
