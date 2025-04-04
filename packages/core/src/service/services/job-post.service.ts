import {
    CATEGORY_FACET_CODE,
    DURATION_FACET_CODE,
    EXPERIENCE_LEVEL_FACET_CODE,
    PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
    SCOPE_FACET_CODE,
    SKILL_FACET_CODE,
} from '@firelancerco/common/lib/shared-constants';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { assertFound, unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { RelationPaths } from '../../api';
import { InternalServerException, ListQueryOptions, RequestContext, UserInputException } from '../../common';
import {
    CreateJobPostInput,
    ID,
    JobPostStatus,
    JobPostVisibility,
    PublishJobPostInput,
    UpdateJobPostInput,
} from '../../common/shared-schema';
import { TransactionalConnection } from '../../connection';
import { FacetValue, JobPost } from '../../entity';
import { EventBus, JobPostEvent } from '../../event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { patchEntity } from '../helpers/utils/patch-entity';
import { AssetService } from './asset.service';
import { FacetValueService } from './facet-value.service';
import { EntityHydrator } from '../../service/helpers/entity-hydrator/entity-hydrator.service';
import { TranslatorService } from '../../service/helpers/translator/translator.service';

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
        private entityHydrator: EntityHydrator,
        private translator: TranslatorService,
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
            .andWhere('jobpost.publishedAt IS NOT NULL')
            .andWhere('jobpost.deletedAt IS NULL')
            .andWhere('collection.id = :collectionId', { collectionId });

        if (options?.filter?.visibility?.eq === JobPostVisibility.PUBLIC) {
            qb.andWhere('jobpost.visibility = :visibility', { visibility: JobPostVisibility.PUBLIC });
        }

        if (options?.filter?.publishedAt?.isNull === false) {
            qb.andWhere('jobpost.publishedAt IS NOT NULL');
        }

        return qb.getManyAndCount().then(([items, totalItems]) => {
            return {
                items: items.map(item =>
                    this.translator.translate(item as any, ctx, ['facetValues', ['facetValues', 'facet']]),
                ),
                totalItems,
            };
        });
    }

    async create(ctx: RequestContext, input: CreateJobPostInput): Promise<JobPost> {
        const { assetIds, ...rest } = input;
        const jobPost = new JobPost(rest);

        await this.updateJobPostFacetValues(ctx, jobPost, {
            requiredSkillIds: input.requiredSkillIds,
            requiredCategoryId: input.requiredCategoryId,
            requiredExperienceLevelId: input.requiredExperienceLevelId,
            requiredJobDurationId: input.requiredJobDurationId,
            requiredJobScopeId: input.requiredJobScopeId,
        });

        const createdJobPost = await this.connection.getRepository(ctx, JobPost).save(jobPost);
        await this.assetService.updateEntityAssets(ctx, createdJobPost, { assetIds });
        await this.eventBus.publish(new JobPostEvent(ctx, createdJobPost, 'created', input));
        return assertFound(this.findOne(ctx, jobPost.id));
    }

    async update(ctx: RequestContext, input: UpdateJobPostInput): Promise<JobPost> {
        try {
            const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
                relations: ['facetValues', 'facetValues.facet'],
            });

            console.log({ jobPost });

            const updatedJobPost = patchEntity(jobPost, input);

            await this.updateJobPostFacetValues(ctx, updatedJobPost, {
                requiredSkillIds: input.requiredSkillIds,
                requiredCategoryId: input.requiredCategoryId,
                requiredExperienceLevelId: input.requiredExperienceLevelId,
                requiredJobDurationId: input.requiredJobDurationId,
                requiredJobScopeId: input.requiredJobScopeId,
            });
            await this.assetService.updateFeaturedAsset(ctx, jobPost, input);
            await this.assetService.updateEntityAssets(ctx, jobPost, input);

            await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
            await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'updated', input));
            return assertFound(this.findOne(ctx, updatedJobPost.id));
        } catch (error) {
            console.log({ error });
            throw error;
        }
    }

    async softDelete(ctx: RequestContext, jobPostId: ID) {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, jobPostId, {
            relations: ['facetValues'],
        });

        // TODO: Remove this once we have a proper way to delete JobPosts.
        if (jobPost.status !== JobPostStatus.DRAFT) {
            throw new UserInputException('error.job-post-not-draft');
        }

        jobPost.deletedAt = new Date();
        await this.connection.getRepository(ctx, JobPost).save(jobPost, { reload: false });
        await this.eventBus.publish(new JobPostEvent(ctx, jobPost, 'deleted', jobPostId));
    }

    async publish(ctx: RequestContext, input: PublishJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues'],
        });

        await this.checkRequiredFieldsDefined(ctx, jobPost);

        const updatedJobPost = patchEntity(jobPost, { publishedAt: new Date() });
        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'published', input));
        return assertFound(this.findOne(ctx, updatedJobPost.id));
    }

    private async checkRequiredFieldsDefined(ctx: RequestContext, jobPost: JobPost): Promise<void> {
        await this.entityHydrator.hydrate(ctx, jobPost, {
            relations: ['facetValues', 'facetValues.facet'] as any,
        });

        // Check basic required fields
        const requiredFields = [
            { field: 'title', error: 'error.job-post-title-required' },
            { field: 'description', error: 'error.job-post-description-required' },
            { field: 'budget', error: 'error.job-post-budget-required' },
            { field: 'currencyCode', error: 'error.job-post-currencyCode-required' },
        ] as const;

        for (const { field, error } of requiredFields) {
            if (!jobPost[field]) {
                throw new UserInputException(error);
            }
        }

        // Check budget constraints
        if (jobPost.budget && jobPost.budget < PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET) {
            throw new UserInputException('error.job-post-budget-too-low', {
                min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET,
            });
        }

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

        // Check required facet values
        const requiredFacets = [
            { value: jobPost.requiredCategory, error: 'error.invalid-category-required' },
            { value: jobPost.requiredExperienceLevel, error: 'error.invalid-experience-level-required' },
            { value: jobPost.requiredJobDuration, error: 'error.invalid-job-duration-required' },
            { value: jobPost.requiredJobScope, error: 'error.invalid-job-scope-required' },
        ] as const;

        for (const { value, error } of requiredFacets) {
            if (!value) {
                throw new UserInputException(error);
            }
        }
    }

    private async updateJobPostFacetValues(
        ctx: RequestContext,
        jobPost: JobPost,
        input: JobPostFacetValuesInput,
    ): Promise<void> {
        console.log({ jobPost });
        if (!jobPost.facetValues) {
            jobPost.facetValues = [];
        }

        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: SKILL_FACET_CODE,
            newFacetValueIds: input.requiredSkillIds,
            validateConstraints: (newFacetValues: FacetValue[]) => {
                if (
                    newFacetValues.length < PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS ||
                    newFacetValues.length > PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS
                ) {
                    throw new UserInputException('error.invalid-skill-count', {
                        min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
                        max: PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
                    });
                }
            },
        });

        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: CATEGORY_FACET_CODE,
            newFacetValueIds: input.requiredCategoryId ? [input.requiredCategoryId] : null,
            validateConstraints: (newFacetValues: FacetValue[]) => {
                if (newFacetValues.length !== 1) {
                    throw new UserInputException('error.invalid-category-count');
                }
            },
        });

        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: EXPERIENCE_LEVEL_FACET_CODE,
            newFacetValueIds: input.requiredExperienceLevelId ? [input.requiredExperienceLevelId] : null,
            validateConstraints: (newFacetValues: FacetValue[]) => {
                if (newFacetValues.length !== 1) {
                    throw new UserInputException('error.invalid-experience-level-count');
                }
            },
        });

        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: DURATION_FACET_CODE,
            newFacetValueIds: input.requiredJobDurationId ? [input.requiredJobDurationId] : null,
            validateConstraints: (newFacetValues: FacetValue[]) => {
                if (newFacetValues.length !== 1) {
                    throw new UserInputException('error.invalid-job-duration-count');
                }
            },
        });

        await this.updateFacetValuesForType({
            ctx,
            jobPost,
            facetCode: SCOPE_FACET_CODE,
            newFacetValueIds: input.requiredJobScopeId ? [input.requiredJobScopeId] : null,
            validateConstraints: (newFacetValues: FacetValue[]) => {
                if (newFacetValues.length !== 1) {
                    throw new UserInputException('error.invalid-job-scope-count');
                }
            },
        });
    }

    private async updateFacetValuesForType(options: {
        ctx: RequestContext;
        jobPost: JobPost;
        facetCode: string;
        newFacetValueIds: ID[] | null | undefined;
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
            // TODO: Add a more specific error message
            throw new UserInputException(`error.invalid-facet-values`, { facetCode });
        }
        validateConstraints(newFacetValues);
        // Add the new facet values
        jobPost.facetValues = [...jobPost.facetValues, ...newFacetValues];
    }
}
