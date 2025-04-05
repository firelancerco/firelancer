import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { Column, Entity, Index } from 'typeorm';

import { FirelancerEntity } from '../../entity/base/base.entity';

@Entity()
export class CacheItem extends FirelancerEntity {
    constructor(input: DeepPartial<CacheItem>) {
        super(input);
    }

    @Column({ type: 'timestamptz', precision: 3 })
    insertedAt: Date;

    @Index('cache_item_key')
    @Column({ unique: true })
    key: string;

    @Column('text')
    value: string;

    @Column({ type: 'timestamptz', nullable: true })
    expiresAt: Date | null;
}
