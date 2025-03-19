import { bootstrap, JobQueueService } from '@firelancerco/core';

import { config } from './firelancer-config';

/**
 * This bootstraps the dev server, used for testing Firelqancer during development.
 */
bootstrap(config)
    .then(app => {
        if (process.env.RUN_JOB_QUEUE === '1') {
            return app.get(JobQueueService).start();
        }
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
