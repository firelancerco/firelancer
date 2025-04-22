import z from 'zod';

/**
 * @description
 * Languages in the form of a ISO 639-1 language code with optional
 * region or script modifier (e.g. de_AT). The selection available is based
 * on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
 * and includes the major spoken languages of the world and any widely-used variants.
 */
// prettier-ignore
export const LanguageCode = z.enum([
    'af', 'ak', 'am', 'ar', 'as', 'az', 'be', 'bg', 'bm', 'bn', 'bo', 'br', 
    'bs', 'ca', 'ce', 'co', 'cs', 'cu', 'cy', 'da', 'de', 'de_AT', 'de_CH', 
    'dz', 'ee', 'el', 'en', 'en_AU', 'en_CA', 'en_GB', 'en_US', 'eo', 'es', 
    'es_ES', 'es_MX', 'et', 'eu', 'fa', 'fa_AF', 'ff', 'fi', 'fo', 'fr', 
    'fr_CA', 'fr_CH', 'fy', 'ga', 'gd', 'gl', 'gu', 'gv', 'ha', 'he', 'hi', 
    'hr', 'ht', 'hu', 'hy', 'ia', 'id', 'ig', 'ii', 'is', 'it', 'ja', 'jv', 
    'ka', 'ki', 'kk', 'kl', 'km', 'kn', 'ko', 'ks', 'ku', 'kw', 'ky', 'la', 
    'lb', 'lg', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 
    'mr', 'ms', 'mt', 'my', 'nb', 'nd', 'ne', 'nl', 'nl_BE', 'nn', 'ny', 'om', 
    'or', 'os', 'pa', 'pl', 'ps', 'pt', 'pt_BR', 'pt_PT', 'qu', 'rm', 'rn', 
    'ro', 'ro_MD', 'ru', 'rw', 'sa', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 
    'sn', 'so', 'sq', 'sr', 'st', 'su', 'sv', 'sw', 'sw_CD', 'ta', 'te', 'tg', 
    'th', 'ti', 'tk', 'to', 'tr', 'tt', 'ug', 'uk', 'ur', 'uz', 'vi', 'vo', 
    'wo', 'xh', 'yi', 'yo', 'zh', 'zh_Hans', 'zh_Hant', 'zu'
]);
