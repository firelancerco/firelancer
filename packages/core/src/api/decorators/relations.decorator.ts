import { Type } from '@firelancerco/common/lib/shared-types';
import { unique } from '@firelancerco/common/lib/shared-utils';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';

import { EntityRelationPaths, InternalServerException } from '../../common';
import { TtlCache } from '../../common/ttl-cache';
import { FirelancerEntity } from '../../entity/base/base.entity';

export type RelationPaths<T extends FirelancerEntity> = Array<EntityRelationPaths<T>>;
export type FieldsDecoratorConfig<T extends FirelancerEntity> =
    | Type<T>
    | {
          entity: Type<T>;
          depth?: number;
          omit?: RelationPaths<T>;
      };

const DEFAULT_DEPTH = 3;
const cache = new TtlCache({ cacheSize: 500, ttl: 5 * 60 * 1000 });

export const Relations: <T extends FirelancerEntity>(data: FieldsDecoratorConfig<T>) => ParameterDecorator =
    createParamDecorator<FieldsDecoratorConfig<any>>((data, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (data == null) {
            throw new InternalServerException('The @Relations() decorator requires an entity type argument');
        }

        // Get relations from query parameters
        const relationsParam = request.query.relations;
        if (!relationsParam) {
            return [];
        }

        const cacheKey = `${request.path}__${relationsParam}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // Parse relations from query string
        const requestedRelations = Array.isArray(relationsParam) ? relationsParam : relationsParam.split(',');

        const entity = typeof data === 'function' ? data : data.entity;
        const maxDepth = typeof data === 'function' ? DEFAULT_DEPTH : (data.depth ?? DEFAULT_DEPTH);
        const omit = typeof data === 'function' ? [] : (data.omit ?? []);

        // Validate and filter relations
        const validRelations = getValidRelations(requestedRelations, entity, maxDepth);
        let result = unique(validRelations);

        // Apply omit rules
        for (const omitPath of omit) {
            result = result.filter(resultPath => !resultPath.startsWith(omitPath as string));
        }

        cache.set(cacheKey, result);
        return result;
    });

function getValidRelations(requestedRelations: string[], entity: Type<FirelancerEntity>, maxDepth: number): string[] {
    const relations = getMetadataArgsStorage().filterRelations(entity);
    const validRelations: string[] = [];

    for (const relation of requestedRelations) {
        const parts = relation.split('.');
        if (parts.length > maxDepth) {
            continue;
        }

        let currentEntity = entity;
        let currentPath = '';
        let isValid = true;

        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}.${part}` : part;
            const relationMetadata = relations.find(r => r.propertyName === part);

            if (!relationMetadata) {
                isValid = false;
                break;
            }

            currentEntity =
                typeof relationMetadata.type === 'function' ? (relationMetadata.type as any)() : relationMetadata.type;
        }

        if (isValid) {
            validRelations.push(currentPath);
        }
    }

    return validRelations;
}
