import { Column, DeepPartial, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { SoftDeletable } from '../../common/shared-types';
import { FirelancerEntity } from '../base/base.entity';
import { JobPost } from '../job-post/job-post.entity';
import { User } from '../user/user.entity';
import { CustomerRole } from '@firelancerco/common/lib/generated-schema';

/**
 * @description
 * This entity represents a customer of the store, typically an individual person. A Customer can be
 * a guest, in which case it has no associated User. Customers with registered account will
 * have an associated User entity.
 */
@Entity()
export class Customer extends FirelancerEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Customer>) {
        super(input);
    }

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'varchar', nullable: true })
    phoneNumber: string | null;

    @Column()
    emailAddress: string;

    @Column({ type: 'varchar', nullable: true })
    role: CustomerRole | null;

    @OneToOne(() => User, { eager: true })
    @JoinColumn()
    user?: User;

    @OneToMany(() => JobPost, jobPost => jobPost.customer)
    jobPosts: JobPost[];
}
