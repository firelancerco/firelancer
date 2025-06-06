import { ID, SearchInput, SearchResult } from '@firelancerco/common/lib/generated-schema';
import { InjectableStrategy, RequestContext } from '../../../common';

/**
 * @description
 * This interface defines the contract that any database-specific search implementations
 * should follow.
 *
 * :::info
 *
 * This is configured via the `searchStrategy` property of
 * the {@link DefaultSearchPluginInitOptions}.
 *
 * :::
 */
export interface SearchStrategy extends InjectableStrategy {
    getSearchResults(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<SearchResult[]>;
    getTotalCount(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<number>;
    /**
     * Returns a map of `facetValueId` => `count`, providing the number of times that
     * facetValue occurs in the result set.
     */
    getFacetValueIds(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<Map<ID, number>>;
    /**
     * Returns a map of `collectionId` => `count`, providing the number of times that
     * collection occurs in the result set.
     */
    getCollectionIds(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<Map<ID, number>>;
}
