import { FacetListOptions, ID } from '@firelancerco/common/lib/generated-shop-schema';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';

import { RequestContext } from '../../../../common';
import { FacetService } from '../../../../service';
import { Ctx } from '../../../decorators/request-context.decorator';
import * as schema from '../../../schema/common';
import { coreSchemas } from '../../../schema/core-schemas';

@Controller('facets')
export class FacetEntityController {
    constructor(private facetService: FacetService) {}

    @Get()
    @ZodSerializerDto(coreSchemas.shop.FacetList)
    async getFacetsList(
        @Ctx() ctx: RequestContext,
        @Query(coreSchemas.shop.FacetListOptions)
        options: FacetListOptions,
    ) {
        return this.facetService.findAll(ctx, options, []);
    }

    @Get(':id')
    @ZodSerializerDto(coreSchemas.shop.Facet)
    async getFacet(@Ctx() ctx: RequestContext, @Param('id', new ZodValidationPipe(schema.ID)) id: ID) {
        return this.facetService.findOne(ctx, id, []);
    }

    @Get('code/:code')
    @ZodSerializerDto(coreSchemas.shop.Facet)
    async getFacetByCode(@Ctx() ctx: RequestContext, @Param('code', new ZodValidationPipe(z.string())) code: string) {
        return this.facetService.findByCode(ctx, code, []);
    }

    @Get('facet-values/:facetValueId')
    @ZodSerializerDto(coreSchemas.shop.Facet)
    async getFacetByFacetValueId(
        @Ctx() ctx: RequestContext,
        @Param('facetValueId', new ZodValidationPipe(schema.ID)) facetValueId: ID,
    ) {
        return this.facetService.findByFacetValueId(ctx, facetValueId);
    }
}
