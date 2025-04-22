import { Column } from 'typeorm';
import { ID, SearchIndex } from '@firelancerco/common/lib/generated-schema';

import { EntityId } from '../../../entity/entity-id.decorator';

export abstract class SearchIndexItem {
    constructor(input?: Partial<SearchIndexItem>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    @EntityId({ primary: true })
    id: ID;

    @Column()
    index: SearchIndex;

    @Column('simple-array')
    facetIds: string[];

    @Column('simple-array')
    facetValueIds: string[];

    @Column('simple-array')
    collectionIds: string[];

    @Column('simple-array')
    collectionSlugs: string[];

    @Column('float', { default: 0 })
    score: number;
}
