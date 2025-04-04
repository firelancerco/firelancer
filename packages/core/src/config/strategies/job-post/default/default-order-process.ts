import { RequestContext } from '../../../../common';
import { ID } from '../../../../common/shared-schema';
import { TransactionalConnection } from '../../../../connection';
import { JobPost } from '../../../../entity';
import { JobPostState } from '../../../../service/helpers/job-post-state-machine/job-post-state';
import { JobPostProcess } from '../job-post-process';

/**
 * @description
 * Options which can be passed to the {@link configureDefaultJobPostProcess} function
 * to configure an instance of the default {@link JobPostProcess}. By default, all
 * options are set to `true`.
 */
export interface DefaultJobPostProcessOptions {
    /**
     * @description
     * Prevents a JobPost from transitioning out of the `DRAFT` state if
     * the JobPost is missing required fields.
     *
     * @default true
     */
    checkRequiredFieldsDefined?: boolean;
}

/**
 * @description
 * Used to configure a customized instance of the default {@link JobPostProcess} that ships with Vendure.
 * Using this function allows you to turn off certain checks and constraints that are enabled by default.
 *
 * ```ts
 * import { configureDefaultJobPostProcess, VendureConfig } from '\@vendure/core';
 *
 * const myCustomJobPostProcess = configureDefaultJobPostProcess({
 *   // Disable the constraint that requires
 *   // JobPosts to have a required field defined
 *   checkRequiredFieldsDefined: false,
 * });
 *
 * export const config: VendureConfig = {
 *   jobPostOptions: {
 *     process: [myCustomJobPostProcess],
 *   },
 * };
 * ```
 * The {@link DefaultJobPostProcessOptions} type defines all available options. If you require even
 * more customization, you can create your own implementation of the {@link JobPostProcess} interface.
 */
export function configureDefaultJobPostProcess(options: DefaultJobPostProcessOptions) {
    let connection: TransactionalConnection;
    let jobPostService: import('../../../../service/index').JobPostService;
    let configService: import('../../../config.service').ConfigService;
    let eventBus: import('../../../../event-bus/index').EventBus;
    let historyService: import('../../../../service/index').HistoryService;

    const jobPostProcess: JobPostProcess<JobPostState> = {
        transitions: {
            DRAFT: {
                to: ['DRAFT_DELETED', 'IN_REVIEW'],
            },
            IN_REVIEW: {
                to: ['REJECTED', 'OPEN'],
            },
            DRAFT_DELETED: {
                to: [],
            },
            REJECTED: {
                to: [],
            },
            OPEN: {
                to: ['CLOSED', 'CANCELLED', 'FILLED'],
            },
            CANCELLED: {
                to: [],
            },
            CLOSED: {
                to: [],
            },
            FILLED: {
                to: [],
            },
        },
        async init(injector) {
            // Lazily import these services to avoid a circular dependency error
            // due to this being used as part of the DefaultConfig
            const ConfigService = await import('../../../config.service.js').then(m => m.ConfigService);
            const EventBus = await import('../../../../event-bus/index.js').then(m => m.EventBus);
            const HistoryService = await import('../../../../service/index.js').then(m => m.HistoryService);
            const JobPostService = await import('../../../../service/index.js').then(m => m.JobPostService);
            connection = injector.get(TransactionalConnection);
            jobPostService = injector.get(JobPostService);
            configService = injector.get(ConfigService);
            eventBus = injector.get(EventBus);
            historyService = injector.get(HistoryService);
        },

        async onTransitionStart(fromState, toState, { ctx, jobPost }) {},
        async onTransitionEnd(fromState, toState, data) {
            const { ctx, jobPost } = data;
            const {} = configService.jobPostOptions;
        },
    };

    async function findOrderWithFulfillments(ctx: RequestContext, id: ID): Promise<JobPost> {
        return await connection.getEntityOrThrow(ctx, JobPost, id, {
            relations: ['facetValues', 'facetValues.facet'],
        });
    }

    return jobPostProcess;
}

/**
 * @description
 * This is the built-in {@link JobPostProcess} that ships with Firelancer. A customized version of this process
 * can be created using the {@link configureDefaultJobPostProcess} function, which allows you to pass in an object
 * to enable/disable certain checks.
 */
export const defaultJobPostProcess = configureDefaultJobPostProcess({});
