import { cancel, intro, isCancel, log, outro, select } from '@clack/prompts';
import pc from 'picocolors';

import { generateSchemaTypes } from './generate-schema-types/generate-schema-types';

const cancelledMessage = 'Schema types cancelled.';

export async function schemaTypesCommand() {
    console.log(`\n`);
    intro(pc.blue('🛠️ Firelancer schema types'));

    const action = await select({
        message: 'What would you like to do?',
        options: [{ value: 'generate', label: 'Generate schema types' }],
    });

    if (isCancel(action)) {
        cancel(cancelledMessage);
        process.exit(0);
    }

    try {
        process.env.FIRELANCER_RUNNING_IN_CLI = 'true';

        if (action === 'generate') {
            await generateSchemaTypes.run();
        }

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
