import { FacetValueListOptions, ID } from '@firelancerco/common/lib/generated-shop-schema';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';

import { coreSchemas } from '../../../api/schema/core-schemas';
import { EntityNotFoundException, RequestContext } from '../../../common';
import { FacetService, FacetValueService } from '../../../service';
import { Ctx } from '../../decorators/request-context.decorator';
import * as schema from '../../schema/common';

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
    async getFacetValue(@Ctx() ctx: RequestContext, @Param('id', new ZodValidationPipe(schema.ID)) id: ID) {
        return this.facetValueService.findOne(ctx, id);
    }

    @Get('facet/:facetId')
    async getFacetValuesListByFacetId(
        @Ctx() ctx: RequestContext,
        @Param('facetId', new ZodValidationPipe(schema.ID)) facetId: ID,
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
        @Param('facetCode', new ZodValidationPipe(z.string())) facetCode: string,
    ) {
        const facet = await this.facetService.findByCode(ctx, facetCode, []);
        if (!facet) {
            throw new EntityNotFoundException('Facet', facetCode);
        }
        return this.facetValueService.findByFacetId(ctx, facet.id, options);
    }
}
