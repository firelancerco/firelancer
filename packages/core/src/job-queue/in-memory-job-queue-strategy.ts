import { ID, JobState } from '@firelancerco/common/lib/generated-schema';
import { notNullOrUndefined } from '@firelancerco/common/lib/shared-utils';

import { Injector } from '../common';
import { Logger } from '../config';
import { InspectableJobQueueStrategy } from '../config/strategies/job-queue/inspectable-job-queue-strategy';
import { ProcessContext } from '../process-context';
import { Job } from './job';
import { PollingJobQueueStrategy } from './polling-job-queue-strategy';
import { JobData } from './types';

/**
 * @description
 * An in-memory JobQueueStrategy. This is the default strategy if not using a dedicated
 * JobQueue plugin (e.g. DefaultJobQueuePlugin). Not recommended for production, since
 * the queue will be cleared when the server stops, and can only be used when the JobQueueService is
 * started from the main server process:
 *
 * @example
 * ```ts
 * bootstrap(config)
 *   .then(app => app.get(JobQueueService).start());
 * ```
 *
 * Attempting to use this strategy when running the worker in a separate process (using `bootstrapWorker()`)
 * will result in an error on startup.
 *
 * Completed jobs will be evicted from the store every 2 hours to prevent a memory leak.
 */
export class InMemoryJobQueueStrategy extends PollingJobQueueStrategy implements InspectableJobQueueStrategy {
    protected jobs = new Map<ID, Job>();
    protected unsettledJobs: { [queueName: string]: Array<{ job: Job; updatedAt: Date }> } = {};
    private processContext: ProcessContext;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    private timer: any;
    private evictJobsAfterMs = 1000 * 60 * 60 * 2; // 2 hours
    private processContextChecked = false;

    init(injector: Injector) {
        super.init(injector);
        this.processContext = injector.get(ProcessContext);
        this.timer = setTimeout(this.evictSettledJobs, this.evictJobsAfterMs);
    }

    destroy() {
        super.destroy();
        clearTimeout(this.timer);
    }

    async add<Data extends JobData<Data> = object>(job: Job<Data>): Promise<Job<Data>> {
        if (!job.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (job as any).id = Math.floor(Math.random() * 1000000000)
                .toString()
                .padEnd(10, '0');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (job as any).retries = this.setRetries(job.queueName, job);

        this.jobs.set(job.id!, job);
        if (!this.unsettledJobs[job.queueName]) {
            this.unsettledJobs[job.queueName] = [];
        }
        this.unsettledJobs[job.queueName].push({ job, updatedAt: new Date() });
        return job;
    }

    async findOne(id: ID): Promise<Job | undefined> {
        return this.jobs.get(id);
    }

    async findMany(): Promise<Job[]> {
        const items = [...this.jobs.values()];
        return items;
    }

    async findManyById(ids: ID[]): Promise<Job[]> {
        return ids.map(id => this.jobs.get(id)).filter(notNullOrUndefined);
    }

    async next(queueName: string, waitingJobs: Job[] = []): Promise<Job | undefined> {
        this.checkProcessContext();
        const nextIndex = this.unsettledJobs[queueName]?.findIndex(item => !waitingJobs.includes(item.job));
        if (nextIndex === -1) {
            return;
        }
        const next = this.unsettledJobs[queueName]?.splice(nextIndex, 1)[0];
        if (next) {
            if (next.job.state === JobState.RETRYING && typeof this.backOffStrategy === 'function') {
                const msSinceLastFailure = Date.now() - +next.updatedAt;
                const backOffDelayMs = this.backOffStrategy(queueName, next.job.attempts, next.job);
                if (msSinceLastFailure < backOffDelayMs) {
                    this.unsettledJobs[queueName]?.push(next);
                    return;
                }
            }
            next.job.start();
            return next.job;
        }
    }

    async update(job: Job): Promise<void> {
        if (job.state === JobState.RETRYING || job.state === JobState.PENDING) {
            this.unsettledJobs[job.queueName].unshift({ job, updatedAt: new Date() });
        }

        this.jobs.set(job.id!, job);
    }

    async removeSettledJobs(queueNames: string[] = [], olderThan?: Date): Promise<number> {
        let removed = 0;
        for (const job of this.jobs.values()) {
            if (0 < queueNames.length && !queueNames.includes(job.queueName)) {
                continue;
            }
            if (job.isSettled) {
                if (olderThan) {
                    if (job.settledAt && job.settledAt < olderThan) {
                        this.jobs.delete(job.id!);
                        removed++;
                    }
                } else {
                    this.jobs.delete(job.id!);
                    removed++;
                }
            }
        }
        return removed;
    }

    /**
     * Delete old jobs from the `jobs` Map if they are settled and older than the value
     * defined in `this.pruneJobsAfterMs`. This prevents a memory leak as the job queue
     * grows indefinitely.
     */
    private evictSettledJobs = () => {
        const nowMs = +new Date();
        const olderThanMs = nowMs - this.evictJobsAfterMs;
        void this.removeSettledJobs([], new Date(olderThanMs));
        this.timer = setTimeout(this.evictSettledJobs, this.evictJobsAfterMs);
    };

    private checkProcessContext() {
        if (!this.processContextChecked) {
            if (this.processContext.isWorker) {
                Logger.error(
                    'The InMemoryJobQueueStrategy will not work when running job queues outside the main server process!',
                );
                process.kill(process.pid, 'SIGINT');
            }
            this.processContextChecked = true;
        }
    }
}
