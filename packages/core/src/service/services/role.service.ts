import { CreateRoleInput, ID, Permission, UpdateRoleInput } from '@firelancerco/common/lib/generated-schema';
import {
    BUYER_ROLE_CODE,
    BUYER_ROLE_DESCRIPTION,
    SELLER_ROLE_CODE,
    SELLER_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_CODE,
    SUPER_ADMIN_ROLE_DESCRIPTION,
} from '@firelancerco/common/lib/shared-constants';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { assertFound, unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { RelationPaths } from '../../api';
import { RequestContextCacheService } from '../../cache';
import {
    EntityNotFoundException,
    InternalServerException,
    ListQueryOptions,
    RequestContext,
    UserInputException,
} from '../../common';
import { getAllPermissionsMetadata } from '../../common/constants';
import { ConfigService } from '../../config';
import { TransactionalConnection } from '../../connection';
import { Role, User } from '../../entity';
import { EventBus, RoleEvent } from '../../event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { getPermissions, getUserPermissions } from '../helpers/utils/get-user-permissions';
import { patchEntity } from '../helpers/utils/patch-entity';

/**
 * @description
 * Contains methods relating to Role entities.
 */
@Injectable()
export class RoleService {
    constructor(
        private connection: TransactionalConnection,
        private configService: ConfigService,
        private eventBus: EventBus,
        private listQueryBuilder: ListQueryBuilder,
        private requestContextCache: RequestContextCacheService,
    ) {}

    async initRoles() {
        await this.ensureSuperAdminRoleExists();
        await this.ensureBuyerRoleExists();
        await this.ensureSellerRoleExists();
        this.ensureRolesHaveValidPermissions();
    }

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Role>,
        relations?: RelationPaths<Role>,
    ): Promise<PaginatedList<Role>> {
        return this.listQueryBuilder
            .build(Role, options, { relations: unique(relations ?? []), ctx })
            .getManyAndCount()
            .then(async ([items, totalItems]) => {
                const visibleRoles: Role[] = [];
                for (const item of items) {
                    const canRead = await this.activeUserCanReadRole(ctx, item);
                    if (canRead) {
                        visibleRoles.push(item);
                    }
                }
                return {
                    items: visibleRoles,
                    totalItems,
                };
            });
    }

    async findOne(ctx: RequestContext, roleId: ID, relations?: RelationPaths<Role>): Promise<Role | undefined> {
        return this.connection
            .getRepository(ctx, Role)
            .findOne({
                where: { id: roleId },
                relations: unique(relations ?? []),
            })
            .then(async result => {
                if (result && (await this.activeUserCanReadRole(ctx, result))) {
                    return result;
                }
            });
    }

    async create(ctx: RequestContext, input: CreateRoleInput): Promise<Role> {
        this.checkPermissionsAreValid(input.permissions);
        const role = new Role({
            code: input.code,
            description: input.description,
            permissions: unique([Permission.Authenticated, ...input.permissions]),
        });
        await this.connection.getRepository(ctx, Role).save(role, { reload: false });
        await this.eventBus.publish(new RoleEvent(ctx, role, 'created', input));
        return role;
    }

    async update(ctx: RequestContext, input: UpdateRoleInput): Promise<Role> {
        this.checkPermissionsAreValid(input.permissions);
        const role = await this.findOne(ctx, input.id);
        if (!role) {
            throw new EntityNotFoundException('Role', input.id);
        }
        if (role.code === SUPER_ADMIN_ROLE_CODE || role.code === SELLER_ROLE_CODE || role.code === BUYER_ROLE_CODE) {
            throw new InternalServerException('error.cannot-modify-role');
        }
        const updatedRole = patchEntity(role, {
            code: input.code,
            description: input.description,
            permissions: input.permissions ? unique([Permission.Authenticated, ...input.permissions]) : undefined,
        });
        await this.connection.getRepository(ctx, Role).save(updatedRole, { reload: false });
        await this.eventBus.publish(new RoleEvent(ctx, role, 'updated', input));
        return assertFound(this.findOne(ctx, role.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<void> {
        const role = await this.findOne(ctx, id);
        if (!role) {
            throw new EntityNotFoundException('Role', id);
        }
        if (role.code === SUPER_ADMIN_ROLE_CODE || role.code === SELLER_ROLE_CODE || role.code === BUYER_ROLE_CODE) {
            throw new InternalServerException('error.cannot-delete-role');
        }
        await this.connection.getRepository(ctx, Role).remove(role);
        await this.eventBus.publish(new RoleEvent(ctx, role, 'deleted', id));
    }

    /**
     * @description
     * Returns the special SuperAdmin Role, which always exists in Firelancer.
     */
    async getSuperAdminRole(ctx?: RequestContext): Promise<Role> {
        return this.getRoleByCode(ctx, SUPER_ADMIN_ROLE_CODE).then(role => {
            if (!role) {
                // TODO
                throw new InternalServerException('error.super-admin-role-not-found' as any);
            }
            return role;
        });
    }

    /**
     * @description
     * Returns the special Buyer, which always exists in Firelancer.
     */
    async getBuyerRole(ctx?: RequestContext): Promise<Role> {
        return this.getRoleByCode(ctx, BUYER_ROLE_CODE).then(role => {
            if (!role) {
                // TODO
                throw new InternalServerException('error.buyer-role-not-found' as any);
            }
            return role;
        });
    }

    /**
     * @description
     * Returns the special Buyer, which always exists in Firelancer.
     */
    async getSellerRole(ctx?: RequestContext): Promise<Role> {
        return this.getRoleByCode(ctx, SELLER_ROLE_CODE).then(role => {
            if (!role) {
                // TODO
                throw new InternalServerException('error.seller-role-not-found' as any);
            }
            return role;
        });
    }

    /**
     * @description
     * Returns all the valid Permission values
     */
    getAllPermissions(): string[] {
        return Object.values(Permission);
    }

    private checkPermissionsAreValid(permissions?: Permission[] | null) {
        if (!permissions) {
            return;
        }
        const allAssignablePermissions = this.getAllAssignablePermissions();
        for (const permission of permissions) {
            if (!allAssignablePermissions.includes(permission) || permission === Permission.SuperAdmin) {
                throw new UserInputException('error.permission-invalid');
            }
        }
    }

    private getRoleByCode(ctx: RequestContext | undefined, code: string) {
        const repository = ctx
            ? this.connection.getRepository(ctx, Role)
            : this.connection.rawConnection.getRepository(Role);

        return repository.findOne({
            where: { code },
        });
    }

    private async ensureSuperAdminRoleExists() {
        const assignablePermissions = this.getAllAssignablePermissions();
        try {
            const superAdminRole = await this.getSuperAdminRole();
            superAdminRole.permissions = assignablePermissions;
            await this.connection.rawConnection.getRepository(Role).save(superAdminRole, { reload: false });
        } catch {
            const superAdminRole = new Role({
                code: SUPER_ADMIN_ROLE_CODE,
                description: SUPER_ADMIN_ROLE_DESCRIPTION,
                permissions: assignablePermissions,
            });
            await this.connection.rawConnection.getRepository(Role).save(superAdminRole, { reload: false });
        }
    }

    private async ensureBuyerRoleExists() {
        try {
            await this.getBuyerRole();
        } catch {
            const buyerRole = new Role({
                code: BUYER_ROLE_CODE,
                description: BUYER_ROLE_DESCRIPTION,
                permissions: [Permission.Authenticated, Permission.PublishJobPost],
            });
            await this.connection.rawConnection.getRepository(Role).save(buyerRole, { reload: false });
        }
    }

    private async ensureSellerRoleExists() {
        try {
            await this.getSellerRole();
        } catch {
            const sellerRole = new Role({
                code: SELLER_ROLE_CODE,
                description: SELLER_ROLE_DESCRIPTION,
                permissions: [Permission.Authenticated],
            });
            await this.connection.rawConnection.getRepository(Role).save(sellerRole, { reload: false });
        }
    }

    private ensureRolesHaveValidPermissions() {
        const allPermissions = Object.values(Permission);
        for (const permission of allPermissions) {
            if (permission === Permission.SuperAdmin) {
                continue;
            }
            // Check for other validations if necessary
        }
    }

    private getAllAssignablePermissions(): Permission[] {
        return getAllPermissionsMetadata(this.configService.authOptions.customPermissions)
            .filter(p => p.assignable)
            .map(p => p.name as Permission);
    }

    /**
     * @description
     * Returns true if the User has the specified permission
     */
    async userHasPermission(ctx: RequestContext, permission: Permission): Promise<boolean> {
        return this.userHasAnyPermissions(ctx, [permission]);
    }

    /**
     * @description
     * Returns true if the User has any of the specified permissions
     */
    async userHasAnyPermissions(ctx: RequestContext, permissions: Permission[]): Promise<boolean> {
        const userPermissions = await this.getActiveUserPermissions(ctx);
        for (const permission of permissions) {
            if (userPermissions.includes(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @description
     * Returns true if the User has all the specified permissions
     */
    async userHasAllPermissions(ctx: RequestContext, permissions: Permission[]): Promise<boolean> {
        const userPermissions = await this.getActiveUserPermissions(ctx);
        for (const permission of permissions) {
            if (!userPermissions.includes(permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @description
     * Determines if the active user can read the specified role
     */
    private async activeUserCanReadRole(ctx: RequestContext, role: Role): Promise<boolean> {
        const requiredPermissions = getPermissions([role]);
        return await this.userHasAllPermissions(ctx, requiredPermissions);
    }

    /**
     * @description
     * Retrieves all permissions for the active user
     */
    private async getActiveUserPermissions(ctx: RequestContext): Promise<Permission[]> {
        const { activeUserId } = ctx;
        if (!activeUserId) {
            return [];
        }
        return await this.requestContextCache.get(
            ctx,
            `RoleService.getActiveUserPermissions.user(${activeUserId})`,
            async () => {
                const user = await this.connection.getEntityOrThrow(ctx, User, activeUserId, {
                    relations: ['roles'],
                });
                return getUserPermissions(user); // Adjusted to aggregate permissions at a global level.
            },
        );
    }
}
