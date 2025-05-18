import { MutationUpdateCustomerArgs, Permission } from '@firelancerco/common/lib/generated-shop-schema';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';

import { RequestContext, UserInputException } from '../../../common';
import { CustomerService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import { coreSchemas } from '../../schema/core-schemas';

@Controller('customers')
export class ShopCustomerController {
    constructor(private customerService: CustomerService) {}

    @Get('active-customer')
    @Allow(Permission.Authenticated)
    @ZodSerializerDto(coreSchemas.shop.Customer)
    async getActiveCustomer(@Ctx() ctx: RequestContext) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        return customer;
    }

    @Put()
    @Allow(Permission.Authenticated)
    @Transaction()
    @ZodSerializerDto(coreSchemas.shop.Customer)
    async updateActiveCustomer(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationUpdateCustomerArgs))
        args: MutationUpdateCustomerArgs,
    ) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        // prevent customers from changing their roles
        if (args.input.role && customer.role) {
            throw new UserInputException('error.customer-role-cannot-be-changed' as any); // TODO
        }
        const updated = await this.customerService.update(ctx, { id: customer.id, ...args.input });
        return updated;
    }
}
