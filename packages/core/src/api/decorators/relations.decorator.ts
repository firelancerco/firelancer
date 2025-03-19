import { Type } from '@firelancerco/common/lib/shared-types';
import { EntityRelationPaths } from '../../common';
import { FirelancerEntity } from '../../entity';

export type RelationPaths<T extends FirelancerEntity> = Array<EntityRelationPaths<T>>;
export type FieldsDecoratorConfig<T extends FirelancerEntity> =
    | Type<T>
    | {
          entity: Type<T>;
          depth?: number;
          omit?: RelationPaths<T>;
      };
