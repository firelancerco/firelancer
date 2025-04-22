import { ID } from '@firelancerco/common/lib/generated-schema';
import { unique } from '@firelancerco/common/lib/shared-utils';

import { Job } from '../../../job-queue/job';
import { JobBuffer } from '../../../job-queue/job-buffer/job-buffer';
import { ApplyCollectionFiltersJobData } from '../../../service/services/collection.service';

export class CollectionJobBuffer implements JobBuffer<ApplyCollectionFiltersJobData> {
    readonly id = 'search-plugin-apply-collection-filters';

    collect(job: Job): boolean {
        return job.queueName === 'apply-collection-filters';
    }

    reduce(collectedJobs: Array<Job<ApplyCollectionFiltersJobData>>): Array<Job<any>> {
        const collectionIdsToUpdate = collectedJobs.reduce((result, job) => {
            return [...result, ...job.data.collectionIds];
        }, [] as ID[]);

        const referenceJob = collectedJobs[0];
        const batchedCollectionJob = new Job<ApplyCollectionFiltersJobData>({
            ...referenceJob,
            id: undefined,
            data: {
                collectionIds: unique(collectionIdsToUpdate),
                ctx: referenceJob.data.ctx,
                entityName: referenceJob.data.entityName,
                applyToChangedEntitiesOnly: referenceJob.data.applyToChangedEntitiesOnly,
            },
        });
        return [batchedCollectionJob];
    }
}
