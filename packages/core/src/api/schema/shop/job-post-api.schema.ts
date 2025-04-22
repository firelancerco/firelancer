import z from 'zod';
import { ID } from '../common/common-types.schema';
import { CurrencyCode } from '../common/currency-code.schema';
import { JobPostVisibility } from '../common/job-post-type.schema';

export const DeleteDraftJobPostInput = z.object({
    id: ID,
});

export const CloseJobPostInput = z.object({
    id: ID,
    reason: z.string().optional(),
});

export const CreateJobPostInput = z.object({
    title: z.string().min(3).max(75),
    description: z.string().min(3).max(1000).optional(),
    budget: z.number().int().min(5).optional(), // TODO: Validate budget
    currencyCode: CurrencyCode.optional(),
    visibility: JobPostVisibility.optional(),
    assetIds: z.array(ID).min(0).max(15).optional(),
    facetValueIds: z.array(ID).optional(),
    requiredSkillIds: z.array(ID).min(3).max(15).optional(),
    requiredJobScopeId: ID.optional(),
    requiredJobDurationId: ID.optional(),
    requiredExperienceLevelId: ID.optional(),
    requiredCategoryId: ID.optional(),
});

export const EditDraftJobPostInput = z.object({
    id: ID,
    title: z.string().min(3).max(75).optional(),
    description: z.string().min(3).max(1000).optional(),
    budget: z.number().int().min(5).optional(),
    currencyCode: CurrencyCode.optional(),
    visibility: JobPostVisibility.optional(),
    assetIds: z.array(ID).min(0).max(15).optional(),
    requiredSkillIds: z.array(ID).min(3).max(15).optional(),
    requiredJobScopeId: ID.optional(),
    requiredJobDurationId: ID.optional(),
    requiredExperienceLevelId: ID.optional(),
    requiredCategoryId: ID.optional(),
});

export const EditPublishedJobPostInput = z.object({
    id: ID,
    title: z.string().min(3).max(75).optional(),
    description: z.string().min(3).max(1000).optional(),
    budget: z.number().int().min(5).optional(), // TODO: Validate budget
    currencyCode: CurrencyCode.optional(),
    visibility: JobPostVisibility.optional(),
    assetIds: z.array(ID).min(0).max(15).optional(),
    requiredSkillIds: z.array(ID).min(3).max(15).optional(),
    requiredJobScopeId: ID.optional(),
    requiredJobDurationId: ID.optional(),
    requiredExperienceLevelId: ID.optional(),
    requiredCategoryId: ID.optional(),
});

export const PublishJobPostInput = z.object({
    id: ID,
});

export const MutationDeleteDraftJobPostArgs = z.object({
    input: DeleteDraftJobPostInput,
});

export const MutationCloseJobPostArgs = z.object({
    input: CloseJobPostInput,
});

export const MutationCreateJobPostArgs = z.object({
    input: CreateJobPostInput,
});

export const MutationEditDraftJobPostArgs = z.object({
    input: EditDraftJobPostInput,
});

export const MutationEditPublishedJobPostArgs = z.object({
    input: EditPublishedJobPostInput,
});

export const MutationPublishJobPostArgs = z.object({
    input: PublishJobPostInput,
});
