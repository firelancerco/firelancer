import { bootstrapWorker } from '@firelancerco/core';

import { config } from './firelancer-config';

bootstrapWorker(config)
    .then(worker => worker.startJobQueue())
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
