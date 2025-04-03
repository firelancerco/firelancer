import {
    CATEGORY_FACET_CODE,
    DURATION_FACET_CODE,
    EXPERIENCE_LEVEL_FACET_CODE,
    PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
    SKILL_FACET_CODE,
} from '@firelancerco/common/lib/shared-constants';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { assertFound, unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { RelationPaths } from '../../api';
import { ListQueryOptions, RequestContext, UserInputException } from '../../common';
import {
    CreateJobPostInput,
    ID,
    JobPostStatus,
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
                items,
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
            .then(result => result ?? undefined);
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

        if (options?.filter?.visibility?.eq === 'PUBLIC') {
            qb.andWhere('jobpost.visibility = :visibility', { visibility: 'PUBLIC' });
        }

        if (options?.filter?.publishedAt?.isNull === false) {
            qb.andWhere('jobpost.publishedAt IS NOT NULL');
        }

        return qb.getManyAndCount().then(([items, totalItems]) => {
            return { items, totalItems };
        });
    }

    async create(ctx: RequestContext, input: CreateJobPostInput): Promise<JobPost> {
        const { facetValueIds, assetIds, ...rest } = input;
        const jobPost = new JobPost(rest);
        if (facetValueIds) {
            jobPost.facetValues = await this.facetValueService.findByIds(ctx, unique(facetValueIds));
        }
        const createdJobPost = await this.connection.getRepository(ctx, JobPost).save(jobPost);
        await this.assetService.updateEntityAssets(ctx, createdJobPost, { assetIds });
        await this.eventBus.publish(new JobPostEvent(ctx, createdJobPost, 'created', input));
        return assertFound(this.findOne(ctx, jobPost.id));
    }

    async publish(ctx: RequestContext, input: PublishJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues'],
        });

        await this.validatePublishable(ctx, jobPost);

        const updatedJobPost = patchEntity(jobPost, { publishedAt: new Date() });
        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'published', input));
        return assertFound(this.findOne(ctx, updatedJobPost.id));
    }

    async update(ctx: RequestContext, input: UpdateJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues'],
        });

        const updatedJobPost = patchEntity(jobPost, input);
        if (input.facetValueIds) {
            updatedJobPost.facetValues = await this.facetValueService.findByIds(ctx, unique(input.facetValueIds));
        }
        await this.assetService.updateFeaturedAsset(ctx, jobPost, input);
        await this.assetService.updateEntityAssets(ctx, jobPost, input);

        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'updated', input));
        return assertFound(this.findOne(ctx, updatedJobPost.id));
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

    private async validatePublishable(ctx: RequestContext, jobPost: JobPost): Promise<void> {
        await this.entityHydrator.hydrate(ctx, jobPost, {
            relations: ['facetValues' as never, 'facetValues.facet' as never],
        });

        const requiredFields: Array<{ field: keyof JobPost; error: string }> = [
            { field: 'title', error: 'error.job-post-title-required' },
            { field: 'description', error: 'error.job-post-description-required' },
            { field: 'visibility', error: 'error.job-post-visibility-required' },
            { field: 'budget', error: 'error.job-post-budget-required' },
            { field: 'currencyCode', error: 'error.job-post-currencyCode-required' },
        ];

        for (const { field, error } of requiredFields) {
            if (!jobPost[field]) {
                throw new UserInputException(error);
            }
        }

        if (jobPost.budget && jobPost.budget < PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET) {
            throw new UserInputException('error.job-post-budget-too-low', {
                min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET,
            });
        }

        if (
            jobPost.requiredSkills.length < PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS ||
            jobPost.requiredSkills.length > PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS
        ) {
            throw new UserInputException('error.invalid-skills-count', {
                min: PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
                max: PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
            });
        }

        if (!jobPost.requiredCategory) {
            throw new UserInputException('error.invalid-category-required');
        }

        if (!jobPost.requiredExperienceLevel) {
            throw new UserInputException('error.invalid-experience-level-required');
        }

        if (!jobPost.requiredJobDuration) {
            throw new UserInputException('error.invalid-job-duration-required');
        }

        if (!jobPost.requiredJobScope) {
            throw new UserInputException('error.invalid-job-scope-required');
        }
    }
}
