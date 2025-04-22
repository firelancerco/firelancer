import z from 'zod';
import { ID } from '../common/common-types.schema';

export const VerifyRequestedJobPostInput = z.object({
    id: ID,
});

export const MutationVerifyRequestedJobPostArgs = z.object({
    input: VerifyRequestedJobPostInput,
});
