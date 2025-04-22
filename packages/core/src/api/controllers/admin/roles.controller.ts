import {
    ID,
    MutationCreateRoleArgs,
    MutationDeleteRoleArgs,
    MutationDeleteRolesArgs,
    MutationUpdateRoleArgs,
    Permission,
} from '@firelancerco/common/lib/generated-schema';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { coreSchemas } from '../../../api/schema/core-schemas';
import { RequestContext } from '../../../common';
import { RoleService } from '../../../service';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';
import * as schema from '../../schema/common';

@Controller('roles')
export class RoleController {
    constructor(private roleService: RoleService) {}

    @Get()
    @Allow(Permission.ReadAdministrator)
    async roles(@Ctx() ctx: RequestContext) {
        const roles = await this.roleService.findAll(ctx);
        return { roles };
    }

    @Get(':id')
    @Allow(Permission.ReadAdministrator)
    async role(@Ctx() ctx: RequestContext, @Param('id', new ZodValidationPipe(schema.ID)) id: ID) {
        const role = await this.roleService.findOne(ctx, id);
        return { role };
    }

    @Transaction()
    @Post('create')
    @Allow(Permission.CreateAdministrator)
    async createRole(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationCreateRoleArgs))
        args: MutationCreateRoleArgs,
    ) {
        const createRole = await this.roleService.create(ctx, args.input);
        return { createRole };
    }

    @Transaction()
    @Put()
    @Allow(Permission.UpdateAdministrator)
    async updateRole(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationUpdateRoleArgs))
        args: MutationUpdateRoleArgs,
    ) {
        const updateRole = await this.roleService.update(ctx, args.input);
        return { updateRole };
    }

    @Transaction()
    @Delete()
    @Allow(Permission.DeleteAdministrator)
    async deleteRole(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationDeleteRoleArgs))
        args: MutationDeleteRoleArgs,
    ) {
        const deleteRole = await this.roleService.delete(ctx, args.input.id);
        return { deleteRole };
    }

    @Transaction()
    @Delete()
    @Allow(Permission.DeleteAdministrator)
    async deleteRoles(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.admin.MutationDeleteRolesArgs))
        args: MutationDeleteRolesArgs,
    ) {
        const deleteRoles = await Promise.all(args.input.ids.map(id => this.roleService.delete(ctx, id)));
        return { deleteRoles };
    }
}
