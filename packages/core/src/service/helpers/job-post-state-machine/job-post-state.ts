import { RequestContext } from '../../../common/request-context';
import { JobPost } from '../../../entity/job-post/job-post.entity';

/**
 * @description
 * An interface to extend the {@link JobPostState} type.
 */
export interface JobPostStates {}

/**
 * @description
 * These are the default states of the JobPost process. They can be augmented and
 * modified by using the {@link JobPostOptions} `process` property, and by default
 * the {@link defaultJobPostProcess} will add the states
 *
 * - `DRAFT`
 * - `DRAFT_DELETED`
 * - `IN_REVIEW`
 * - `REJECTED`
 * - `OPEN`
 * - `CANCELLED`
 * - `CLOSED`
 * - `FILLED`
 */
export type JobPostState =
    | 'DRAFT'
    | 'DRAFT_DELETED'
    | 'IN_REVIEW'
    | 'REJECTED'
    | 'OPEN'
    | 'CANCELLED'
    | 'CLOSED'
    | 'FILLED'
    | keyof JobPostStates;

/**
 * @description
 * This is the object passed to the {@link JobPostProcess} state transition hooks.
 */
export interface JobPostTransitionData {
    ctx: RequestContext;
    jobPost: JobPost;
}
