import { buildApiSchema } from '@firelancerco/core';
import { resolve } from 'path';
import { config } from './firelancer-config';

buildApiSchema(config, {
    apiType: 'shop',
    outputSchemaPath: resolve(__dirname, 'generated-schema.ts'),
});
