import { InitialData, LanguageCode, Permission } from '@firelancerco/core';
import { CATEGORY_FACET_CODE, SKILL_FACET_CODE } from '@firelancerco/common/lib/shared-constants';

export const initialData: InitialData = {
    defaultLanguage: LanguageCode.en,
    roles: [
        {
            code: 'administrator',
            description: 'Administrator',
            permissions: [
                Permission.CreateCustomer,
                Permission.ReadCustomer,
                Permission.UpdateCustomer,
                Permission.DeleteCustomer,
            ],
        },
    ],
    facets: [
        {
            facetCode: CATEGORY_FACET_CODE,
            facetName: ['en:Category', 'ar:التصنيف'],
            facetValues: [
                ['en:Web Development', 'ar:برمجة المواقع وتطبيقات الويب'],
                ['en:Web & Mobile Design', 'ar:تصميم الويب والجوال'],
                ['en:QA Testing', 'ar:اختبار ضمان الجودة'],
                ['en:Desktop Application Development', 'ar:تطوير تطبيقات سطح المكتب'],
                ['en:Mobile Development', 'ar:تطوير التطبيقات الجوالة'],
                ['en:Language Tutoring & Interpretation', 'ar:الدروس اللغوية والترجمة'],
                ['en:Translation & Localization Services', 'ar:الترجمة'],
            ],
        },
        {
            facetCode: SKILL_FACET_CODE,
            facetName: ['en:Skills', 'ar:المهارات'],
            facetValues: [
                ['en:Front-End Development', 'ar:تطوير الواجهة الأمامية'],
                ['en:Google Chrome Extension', 'ar:اكستينشن جوجل كروم'],
                ['en:Page Speed Optimization', 'ar:تحسين سرعة الصفحة'],
                ['en:Responsive Design', 'ar:التصميم المتجاوب'],
                ['en:UI Animation', 'ar:انيميشن واجهة المستخدم'],
                ['en:Landing Page', 'ar:صفحة الهبوط'],
                ['en:Template Markup', 'ar:تهيئة القوالب'],
                ['en:Web Application', 'ar:تطبيق الويب'],
                ['en:Website', 'ar:موقع الويب'],
                ['en:Website Redesign', 'ar:إعادة تصميم الموقع'],
                ['en:Agile Software Development', 'ar:التطوير البرمجي الرشيق'],
                ['en:Blog', 'ar:مدونة'],
                ['en:Browser Extension', 'ar:ملحق المتصفح'],
                ['en:Ecommerce Website', 'ar:موقع تجارة إلكترونية'],
                ['en:JavaScript', 'ar:جافاسكريبت'],
                ['en:SQL', 'ar:إس كيو إل'],
                ['en:TypeScript', 'ar:تايب سكريبت'],
                ['en:CSS', 'ar:سي إس إس'],
                ['en:CSS 3', 'ar:سي إس إس 3'],
                ['en:HTML', 'ar:إتش تي إم إل'],
                ['en:HTML5', 'ar:إتش تي إم إل 5'],
                ['en:Sass', 'ar:ساس'],
                ['en:ECMAScript', 'ar:إيكما سكريبت'],
                ['en:CoffeeScript', 'ar:كوفي سكريبت'],
                ['en:Elm', 'ar:Elm'],
                ['en:HAML', 'ar:HAML'],
                ['en:Haxe', 'ar:Haxe'],
                ['en:Microsoft VBScript', 'ar:مايكروسوفت في بي سكريبت'],
                ['en:SCSS', 'ar:إس سي إس إس'],
                ['en:XHTML', 'ar:إكس إتش تي إم إل'],
                ['en:ReactJS', 'ar:رياكت جي إس'],
                ['en:NextJS', 'ar:نيكست جي إس'],
                ['en:SQLite', 'ar:إس كيو لايت'],
                ['en:Realm Database', 'ar:قاعدة بيانات ريلم'],
                ['en:LevelDB', 'ar:ليفل دي بي'],
                ['en:PaperDb', 'ar:بيبر دي بي'],
                ['en:Firebase', 'ar:فايربيز'],
                ['en:API', 'ar:واجهة برمجة التطبيقات'],
                ['en:Database', 'ar:قاعدة البيانات'],
                ['en:Database Architecture', 'ar:هندسة قواعد البيانات'],
                ['en:Database Design', 'ar:تصميم قواعد البيانات'],
                ['en:Java', 'ar:جافا'],
                ['en:Kotlin', 'ar:كوتلين'],
                ['en:Scala', 'ar:سكالا'],
                ['en:PHP', 'ar:بي إتش بي'],
            ],
        },
    ],
    collections: [
        // Web, Mobile, & Software Development
        {
            name: ['en:Web, Mobile, & Software Development'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: [
                            'Web Development',
                            'Web & Mobile Design',
                            'QA Testing',
                            'Desktop Application Development',
                            'Mobile Development',
                        ],
                        containsAny: true,
                    },
                },
            ],
            inheritFilters: false,
            assetPaths: ['web-mobile-software-development.png'],
        },
        {
            parentName: 'Web, Mobile, & Software Development',
            name: ['en:Web Development'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Web Development'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        {
            parentName: 'Web, Mobile, & Software Development',
            name: ['en:Web & Mobile Design'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Web & Mobile Design'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        {
            parentName: 'Web, Mobile, & Software Development',
            name: ['en:QA Testing'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['QA Testing'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        {
            parentName: 'Web, Mobile, & Software Development',
            name: ['en:Desktop Application Development'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Desktop Application Development'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        {
            parentName: 'Web, Mobile, & Software Development',
            name: ['en:Mobile Development'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Mobile Development'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        // Translation
        {
            name: ['en:Translation'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Language Tutoring & Interpretation', 'Translation & Localization Services'],
                        containsAny: true,
                    },
                },
            ],
            inheritFilters: false,
            assetPaths: ['translation.png'],
        },
        {
            parentName: 'Translation',
            name: ['en:Language Tutoring & Interpretation'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Language Tutoring & Interpretation'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
        {
            parentName: 'Translation',
            name: ['en:Translation & Localization Services'],
            filters: [
                {
                    code: 'job-post-facet-value-filter',
                    args: {
                        facetValueNames: ['Translation & Localization Services'],
                        containsAny: false,
                    },
                },
            ],
            inheritFilters: false,
        },
    ],
    countries: [
        {
            name: 'Egypt',
            code: 'EG',
            zone: 'Africa',
        },
    ],
};
