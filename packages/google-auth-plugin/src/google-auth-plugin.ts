import { FirelancerPlugin, PluginCommonModule } from '@firelancerco/core';

import { GoogleAuthenticationStrategy } from './google-authentication-strategy';

export type GoogleAuthPluginOptions = {
    clientId: string;
};

/**
 * An implementation of a Google login flow.
 */
@FirelancerPlugin({
    imports: [PluginCommonModule],
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

    static init(options: GoogleAuthPluginOptions) {
        this.options = options;
        return GoogleAuthPlugin;
    }
}
