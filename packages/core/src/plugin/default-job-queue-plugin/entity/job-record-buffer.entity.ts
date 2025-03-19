import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { Column, Entity } from 'typeorm';
import { FirelancerEntity } from '../../../entity/base/base.entity';
import { JobConfig } from '../../../job-queue/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Entity()
export class JobRecordBuffer extends FirelancerEntity {
    constructor(input: DeepPartial<JobRecordBuffer>) {
        super(input);
    }

    @Column()
    bufferId: string;

    @Column('simple-json')
    job: JobConfig<any>;
}
