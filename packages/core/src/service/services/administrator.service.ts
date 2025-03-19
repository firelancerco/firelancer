import { assertFound, idsAreEqual, normalizeEmailAddress } from '@firelancerco/common/lib/shared-utils';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { Injectable } from '@nestjs/common';
import { In, IsNull } from 'typeorm';
import { RelationPaths } from '../../api';
import {
    EntityNotFoundError,
    InternalServerError,
    ListQueryOptions,
    RequestContext,
    UserInputError,
} from '../../common';
import { CreateAdministratorInput, DeletionResult, ID, UpdateAdministratorInput } from '../../common/shared-schema';
import { ConfigService } from '../../config';
import { TransactionalConnection } from '../../connection';
import { Administrator, NativeAuthenticationMethod, Role, User } from '../../entity';
import { AdministratorEvent, EventBus, RoleChangeEvent } from '../../event-bus';
import { ProcessContext } from '../../process-context';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { PasswordCipher } from '../helpers/password-cipher/password-cipher';
import { RequestContextService } from '../helpers/request-context/request-context.service';
import { patchEntity } from '../helpers/utils/patch-entity';
import { RoleService } from './role.service';
import { UserService } from './user.service';
import { getPermissions } from '../helpers/utils/get-user-permissions';

/**
 * @description
 * Contains methods relating to Administrator entities.
 */
@Injectable()
export class AdministratorService {
    constructor(
        private connection: TransactionalConnection,
        private configService: ConfigService,
        private passwordCipher: PasswordCipher,
        private userService: UserService,
        private roleService: RoleService,
        private requestContextService: RequestContextService,
        private eventBus: EventBus,
        private processContext: ProcessContext,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async initAdministrators() {
        await this.ensureSuperAdminExists();
    }

    /**
     * @description
     * Get a paginated list of Administrators.
     */
    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Administrator>,
        relations?: RelationPaths<Administrator>,
    ): Promise<PaginatedList<Administrator>> {
        return this.listQueryBuilder
            .build(Administrator, options, {
                relations: relations ?? ['user', 'user.roles'],
                where: { deletedAt: IsNull() },
                ctx,
            })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    /**
     * @description
     * Get an Administrator by id.
     */
    async findOne(
        ctx: RequestContext,
        administratorId: ID,
        relations?: RelationPaths<Administrator>,
    ): Promise<Administrator | undefined> {
        return this.connection
            .getRepository(ctx, Administrator)
            .findOne({
                relations: relations ?? ['user', 'user.roles'],
                where: {
                    id: administratorId,
                    deletedAt: IsNull(),
                },
            })
            .then(result => result ?? undefined);
    }

    /**
     * @description
     * Get an Administrator based on the User id.
     */
    async findOneByUserId(
        ctx: RequestContext,
        userId: ID,
        relations?: RelationPaths<Administrator>,
    ): Promise<Administrator | undefined> {
        return this.connection
            .getRepository(ctx, Administrator)
            .findOne({
                relations,
                where: {
                    user: { id: userId },
                    deletedAt: IsNull(),
                },
            })
            .then(result => result ?? undefined);
    }

    /**
     * @description
     * Create a new Administrator.
     */
    async create(ctx: RequestContext, input: CreateAdministratorInput): Promise<Administrator> {
        const administrator = new Administrator(input);
        administrator.emailAddress = normalizeEmailAddress(input.emailAddress);
        administrator.user = await this.userService.createAdminUser(ctx, input.emailAddress, input.password);
        let createdAdministrator = await this.connection.getRepository(ctx, Administrator).save(administrator);
        for (const roleId of input.roleIds) {
            createdAdministrator = await this.assignRole(ctx, createdAdministrator.id, roleId);
        }
        await this.eventBus.publish(new AdministratorEvent(ctx, createdAdministrator, 'created', input));
        return createdAdministrator;
    }

    /**
     * @description
     * Update an existing Administrator.
     */
    async update(ctx: RequestContext, input: UpdateAdministratorInput): Promise<Administrator> {
        const administrator = await this.findOne(ctx, input.id);
        if (!administrator) {
            throw new EntityNotFoundError('Administrator', input.id);
        }
        if (input.roleIds) {
            await this.checkActiveUserCanGrantRoles(ctx, input.roleIds);
        }
        let updatedAdministrator = patchEntity(administrator, input);
        await this.connection.getRepository(ctx, Administrator).save(administrator, { reload: false });

        if (input.emailAddress) {
            updatedAdministrator.user.identifier = input.emailAddress;
            await this.connection.getRepository(ctx, User).save(updatedAdministrator.user);
        }
        if (input.password) {
            const user = await this.userService.getUserById(ctx, administrator.user.id);
            if (user) {
                const nativeAuthMethod = user.getNativeAuthenticationMethod();
                nativeAuthMethod.passwordHash = await this.passwordCipher.hash(input.password);
                await this.connection.getRepository(ctx, NativeAuthenticationMethod).save(nativeAuthMethod);
            }
        }
        if (input.roleIds) {
            const removeIds = administrator.user.roles
                .map(role => role.id)
                .filter(roleId => (input.roleIds as ID[]).indexOf(roleId) === -1);

            const addIds = (input.roleIds as ID[]).filter(
                roleId => !administrator.user.roles.some(role => role.id === roleId),
            );

            administrator.user.roles = [];
            await this.connection.getRepository(ctx, User).save(administrator.user, { reload: false });
            for (const roleId of input.roleIds) {
                updatedAdministrator = await this.assignRole(ctx, administrator.id, roleId);
            }
            await this.eventBus.publish(new RoleChangeEvent(ctx, administrator, addIds, 'assigned'));
            await this.eventBus.publish(new RoleChangeEvent(ctx, administrator, removeIds, 'removed'));
        }
        await this.eventBus.publish(new AdministratorEvent(ctx, administrator, 'updated', input));
        return updatedAdministrator;
    }

    /**
     * @description
     * Checks that the active user is allowed to grant the specified Roles when creating or
     * updating an Administrator.
     */
    private async checkActiveUserCanGrantRoles(ctx: RequestContext, roleIds: ID[]) {
        const roles = await this.connection.getRepository(ctx, Role).find({
            where: { id: In(roleIds) },
        });
        const permissionsRequired = getPermissions(roles);
        const activeUserHasRequiredPermissions = await this.roleService.userHasAllPermissions(ctx, permissionsRequired);
        if (!activeUserHasRequiredPermissions) {
            throw new UserInputError('error.active-user-does-not-have-sufficient-permissions');
        }
    }

    /**
     * @description
     * Assigns a Role to the Administrator's User entity.
     */
    async assignRole(ctx: RequestContext, administratorId: ID, roleId: ID): Promise<Administrator> {
        const administrator = await this.findOne(ctx, administratorId);
        if (!administrator) {
            throw new EntityNotFoundError('Administrator', administratorId);
        }
        const role = await this.roleService.findOne(ctx, roleId);
        if (!role) {
            throw new EntityNotFoundError('Role', roleId);
        }
        administrator.user.roles.push(role);
        await this.connection.getRepository(ctx, User).save(administrator.user, { reload: false });
        return administrator;
    }

    /**
     * @description
     * Soft deletes an Administrator (sets the `deletedAt` field).
     */
    async softDelete(ctx: RequestContext, id: ID) {
        const administrator = await this.connection.getEntityOrThrow(ctx, Administrator, id, {
            relations: ['user'],
        });
        const isSoleSuperadmin = await this.isSoleSuperadmin(ctx, id);
        if (isSoleSuperadmin) {
            throw new InternalServerError('error.cannot-delete-sole-superadmin');
        }
        await this.connection.getRepository(ctx, Administrator).update({ id }, { deletedAt: new Date() });
        await this.userService.softDelete(ctx, administrator.user.id);
        await this.eventBus.publish(new AdministratorEvent(ctx, administrator, 'deleted', id));
        return { result: DeletionResult.DELETED };
    }

    /**
     * @description
     * Resolves to `true` if the administrator ID belongs to the only Administrator
     * with SuperAdmin permissions.
     */
    private async isSoleSuperadmin(ctx: RequestContext, id: ID) {
        const superAdminRole = await this.roleService.getSuperAdminRole(ctx);
        const allAdmins = await this.connection.getRepository(ctx, Administrator).find({
            relations: ['user', 'user.roles'],
        });
        const superAdmins = allAdmins.filter(admin => !!admin.user.roles.find(r => r.id === superAdminRole.id));
        if (1 < superAdmins.length) {
            return false;
        } else {
            return idsAreEqual(superAdmins[0].id, id);
        }
    }

    /**
     * @description
     * Ensures that a SuperAdmin user and corresponding Administrator entity exist and are active.
     * This method handles the following cases:
     * - No SuperAdmin user exists.
     * - The SuperAdmin user exists but has no corresponding Administrator entity.
     * - The SuperAdmin user or Administrator entity exists but is soft-deleted.
     * - Ensures the SuperAdmin user has the SuperAdmin role.
     */
    private async ensureSuperAdminExists() {
        if (this.processContext.isWorker) {
            return;
        }
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.rawConnection.getRepository(User).findOne({
            where: { identifier: superadminCredentials.identifier },
            relations: {
                roles: true,
            },
            withDeleted: true, // Include soft-deleted entities
        });

        if (!superAdminUser) {
            // Case: No SuperAdmin user exists
            const ctx = this.requestContextService.create({ apiType: 'admin' });
            const superAdminRole = await this.roleService.getSuperAdminRole();
            const administrator = new Administrator({
                emailAddress: superadminCredentials.identifier,
                firstName: 'Super',
                lastName: 'Admin',
            });
            administrator.user = await this.userService.createAdminUser(
                ctx,
                superadminCredentials.identifier,
                superadminCredentials.password,
            );
            const { id } = await this.connection.getRepository(ctx, Administrator).save(administrator);
            const createdAdministrator = await assertFound(this.findOne(ctx, id));
            createdAdministrator.user.roles.push(superAdminRole);
            await this.connection.getRepository(ctx, User).save(createdAdministrator.user, { reload: false });
        } else {
            // Case: SuperAdmin user exists
            if (superAdminUser.deletedAt) {
                // Reactivate the soft-deleted user
                superAdminUser.deletedAt = null;
                await this.connection.rawConnection.getRepository(User).save(superAdminUser);
            }

            const superAdministrator = await this.connection.rawConnection.getRepository(Administrator).findOne({
                where: { user: { id: superAdminUser.id } },
                withDeleted: true, // Include soft-deleted entities
            });

            if (!superAdministrator) {
                // Case: Administrator entity does not exist for the SuperAdmin user
                const administrator = new Administrator({
                    emailAddress: superadminCredentials.identifier,
                    firstName: 'Super',
                    lastName: 'Admin',
                    user: superAdminUser,
                });
                await this.connection.rawConnection.getRepository(Administrator).save(administrator);
            } else if (superAdministrator.deletedAt) {
                // Reactivate the soft-deleted Administrator entity
                superAdministrator.deletedAt = null;
                await this.connection.rawConnection.getRepository(Administrator).save(superAdministrator);
            }

            const superAdminRole = await this.roleService.getSuperAdminRole();
            if (!superAdminUser.roles.some(role => role.id === superAdminRole.id)) {
                // Ensure the user has the SuperAdmin role
                superAdminUser.roles.push(superAdminRole);
                await this.connection.rawConnection.getRepository(User).save(superAdminUser, { reload: false });
            }
        }
    }
}
