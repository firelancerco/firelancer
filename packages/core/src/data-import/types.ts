import { LanguageCode, Permission } from '../common/shared-schema';

export interface CountryDefinition {
    code: string;
    name: string;
    zone: string;
}

export interface FacetValueCollectionFilterDefinition {
    code: 'job-post-facet-value-filter';
    args: {
        facetValueNames: string[];
        containsAny: boolean;
    };
}

export type CollectionFilterDefinition = FacetValueCollectionFilterDefinition;

export type FacetDefinition = {
    facetCode: string;
    facetName: Array<`${LanguageCode}:${string}`>;
    facetValues: Array<Array<`${LanguageCode}:${string}`>>;
};

export interface CollectionDefinition {
    name: Array<`${LanguageCode}:${string}`>;
    description?: Array<`${LanguageCode}:${string}`>;
    slug?: string;
    private?: boolean;
    filters?: CollectionFilterDefinition[];
    inheritFilters?: boolean;
    parentName?: string;
    assetPaths?: string[];
}

export interface RoleDefinition {
    code: string;
    description: string;
    permissions: Permission[];
}

/**
 * @description
 * An object defining initial settings for a new Firelancer installation.
 */
export interface InitialData {
    defaultLanguage: LanguageCode;
    roles?: RoleDefinition[];
    facets: FacetDefinition[];
    countries: CountryDefinition[];
    collections: CollectionDefinition[];
}
