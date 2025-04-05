import { RequestContext } from '../../../common/request-context';
import type { JobPostState as JobPostStateEnum } from '../../../common/shared-schema';
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
 * 1. DRAFT
 *  - This is the initial state when a client starts creating a job post
 *  - The job post is not yet visible to freelancers
 *  - Client can save their progress and come back later
 *  - Can transition to either DRAFT_DELETED or REQUESTED
 * 2. REQUESTED
 *  - The client has submitted the job post for review
 *  - Platform administrators can review the job post for compliance
 *  - Can transition to either REJECTED or OPEN
 * 3. REJECTED
 *  - The job post was reviewed and didn't meet platform requirements
 *  - This is a terminal state (no further transitions allowed)
 *  - Client would need to create a new job post
 * 4. OPEN
 *  - The job post is live and visible to freelancers
 *  - Freelancers can submit proposals
 *  - Can transition to CLOSED, CANCELLED, or FILLED
 * 5. CLOSED
 *  - The job post is no longer accepting new proposals
 *  - Can only transition to FILLED (if a freelancer was hired)
 * 6. CANCELLED
 *  - The client has cancelled the job post
 *  - This is a terminal state (no further transitions allowed)
 * 7. FILLED
 *  - A freelancer has been hired for the job
 *  - This is a terminal state (no further transitions allowed)
 * 8. DRAFT_DELETED
 *  - The client has deleted a draft job post
 *  - This is a terminal state (no further transitions allowed)
 */
export type JobPostState = `${JobPostStateEnum}` | keyof JobPostStates;

/**
 * @description
 * This is the object passed to the {@link JobPostProcess} state transition hooks.
 */
export interface JobPostTransitionData {
    ctx: RequestContext;
    jobPost: JobPost;
}
