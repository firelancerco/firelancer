import { notNullOrUndefined } from '@firelancerco/common/lib/shared-utils';
import { Type } from '@nestjs/common';
import { EntitySubscriberInterface } from 'typeorm';

import { coreSchemas } from './api/schema/core-schemas';
import { InternalServerException } from './common/error/errors';
import { getConfig, setConfig } from './config/config-helpers';
import { FirelancerConfig, RuntimeFirelancerConfig } from './config/firelancer-config';
import { Logger } from './config/strategies/logger/firelancer-logger';
import { setEntityIdStrategy, setMoneyStrategy } from './entity';
import { coreEntitiesMap } from './entity/core-entities';
import { getConfigurationFunction, getEntitiesFromPlugins, getPluginAPIExtensions } from './plugin/plugin-metadata';
import { AuthenticationStrategy } from 'config';

/**
 * Setting the global config must be done prior to loading the AppModule.
 */
export async function preBootstrapConfig(
    userConfig: Partial<FirelancerConfig> = {},
): Promise<Readonly<RuntimeFirelancerConfig>> {
    if (userConfig) {
        await setConfig(userConfig);
    }

    const entities = getAllEntities(userConfig);
    const { coreSubscribersMap } = await import('./entity/subscribers.js');
    await setConfig({
        dbConnectionOptions: {
            entities,
            subscribers: [
                ...((userConfig.dbConnectionOptions?.subscribers ?? []) as Array<Type<EntitySubscriberInterface>>),
                ...(Object.values(coreSubscribersMap) as Array<Type<EntitySubscriberInterface>>),
            ],
        },
    });

    let config = getConfig();
    // The logger is set here so that we are able to log any messages prior to the final
    // logger (which may depend on config coming from a plugin) being set.
    Logger.useLogger(config.logger);
    config = await runPluginConfigurations(config);

    setEntityIdStrategy(config.entityOptions.entityIdStrategy, entities);
    setMoneyStrategy(config.entityOptions.moneyStrategy, entities);
    setExposedHeaders(config);
    setSchemaExtensions(config);

    return config;
}

function setSchemaExtensions(config: RuntimeFirelancerConfig) {
    const { adminAuthenticationStrategy, shopAuthenticationStrategy } = config?.authOptions || {};

    const processPluginSchemas = (apiType: 'admin' | 'shop') =>
        getPluginAPIExtensions(config.plugins, apiType)
            .map(e => (typeof e.schemas === 'function' ? e.schemas() : e.schemas))
            .filter(notNullOrUndefined)
            .reduce((acc, schema) => ({ ...acc, ...schema }), {});

    const mutateAuthenticationSchemas = (apiType: 'admin' | 'shop', strategies: AuthenticationStrategy[]) =>
        strategies?.forEach(strategy => {
            coreSchemas[apiType].AuthenticationInput = coreSchemas[apiType].AuthenticationInput.extend({
                [strategy.name]: strategy.getInputSchema().optional(),
            });

            coreSchemas[apiType].MutationAuthenticateArgs = coreSchemas[apiType].MutationAuthenticateArgs.extend({
                input: coreSchemas[apiType].AuthenticationInput,
            });
        });

    coreSchemas.admin = {
        ...coreSchemas.admin,
        ...processPluginSchemas('admin'),
    };

    coreSchemas.shop = {
        ...coreSchemas.shop,
        ...processPluginSchemas('shop'),
    };

    mutateAuthenticationSchemas('shop', adminAuthenticationStrategy);
    mutateAuthenticationSchemas('admin', shopAuthenticationStrategy);
}

/**
 * If the 'bearer' tokenMethod is being used, then we automatically expose the authTokenHeaderKey header
 * in the CORS options, making sure to preserve any user-configured exposedHeaders.
 */
function setExposedHeaders(config: Readonly<RuntimeFirelancerConfig>) {
    const { tokenMethod } = config.authOptions;
    const isUsingBearerToken =
        tokenMethod === 'bearer' || (Array.isArray(tokenMethod) && tokenMethod.includes('bearer'));
    if (isUsingBearerToken) {
        const authTokenHeaderKey = config.authOptions.authTokenHeaderKey;
        const corsOptions = config.apiOptions.cors;
        if (typeof corsOptions !== 'boolean') {
            const { exposedHeaders } = corsOptions;
            let exposedHeadersWithAuthKey: string[];
            if (!exposedHeaders) {
                exposedHeadersWithAuthKey = [authTokenHeaderKey];
            } else if (typeof exposedHeaders === 'string') {
                exposedHeadersWithAuthKey = exposedHeaders
                    .split(',')
                    .map(x => x.trim())
                    .concat(authTokenHeaderKey);
            } else {
                exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
            }
            corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
        }
    }
}

/**
 * Initialize any configured plugins.
 */
async function runPluginConfigurations(config: RuntimeFirelancerConfig): Promise<RuntimeFirelancerConfig> {
    for (const plugin of config.plugins) {
        const configFn = getConfigurationFunction(plugin);
        if (typeof configFn === 'function') {
            const result = await configFn(config);
            Object.assign(config, result);
        }
    }
    return config;
}

/**
 * Returns an array of core entities and any additional entities defined in plugins.
 */
function getAllEntities(userConfig: Partial<FirelancerConfig>): Array<Type<unknown>> {
    const coreEntities = Object.values(coreEntitiesMap) as Array<Type<unknown>>;
    const pluginEntities = getEntitiesFromPlugins(userConfig.plugins);
    const allEntities: Array<Type<unknown>> = coreEntities;
    // Check to ensure that no plugins are defining entities with names which conflict with existing entities.
    for (const pluginEntity of pluginEntities) {
        if (allEntities.find(e => e.name === pluginEntity.name)) {
            // TODO
            throw new InternalServerException('The entity name conflicts with an existing entity' as any);
        } else {
            allEntities.push(pluginEntity);
        }
    }
    return allEntities;
}
