import { Column, DeepPartial, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { Draftable, SoftDeletable } from '../../common';
import { CurrencyCode, ID, JobPostVisibility } from '../../common/shared-schema';
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
export class JobPost extends FirelancerEntity implements SoftDeletable, Draftable {
    constructor(input?: DeepPartial<JobPost>) {
        super(input);
    }

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date | null;

    @Column()
    customerId: ID;

    @ManyToOne(() => Customer, customer => customer.jobPosts)
    customer: Customer;

    @Column({ type: 'varchar', nullable: true })
    title: string | null;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', nullable: true })
    visibility: JobPostVisibility | null;

    @Column({ type: 'varchar', nullable: true })
    currencyCode: CurrencyCode | null;

    @Money({ nullable: true })
    budget: number | null;

    @OneToMany(() => JobPostAsset, jobPostAsset => jobPostAsset.jobPost)
    assets: JobPostAsset[];

    @ManyToMany(() => FacetValue, facetValue => facetValue.jobPosts, { nullable: true })
    @JoinTable()
    facetValues: FacetValue[] | null;

    @ManyToMany(() => Collection, collection => collection.jobPosts)
    collections: Collection[];
}
