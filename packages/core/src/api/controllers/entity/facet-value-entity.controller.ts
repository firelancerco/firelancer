import { Controller, Get, Param, Query } from '@nestjs/common';

import { FacetValueListOptions, ID } from '@firelancerco/common/lib/generated-shop-schema';
import { coreSchemas } from '../../../api/schema/core-schemas';
import { EntityNotFoundException, RequestContext } from '../../../common';
import { FacetService, FacetValueService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';

@Controller('facet-values')
export class FacetValueEntityController {
    constructor(
        private facetValueService: FacetValueService,
        private facetService: FacetService,
    ) {}

    @Get()
    async getFacetValuesList(
        @Ctx() ctx: RequestContext,
        @Query(coreSchemas.common.FacetValueListOptions)
        options: FacetValueListOptions,
    ) {
        return this.facetValueService.findAll(ctx, options, []);
    }

    @Get(':id')
    async getFacetValue(@Ctx() ctx: RequestContext, @Param('id') id: ID) {
        return this.facetValueService.findOne(ctx, id);
    }

    @Get('facet/:facetId')
    async getFacetValuesListByFacetId(
        @Ctx() ctx: RequestContext,
        @Param('facetId') facetId: ID,
        @Query(coreSchemas.common.FacetValueListOptions)
        options: FacetValueListOptions,
    ) {
        return this.facetValueService.findByFacetId(ctx, facetId, options);
    }

    @Get('facet-code/:facetCode')
    async getFacetValuesListByFacetCode(
        @Ctx() ctx: RequestContext,
        @Query(coreSchemas.common.FacetValueListOptions)
        options: FacetValueListOptions,
        @Param('facetCode') facetCode: string,
    ) {
        const facet = await this.facetService.findByCode(ctx, facetCode, []);
        if (!facet) {
            throw new EntityNotFoundException('Facet', facetCode);
        }
        return this.facetValueService.findByFacetId(ctx, facet.id, options);
    }
}
