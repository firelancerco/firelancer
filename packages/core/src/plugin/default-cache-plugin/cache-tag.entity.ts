import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';

import { FirelancerEntity } from '../../entity/base/base.entity';
import { EntityId } from '../../entity/index';
import { CacheItem } from './cache-item.entity';

@Entity()
@Unique(['tag', 'itemId'])
export class CacheTag extends FirelancerEntity {
    constructor(input: DeepPartial<CacheTag>) {
        super(input);
    }

    @Index('cache_tag_tag')
    @Column()
    tag: string;

    @ManyToOne(() => CacheItem, { onDelete: 'CASCADE' })
    item: CacheItem;

    @EntityId()
    itemId: string;
}
