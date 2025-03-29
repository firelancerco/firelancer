import { Controller, Get, Param, Query } from '@nestjs/common';

import { Ctx } from '../..';
import { RequestContext } from '../../../common';
import { FacetListOptions, FacetValueListOptions, ID } from '../../../common/shared-schema';
import { FacetService, FacetValueService } from '../../../service';

@Controller('facets')
export class FacetController {
    constructor(
        private facetService: FacetService,
        private facetValueService: FacetValueService,
    ) {}

    @Get()
    async facets(@Ctx() ctx: RequestContext, @Query() options: FacetListOptions) {
        return this.facetService.findAll(ctx, options, []);
    }

    @Get(':id')
    async facetById(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetService.findOne(ctx, id, []);
    }

    @Get('code/:code')
    async facetByCode(@Ctx() ctx: RequestContext, @Param('code') code: string) {
        return this.facetService.findByCode(ctx, code, []);
    }

    @Get('facet-values/:id')
    async facetByFacetValueId(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetService.findByFacetValueId(ctx, id);
    }

    @Get(':id/facet-values')
    async getValues(@Ctx() ctx: RequestContext, @Param('id') id: ID, @Query() options: FacetValueListOptions) {
        return this.facetValueService.findByFacetId(ctx, id, options);
    }
}
