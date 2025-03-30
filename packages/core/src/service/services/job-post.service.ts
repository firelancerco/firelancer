import {
    CATEGORY_FACET_CODE,
    DURATION_FACET_CODE,
    EXPERIENCE_LEVEL_FACET_CODE,
    SKILL_FACET_CODE,
} from '@firelancerco/common/lib/shared-constants';
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { assertFound, unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { RelationPaths } from '../../api';
import { ListQueryOptions, RequestContext, UserInputException } from '../../common';
import { CreateJobPostInput, ID, PublishJobPostInput, UpdateJobPostInput } from '../../common/shared-schema';
import { TransactionalConnection } from '../../connection';
import { FacetValue, JobPost } from '../../entity';
import { EventBus, JobPostEvent } from '../../event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { patchEntity } from '../helpers/utils/patch-entity';
import { AssetService } from './asset.service';
import { FacetValueService } from './facet-value.service';

@Injectable()
export class JobPostService {
    private readonly relations = ['assets', 'facetValues', 'facetValues.facet'];

    private readonly PUBLISH_CONSTRAINTS = {
        MIN_SKILLS: 1,
        MAX_SKILLS: 15,
        MIN_CATEGORIES: 1,
        MAX_CATEGORIES: 2,
        MIN_BUDGET: 5,
    } as const;

    constructor(
        private connection: TransactionalConnection,
        private assetService: AssetService,
        private facetValueService: FacetValueService,
        private eventBus: EventBus,
        private listQueryBuilder: ListQueryBuilder,
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

    private async validatePublishable(ctx: RequestContext, jobPost: JobPost): Promise<void> {
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

        // Validate budget minimum
        if (jobPost.budget && jobPost.budget < this.PUBLISH_CONSTRAINTS.MIN_BUDGET) {
            throw new UserInputException('error.job-post-budget-too-low', {
                min: this.PUBLISH_CONSTRAINTS.MIN_BUDGET,
            });
        }

        // Validate facets
        if (!jobPost.facetValues) {
            throw new UserInputException('error.job-post-facet-values-required');
        }

        await this.validateFacetConstraints(
            ctx,
            jobPost.facetValues.map(fv => fv.id),
        );
    }

    private async validateFacetConstraints(ctx: RequestContext, facetValueIds: ID[]): Promise<void> {
        const facetValues = await this.facetValueService.findByIds(ctx, unique(facetValueIds) || []);

        const categories = this.getFacetValues(facetValues, CATEGORY_FACET_CODE);
        const skills = this.getFacetValues(facetValues, SKILL_FACET_CODE);

        if (
            categories.length < this.PUBLISH_CONSTRAINTS.MIN_CATEGORIES ||
            categories.length > this.PUBLISH_CONSTRAINTS.MAX_CATEGORIES
        ) {
            throw new UserInputException('error.invalid-categories-count', {
                min: this.PUBLISH_CONSTRAINTS.MIN_CATEGORIES,
                max: this.PUBLISH_CONSTRAINTS.MAX_CATEGORIES,
            });
        }

        if (
            skills.length < this.PUBLISH_CONSTRAINTS.MIN_SKILLS ||
            skills.length > this.PUBLISH_CONSTRAINTS.MAX_SKILLS
        ) {
            throw new UserInputException('error.invalid-skills-count', {
                min: this.PUBLISH_CONSTRAINTS.MIN_SKILLS,
                max: this.PUBLISH_CONSTRAINTS.MAX_SKILLS,
            });
        }
    }

    private getFacetValues(facetValues: Array<FacetValue>, facetCode: string): Array<FacetValue> {
        return facetValues.filter(fv => fv.facet.code === facetCode);
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
}
