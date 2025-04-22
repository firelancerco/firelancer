import { Column, Entity, Index } from 'typeorm';
import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { SearchIndex } from '@firelancerco/common/lib/generated-schema';

import { SearchIndexItem } from './search-index-item.entity';

@Entity('profile_search_index')
export class ProfileSearchIndexItem extends SearchIndexItem {
    constructor(input?: DeepPartial<ProfileSearchIndexItem>) {
        super(input);
        this.index = SearchIndex.Profile;
    }

    @Index({ fulltext: true })
    @Column()
    title: string;

    @Index({ fulltext: true })
    @Column('text')
    description: string;

    @Column({ default: true })
    enabled: boolean;
}
