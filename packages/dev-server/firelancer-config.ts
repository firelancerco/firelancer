import { AdminUiPlugin } from '@firelancerco/admin-ui-plugin';
import { AssetServerPlugin } from '@firelancerco/asset-server-plugin';
import {
    DefaultCachePlugin,
    DefaultCacheTtlProvider,
    DefaultJobQueuePlugin,
    FirelancerConfig,
} from '@firelancerco/core';
import { EmailPlugin, FileBasedTemplateLoader } from '@firelancerco/email-plugin';
import { GoogleAuthPlugin } from '@firelancerco/google-auth-plugin';
import path from 'path';

import emailHandlers from './email-handlers';

const serverPort = Number(process.env.PORT) || 3000;
const serverHost = process.env.HOST || 'localhost';

export const config: FirelancerConfig = {
    apiOptions: {
        hostname: serverHost,
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
    },
    dbConnectionOptions: {
        type: 'postgres',
        port: Number(process.env.POSTGRES_CONNECTION_PORT!),
        host: process.env.POSTGRES_CONNECTION_HOST!,
        username: process.env.POSTGRES_CONNECTION_USERNAME!,
        password: process.env.POSTGRES_CONNECTION_PASSWORD!,
        database: process.env.POSTGRES_DATABASE!,
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    },
    authOptions: {
        tokenMethod: ['cookie', 'bearer'],
        cookieOptions: {
            name: {
                admin: 'admin-session',
                shop: 'shop-session',
            },
        },
    },
    importExportOptions: {
        importAssetsDir: path.join(__dirname, './import/assets'),
    },
    plugins: [
        GoogleAuthPlugin.init({
            clientId: process.env.GOOGLE_CLIENT_ID!,
        }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, './static/assets'),
            assetUrlPrefix: process.env.IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: serverPort + 2,
            adminUiConfig: {
                apiHost: `http://${serverHost}`,
                apiPort: serverPort,
            },
        }),
        EmailPlugin.init({
            // devMode: true,
            // outputPath: path.join(__dirname, './test-emails'),
            // route: 'mailbox',
            handlers: emailHandlers,
            templateLoader: new FileBasedTemplateLoader({
                templatePath: path.join(__dirname, '../email-plugin/templates'),
                localized: true,
            }),
            globalTemplateVars: {
                fromAddress: `"Firelancer" <${process.env.GOOGLE_EMAIL!}>`,
            },
            transport: {
                type: 'smtp',
                host: 'smtp.gmail.com',
                port: 465,
                auth: {
                    user: process.env.GOOGLE_EMAIL!,
                    pass: process.env.GOOGLE_APP_PASSWORD!,
                },
                logging: true,
            },
        }),
        DefaultCachePlugin.init({
            cacheSize: 1000,
            cacheTtlProvider: new DefaultCacheTtlProvider(),
        }),
    ],
};
