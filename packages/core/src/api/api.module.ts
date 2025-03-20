import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE, RouterModule } from '@nestjs/core';

import { CacheModule } from '../cache';
import { getConfig } from '../config/config-helpers';
import { ConfigModule } from '../config/config.module';
import { ConnectionModule } from '../connection/connection.module';
import { DataImportModule } from '../data-import';
import { I18nModule } from '../i18n/i18n.module';
import { createDynamicRestModulesForPlugins } from '../plugin/dynamic-plugin-api.module';
import { ServiceModule } from '../service/service.module';
import { AdministratorController } from './controllers/admin/administrator.controller';
import { AdminAuthController } from './controllers/admin/auth.controller';
import { RoleController } from './controllers/admin/roles.controller';
import { FacetController } from './controllers/entity/facet-entity.controller';
import { ShopAuthController } from './controllers/shop/auth.controller';
import { ShopJobPostController } from './controllers/shop/job-post.controller';
import { AuthGuard } from './middlewares/auth.guard';
import { ExceptionHandlerFilter } from './middlewares/exception-handler.filter';

const { apiOptions } = getConfig();

const adminResolvers = [AdminAuthController, AdministratorController, RoleController];

const shopControllers = [ShopAuthController, ShopJobPostController];

export const entityControllers = [FacetController];

export const adminEntityControllers = [];

/**
 * The internal module containing some shared providers used by more than
 * one API module.
 */
@Module({
    imports: [ConfigModule, ServiceModule, CacheModule, ConnectionModule.forRoot()],
    providers: [],
    exports: [CacheModule, ConfigModule, ServiceModule, ConnectionModule.forRoot()],
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

@Module({
    imports: [
        ServiceModule,
        ConnectionModule.forRoot(),
        DataImportModule,
        I18nModule,
        ApiSharedModule,
        AdminModule,
        ShopModule,
        ...createDynamicRestModulesForPlugins('admin'),
        ...createDynamicRestModulesForPlugins('shop'),
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        },
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionHandlerFilter,
        },
    ],
})
export class ApiModule {}
