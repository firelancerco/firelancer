import { bootstrap, JobQueueService } from '@firelancerco/core';
import { populate } from '@firelancerco/core/cli';

import { config } from './firelancer-config';
import { initialData } from './import/data-sources/initial-data';

const bootstrapFn = async () => {
    const _app = await bootstrap(config);
    await _app.get(JobQueueService).start();
    return _app;
};

populate(bootstrapFn, initialData)
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
    });
