import { ConfigArgDef } from '../../../../common/configurable-operation';
import { LanguageCode } from '../../../../common/shared-schema';
import { JobPost } from '../../../../entity';
import { CollectionFilter } from '../collection-filter';

/* eslint-disable @typescript-eslint/no-require-imports */
const { customAlphabet } = require('nanoid');

/**
 * @description
 * Used to created unique key names for DB query parameters, to avoid conflicts if the
 * same filter is applied multiple times.
 */
export function randomSuffix(prefix: string) {
    const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyz', 6);
    return `${prefix}_${nanoid() as string}`;
}

/**
 * @description
 * Add this to your CollectionFilter `args` object to display the standard UI component
 * for selecting the combination mode when working with multiple filters.
 */
export const combineWithAndArg: ConfigArgDef<'boolean'> = {
    type: 'boolean',
    label: [
        {
            languageCode: LanguageCode.en,
            value: 'Combination mode',
        },
        {
            languageCode: LanguageCode.ar,
            value: 'وضع الدمج',
        },
    ],
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'If this filter is being combined with other filters, do all conditions need to be satisfied (AND), or just one or the other (OR)?',
        },
        {
            languageCode: LanguageCode.ar,
            value: 'إذا كان هذا الفلتر يُستخدم مع فلاتر أخرى، فهل يجب استيفاء جميع الشروط (AND)، أم يكفي تحقق أحدها فقط (OR)؟',
        },
    ],
    defaultValue: true,
};

/**
 * Filters for JobPosts having the given facetValueIds
 */
export const jobPostFacetValueCollectionFilter = new CollectionFilter({
    entityType: JobPost,
    code: 'job-post-facet-value-filter',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Filter by facet values',
        },
        {
            languageCode: LanguageCode.ar,
            value: 'التصفية حسب قيم السمات',
        },
    ],
    args: {
        facetValueIds: {
            type: 'ID',
            list: true,
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Facet values',
                },
                {
                    languageCode: LanguageCode.ar,
                    value: 'قيم السمات',
                },
            ],
        },
        containsAny: {
            type: 'boolean',
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Contains any',
                },
                {
                    languageCode: LanguageCode.ar,
                    value: 'يحتوي على أي',
                },
            ],
            description: [
                {
                    languageCode: LanguageCode.en,
                    value: 'If checked, job posts must have at least one of the selected facet values. If not checked, the job post must have all selected values.',
                },
                {
                    languageCode: LanguageCode.ar,
                    value: 'إذا تم التحديد، يجب أن تحتوي المشاريع على سمة واحدة على الأقل من السمات المحددة. إذا لم يتم التحديد، يجب أن يحتوي المشروع على جميع السمات المحددة.',
                },
            ],
        },
        combineWithAnd: combineWithAndArg,
    },
    apply: (qb, args) => {
        const ids = args.facetValueIds;

        if (ids.length) {
            // uuid IDs can include `-` chars, which we cannot use in a TypeORM key name.
            const safeIdsConcat = ids.join('_').replace(/-/g, '_');
            const idsName = `ids_${safeIdsConcat}`;
            const countName = `count_${safeIdsConcat}`;
            const jobPostQuery = qb.connection
                .createQueryBuilder(JobPost, 'entity')
                .select('entity.id', 'entity_id')
                .addSelect('facet_value.id', 'facet_value_id')
                .leftJoin('entity.facetValues', 'facet_value')
                .where(`facet_value.id IN (:...${idsName})`);

            const jobPostIds = qb.connection
                .createQueryBuilder()
                .select('entity_ids_table.entity_id')
                .from(`(${jobPostQuery.getQuery()})`, 'entity_ids_table')
                .groupBy('entity_id')
                .having(`COUNT(*) >= :${countName}`);

            const clause = `entity.id IN (${jobPostIds.getQuery()})`;
            const params = {
                [idsName]: ids,
                [countName]: args.containsAny ? 1 : ids.length,
            };
            if (args.combineWithAnd !== false) {
                qb.andWhere(clause).setParameters(params);
            } else {
                qb.orWhere(clause).setParameters(params);
            }
        } else {
            // If no facetValueIds are specified, no JobPosts will be matched.
            if (args.combineWithAnd !== false) {
                qb.andWhere('1 = 0');
            }
        }
        return qb;
    },
});

export const jobPostIdCollectionFilter = new CollectionFilter({
    entityType: JobPost,
    code: 'job-post-id-filter',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Manually select job posts',
        },
        {
            languageCode: LanguageCode.ar,
            value: 'تحديد المشاريع يدوياً',
        },
    ],
    args: {
        jobPostIds: {
            type: 'ID',
            list: true,
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Job Posts',
                },
                {
                    languageCode: LanguageCode.ar,
                    value: 'المشاريع',
                },
            ],
        },
        combineWithAnd: combineWithAndArg,
    },
    apply: (qb, args) => {
        const emptyIds = args.jobPostIds.length === 0;
        const entityIdsKey = randomSuffix('entityIds');
        const clause = `entity.id IN (:...${entityIdsKey})`;
        const params = { [entityIdsKey]: args.jobPostIds };
        if (args.combineWithAnd === false) {
            if (emptyIds) {
                return qb;
            }
            return qb.orWhere(clause, params);
        } else {
            if (emptyIds) {
                return qb.andWhere('1 = 0');
            }
            return qb.andWhere(clause, params);
        }
    },
});

export const defaultCollectionFilters = [jobPostFacetValueCollectionFilter, jobPostIdCollectionFilter];
