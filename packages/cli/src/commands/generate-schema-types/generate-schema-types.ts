import { cancel, intro, isCancel, log, outro, select } from '@clack/prompts';
import pc from 'picocolors';
import { unique } from '@firelancerco/common/lib/shared-utils';
import { FirelancerConfig, generateMigration } from '@firelancerco/core/';
import path from 'path';

import { CliCommand } from '../../shared/cli-command';
import { analyzeProject } from '../../shared/shared-prompts';
import { FirelancerConfigRef } from '../../shared/firelancer-config-ref';
import { loadFirelancerConfigFile } from '../../shared/load-firelancer-config-file';

const cancelledMessage = 'Typescript schema generation cancelled.';

export async function generateSchemaTypesCommand() {
    console.log(`\n`);
    intro(pc.blue('🛠️ Firelancer typeScript schema generation'));

    try {
        process.env.FIRELANCER_RUNNING_IN_CLI = 'true';
        await command.run();
        outro('✅ Done!');
        process.env.FIRELANCER_RUNNING_IN_CLI = undefined;
    } catch (e) {
        if (e instanceof Error) {
            log.error(e.message);
            if (e.stack) {
                log.error(e.stack);
            }
        }
    }
}

const command = new CliCommand({
    id: 'generate-schema-types',
    category: 'Other',
    description: 'Generate typescript schema types',
    run: async () => {
        const { project, tsConfigPath } = await analyzeProject({ cancelledMessage });
        const firelancerConfig = new FirelancerConfigRef(project);
        const config = await loadFirelancerConfigFile(firelancerConfig, tsConfigPath);

        return {
            project,
            modifiedSourceFiles: [],
        };
    },
});
