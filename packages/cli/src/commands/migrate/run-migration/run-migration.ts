import { log, spinner } from '@clack/prompts';
import { runMigrations } from '@firelancerco/core';

import { CliCommand, CliCommandReturnVal } from '../../../shared/cli-command';
import { FirelancerConfigRef } from '../../../shared/firelancer-config-ref';
import { loadFirelancerConfigFile } from '../../../shared/load-firelancer-config-file';
import { analyzeProject } from '../../../shared/shared-prompts';

const cancelledMessage = 'Run migrations cancelled';

export const runMigrationCommand = new CliCommand({
    id: 'run-migration',
    category: 'Other',
    description: 'Run any pending database migrations',
    run: () => runRunMigration(),
});

async function runRunMigration(): Promise<CliCommandReturnVal> {
    const { project } = await analyzeProject({ cancelledMessage });
    const firelancerConfig = new FirelancerConfigRef(project);
    log.info('Using FirelancerConfig from ' + firelancerConfig.getPathRelativeToProjectRoot());
    const config = await loadFirelancerConfigFile(firelancerConfig);

    const runSpinner = spinner();
    runSpinner.start('Running migrations...');
    const migrationsRan = await runMigrations(config);
    const report = migrationsRan.length
        ? `Successfully ran ${migrationsRan.length} migrations`
        : 'No pending migrations found';
    runSpinner.stop(report);
    return {
        project,
        modifiedSourceFiles: [],
    };
}
