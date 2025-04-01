/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { normalizeString, notNullOrUndefined } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';

import { RequestContext, Translated } from '../../../common';
import { ConfigurableOperation, ID, LanguageCode } from '../../../common/shared-schema';
import { ConfigService, Logger } from '../../../config';
import { TransactionalConnection } from '../../../connection';
import { User } from '../../../entity';
import { Collection } from '../../../entity/collection/collection.entity';
import { FacetValue } from '../../../entity/facet-value/facet-value.entity';
import { Facet } from '../../../entity/facet/facet.entity';
import {
    CollectionService,
    FacetService,
    FacetValueService,
    RequestContextService,
    RoleService,
} from '../../../service';
import { SearchService } from '../../../service/services/search.service';
import {
    CollectionDefinition,
    CollectionFilterDefinition,
    FacetDefinition,
    InitialData,
    RoleDefinition,
} from '../../types';
import { AssetImporter } from '../asset-importer/asset-importer';

/**
 * @description
 * Responsible for populating the database with InitialData.
 */
@Injectable()
export class Populator {
    // These Maps are used to cache newly-created entities and prevent duplicates
    // from being created.
    private facetMap = new Map<string, Facet>();
    private facetValueMap = new Map<string, FacetValue>();

    constructor(
        private collectionService: CollectionService,
        private roleService: RoleService,
        private configService: ConfigService,
        private connection: TransactionalConnection,
        private requestContextService: RequestContextService,
        private facetService: FacetService,
        private facetValueService: FacetValueService,
        private searchService: SearchService,
        private assetImporter: AssetImporter,
    ) {}

    async populateInitialData(data: InitialData) {
        const ctx = await this.createRequestContext();
        try {
            await this.populateRoles(ctx, data.roles);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate roles');
                Logger.error(e.message, 'populator', e.stack);
            }
        }

        try {
            await this.populateFactes(ctx, data.facets);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate facets');
                Logger.error(e.message, 'populator', e.stack);
            }
        }

        try {
            await this.populateCollections(ctx, data.collections);
        } catch (e) {
            if (e && e instanceof Error) {
                Logger.error('Could not populate collections');
                Logger.error(e.message, 'populator', e.stack);
            }
        }
    }

    private async populateFactes(ctx: RequestContext, facets: FacetDefinition[]): Promise<ID[]> {
        const facetValueIds: ID[] = [];

        for (const facetDef of facets) {
            const { facetCode, facetName, facetValues } = facetDef;
            const facetEntity = await this.getOrCreateFacet(ctx, facetCode, facetName);

            for (const facetValue of facetValues) {
                const facetValueEntity = await this.getOrCreateFacetValue(ctx, facetEntity, facetName, facetValue);
                facetValueIds.push(facetValueEntity.id);
            }
        }

        return facetValueIds;
    }

    private async populateRoles(ctx: RequestContext, roles?: RoleDefinition[]) {
        if (!roles) {
            return;
        }
        for (const roleDef of roles) {
            await this.roleService.create(ctx, roleDef);
        }
    }

    private async populateCollections(ctx: RequestContext, collections?: CollectionDefinition[]) {
        if (!collections?.length) {
            return;
        }

        try {
            const allFacetValues = await this.facetValueService.findAll(ctx);
            const collectionMap = new Map<string, Collection>();

            for (const collectionDef of collections) {
                await this.processCollectionDefinition(ctx, collectionDef, allFacetValues, collectionMap);
            }

            // Short delay before reindexing
            await this.delay(50);
            await this.searchService.reindex(ctx);
        } catch (error) {
            Logger.error(`Error populating collections: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    private async processCollectionDefinition(
        ctx: RequestContext,
        collectionDef: CollectionDefinition,
        allFacetValues: PaginatedList<Translated<FacetValue>>,
        collectionMap: Map<string, Collection>,
    ) {
        const parent = collectionDef.parentName ? collectionMap.get(collectionDef.parentName) : undefined;
        const assets = await this.getCollectionAssets(ctx, collectionDef.assetPaths);
        const filters = await this.buildCollectionFilters(collectionDef.filters, allFacetValues);

        const translations = this.buildCollectionTranslations(
            ctx.languageCode,
            collectionDef.name,
            collectionDef.description,
            collectionDef.slug,
        );

        const collection = await this.collectionService.create(ctx, {
            translations,
            isPrivate: collectionDef.private ?? false,
            parentId: parent?.id,
            assetIds: assets.map(a => a.id.toString()),
            featuredAssetId: assets[0]?.id.toString(),
            filters,
            inheritFilters: collectionDef.inheritFilters ?? true,
        });

        collectionMap.set(this.getPrimaryCollectionName(collectionDef.name), collection);
    }

    private async getCollectionAssets(ctx: RequestContext, assetPaths?: string[]) {
        if (!assetPaths?.length) {
            return [];
        }
        return (await this.assetImporter.getAssets(assetPaths, ctx)).assets;
    }

    private async buildCollectionFilters(
        filters: CollectionFilterDefinition[] = [],
        allFacetValues: PaginatedList<Translated<FacetValue>>,
    ): Promise<ConfigurableOperation[]> {
        return filters.map(filter => {
            try {
                return this.processFilterDefinition(filter, allFacetValues);
            } catch (error) {
                Logger.error(`Error processing filter: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }
        });
    }

    private buildCollectionTranslations(
        languageCode: LanguageCode,
        nameTranslations: Array<`${LanguageCode}:${string}`>,
        descriptionTranslations?: Array<`${LanguageCode}:${string}`>,
        slug?: string,
    ) {
        const primaryName = this.getPrimaryTranslation(nameTranslations);
        return [
            {
                languageCode,
                name: primaryName,
                description: descriptionTranslations ? this.getPrimaryTranslation(descriptionTranslations) : '',
                slug: slug ?? primaryName,
            },
        ];
    }

    private processFilterDefinition(
        filter: CollectionFilterDefinition,
        allFacetValues: PaginatedList<Translated<FacetValue>>,
    ): ConfigurableOperation {
        if (filter.code !== 'job-post:facet-value-filter') {
            throw new Error(`Filter with code "${filter.code}" is not recognized.`);
        }

        const facetValueIds = filter.args.facetValueNames
            .map(name => this.findMatchingFacetValue(name, allFacetValues))
            .filter(notNullOrUndefined)
            .map(fv => fv.id);

        return {
            code: filter.code,
            args: [
                {
                    name: 'facetValueIds',
                    value: JSON.stringify(facetValueIds),
                },
                {
                    name: 'containsAny',
                    value: filter.args.containsAny.toString(),
                },
            ],
        };
    }

    private findMatchingFacetValue(
        name: string,
        allFacetValues: PaginatedList<Translated<FacetValue>>,
    ): FacetValue | undefined {
        if (name.includes(':')) {
            const [facetName, valueName] = name.split(':');
            return allFacetValues.items.find(
                fv =>
                    (fv.name === valueName || fv.code === valueName) &&
                    (fv.facet.name === facetName || fv.facet.code === facetName),
            );
        }
        return allFacetValues.items.find(fv => fv.name === name || fv.code === name);
    }

    private getPrimaryCollectionName(names: Array<`${LanguageCode}:${string}`>): string {
        return this.getPrimaryTranslation(names);
    }

    private getPrimaryTranslation(translations: Array<`${LanguageCode}:${string}`>): string {
        const primary = translations.find(t => t.startsWith('en:')) || translations[0];
        return primary.split(':')[1];
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async getOrCreateFacet(
        ctx: RequestContext,
        facetCode: string,
        facetName: Array<`${LanguageCode}:${string}`>,
    ): Promise<Facet> {
        // Check cache first
        const cachedFacet = this.facetMap.get(facetCode);
        if (cachedFacet) {
            return cachedFacet;
        }

        // Try to find existing facet
        const existingFacet = await this.facetService.findByCode(ctx, facetCode);
        if (existingFacet) {
            this.facetMap.set(facetCode, existingFacet);
            return existingFacet;
        }

        // Create new facet if not found
        const translations = this.parseTranslations(facetName);
        const newFacet = await this.facetService.create(ctx, {
            code: facetCode,
            translations,
        });

        this.facetMap.set(facetCode, newFacet);
        return newFacet;
    }

    private async getOrCreateFacetValue(
        ctx: RequestContext,
        facetEntity: Facet,
        facetName: Array<`${LanguageCode}:${string}`>,
        facetValue: Array<`${LanguageCode}:${string}`>,
    ): Promise<FacetValue> {
        const translations = this.parseTranslations(facetValue);
        const primaryName = translations[0]?.name;
        const facetValueMapKey = `${facetName[0]}:${primaryName}`;

        // Check cache first
        const cachedFacetValue = this.facetValueMap.get(facetValueMapKey);
        if (cachedFacetValue) {
            return cachedFacetValue;
        }

        // Try to find existing value
        const existingValue = facetEntity.values.find(v => v.name === primaryName);
        if (existingValue) {
            this.facetValueMap.set(facetValueMapKey, existingValue);
            return existingValue;
        }

        // Create new value if not found
        const newFacetValue = await this.facetValueService.create(ctx, {
            facetId: facetEntity.id,
            code: normalizeString(primaryName, '-'),
            translations,
        });

        this.facetValueMap.set(facetValueMapKey, newFacetValue);
        return newFacetValue;
    }

    private parseTranslations(
        translations: Array<`${LanguageCode}:${string}`>,
    ): Array<{ languageCode: LanguageCode; name: string }> {
        return translations.map(value => {
            const [languageCode, name] = value.split(':') as [LanguageCode, string];
            return { languageCode, name };
        });
    }

    private async createRequestContext() {
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.rawConnection.getRepository(User).findOne({
            where: { identifier: superadminCredentials.identifier },
        });
        const ctx = this.requestContextService.create({
            user: superAdminUser ?? undefined,
            apiType: 'admin',
        });
        return ctx;
    }
}
