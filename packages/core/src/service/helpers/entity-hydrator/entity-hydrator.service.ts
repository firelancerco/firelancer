import { Type } from '@firelancerco/common/lib/shared-types';
import { unique } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { RequestContext } from '../../../common';
import { InternalServerException } from '../../../common/error/errors';
import { TransactionalConnection } from '../../../connection/transactional-connection';
import { FirelancerEntity } from '../../../entity/base/base.entity';
import { TranslatorService } from '../translator/translator.service';
import { joinTreeRelationsDynamically } from '../utils/tree-relations-qb-joiner';
import { HydrateOptions } from './entity-hydrator-types';
import { mergeDeep } from './merge-deep';

/**
 * @description
 * This is a helper class which is used to "hydrate" entity instances, which means to populate them
 * with the specified relations. This is useful when writing plugin code which receives an entity,
 * and you need to ensure that one or more relations are present.
 *
 */
@Injectable()
export class EntityHydrator {
    constructor(
        private connection: TransactionalConnection,
        private translator: TranslatorService,
    ) {}

    /**
     * @description
     * Hydrates (joins) the specified relations to the target entity instance. This method
     * mutates the `target` entity.
     */
    async hydrate<Entity extends FirelancerEntity>(
        ctx: RequestContext,
        target: Entity,
        options: HydrateOptions<Entity>,
    ): Promise<Entity> {
        if (options.relations) {
            let missingRelations = this.getMissingRelations(target, options);

            if (missingRelations.length) {
                const hydratedQb: SelectQueryBuilder<any> = this.connection
                    .getRepository(ctx, target.constructor)
                    .createQueryBuilder(target.constructor.name);
                const joinedRelations = joinTreeRelationsDynamically(hydratedQb, target.constructor, missingRelations);
                hydratedQb.setFindOptions({
                    relationLoadStrategy: 'query',
                    where: { id: target.id },
                    relations: missingRelations.filter(relationPath => !joinedRelations.has(relationPath)),
                });
                const hydrated = await hydratedQb.getOne();
                const propertiesToAdd = unique(missingRelations.map(relation => relation.split('.')[0]));
                for (const prop of propertiesToAdd) {
                    (target as any)[prop] = mergeDeep((target as any)[prop], hydrated[prop]);
                }

                const relationsWithEntities = missingRelations.map(relation => ({
                    entity: this.getRelationEntityAtPath(target, relation.split('.')),
                    relation,
                }));

                const translateDeepRelations = relationsWithEntities
                    .filter(item => this.isTranslatable(item.entity))
                    .map(item => item.relation.split('.'));

                this.assignSettableProperties(
                    target,
                    this.translator.translate(target as any, ctx, translateDeepRelations as any),
                );
            }
        }
        return target;
    }

    private assignSettableProperties<Entity extends FirelancerEntity>(target: Entity, source: Entity) {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(target))) {
            if (typeof descriptor.get === 'function' && typeof descriptor.set !== 'function') {
                // If the entity property has a getter only, we will skip it otherwise
                // we will get an error of the form:
                // `Cannot set property <name> of #<Entity> which has only a getter`
                continue;
            }
            target[key as keyof Entity] = source[key as keyof Entity];
        }
        return target;
    }

    /**
     * Compares the requested relations against the actual existing relations on the target entity,
     * and returns an array of all missing relation paths that would need to be fetched.
     */
    private getMissingRelations<Entity extends FirelancerEntity>(target: Entity, options: HydrateOptions<Entity>) {
        const missingRelations: string[] = [];
        for (const relation of options.relations.slice().sort()) {
            if (typeof relation === 'string') {
                const parts = relation.split('.');
                let entity: Record<string, any> | undefined = target;
                const path = [];
                for (const part of parts) {
                    path.push(part);
                    // null = the relation has been fetched but was null in the database.
                    // undefined = the relation has not been fetched.
                    if (entity && entity[part] === null) {
                        break;
                    }
                    if (entity && entity[part]) {
                        entity = Array.isArray(entity[part]) ? entity[part][0] : entity[part];
                    } else {
                        const allParts = path.reduce((result, p, i) => {
                            if (i === 0) {
                                return [p];
                            } else {
                                return [...result, [result[result.length - 1], p].join('.')];
                            }
                        }, [] as string[]);
                        missingRelations.push(...allParts);
                        entity = undefined;
                    }
                }
            }
        }
        return unique(missingRelations.filter(relation => !relation.endsWith('.customFields')));
    }

    /**
     * Returns an instance of the related entity at the given path.
     */
    private getRelationEntityAtPath(
        entity: FirelancerEntity,
        path: string[],
    ): FirelancerEntity | FirelancerEntity[] | undefined {
        let isArrayResult = false;
        const result: FirelancerEntity[] = [];

        function visit(parent: any, parts: string[]): any {
            if (parts.length === 0) {
                return;
            }
            const part = parts.shift() as string;
            const target = parent[part];
            if (Array.isArray(target)) {
                isArrayResult = true;
                if (parts.length === 0) {
                    result.push(...target);
                } else {
                    for (const item of target) {
                        visit(item, parts.slice());
                    }
                }
            } else if (target === null) {
                result.push(target);
            } else {
                if (parts.length === 0) {
                    result.push(target);
                } else {
                    visit(target, parts.slice());
                }
            }
        }
        visit(entity, path.slice());
        return isArrayResult ? result : result[0];
    }

    private getRelationEntityTypeAtPath(entity: FirelancerEntity, path: string): Type<FirelancerEntity> {
        const { entityMetadatas } = this.connection.rawConnection;
        const targetMetadata = entityMetadatas.find(m => m.target === entity.constructor);
        if (!targetMetadata) {
            throw new InternalServerException(`Cannot find entity metadata for entity "${entity.constructor.name}"`);
        }
        let currentMetadata = targetMetadata;
        for (const pathPart of path.split('.')) {
            const relationMetadata = currentMetadata.findRelationWithPropertyPath(pathPart);
            if (relationMetadata) {
                currentMetadata = relationMetadata.inverseEntityMetadata;
            } else {
                throw new InternalServerException(
                    `Cannot find relation metadata for entity "${currentMetadata.targetName}" at path "${pathPart}"`,
                );
            }
        }
        return currentMetadata.target as Type<FirelancerEntity>;
    }

    private isTranslatable<T extends FirelancerEntity>(input: T | T[] | undefined): boolean {
        return Array.isArray(input)
            ? (input[0]?.hasOwnProperty('translations') ?? false)
            : (input?.hasOwnProperty('translations') ?? false);
    }
}
