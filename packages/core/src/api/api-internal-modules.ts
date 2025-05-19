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
import { JobPostController } from './controllers/admin/job-post.controller';
import { RoleController } from './controllers/admin/role.controller';

import { ShopAuthController } from './controllers/shop/auth.controller';
import { ShopCustomerController } from './controllers/shop/customer.controller';
import { ShopHiringJobPostController } from './controllers/shop/hiring-job-post.controller';

import { AssetEntityController } from './controllers/shop/entity/asset-entity.controller';
import { CollectionEntityController } from './controllers/shop/entity/collection-entity.controller';
import { FacetEntityController } from './controllers/shop/entity/facet-entity.controller';
import { FacetValueEntityController } from './controllers/shop/entity/facet-value-entity.controller';
import { JobPostEntityController } from './controllers/shop/entity/job-post-entity.controller';

const { apiOptions } = getConfig();

const adminResolvers = [AdminAuthController, AdministratorController, RoleController, JobPostController];
const shopControllers = [ShopAuthController, ShopHiringJobPostController, ShopCustomerController];
export const adminEntityControllers = [];
export const shopEntityControllers = [
    AssetEntityController,
    CollectionEntityController,
    FacetEntityController,
    FacetValueEntityController,
    JobPostEntityController,
];

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
    controllers: [...adminResolvers, ...adminEntityControllers, ...adminEntityControllers],
})
export class AdminModule {}

@Module({
    imports: [ApiSharedModule, RouterModule.register([{ path: apiOptions.shopApiPath, module: ShopModule }])],
    controllers: [...shopControllers, ...shopEntityControllers],
})
export class ShopModule {}
