import { Controller, Get, Param } from '@nestjs/common';

import { Ctx } from '../..';
import { RequestContext } from '../../../common';
import { ID } from '../../../common/shared-schema';
import { FacetService, FacetValueService } from '../../../service';

@Controller('facets')
export class FacetController {
    constructor(
        private facetService: FacetService,
        private facetValueService: FacetValueService,
    ) {}

    @Get(':id')
    async facet(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetService.findOne(ctx, id, []);
    }

    @Get()
    async facets(@Ctx() ctx: RequestContext) {
        return this.facetService.findAll(ctx, undefined, []);
    }

    @Get('value/:id')
    async facetByFacetValueId(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetService.findByFacetValueId(ctx, id);
    }

    @Get(':id/values')
    async getValues(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetValueService.findByFacetId(ctx, id);
    }
}
