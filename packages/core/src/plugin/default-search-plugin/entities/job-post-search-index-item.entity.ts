import { Column, Entity, Index } from 'typeorm';

import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { SearchIndex } from '../../../common/shared-schema';
import { SearchIndexItem } from './search-index-item.entity';

@Entity('job_post_search_index')
export class JobPostSearchIndexItem extends SearchIndexItem {
    constructor(input?: DeepPartial<JobPostSearchIndexItem>) {
        super(input);
        this.index = SearchIndex.JobPost;
    }

    @Index({ fulltext: true })
    @Column()
    title: string;

    @Index({ fulltext: true })
    @Column('text')
    description: string;

    @Column()
    currencyCode: string;

    @Column('int')
    budget: number;
}
