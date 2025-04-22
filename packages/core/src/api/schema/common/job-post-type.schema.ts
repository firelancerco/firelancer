import z from 'zod';

export const JobPostState = z.enum(['DRAFT', 'DRAFT_DELETED', 'REQUESTED', 'REJECTED', 'OPEN', 'CLOSED']);

export const JobPostVisibility = z.enum(['PUBLIC', 'INVITE_ONLY']);

export const JobPostProcessState = z.object({
    /**
     * @description
     * The name of the state
     */
    name: z.string(),
    /**
     * @description
     * The states that can transition to the current state
     */
    to: z.string().array(),
});
