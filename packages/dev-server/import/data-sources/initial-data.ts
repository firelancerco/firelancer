import { InitialData, LanguageCode, Permission } from '@firelancerco/core';

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
        'category:Web Development',
        'category:Web & Mobile Design',
        'category:QA Testing',
        'category:Desktop Application Development',
        'category:Mobile Development',
        'category:Language Tutoring & Interpretation',
        'category:Translation & Localization Services',
        'skill:Front-End Development',
        'skill:Google Chrome Extension',
        'skill:Page Speed Optimization',
        'skill:Responsive Desgin',
        'skill:UI Animation',
        'skill:Landing Page',
        'skill:Template Markup',
        'skill:Web Application',
        'skill:Website',
        'skill:Website Redesign',
        'skill:Agile Software Development',
        'skill:Blog',
        'skill:Browser Extension',
        'skill:Ecommerce Website',
        'skill:JavaScript',
        'skill:SQL',
        'skill:TypeScript',
        'skill:CSS',
        'skill:CSS 3',
        'skill:HTML',
        'skill:HTML5',
        'skill:Sass',
        'skill:ECMAScript',
        'skill:CoffeeScript',
        'skill:Elm',
        'skill:HAML',
        'skill:Haxe',
        'skill:Microsoft VBScript',
        'skill:SCSS',
        'skill:XHTML',
        'skill:ReactJS',
        'skill:NextJS',
        'skill:SQLite',
        'skill:Realm Database',
        'skill:LevelDB',
        'skill:PaperDb',
        'skill:Firebase',
        'skill:API',
        'skill:Database',
        'skill:Database Architecture',
        'skill:Database Design',
        'skill:Java',
        'skill:Kotlin',
        'skill:Scala',
        'skill:PHP',
    ],
    collections: [
        // Web, Mobile, & Software Development
        {
            name: 'Web, Mobile, & Software Development',
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
            name: 'Web Development',
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
            name: 'Web & Mobile Design',
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
            name: 'QA Testing',
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
            name: 'Desktop Application Development',
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
            name: 'Mobile Development',
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
            name: 'Translation',
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
            name: 'Language Tutoring & Interpretation',
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
            name: 'Translation & Localization Services',
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
    countries: [{ name: 'Egypt', code: 'EG', zone: 'Africa' }],
};
