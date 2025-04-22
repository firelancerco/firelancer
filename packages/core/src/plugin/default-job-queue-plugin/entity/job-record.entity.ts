import { JobState } from '@firelancerco/common/lib/generated-schema';
import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { Column, Entity } from 'typeorm';
import { FirelancerEntity } from '../../../entity/base/base.entity';

@Entity()
export class JobRecord extends FirelancerEntity {
    constructor(input: DeepPartial<JobRecord>) {
        super(input);
    }

    @Column()
    queueName: string;

    @Column('simple-json', { nullable: true })
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    data: any;

    @Column('varchar')
    state: JobState;

    @Column()
    progress: number;

    @Column('simple-json', { nullable: true })
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    result: any;

    @Column({ nullable: true })
    error: string;

    @Column({ type: 'timestamp', nullable: true, precision: 6 })
    startedAt?: Date;

    @Column({ type: 'timestamp', nullable: true, precision: 6 })
    settledAt?: Date;

    @Column()
    isSettled: boolean;

    @Column()
    retries: number;

    @Column()
    attempts: number;
}
