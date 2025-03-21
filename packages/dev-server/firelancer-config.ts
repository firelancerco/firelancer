import path from 'path';
import { AdminUiPlugin } from '@firelancerco/admin-ui-plugin';
import { GoogleAuthPlugin } from '@firelancerco/google-auth-plugin';
import { AssetServerPlugin } from '@firelancerco/asset-server-plugin';
import { DefaultJobQueuePlugin, FirelancerConfig } from '@firelancerco/core';

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
    ],
    importExportOptions: {
        importAssetsDir: path.join(__dirname, './import/assets'),
    },
};
