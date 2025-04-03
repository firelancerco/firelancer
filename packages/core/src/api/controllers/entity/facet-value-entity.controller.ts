import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';

import { Ctx } from '../../decorators/request-context.decorator';
import { EntityNotFoundException, RequestContext } from '../../../common';
import { FacetValueListOptions, ID } from '../../../common/shared-schema';
import { FacetService, FacetValueService } from '../../../service';

@Controller('facet-values')
export class FacetValueController {
    constructor(
        private facetValueService: FacetValueService,
        private facetService: FacetService,
    ) {}

    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getFacetValuesList(@Ctx() ctx: RequestContext, @Query() options: FacetValueListOptions) {
        return this.facetValueService.findAll(ctx, options, []);
    }

    @Get(':id')
    async getFacetValue(@Ctx() ctx: RequestContext, @Param() params: { id: ID }) {
        return this.facetValueService.findOne(ctx, params.id);
    }

    @Get('facet/:facetId')
    async getFacetValuesListByFacetId(
        @Ctx() ctx: RequestContext,
        @Query() options: FacetValueListOptions,
        @Param() params: { facetId: ID },
    ) {
        return this.facetValueService.findByFacetId(ctx, params.facetId, options);
    }

    @Get('facet-code/:facetCode')
    async getFacetValuesListByFacetCode(
        @Ctx() ctx: RequestContext,
        @Query() options: FacetValueListOptions,
        @Param() params: { facetCode: string },
    ) {
        const facet = await this.facetService.findByCode(ctx, params.facetCode, []);
        if (!facet) {
            throw new EntityNotFoundException('Facet', params.facetCode);
        }
        return this.facetValueService.findByFacetId(ctx, facet.id, options);
    }
}
