import { resolve } from 'path';

import { buildApiSchema } from '../packages/core/dist/build-api-schema';
import { defaultConfig } from '../packages/core/dist/config/default-config';

buildApiSchema(defaultConfig, {
    apiType: 'shop',
    outputSchemaPath: resolve(__dirname, '../packages/common/src/shared-schema.ts'),
});
