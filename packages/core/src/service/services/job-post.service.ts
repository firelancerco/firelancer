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

    async create(ctx: RequestContext, input: CreateJobPostInput): Promise<JobPost> {
        const { facetValueIds, assetIds, ...rest } = input;
        const jobPost = new JobPost(rest);
        if (facetValueIds) {
            jobPost.facetValues = await this.validateFacetConstraints(ctx, facetValueIds);
        }
        const createdJobPost = await this.connection.getRepository(ctx, JobPost).save(jobPost);
        await this.assetService.updateEntityAssets(ctx, createdJobPost, { assetIds });
        await this.eventBus.publish(new JobPostEvent(ctx, createdJobPost, 'created', input));
        return assertFound(this.findOne(ctx, jobPost.id));
    }

    // TODO: add error message translations
    async publish(ctx: RequestContext, input: PublishJobPostInput): Promise<JobPost> {
        const jobPost = await this.connection.getEntityOrThrow(ctx, JobPost, input.id, {
            relations: ['facetValues'],
        });

        if (!jobPost.title) {
            throw new UserInputException('error.job-post-title-required');
        }
        if (!jobPost.description) {
            throw new UserInputException('error.job-post-description-required');
        }
        if (!jobPost.visibility) {
            throw new UserInputException('error.job-post-visibility-required');
        }
        if (!jobPost.budget) {
            throw new UserInputException('error.job-post-budget-required');
        }
        if (!jobPost.currencyCode) {
            throw new UserInputException('error.job-post-currencyCode-required');
        }
        if (!jobPost.facetValues?.length) {
            throw new UserInputException('error.job-post-facetValues-required');
        }

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
            updatedJobPost.facetValues = await this.validateFacetConstraints(ctx, input.facetValueIds);
        }
        await this.assetService.updateFeaturedAsset(ctx, jobPost, input);
        await this.assetService.updateEntityAssets(ctx, jobPost, input);

        await this.connection.getRepository(ctx, JobPost).save(updatedJobPost);
        await this.eventBus.publish(new JobPostEvent(ctx, updatedJobPost, 'updated', input));
        return assertFound(this.findOne(ctx, updatedJobPost.id));
    }

    // TODO: add error message translations
    private async validateFacetConstraints(ctx: RequestContext, facetValueIds: ID[]) {
        const facetValues = await this.facetValueService.findByIds(ctx, unique(facetValueIds) || []);

        const category = this.getCategory(facetValues);
        const duration = this.getDuration(facetValues);
        const experienceLevel = this.getExperienceLevel(facetValues);
        const skills = this.getSkills(facetValues);

        const MIN_SKILLS = 3;
        const MAX_SKILLS = 15;

        if (!category) {
            throw new UserInputException('Job category is required');
        }

        if (skills.length < MIN_SKILLS) {
            throw new UserInputException(`error.minimum-skills-required`, { count: MIN_SKILLS });
        }

        if (skills.length > MAX_SKILLS) {
            throw new UserInputException(`error.maximum-skills-allowed`, { count: MAX_SKILLS });
        }

        if (!duration) {
            throw new UserInputException('error.job-duration-required');
        }

        if (!experienceLevel) {
            throw new UserInputException('error.experience-level-required');
        }

        return facetValues;
    }

    private getSkills(facetValues: Array<FacetValue>) {
        return facetValues.filter(fv => fv.facet.code === SKILL_FACET_CODE);
    }

    private getCategory(facetValues: Array<FacetValue>) {
        return facetValues.find(fv => fv.facet.code === CATEGORY_FACET_CODE);
    }

    private getDuration(facetValues: Array<FacetValue>) {
        return facetValues.find(fv => fv.facet.code === DURATION_FACET_CODE);
    }

    private getExperienceLevel(facetValues: Array<FacetValue>) {
        return facetValues.find(fv => fv.facet.code === EXPERIENCE_LEVEL_FACET_CODE);
    }
}
