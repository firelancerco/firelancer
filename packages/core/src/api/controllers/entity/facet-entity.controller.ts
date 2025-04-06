import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { RequestContext } from '../../../common';
import { FacetListOptions, ID } from '../../../common/shared-schema';
import { FacetService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('facets')
export class FacetEntityController {
    constructor(private facetService: FacetService) {}

    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getFacetsList(@Ctx() ctx: RequestContext, @Query() options: FacetListOptions) {
        return this.facetService.findAll(ctx, options, []);
    }

    @Get(':id')
    async getFacet(@Ctx() ctx: RequestContext, @Param() params: { id: ID }) {
        return this.facetService.findOne(ctx, params.id, []);
    }

    @Get('code/:code')
    async getFacetByCode(@Ctx() ctx: RequestContext, @Param() params: { code: string }) {
        return this.facetService.findByCode(ctx, params.code, []);
    }

    @Get('facet-values/:facetValueId')
    async getFacetByFacetValueId(@Ctx() ctx: RequestContext, @Param() params: { facetValueId: ID }) {
        return this.facetService.findByFacetValueId(ctx, params.facetValueId);
    }
}
