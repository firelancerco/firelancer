import {
    ID,
    MutationAssignRoleToAdministratorArgs,
    MutationCreateAdministratorArgs,
    MutationDeleteAdministratorArgs,
    MutationDeleteAdministratorsArgs,
    MutationUpdateActiveAdministratorArgs,
    MutationUpdateAdministratorArgs,
    Permission,
} from '@firelancerco/common/lib/generated-schema';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { RequestContext } from '../../../common';
import { Administrator } from '../../../entity/administrator/administrator.entity';
import { AdministratorService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import * as schema from '../../schema/common';
import { coreSchemas } from '../../schema/core-schemas';

@Controller('admins')
export class AdministratorController {
    constructor(private administratorService: AdministratorService) {}

    @Get()
    @Allow(Permission.ReadAdministrator)
    async getAdministratorsList(@Ctx() ctx: RequestContext) {
        return this.administratorService.findAll(ctx);
    }

    @Get('active')
    @Allow(Permission.Owner)
    async getActiveAdministrator(@Ctx() ctx: RequestContext) {
        if (ctx.activeUserId) {
            const activeAdministrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId, [
                'user',
                'user.roles',
            ]);
            return { activeAdministrator: activeAdministrator ?? null };
        }
        return { activeAdministrator: null };
    }

    @Get(':id')
    @Allow(Permission.ReadAdministrator)
    async getAdministrator(@Ctx() ctx: RequestContext, @Param('id', new ZodValidationPipe(schema.ID)) id: ID) {
        return this.administratorService.findOne(ctx, id);
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.CreateAdministrator)
    async createAdministrator(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationCreateAdministratorArgs))
        args: MutationCreateAdministratorArgs,
    ) {
        const createAdministrator = await this.administratorService.create(ctx, args.input);
        return { createAdministrator };
    }

    @Transaction()
    @Put()
    @Allow(Permission.UpdateAdministrator)
    async updateAdministrator(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationUpdateAdministratorArgs))
        args: MutationUpdateAdministratorArgs,
    ) {
        const updateAdministrator = await this.administratorService.update(ctx, args.input);
        return { updateAdministrator };
    }

    @Transaction()
    @Put('active')
    @Allow(Permission.Owner)
    async updateActiveAdministrator(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationUpdateActiveAdministratorArgs))
        args: MutationUpdateActiveAdministratorArgs,
    ) {
        if (ctx.activeUserId) {
            const administrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
            if (administrator) {
                const updateActiveAdministrator = await this.administratorService.update(ctx, {
                    ...args.input,
                    id: administrator.id,
                });

                return { updateActiveAdministrator };
            }
        }
        return { updateActiveAdministrator: null };
    }

    @Transaction()
    @Post('assign-role')
    @Allow(Permission.UpdateAdministrator)
    async assignRoleToAdministrator(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationAssignRoleToAdministratorArgs))
        args: MutationAssignRoleToAdministratorArgs,
    ): Promise<Administrator> {
        return this.administratorService.assignRole(ctx, args.input.administratorId, args.input.roleId);
    }

    @Transaction()
    @Delete(':id')
    @Allow(Permission.DeleteAdministrator)
    async deleteAdministrator(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationDeleteAdministratorArgs))
        args: MutationDeleteAdministratorArgs,
    ) {
        const deleteAdministrator = await this.administratorService.softDelete(ctx, args.input.id);
        return { deleteAdministrator };
    }

    @Transaction()
    @Delete()
    @Allow(Permission.DeleteAdministrator)
    deleteAdministrators(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationDeleteAdministratorsArgs))
        args: MutationDeleteAdministratorsArgs,
    ) {
        return Promise.all(args.input.ids.map(id => this.administratorService.softDelete(ctx, id)));
    }
}
