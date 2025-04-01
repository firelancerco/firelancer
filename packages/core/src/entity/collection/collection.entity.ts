import { DeepPartial } from '@firelancerco/common/lib/shared-types';
import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { LocaleString, Orderable, Translatable, Translation } from '../../common';
import { ConfigurableOperation, ID } from '../../common/shared-schema';
import { Asset } from '../asset/asset.entity';
import { FirelancerEntity } from '../base/base.entity';
import { EntityId } from '../entity-id.decorator';
import { JobPost } from '../job-post/job-post.entity';
import { CollectionAsset } from './collection-asset.entity';
import { CollectionTranslation } from './collection-translation.entity';

/**
 * @description
 * A Collection is a grouping of JobPosts based on various configurable criteria.
 */
@Entity()
@Tree('closure-table')
export class Collection extends FirelancerEntity implements Translatable, Orderable {
    constructor(input?: DeepPartial<Collection>) {
        super(input);
    }

    @Column({ default: false })
    isRoot: boolean;

    @Column()
    position: number;

    @Column({ default: false })
    isPrivate: boolean;

    name: LocaleString;

    description: LocaleString;

    slug: LocaleString;

    @OneToMany(() => CollectionTranslation, translation => translation.base, { eager: true })
    translations: Array<Translation<Collection>>;

    @Column('simple-json')
    filters: ConfigurableOperation[];

    @Column({ default: true })
    inheritFilters: boolean;

    @TreeChildren()
    children: Collection[];

    @TreeParent()
    parent: Collection;

    @EntityId({ nullable: true })
    parentId: ID;

    @Index()
    @ManyToOne(() => Asset, asset => asset.featuredInCollections, { onDelete: 'SET NULL' })
    featuredAsset: Asset;

    @OneToMany(() => CollectionAsset, collectionAsset => collectionAsset.collection)
    assets: CollectionAsset[];

    /**
     * @description
     * A collection can have many job posts.
     */
    @ManyToMany(() => JobPost, jobPost => jobPost.collections)
    @JoinTable()
    jobPosts: JobPost[];
}
