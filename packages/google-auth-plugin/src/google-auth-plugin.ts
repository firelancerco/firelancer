import { FirelancerPlugin, I18nService, PluginCommonModule } from '@firelancerco/core';
import { resolve } from 'path';

import { GoogleAuthenticationStrategy } from './google-authentication-strategy';

export type GoogleAuthPluginOptions = {
    clientId: string;
};

/**
 * An implementation of a Google login flow.
 */
@FirelancerPlugin({
    compatibility: '>=1.0.0',
    imports: [PluginCommonModule],
    shopApiExtensions: {
        schemaPath: resolve(__dirname, './schema.d.ts'),
    },
    configuration: config => {
        config.authOptions.shopAuthenticationStrategy = [
            ...config.authOptions.shopAuthenticationStrategy,
            new GoogleAuthenticationStrategy(GoogleAuthPlugin.options.clientId),
        ];
        return config;
    },
})
export class GoogleAuthPlugin {
    static options: GoogleAuthPluginOptions;

    constructor(private i18nService: I18nService) {}

    static init(options: GoogleAuthPluginOptions) {
        this.options = options;
        return GoogleAuthPlugin;
    }

    onApplicationBootstrap() {
        this.i18nService.addTranslation('en', {
            error: {
                'user-not-registered': 'This Google account is not registered in Firelancer',
                'register-customer-type-required': 'Customer Type field is required',
                'unkown-error': 'An unknown error occurred',
                'google-failed-to-fetch-user-info': 'Failed to fetch user info from Google',
                'google-auth-action-required': 'Google authentication action required',
                'google-auth-invalid-action-value': 'Invalid Google authentication action value',
                'google-auth-profile-invalid': 'Invalid Google authentication profile',
                'google-auth-token-required': 'Google authentication token required',
            },
        });

        this.i18nService.addTranslation('ar', {
            error: {
                'user-not-registered': 'هذا الحساب غوغل غير مسجل في فيرلانسر',
                'register-customer-type-required': 'يجب إدخال حقل نوع العميل',
                'unkown-error': 'حدث خطأ غير معروف',
                'google-failed-to-fetch-user-info': 'فشل جلب معلومات المستخدم من جوجل',
                'google-auth-action-required': 'إعادة تحميل جوجل للمصادقة',
                'google-auth-invalid-action-value': 'قيمة نوع الاجراء غير صالحة',
                'google-auth-profile-invalid': 'الملف الشخصي غير صالح',
                'google-auth-token-required': 'رمز المصادقة مطلوب',
            },
        });
    }
}
