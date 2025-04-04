import { RequestContext } from '../../../../common';
import { ID } from '../../../../common/shared-schema';
import { TransactionalConnection } from '../../../../connection';
import { JobPost } from '../../../../entity';
import { JobPostState } from '../../../../service/helpers/job-post-state-machine/job-post-state';
import { JobPostProcess } from '../job-post-process';
import { UserInputException } from '../../../../common';
import { JobPostEvent } from '../../../../event-bus/events/job-post-event';
import { JobPostStatus } from '../../../../common/shared-schema';

// Constants for job post constraints
const PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET = 100;
const PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS = 1;
const PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS = 10;

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
    /**
     * @description
     * Prevents a JobPost from transitioning to `OPEN` if the budget is below
     * the minimum required amount.
     *
     * @default true
     */
    checkMinimumBudget?: boolean;
    /**
     * @description
     * Prevents a JobPost from transitioning to `OPEN` if the required skills
     * count is not within the allowed range.
     *
     * @default true
     */
    checkSkillsCount?: boolean;
    /**
     * @description
     * Prevents a JobPost from transitioning to `CLOSED` if it's already `FILLED`.
     *
     * @default true
     */
    checkClosedState?: boolean;
    /**
     * @description
     * Prevents a JobPost from transitioning to `FILLED` if it's already `CLOSED`.
     *
     * @default true
     */
    checkFilledState?: boolean;
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
                to: ['DRAFT_DELETED', 'IN_REVIEW'],
            },
            IN_REVIEW: {
                to: ['REJECTED', 'OPEN'],
            },
            REJECTED: {
                to: [],
            },
            OPEN: {
                to: ['CLOSED', 'CANCELLED', 'FILLED'],
            },
            CLOSED: {
                to: [],
            },
            CANCELLED: {
                to: [],
            },
            FILLED: {
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
            // Validate transition is allowed
            const allowedTransitions = jobPostProcess.transitions?.[fromState]?.to ?? [];
            if (!allowedTransitions.includes(toState)) {
                throw new UserInputException('error.invalid-job-post-transition', {
                    fromState,
                    toState,
                });
            }

            // Special handling for specific transitions
            switch (toState) {
                case 'IN_REVIEW':
                    if (options.checkRequiredFieldsDefined !== false) {
                        await jobPostService['checkRequiredFieldsDefined'](ctx, jobPost);
                    }
                    break;
                case 'OPEN':
                    if (
                        options.checkMinimumBudget !== false &&
                        jobPost.budget &&
                        jobPost.budget < PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET
                    ) {
                        throw new UserInputException('error.job-post-budget-too-low', {
                            min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET,
                        });
                    }
                    if (options.checkSkillsCount !== false) {
                        const skillsCount = jobPost.requiredSkills.length;
                        if (
                            skillsCount < PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS ||
                            skillsCount > PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS
                        ) {
                            throw new UserInputException('error.invalid-skills-count', {
                                min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
                                max: PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
                            });
                        }
                    }
                    break;
                case 'CLOSED':
                    if (options.checkClosedState !== false && jobPost.status === JobPostStatus.ACTIVE) {
                        throw new UserInputException('error.job-post-already-filled');
                    }
                    break;
                case 'FILLED':
                    if (options.checkFilledState !== false && jobPost.status === JobPostStatus.CLOSED) {
                        throw new UserInputException('error.job-post-already-closed');
                    }
                    break;
            }
        },
        onTransitionEnd: async (fromState, toState, data) => {
            const { ctx, jobPost } = data;

            // Update job post status
            (jobPost as any).status = toState;
            await connection.getRepository(ctx, JobPost).save(jobPost);

            // Create history entry
            // await historyService.createHistoryEntryForCustomer({
            //     ctx,
            //     customerId: jobPost.customerId,
            //     type: 'JOB_POST_STATE_TRANSITION',
            //     data: {
            //         jobPostId: jobPost.id,
            //         fromState,
            //         toState,
            //     },
            // });

            // Publish event
            await eventBus.publish(new JobPostEvent(ctx, jobPost, 'updated', jobPost));

            // Additional actions based on the new state
            switch (toState) {
                case 'OPEN':
                    jobPost.publishedAt = new Date();
                    await eventBus.publish(new JobPostEvent(ctx, jobPost, 'published', jobPost));
                    break;
                case 'CLOSED':
                    await eventBus.publish(new JobPostEvent(ctx, jobPost, 'updated', jobPost));
                    break;
                case 'FILLED':
                    await eventBus.publish(new JobPostEvent(ctx, jobPost, 'updated', jobPost));
                    break;
            }
        },
    };

    return jobPostProcess;
}

/**
 * @description
 * This is the built-in {@link JobPostProcess} that ships with Firelancer. A customized version of this process
 * can be created using the {@link configureDefaultJobPostProcess} function, which allows you to pass in an object
 * to enable/disable certain checks.
 */
export const defaultJobPostProcess = configureDefaultJobPostProcess({});
