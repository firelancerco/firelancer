import { Brackets, SelectQueryBuilder } from 'typeorm';

import {
    ID,
    SearchInput,
    SearchResult,
    JobPostSearchResultSortParameter,
} from '@firelancerco/common/lib/generated-schema';
import { Injector, RequestContext } from '../../../common';
import { UserInputException } from '../../../common/error/errors';
import { TransactionalConnection } from '../../../connection/transactional-connection';
import { PLUGIN_INIT_OPTIONS } from '../constants';
import { DefaultSearchPluginInitOptions } from '../types';
import { SearchStrategy } from './search-strategy';

import { SearchIndexItem } from '../entities/search-index-item.entity';
import { searchIndexes } from '../entities/search-indexes';
import { createCollectionIdCountMap, createFacetIdCountMap, createPlaceholderFromId } from './search-strategy-utils';

/**
 * @description
 * A weighted fulltext search for PostgeSQL.
 */
export class PostgresSearchStrategy implements SearchStrategy {
    private readonly minTermLength = 2;
    private connection: TransactionalConnection;
    private options: DefaultSearchPluginInitOptions;

    async init(injector: Injector) {
        this.connection = injector.get(TransactionalConnection);
        this.options = injector.get(PLUGIN_INIT_OPTIONS);
    }

    async getFacetValueIds(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<Map<ID, number>> {
        const SearchIndexItem = searchIndexes[input.search.index];

        const facetValuesQb = this.connection
            .getRepository(ctx, SearchIndexItem)
            .createQueryBuilder('si')
            .select(['"si"."id"'])
            .addSelect('string_agg("si"."facetValueIds",\',\')', 'facetValues');

        this.applyTermAndFilters(ctx, facetValuesQb, input, enabledOnly);

        if (enabledOnly) {
            facetValuesQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
        }

        const facetValuesResult = await facetValuesQb.getRawMany();
        return createFacetIdCountMap(facetValuesResult);
    }

    async getCollectionIds(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<Map<ID, number>> {
        const SearchIndexItem = searchIndexes[input.search.index];

        const collectionsQb = this.connection
            .getRepository(ctx, SearchIndexItem)
            .createQueryBuilder('si')
            .select(['"si"."id"'])
            .addSelect('string_agg("si"."collectionIds",\',\')', 'collections');

        this.applyTermAndFilters(ctx, collectionsQb, input, enabledOnly);

        if (enabledOnly) {
            collectionsQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
        }

        const collectionsResult = await collectionsQb.getRawMany();
        return createCollectionIdCountMap(collectionsResult);
    }

    async getSearchResults(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<SearchResult[]> {
        const SearchIndexItem = searchIndexes[input.search.index];

        const take = input.search.take || 25;
        const skip = input.search.skip || 0;
        const sort = input.search.sort;
        const qb = this.connection.getRepository(ctx, SearchIndexItem).createQueryBuilder('si');

        this.applyTermAndFilters(ctx, qb, input, enabledOnly);

        if (sort) {
            if (sort.title) {
                if (sort.title) {
                    qb.addOrderBy('"si"."title"', sort.title);
                }
            }
        } else if (input.search.term && input.search.term.length > this.minTermLength) {
            qb.addOrderBy('score', 'DESC');
        }

        // Required to ensure deterministic sorting when results have the same score or title
        qb.addOrderBy('"si"."id"', 'ASC');

        if (enabledOnly) {
            qb.andWhere('"si"."enabled" = :enabled', { enabled: true });
        }

        return qb.limit(take).offset(skip).getRawMany();
    }

    async getTotalCount(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<number> {
        const SearchIndexItem = searchIndexes[input.search.index];

        const innerQb = this.applyTermAndFilters(
            ctx,
            this.connection.getRepository(ctx, SearchIndexItem).createQueryBuilder('si'),
            input,
            enabledOnly,
        );

        if (enabledOnly) {
            innerQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
        }

        const totalItemsQb = this.connection.rawConnection
            .createQueryBuilder()
            .select('COUNT(*) as total')
            .from(`(${innerQb.getQuery()})`, 'inner')
            .setParameters(innerQb.getParameters());
        return totalItemsQb.getRawOne().then(res => res.total);
    }

    private applyTermAndFilters(
        ctx: RequestContext,
        qb: SelectQueryBuilder<SearchIndexItem>,
        input: SearchInput,
        enabledOnly: boolean = false,
    ): SelectQueryBuilder<SearchIndexItem> {
        const { term, facetValueFilters, collectionId, collectionSlug } = input.search;
        // join multiple words with the logical AND operator
        const termLogicalAnd = term
            ? term
                  .trim()
                  .split(/\s+/g)
                  .map(t => `'${t}':*`)
                  .join(' & ')
            : '';

        qb.where('1 = 1');
        if (term && term.length > this.minTermLength) {
            qb.addSelect(
                `
                    (ts_rank_cd(to_tsvector('si.title'), to_tsquery(:term)) * 10 +
                    ts_rank_cd(to_tsvector('si.description'), to_tsquery(:term)) * 2)
                `,
                'score',
            )
                .andWhere(
                    new Brackets(qb1 => {
                        qb1.where('to_tsvector(si.title) @@ to_tsquery(:term)').orWhere(
                            'to_tsvector(si.description) @@ to_tsquery(:term)',
                        );
                    }),
                )
                .setParameters({ term: termLogicalAnd });
        }

        if (facetValueFilters?.length) {
            qb.andWhere(
                new Brackets(qb1 => {
                    for (const facetValueFilter of facetValueFilters) {
                        qb1.andWhere(
                            new Brackets(qb2 => {
                                if (facetValueFilter.and && facetValueFilter.or?.length) {
                                    throw new UserInputException('error.facetfilterinput-invalid-input');
                                }
                                if (facetValueFilter.and) {
                                    const placeholder = createPlaceholderFromId(facetValueFilter.and);
                                    const clause = `:${placeholder}::varchar = ANY (string_to_array(si.facetValueIds, ','))`;
                                    const params = { [placeholder]: facetValueFilter.and };
                                    qb2.where(clause, params);
                                }
                                if (facetValueFilter.or?.length) {
                                    for (const id of facetValueFilter.or) {
                                        const placeholder = createPlaceholderFromId(id);
                                        const clause = `:${placeholder}::varchar = ANY (string_to_array(si.facetValueIds, ','))`;
                                        const params = { [placeholder]: id };
                                        qb2.orWhere(clause, params);
                                    }
                                }
                            }),
                        );
                    }
                }),
            );
        }

        if (collectionId) {
            qb.andWhere(":collectionId::varchar = ANY (string_to_array(si.collectionIds, ','))", {
                collectionId,
            });
        }

        if (collectionSlug) {
            qb.andWhere(":collectionSlug::varchar = ANY (string_to_array(si.collectionSlugs, ','))", {
                collectionSlug,
            });
        }

        return qb;
    }
}
