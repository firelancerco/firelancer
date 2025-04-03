import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CacheModule } from '../cache/cache.module';
import { ConfigurableOperationCodec, IdCodecService } from '../common';
import { getConfig } from '../config/config-helpers';
import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { ServiceModule } from '../service/service.module';
import { AdministratorController } from './controllers/admin/administrator.controller';
import { AdminAuthController } from './controllers/admin/auth.controller';
import { RoleController } from './controllers/admin/roles.controller';
import { AssetController } from './controllers/entity/asset.controller';
import { CollectionController } from './controllers/entity/collection.controller';
import { FacetController } from './controllers/entity/facet-entity.controller';
import { FacetValueController } from './controllers/entity/facet-value-entity.controller';
import { JobPostController } from './controllers/entity/job-post-entity.controller';
import { ShopAuthController } from './controllers/shop/auth.controller';
import { ShopHiringController } from './controllers/shop/hiring.controller';

const { apiOptions } = getConfig();

const adminResolvers = [AdminAuthController, AdministratorController, RoleController];
const shopControllers = [ShopAuthController, ShopHiringController];
export const entityControllers = [
    FacetController,
    FacetValueController,
    JobPostController,
    CollectionController,
    AssetController,
];
export const adminEntityControllers = [];

/**
 * The internal module containing some shared providers used by more than
 * one API module.
 */
@Module({
    imports: [
        ConfigModule,
        ServiceModule,
        CacheModule,
        ConnectionModule.forRoot(),
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 50 }] }),
    ],
    providers: [IdCodecService, ConfigurableOperationCodec, { provide: APP_GUARD, useClass: ThrottlerGuard }],
    exports: [
        IdCodecService,
        CacheModule,
        ConfigModule,
        ConfigurableOperationCodec,
        ServiceModule,
        ConnectionModule.forRoot(),
    ],
})
export class ApiSharedModule {}

@Module({
    imports: [ApiSharedModule, RouterModule.register([{ path: apiOptions.adminApiPath, module: AdminModule }])],
    controllers: [...adminResolvers, ...entityControllers, ...adminEntityControllers],
})
export class AdminModule {}

@Module({
    imports: [ApiSharedModule, RouterModule.register([{ path: apiOptions.shopApiPath, module: ShopModule }])],
    controllers: [...shopControllers, ...entityControllers],
})
export class ShopModule {}
