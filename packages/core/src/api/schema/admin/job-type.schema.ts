import z from 'zod';
import { ID } from '../common/common-types.schema';

/**
 * @description
 * The state of a Job in the JobQueue
 */
export const JobState = z.enum(['CANCELLED', 'COMPLETED', 'FAILED', 'PENDING', 'RETRYING', 'RUNNING']);

export const Job = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    settledAt: z.string().datetime().optional(),
    queueName: z.string(),
    state: JobState,
    progress: z.number(),
    data: z.any().optional(),
    result: z.any().optional(),
    error: z.any().optional(),
    isSettled: z.boolean(),
    duration: z.number(),
    retries: z.number(),
    attempts: z.number(),
});

export const JobQueue = z.object({
    name: z.string(),
    running: z.boolean(),
});

export const JobList = z.object({
    items: z.array(Job),
    totalItems: z.number(),
});
