import z from 'zod';
import { coreSchemas } from './api/schema/core-schemas';
import { FirelancerConfig } from './config/firelancer-config';
import { preBootstrapConfig } from './pre-bootstrap-config';

export async function getSchemasForApi(
    apiType: 'shop' | 'admin',
    userConfig?: Partial<FirelancerConfig>,
): Promise<Record<string, z.ZodTypeAny>> {
    if (userConfig) {
        await preBootstrapConfig(userConfig);
    }
    return {
        ...coreSchemas.common,
        ...(apiType === 'admin' ? coreSchemas.admin : {}),
        ...(apiType === 'shop' ? coreSchemas.shop : {}),
    };
}
