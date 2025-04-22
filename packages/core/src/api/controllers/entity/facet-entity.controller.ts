import { FacetListOptions, ID } from '@firelancerco/common/lib/generated-shop-schema';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { coreSchemas } from '../../../api/schema/core-schemas';
import { RequestContext } from '../../../common';
import { FacetService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('facets')
export class FacetEntityController {
    constructor(private facetService: FacetService) {}

    @Get()
    async getFacetsList(
        @Ctx() ctx: RequestContext,
        @Query(coreSchemas.common.FacetListOptions)
        options: FacetListOptions,
    ) {
        return this.facetService.findAll(ctx, options, []);
    }

    @Get(':id')
    async getFacet(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetService.findOne(ctx, id, []);
    }

    @Get('code/:code')
    async getFacetByCode(@Ctx() ctx: RequestContext, @Param('code') code: string) {
        return this.facetService.findByCode(ctx, code, []);
    }

    @Get('facet-values/:facetValueId')
    async getFacetByFacetValueId(@Ctx() ctx: RequestContext, @Param('facetValueId') facetValueId: ID) {
        return this.facetService.findByFacetValueId(ctx, facetValueId);
    }
}
