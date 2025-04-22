import { writeFileSync } from 'fs-extra';
import { resolve } from 'path';

import { getSchemasForApi } from '../packages/core/dist/get-schemas-for-api.js';
import { zodSchemasToTs } from '../packages/core/dist/zod-schemas-to-ts.js';
import { defaultConfig } from '../packages/core/dist/config/default-config.js';

async function run() {
    const adminSchemas = await getSchemasForApi('admin', defaultConfig);
    const shopSchemas = await getSchemasForApi('shop', defaultConfig);
    writeFileSync(resolve(__dirname, '../packages/common/src/generated-schema.ts'), zodSchemasToTs(adminSchemas));
    writeFileSync(resolve(__dirname, '../packages/common/src/generated-shop-schema.ts'), zodSchemasToTs(shopSchemas));
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
