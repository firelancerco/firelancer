import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import { ID } from '@firelancerco/common/lib/generated-schema';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { OrderableAsset } from '../asset/orderable-asset.entity';
import { Collection } from './collection.entity';

@Entity()
export class CollectionAsset extends OrderableAsset {
    constructor(input?: DeepPartial<CollectionAsset>) {
        super(input);
    }
    @Column()
    collectionId: ID;

    @Index()
    @ManyToOne(() => Collection, collection => collection.assets, { onDelete: 'CASCADE' })
    collection: Collection;
}
