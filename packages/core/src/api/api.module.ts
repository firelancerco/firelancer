import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { ConnectionModule } from '../connection/connection.module';
import { DataImportModule } from '../data-import';
import { I18nModule } from '../i18n/i18n.module';
import { createDynamicRestModulesForPlugins } from '../plugin/dynamic-plugin-api.module';
import { ServiceModule } from '../service/service.module';
import { AdminModule, ApiSharedModule, ShopModule } from './api-internal-modules';
import { AuthGuard } from './middlewares/auth.guard';
import { ExceptionHandlerFilter } from './middlewares/exception-handler.filter';

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
