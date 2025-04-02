import { ID } from '@firelancerco/common/lib/shared-schema';

import { Job } from '../../../job-queue/job';
import { JobBuffer } from '../../../job-queue/job-buffer/job-buffer';
import { UpdateIndexQueueJobData, UpdateJobPostJobData, UpdateProfileJobData } from '../types';

export class SearchIndexJobBuffer implements JobBuffer<UpdateIndexQueueJobData> {
    readonly id = 'search-plugin-update-search-index';

    collect(job: Job<UpdateIndexQueueJobData>): boolean | Promise<boolean> {
        return job.queueName === 'update-search-index' && ['update-job-post', 'update-profile'].includes(job.data.type);
    }

    reduce(collectedJobs: Array<Job<UpdateIndexQueueJobData>>): Array<Job<any>> {
        const jobPostsJobs = this.removeBy<Job<UpdateJobPostJobData>>(
            collectedJobs,
            item => item.data.type === 'update-job-post',
        );

        const profileJobs = this.removeBy<Job<UpdateProfileJobData>>(
            collectedJobs,
            item => item.data.type === 'update-profile',
        );

        const jobsToAdd = [...collectedJobs];

        if (jobPostsJobs.length) {
            const seenIds = new Set<ID>();
            const uniqueJobPostJobs: Array<Job<UpdateJobPostJobData>> = [];
            for (const job of jobPostsJobs) {
                if (seenIds.has(job.data.jobPostId)) {
                    continue;
                }
                uniqueJobPostJobs.push(job);
                seenIds.add(job.data.jobPostId);
            }
            jobsToAdd.push(...(uniqueJobPostJobs as Job[]));
        }

        if (profileJobs.length) {
            const seenIds = new Set<ID>();
            const uniqueProfileJobs: Array<Job<UpdateProfileJobData>> = [];
            for (const job of profileJobs) {
                if (seenIds.has(job.data.profileId)) {
                    continue;
                }
                uniqueProfileJobs.push(job);
                seenIds.add(job.data.profileId);
            }
            jobsToAdd.push(...(uniqueProfileJobs as Job[]));
        }

        return jobsToAdd;
    }

    /**
     * Removes items from the array based on the filterFn and returns a new array with only the removed
     * items. The original input array is mutated.
     */
    private removeBy<R extends T, T = any>(input: T[], filterFn: (item: T) => boolean): R[] {
        const removed: R[] = [];
        for (let i = input.length - 1; i >= 0; i--) {
            const item = input[i];
            if (filterFn(item)) {
                removed.push(item as R);
                input.splice(i, 1);
            }
        }
        return removed;
    }
}
