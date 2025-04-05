import { RequestContext, UserInputException } from '../../../../common';
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
     * Prevents a JobPost from transitioning to `REQUESTED` state if
     * the JobPost is missing required fields.
     *
     * @default true
     */
    checkRequiredFieldsDefined?: boolean;
}

/**
 * @description
 * Used to configure a customized instance of the default {@link JobPostProcess} that ships with Firelancer.
 * Using this function allows you to turn off certain checks and constraints that are enabled by default.
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
                to: ['DRAFT_DELETED', 'REQUESTED'],
            },
            REQUESTED: {
                to: ['REJECTED', 'OPEN'],
            },
            OPEN: {
                to: ['CLOSED'],
            },
            REJECTED: {
                to: [],
            },
            CLOSED: {
                to: [],
            },
            DRAFT_DELETED: {
                to: [],
            },
        },
        init: async injector => {
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
        onTransitionStart: async (fromState, toState, { ctx, jobPost }) => {
            if (toState === 'REQUESTED') {
                if (options.checkRequiredFieldsDefined !== false) {
                    await checkRequiredFieldsDefined(ctx, jobPost.id);
                }
            }
        },
        onTransitionEnd: async (fromState, toState, data) => {
            const { ctx, jobPost } = data;

            if (toState === 'DRAFT_DELETED') {
                jobPost.deletedAt = new Date();
            }

            if (toState === 'DRAFT') {
            }

            if (toState === 'REQUESTED') {
            }

            if (toState === 'REJECTED') {
                jobPost.rejectedAt = new Date();
            }

            if (toState === 'OPEN') {
                jobPost.publishedAt = new Date();
            }

            if (toState === 'CLOSED') {
                jobPost.closedAt = new Date();
            }

            // TODO: Create history entry
        },
    };

    async function checkRequiredFieldsDefined(ctx: RequestContext, id: ID): Promise<void> {
        const jobPost = await connection.getEntityOrThrow(ctx, JobPost, id, {
            relations: ['facetValues', 'facetValues.facet'],
        });

        const fields = [
            { value: jobPost.title, error: 'error.job-post-title-required' },
            { value: jobPost.description, error: 'error.job-post-description-required' },
            { value: jobPost.budget, error: 'error.job-post-budget-required' },
            { value: jobPost.currencyCode, error: 'error.job-post-currencyCode-required' },
            { value: jobPost.requiredCategory, error: 'error.invalid-category-required' },
            { value: jobPost.requiredExperienceLevel, error: 'error.invalid-experience-level-required' },
            { value: jobPost.requiredJobDuration, error: 'error.invalid-job-duration-required' },
            { value: jobPost.requiredJobScope, error: 'error.invalid-job-scope-required' },
            { value: jobPost.requiredSkills.length, error: 'error.invalid-skills-count' },
        ];

        for (const { value, error } of fields) {
            if (!value) throw new UserInputException(error);
        }
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
