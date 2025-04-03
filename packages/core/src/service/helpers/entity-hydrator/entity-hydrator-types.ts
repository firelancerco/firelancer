import { EntityRelationPaths } from '../../../common';
import { FirelancerEntity } from '../../../entity';

/**
 * @description
 * Options used to control which relations of the entity get hydrated
 * when using the {@link EntityHydrator} helper.
 */
export interface HydrateOptions<Entity extends FirelancerEntity> {
    /**
     * @description
     * Defines the relations to hydrate, using strings with dot notation to indicate
     * nested joins. If the entity already has a particular relation available, that relation
     * will be skipped (no extra DB join will be added).
     */
    relations: Array<EntityRelationPaths<Entity>>;
}
