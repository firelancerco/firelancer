import { log, spinner } from '@clack/prompts';
import { getSchemasForApi, zodSchemasToTs } from '@firelancerco/core';
import { join } from 'path';

import { CliCommand } from '../../../shared/cli-command';
import { FirelancerConfigRef } from '../../../shared/firelancer-config-ref';
import { loadFirelancerConfigFile } from '../../../shared/load-firelancer-config-file';
import { analyzeProject } from '../../../shared/shared-prompts';
import { writeFileSync } from 'fs-extra';

const cancelledMessage = 'Generate Schema cancelled';

export const generateSchemaTypes = new CliCommand({
    id: 'generate-schema-types',
    category: 'Other',
    description: 'Generate schema types from your server config file',
    run: async () => {
        const { project, tsConfigPath } = await analyzeProject({ cancelledMessage });
        const firelancerConfig = new FirelancerConfigRef(project);
        log.info('Using FirelancerConfig from ' + firelancerConfig.getPathRelativeToProjectRoot());
        const config = await loadFirelancerConfigFile(firelancerConfig, tsConfigPath);

        const runSpinner = spinner();

        runSpinner.start('genearte typescript files...');
        const adminSchemas = await getSchemasForApi('admin', config);
        const shopSchemas = await getSchemasForApi('shop', config);
        const srcDir = project.getDirectory('./');

        if (srcDir) {
            writeFileSync(join(srcDir.getPath(), './generated-schema.ts'), zodSchemasToTs(adminSchemas));
            writeFileSync(join(srcDir.getPath(), './generated-shop-schema.ts'), zodSchemasToTs(shopSchemas));
        }
        return {
            project,
            modifiedSourceFiles: [],
        };
    },
});
