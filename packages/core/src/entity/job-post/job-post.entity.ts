import {
    CATEGORY_FACET_CODE,
    DURATION_FACET_CODE,
    EXPERIENCE_LEVEL_FACET_CODE,
    SCOPE_FACET_CODE,
    SKILL_FACET_CODE,
} from '@firelancerco/common/lib/shared-constants';
import { Column, DeepPartial, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { Calculated, Collectable, Draftable, SoftDeletable } from '../../common';
import { CurrencyCode, ID, JobPostStatus, JobPostVisibility } from '../../common/shared-schema';
import { JobPostState } from '../../service/helpers/job-post-state-machine/job-post-state';
import { FirelancerEntity } from '../base/base.entity';
import { Collection } from '../collection/collection.entity';
import { Customer } from '../customer/customer.entity';
import { FacetValue } from '../facet-value/facet-value.entity';
import { Money } from '../money.decorator';
import { JobPostAsset } from './job-post-asset.entity';

/**
 * @description
 * Job Post
 */
@Entity()
export class JobPost extends FirelancerEntity implements Collectable, SoftDeletable, Draftable {
    constructor(input?: DeepPartial<JobPost>) {
        super(input);
    }

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    closedAt: Date | null;

    @Column()
    customerId: ID;

    @ManyToOne(() => Customer, customer => customer.jobPosts)
    customer: Customer;

    @Column({ type: 'varchar', nullable: true })
    title: string | null;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', default: JobPostVisibility.PUBLIC })
    visibility: JobPostVisibility;

    @Column({ type: 'varchar', nullable: true })
    currencyCode: CurrencyCode | null;

    @Money({ nullable: true })
    budget: number | null;

    // @Column('varchar')
    state: JobPostState;

    @Calculated({
        expression: `
            CASE 
                WHEN publishedAt IS NULL THEN 'DRAFT'
                WHEN publishedAt IS NOT NULL AND closedAt IS NULL THEN 'ACTIVE'
                WHEN publishedAt IS NOT NULL AND closedAt IS NOT NULL THEN 'CLOSED'
            END
        `,
    })
    // TODO: should not return undefined
    get status(): JobPostStatus | undefined {
        if (!this.publishedAt) {
            return JobPostStatus.DRAFT;
        }

        if (this.publishedAt && !this.closedAt) {
            return JobPostStatus.ACTIVE;
        }

        if (this.publishedAt && this.closedAt) {
            return JobPostStatus.CLOSED;
        }
    }

    @Calculated({ relations: ['facetValues', 'facetValues.facet'] })
    get requiredSkills(): FacetValue[] {
        return this.facetValues?.filter(facetValue => facetValue?.facet?.code === SKILL_FACET_CODE) ?? [];
    }

    @Calculated({ relations: ['facetValues', 'facetValues.facet'] })
    get requiredCategory(): FacetValue | null {
        return this.facetValues?.find(facetValue => facetValue?.facet?.code === CATEGORY_FACET_CODE) ?? null;
    }

    @Calculated({ relations: ['facetValues', 'facetValues.facet'] })
    get requiredExperienceLevel(): FacetValue | null {
        return this.facetValues?.find(facetValue => facetValue?.facet?.code === EXPERIENCE_LEVEL_FACET_CODE) ?? null;
    }

    @Calculated({ relations: ['facetValues', 'facetValues.facet'] })
    get requiredJobDuration(): FacetValue | null {
        return this.facetValues?.find(facetValue => facetValue?.facet?.code === DURATION_FACET_CODE) ?? null;
    }

    @Calculated({ relations: ['facetValues', 'facetValues.facet'] })
    get requiredJobScope(): FacetValue | null {
        return this.facetValues?.find(facetValue => facetValue?.facet?.code === SCOPE_FACET_CODE) ?? null;
    }

    @OneToMany(() => JobPostAsset, jobPostAsset => jobPostAsset.jobPost)
    assets: JobPostAsset[];

    @ManyToMany(() => FacetValue, facetValue => facetValue.jobPosts, { nullable: true })
    @JoinTable()
    facetValues: FacetValue[] | null;

    @ManyToMany(() => Collection, collection => collection.jobPosts)
    collections: Collection[];
}
