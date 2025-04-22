import { log, spinner, text } from '@clack/prompts';
import { getSchemasForApi, zodSchemasToTs } from '@firelancerco/core';
import { existsSync, mkdirSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import { CliCommand } from '../../../shared/cli-command';
import { FirelancerConfigRef } from '../../../shared/firelancer-config-ref';
import { loadFirelancerConfigFile } from '../../../shared/load-firelancer-config-file';
import { analyzeProject } from '../../../shared/shared-prompts';

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

        // Ask user for output directory
        const outputDir = await text({
            message: 'Where should the generated files be saved? (Leave empty for project root)',
            placeholder: './schemas',
            defaultValue: '',
        });

        if (outputDir === undefined) {
            log.error(cancelledMessage);
            process.exit(0);
        }

        const runSpinner = spinner();

        runSpinner.start('Generating typescript files...');
        const adminSchemas = await getSchemasForApi('admin', config);
        const shopSchemas = await getSchemasForApi('shop', config);

        const outputPath = join(process.cwd(), outputDir.toString());
        // Create directory if it doesn't exist
        if (!existsSync(outputPath)) {
            try {
                mkdirSync(outputPath, { recursive: true });
                log.info(`Created directory: ${outputPath}`);
            } catch (error) {
                log.error(`Failed to create directory: ${outputPath}`);
                process.exit(1);
            }
        }

        // Write the generated schema files
        try {
            writeFileSync(join(outputPath, './generated-schema.ts'), zodSchemasToTs(adminSchemas));
            writeFileSync(join(outputPath, './generated-shop-schema.ts'), zodSchemasToTs(shopSchemas));
            runSpinner.stop(`Successfully generated schema files in ${outputPath}`);
        } catch (error: any) {
            runSpinner.stop('Failed to write schema files');
            log.error(`Error: ${error.message}`);
            process.exit(1);
        }

        return {
            project,
            modifiedSourceFiles: [],
        };
    },
});
