import {
    CloseJobPostInput,
    CreateJobPostInput,
    DeleteDraftJobPostInput,
    EditDraftJobPostInput,
    EditPublishedJobPostInput,
    ID,
    JobPostProcessState,
    JobPostVisibility,
    PublishJobPostInput,
} from '@firelancerco/common/lib/generated-shop-schema';
import {
    CATEGORY_FACET_CODE,
    DURATION_FACET_CODE,
    EXPERIENCE_LEVEL_FACET_CODE,
    PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
    SCOPE_FACET_CODE,
    SKILL_FACET_CODE,
} from '@firelancerco/common/lib/shared-constants';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { assertFound, unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { RelationPaths } from '../../api';
import { JobPostStateTransitionException, ListQueryOptions, RequestContext, UserInputException } from '../../common';
import { IllegalOperationException } from '../../common/error/errors';
import { TransactionalConnection } from '../../connection';
import { FacetValue, JobPost } from '../../entity';
import { EventBus, JobPostEvent, JobPostStateTransitionEvent } from '../../event-bus';
import { TranslatorService } from '../../service/helpers/translator/translator.service';
import { JobPostState } from '../helpers/job-post-state-machine/job-post-state';
import { JobPostStateMachine } from '../helpers/job-post-state-machine/job-post-state-machine';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { patchEntity } from '../helpers/utils/patch-entity';
import { AssetService } from './asset.service';
import { FacetValueService } from './facet-value.service';

export interface JobPostFacetValuesInput {
    requiredSkillIds?: ID[] | null;
    requiredCategoryId?: ID | null;
    requiredExperienceLevelId?: ID | null;
    requiredJobDurationId?: ID | null;
    requiredJobScopeId?: ID | null;
}

@Injectable()
export class JobPostService {
    private readonly relations = ['assets', 'facetValues', 'facetValues.facet'];

    constructor(
        private connection: TransactionalConnection,
        private assetService: AssetService,
        private facetValueService: FacetValueService,
        private eventBus: EventBus,
        private listQueryBuilder: ListQueryBuilder,
        private translator: TranslatorService,
        private jobPostStateMachine: JobPostStateMachine,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<JobPost>,
        relations?: RelationPaths<JobPost>,
    ): Promise<PaginatedList<JobPost>> {
        const effectiveRelations = relations || this.relations.slice();

        return this.listQueryBuilder
            .build(JobPost, options, {
                ctx,
                relations: effectiveRelations,
                where: { deletedAt: IsNull() },
            })
            .getManyAndCount()
            .then(async ([items, totalItems]) => ({
                items: items.map(item =>
                    this.translator.translate(item as any, ctx, ['facetValues', ['facetValues', 'facet']]),
                ),
                totalItems,
            }));
    }

    async findOne(
        ctx: RequestContext,
        jobPostId: ID,
        relations?: RelationPaths<JobPost>,
    ): Promise<JobPost | undefined> {
        const effectiveRelations = relations ?? this.relations.slice();
        if (relations && effectiveRelations.includes('facetValues')) {
            // We need the facet to determine with the FacetValues are public
            // when serving via the Shop API.
            effectiveRelations.push('facetValues.facet');
        }

        return this.connection
            .getRepository(ctx, JobPost)
            .findOne({
                relations: unique(effectiveRelations),
                where: {
                    id: jobPostId,
                    deletedAt: IsNull(),
                },
            })
            .then(result =>
                result
                    ? this.translator.translate(result as any, ctx, ['facetValues', ['facetValues', 'facet']])
                    : undefined,
            );
    }

    /**
     * @description
     * Returns a {@link PaginatedList} of all JobPosts associated with the given Collection.
     */
    async getJobPostsByCollectionId(
        ctx: RequestContext,
        collectionId: ID,
        options: ListQueryOptions<JobPost>,
        relations: RelationPaths<JobPost> = [],
    ): Promise<PaginatedList<JobPost>> {
        const qb = this.listQueryBuilder
            .build(JobPost, options, { ctx, relations: unique(relations) })
            .leftJoin('jobpost.collections', 'collection')
            .andWhere('jobpost.deletedAt IS NULL')
            .andWhere('collection.id = :collectionId', { collectionId });

        return qb.getManyAndCount().then(([items, totalItems]) => {
            return {
                items: items.map(item =>
                    this.translator.translate(item as any, ctx, ['facetValues', ['facetValues', 'facet']]),
                ),
                totalItems,
            };
        });
    }

    /**
     * @description
     * Creates a new draft JobPost.
     */
    async createDraft(ctx: RequestContext, input: CreateJobPostInput & { customerId: ID }): Promise<JobPost> {
        const { assetIds, ...rest } = input;
        const jobPost = new JobPost(rest);
        jobPost.visibility = JobPostVisibility.PUBLIC;
        jobPost.state = this.jobPostStateMachine.getInitialState();
        await this.updateJobPostFacetValues(ctx, jobPost, input);

        const createdJobPost = await this.connection.getRepository(ctx, JobPost).save(jobPost);
        await this.assetService.updateEntityAssets(ctx, createdJobPost, { assetIds });
        await this.eventBus.publish(new JobPostEvent(ctx, createdJobPost, 'created', input));
        return assertFound(this.findOne(ctx, jobPost.id));
    }

    /**
     * @description
     * Edits a draft JobPost.
     */
    async editDraft(ctx: RequestContext, input: EditDraftJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues', 'facetValues.facet'],
        });

        if (jobPost.state !== 'DRAFT') {
            // TODO
            throw new IllegalOperationException('Job post can only be updated in DRAFT state' as any);
        }

        const updatedJobPost = patchEntity(jobPost, input);
        await this.updateJobPostFacetValues(ctx, updatedJobPost, input);
        await this.assetService.updateFeaturedAsset(ctx, jobPost, input);
        await this.assetService.updateEntityAssets(ctx, jobPost, input);

        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'updated', input));

        return assertFound(this.findOne(ctx, updatedJobPost.id));
    }

    /**
     * @description
     * Deletes a draft JobPost.
     */
    async deleteDraft(ctx: RequestContext, input: DeleteDraftJobPostInput) {
        const result = await this.transitionToState(ctx, input.id, 'DRAFT_DELETED');
        return assertFound(this.findOne(ctx, result.id));
    }

    /**
     * @description
     * Requests to publish a JobPost.
     */
    async requestPublishDraft(ctx: RequestContext, input: PublishJobPostInput): Promise<JobPost> {
        const result = await this.transitionToState(ctx, input.id, 'REQUESTED');
        return assertFound(this.findOne(ctx, result.id));
    }

    /**
     * @description
     * Publishes a JobPost.
     */
    async publish(ctx: RequestContext, jobPostId: ID): Promise<JobPost> {
        const result = await this.transitionToState(ctx, jobPostId, 'OPEN');
        return assertFound(this.findOne(ctx, result.id));
    }

    /**
     * @description
     * Edits a published JobPost.
     */
    async edit(ctx: RequestContext, input: EditPublishedJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues', 'facetValues.facet'],
        });

        if (jobPost.state !== 'OPEN') {
            // TODO
            throw new IllegalOperationException('Job post can only be updated in OPEN state' as any);
        }

        const updatedJobPost = patchEntity(jobPost, { ...input, editedAt: new Date() });
        await this.updateJobPostFacetValues(ctx, updatedJobPost, input);
        await this.assetService.updateFeaturedAsset(ctx, jobPost, input);
        await this.assetService.updateEntityAssets(ctx, jobPost, input);

        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'updated', input));

        return assertFound(this.findOne(ctx, updatedJobPost.id));
    }

    /**
     * @description
     * Closes a published JobPost.
     */
    async close(ctx: RequestContext, input: CloseJobPostInput): Promise<JobPost> {
        const result = await this.transitionToState(ctx, input.id, 'CLOSED');
        return assertFound(this.findOne(ctx, result.id));
    }

    /**
     * @description
     * Returns an array of all the configured states and transitions of the job post process. This is
     * based on the default job post process plus all configured {@link JobPostProcess} objects
     * defined in the {@link JobPostOptions} `process` array.
     */
    getJobPostProcessStates(): JobPostProcessState[] {
        return Object.entries(this.jobPostStateMachine.config.transitions).map(([name, { to }]) => ({
            name,
            to,
        })) as JobPostProcessState[];
    }

    /**
     * @description
     * Returns the next possible states that the JobPost may transition to.
     */
    getNextJobPostStates(jobPost: JobPost): readonly JobPostState[] {
        return this.jobPostStateMachine.getNextStates(jobPost);
    }

    /**
     * @description
     * Transitions the JobPost to the given state.
     */
    async transitionToState(ctx: RequestContext, jobPostId: ID, state: JobPostState): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, jobPostId);
        const fromState = jobPost.state;
        let finalize: () => Promise<any>;
        try {
            const result = await this.jobPostStateMachine.transition(ctx, jobPost, state);
            finalize = result.finalize;
        } catch (e: any) {
            throw new JobPostStateTransitionException({ transitionError: e.message, fromState, toState: state });
        }
        await this.connection.getRepository(ctx, JobPost).save(jobPost, { reload: false });
        await this.eventBus.publish(new JobPostStateTransitionEvent(fromState, state, ctx, jobPost));
        await finalize();
        await this.connection.getRepository(ctx, JobPost).save(jobPost, { reload: false });
        return jobPost;
    }

    private async updateJobPostFacetValues(ctx: RequestContext, jobPost: JobPost, input: JobPostFacetValuesInput) {
        const {
            requiredSkillIds,
            requiredCategoryId,
            requiredExperienceLevelId,
            requiredJobDurationId,
            requiredJobScopeId,
        } = input;

        if (requiredSkillIds !== undefined) {
            await this.updateJobPostSkills(ctx, jobPost, requiredSkillIds);
        }

        if (requiredCategoryId !== undefined) {
            await this.updateJobPostCategory(ctx, jobPost, requiredCategoryId);
        }

        if (requiredExperienceLevelId !== undefined) {
            await this.updateJobPostExperienceLevel(ctx, jobPost, requiredExperienceLevelId);
        }

        if (requiredJobDurationId !== undefined) {
            await this.updateJobPostDuration(ctx, jobPost, requiredJobDurationId);
        }

        if (requiredJobScopeId !== undefined) {
            await this.updateJobPostScope(ctx, jobPost, requiredJobScopeId);
        }
    }

    private async updateJobPostSkills(ctx: RequestContext, jobPost: JobPost, requiredSkillIds: ID[] | null) {
        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: SKILL_FACET_CODE,
            newFacetValueIds: requiredSkillIds,
            validateConstraints: (skills: FacetValue[]) => {
                if (
                    skills.length < PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS ||
                    skills.length > PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS
                ) {
                    // TODO
                    throw new UserInputException('error.invalid-skill-count' as any, {
                        min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
                        max: PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
                    });
                }
            },
        });
    }

    private async updateJobPostCategory(ctx: RequestContext, jobPost: JobPost, requiredCategoryId: ID | null) {
        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: CATEGORY_FACET_CODE,
            newFacetValueIds: requiredCategoryId ? [requiredCategoryId] : null,
            validateConstraints: (category: FacetValue[]) => {
                if (category.length !== 1) {
                    // TODO
                    throw new UserInputException('error.invalid-category-count' as any);
                }
            },
        });
    }

    private async updateJobPostExperienceLevel(
        ctx: RequestContext,
        jobPost: JobPost,
        requiredExperienceLevelId: ID | null,
    ) {
        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: EXPERIENCE_LEVEL_FACET_CODE,
            newFacetValueIds: requiredExperienceLevelId ? [requiredExperienceLevelId] : null,
            validateConstraints: (experienceLevel: FacetValue[]) => {
                if (experienceLevel.length !== 1) {
                    // TODO
                    throw new UserInputException('error.invalid-experience-level-count' as any);
                }
            },
        });
    }

    private async updateJobPostDuration(ctx: RequestContext, jobPost: JobPost, requiredJobDurationId: ID | null) {
        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: DURATION_FACET_CODE,
            newFacetValueIds: requiredJobDurationId ? [requiredJobDurationId] : null,
            validateConstraints: (duration: FacetValue[]) => {
                if (duration.length !== 1) {
                    // TODO
                    throw new UserInputException('error.invalid-job-duration-count' as any);
                }
            },
        });
    }

    private async updateJobPostScope(ctx: RequestContext, jobPost: JobPost, requiredJobScopeId: ID | null) {
        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: SCOPE_FACET_CODE,
            newFacetValueIds: requiredJobScopeId ? [requiredJobScopeId] : null,
            validateConstraints: (scope: FacetValue[]) => {
                if (scope.length !== 1) {
                    // TODO
                    throw new UserInputException('error.invalid-job-scope-count' as any);
                }
            },
        });
    }

    private async updateFacetValuesForType(options: {
        ctx: RequestContext;
        jobPost: JobPost;
        facetCode: string;
        newFacetValueIds: ID[] | null;
        validateConstraints: (newFacetValues: FacetValue[]) => any;
    }): Promise<void> {
        const { ctx, jobPost, facetCode, newFacetValueIds, validateConstraints } = options;

        if (newFacetValueIds === undefined) {
            return; // No update needed
        }

        if (!jobPost.facetValues) {
            jobPost.facetValues = [];
        }

        // Remove all existing facet values of this type first
        jobPost.facetValues = jobPost.facetValues.filter(fv => fv.facet?.code !== facetCode);

        // If null is passed, we're done (all values removed)
        if (newFacetValueIds === null) {
            return;
        }
        // Get the new facet values
        const newFacetValues = await this.facetValueService.findByIds(ctx, unique(newFacetValueIds));
        // Validate that all new facet values belong to the correct facet
        const invalidFacetValues = newFacetValues.filter(fv => fv.facet?.code !== facetCode);
        if (invalidFacetValues.length > 0) {
            // TODO
            throw new UserInputException('error.invalid-facet-values' as any, { facetCode });
        }
        validateConstraints(newFacetValues);
        // Add the new facet values
        jobPost.facetValues = [...jobPost.facetValues, ...newFacetValues];
    }
}
