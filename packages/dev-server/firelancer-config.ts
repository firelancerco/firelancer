import path from 'path';
import { AdminUiPlugin } from '@firelancerco/admin-ui-plugin';
import { GoogleAuthPlugin } from '@firelancerco/google-auth-plugin';
import { AssetServerPlugin } from '@firelancerco/asset-server-plugin';
import { DefaultJobQueuePlugin, FirelancerConfig } from '@firelancerco/core';
import {
    emailAddressChangeHandler,
    EmailPlugin,
    emailVerificationHandler,
    FileBasedTemplateLoader,
    passwordResetHandler,
} from '@firelancerco/email-plugin';

const serverPort = Number(process.env.PORT) || 3000;
const serverHost = process.env.HOST || 'localhost';

const extendedEmailVerificationHandler = emailVerificationHandler
    .setTemplateVars(() => ({
        subject: {
            en: 'Please verify your email address',
            ar: 'يرجى التحقق من عنوان بريدك الإلكتروني',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

const extendedPasswordResetHandler = passwordResetHandler
    .setTemplateVars(() => ({
        subject: {
            en: 'Forgotten password reset',
            ar: 'إعادة تعيين كلمة المرور',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

const extendedEmailAddressChangeHandler = emailAddressChangeHandler
    .setTemplateVars(() => ({
        subject: {
            en: 'Please verify your change of email address',
            ar: 'تحقق من عنوان بريدك الإلكتروني الجديد',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

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
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, './test-emails'),
            route: 'mailbox',
            handlers: [
                extendedEmailVerificationHandler,
                extendedPasswordResetHandler,
                extendedEmailAddressChangeHandler,
            ],
            templateLoader: new FileBasedTemplateLoader({
                templatePath: path.join(__dirname, '../email-plugin/templates'),
                localized: true,
            }),
            globalTemplateVars: {
                fromAddress: '"Firelancer" <noreply@example.com>',
            },
        }),
    ],
    importExportOptions: {
        importAssetsDir: path.join(__dirname, './import/assets'),
    },
};
