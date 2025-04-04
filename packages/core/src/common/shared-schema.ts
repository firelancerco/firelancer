/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    MAX_ASSETS_ARRAY_SIZE,
    MIN_ASSETS_ARRAY_SIZE,
    PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS,
    PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS,
} from '@firelancerco/common/lib/shared-constants';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsDefined,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    MinLength,
    NotEquals,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

import { IsEntityId } from './entity-id-validator';

export type ID = string | number;

export enum CustomerType {
    SELLER = 'SELLER',
    BUYER = 'BUYER',
}

export enum Permission {
    /** Authenticated means simply that the user is logged in */
    Authenticated = 'Authenticated',
    /** Grants permission to create Administrator */
    CreateAdministrator = 'CreateAdministrator',
    /** Grants permission to create Asset */
    CreateAsset = 'CreateAsset',
    /** Grants permission to create Customer */
    CreateCustomer = 'CreateCustomer',
    /** Grants permission to create JobPost */
    CreateJobPost = 'CreateJobPost',
    /** Grants permission to create Facet */
    CreateFacet = 'CreateFacet',
    /** Grants permission to delete Administrator */
    DeleteAdministrator = 'DeleteAdministrator',
    /** Grants permission to delete Asset */
    DeleteAsset = 'DeleteAsset',
    /** Grants permission to delete Customer */
    DeleteCustomer = 'DeleteCustomer',
    /** Grants permission to delete JobPost */
    DeleteJobPost = 'DeleteJobPost',
    /** Grants permission to delete Facet */
    DeleteFacet = 'DeleteFacet',
    /** Owner means the user owns this entity, e.g. a Customer's own Order */
    Owner = 'Owner',
    /** Public means any unauthenticated user may perform the operation */
    Public = 'Public',
    /** Grants permission to read Administrator */
    ReadAdministrator = 'ReadAdministrator',
    /** Grants permission to read Asset */
    ReadAsset = 'ReadAsset',
    /** Grants permission to read Customer */
    ReadCustomer = 'ReadCustomer',
    /** Grants permission to read JobPost */
    ReadJobPost = 'ReadJobPost',
    /** Grants permission to read Facet */
    ReadFacet = 'ReadFacet',
    /** SuperAdmin has unrestricted access to all operations */
    SuperAdmin = 'SuperAdmin',
    /** Grants permission to update Administrator */
    UpdateAdministrator = 'UpdateAdministrator',
    /** Grants permission to update Asset */
    UpdateAsset = 'UpdateAsset',
    /** Grants permission to update Customer */
    UpdateCustomer = 'UpdateCustomer',
    /** Grants permission to update JobPost */
    UpdateJobPost = 'UpdateJobPost',
    /** Grants permission to update Facet */
    UpdateFacet = 'UpdateFacet',
    /** Grants permission to publish new JobPost */
    PublishJobPost = 'PublishJobPost',
}

export enum HistoryEntryType {
    CUSTOMER_EMAIL_UPDATE_REQUESTED = 'CUSTOMER_EMAIL_UPDATE_REQUESTED',
    CUSTOMER_EMAIL_UPDATE_VERIFIED = 'CUSTOMER_EMAIL_UPDATE_VERIFIED',
    CUSTOMER_DETAIL_UPDATED = 'CUSTOMER_DETAIL_UPDATED',
    CUSTOMER_PASSWORD_RESET_REQUESTED = 'CUSTOMER_PASSWORD_RESET_REQUESTED',
    CUSTOMER_PASSWORD_RESET_VERIFIED = 'CUSTOMER_PASSWORD_RESET_VERIFIED',
    CUSTOMER_PASSWORD_UPDATED = 'CUSTOMER_PASSWORD_UPDATED',
    CUSTOMER_REGISTERED = 'CUSTOMER_REGISTERED',
    CUSTOMER_VERIFIED = 'CUSTOMER_VERIFIED',
}

export enum JobPostVisibility {
    PUBLIC = 'PUBLIC',
    INVITE_ONLY = 'INVITE_ONLY',
}

export enum JobPostStatus {
    /**  Job is saved but not published. */
    DRAFT = 'DRAFT',
    /** Job is published and open for proposals. */
    ACTIVE = 'ACTIVE',
    /** Job is closed and no longer accepting bids (may reopen later) */
    CLOSED = 'CLOSED',
}

export enum AssetType {
    BINARY = 'BINARY',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum BalanceEntryType {
    FIXED_PRICE = 'FIXED_PRICE',
    BONUS = 'BONUS',
    PAYMENT = 'PAYMENT',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum BalanceEntryStatus {
    /** The balance entry is pending settlement */
    PENDING = 'PENDING',
    /** The balance entry has been settled */
    SETTLED = 'SETTLED',
    /** The balance entry has been rejected */
    REJECTED = 'REJECTED',
}

/**
 * @description
 * The state of a Job in the JobQueue
 */
export enum JobState {
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    RETRYING = 'RETRYING',
    RUNNING = 'RUNNING',
}

export enum DeletionResult {
    /** The entity was successfully deleted */
    DELETED = 'DELETED',
    /** Deletion did not take place, reason given in message */
    NOT_DELETED = 'NOT_DELETED',
}

/**
 * @description
 * Certain entities (those which implement ConfigurableOperationDef) allow arbitrary
 * configuration arguments to be specified which can then be set in the admin-ui and used in
 * the business logic of the app. These are the valid data types of such arguments.
 * The data type influences:
 *
 * 1. How the argument form field is rendered in the admin-ui
 * 2. The JavaScript type into which the value is coerced before being passed to the business logic.
 */
export type ConfigArgType = 'string' | 'int' | 'float' | 'boolean' | 'datetime' | 'ID';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

/**
 * @description
 * ISO 4217 currency code
 */
export enum CurrencyCode {
    /** United Arab Emirates dirham */
    AED = 'AED',
    /** Afghan afghani */
    AFN = 'AFN',
    /** Albanian lek */
    ALL = 'ALL',
    /** Armenian dram */
    AMD = 'AMD',
    /** Netherlands Antillean guilder */
    ANG = 'ANG',
    /** Angolan kwanza */
    AOA = 'AOA',
    /** Argentine peso */
    ARS = 'ARS',
    /** Australian dollar */
    AUD = 'AUD',
    /** Aruban florin */
    AWG = 'AWG',
    /** Azerbaijani manat */
    AZN = 'AZN',
    /** Bosnia and Herzegovina convertible mark */
    BAM = 'BAM',
    /** Barbados dollar */
    BBD = 'BBD',
    /** Bangladeshi taka */
    BDT = 'BDT',
    /** Bulgarian lev */
    BGN = 'BGN',
    /** Bahraini dinar */
    BHD = 'BHD',
    /** Burundian franc */
    BIF = 'BIF',
    /** Bermudian dollar */
    BMD = 'BMD',
    /** Brunei dollar */
    BND = 'BND',
    /** Boliviano */
    BOB = 'BOB',
    /** Brazilian real */
    BRL = 'BRL',
    /** Bahamian dollar */
    BSD = 'BSD',
    /** Bhutanese ngultrum */
    BTN = 'BTN',
    /** Botswana pula */
    BWP = 'BWP',
    /** Belarusian ruble */
    BYN = 'BYN',
    /** Belize dollar */
    BZD = 'BZD',
    /** Canadian dollar */
    CAD = 'CAD',
    /** Congolese franc */
    CDF = 'CDF',
    /** Swiss franc */
    CHF = 'CHF',
    /** Chilean peso */
    CLP = 'CLP',
    /** Renminbi (Chinese) yuan */
    CNY = 'CNY',
    /** Colombian peso */
    COP = 'COP',
    /** Costa Rican colon */
    CRC = 'CRC',
    /** Cuban convertible peso */
    CUC = 'CUC',
    /** Cuban peso */
    CUP = 'CUP',
    /** Cape Verde escudo */
    CVE = 'CVE',
    /** Czech koruna */
    CZK = 'CZK',
    /** Djiboutian franc */
    DJF = 'DJF',
    /** Danish krone */
    DKK = 'DKK',
    /** Dominican peso */
    DOP = 'DOP',
    /** Algerian dinar */
    DZD = 'DZD',
    /** Egyptian pound */
    EGP = 'EGP',
    /** Eritrean nakfa */
    ERN = 'ERN',
    /** Ethiopian birr */
    ETB = 'ETB',
    /** Euro */
    EUR = 'EUR',
    /** Fiji dollar */
    FJD = 'FJD',
    /** Falkland Islands pound */
    FKP = 'FKP',
    /** Pound sterling */
    GBP = 'GBP',
    /** Georgian lari */
    GEL = 'GEL',
    /** Ghanaian cedi */
    GHS = 'GHS',
    /** Gibraltar pound */
    GIP = 'GIP',
    /** Gambian dalasi */
    GMD = 'GMD',
    /** Guinean franc */
    GNF = 'GNF',
    /** Guatemalan quetzal */
    GTQ = 'GTQ',
    /** Guyanese dollar */
    GYD = 'GYD',
    /** Hong Kong dollar */
    HKD = 'HKD',
    /** Honduran lempira */
    HNL = 'HNL',
    /** Croatian kuna */
    HRK = 'HRK',
    /** Haitian gourde */
    HTG = 'HTG',
    /** Hungarian forint */
    HUF = 'HUF',
    /** Indonesian rupiah */
    IDR = 'IDR',
    /** Israeli new shekel */
    ILS = 'ILS',
    /** Indian rupee */
    INR = 'INR',
    /** Iraqi dinar */
    IQD = 'IQD',
    /** Iranian rial */
    IRR = 'IRR',
    /** Icelandic króna */
    ISK = 'ISK',
    /** Jamaican dollar */
    JMD = 'JMD',
    /** Jordanian dinar */
    JOD = 'JOD',
    /** Japanese yen */
    JPY = 'JPY',
    /** Kenyan shilling */
    KES = 'KES',
    /** Kyrgyzstani som */
    KGS = 'KGS',
    /** Cambodian riel */
    KHR = 'KHR',
    /** Comoro franc */
    KMF = 'KMF',
    /** North Korean won */
    KPW = 'KPW',
    /** South Korean won */
    KRW = 'KRW',
    /** Kuwaiti dinar */
    KWD = 'KWD',
    /** Cayman Islands dollar */
    KYD = 'KYD',
    /** Kazakhstani tenge */
    KZT = 'KZT',
    /** Lao kip */
    LAK = 'LAK',
    /** Lebanese pound */
    LBP = 'LBP',
    /** Sri Lankan rupee */
    LKR = 'LKR',
    /** Liberian dollar */
    LRD = 'LRD',
    /** Lesotho loti */
    LSL = 'LSL',
    /** Libyan dinar */
    LYD = 'LYD',
    /** Moroccan dirham */
    MAD = 'MAD',
    /** Moldovan leu */
    MDL = 'MDL',
    /** Malagasy ariary */
    MGA = 'MGA',
    /** Macedonian denar */
    MKD = 'MKD',
    /** Myanmar kyat */
    MMK = 'MMK',
    /** Mongolian tögrög */
    MNT = 'MNT',
    /** Macanese pataca */
    MOP = 'MOP',
    /** Mauritanian ouguiya */
    MRU = 'MRU',
    /** Mauritian rupee */
    MUR = 'MUR',
    /** Maldivian rufiyaa */
    MVR = 'MVR',
    /** Malawian kwacha */
    MWK = 'MWK',
    /** Mexican peso */
    MXN = 'MXN',
    /** Malaysian ringgit */
    MYR = 'MYR',
    /** Mozambican metical */
    MZN = 'MZN',
    /** Namibian dollar */
    NAD = 'NAD',
    /** Nigerian naira */
    NGN = 'NGN',
    /** Nicaraguan córdoba */
    NIO = 'NIO',
    /** Norwegian krone */
    NOK = 'NOK',
    /** Nepalese rupee */
    NPR = 'NPR',
    /** New Zealand dollar */
    NZD = 'NZD',
    /** Omani rial */
    OMR = 'OMR',
    /** Panamanian balboa */
    PAB = 'PAB',
    /** Peruvian sol */
    PEN = 'PEN',
    /** Papua New Guinean kina */
    PGK = 'PGK',
    /** Philippine peso */
    PHP = 'PHP',
    /** Pakistani rupee */
    PKR = 'PKR',
    /** Polish złoty */
    PLN = 'PLN',
    /** Paraguayan guaraní */
    PYG = 'PYG',
    /** Qatari riyal */
    QAR = 'QAR',
    /** Romanian leu */
    RON = 'RON',
    /** Serbian dinar */
    RSD = 'RSD',
    /** Russian ruble */
    RUB = 'RUB',
    /** Rwandan franc */
    RWF = 'RWF',
    /** Saudi riyal */
    SAR = 'SAR',
    /** Solomon Islands dollar */
    SBD = 'SBD',
    /** Seychelles rupee */
    SCR = 'SCR',
    /** Sudanese pound */
    SDG = 'SDG',
    /** Swedish krona/kronor */
    SEK = 'SEK',
    /** Singapore dollar */
    SGD = 'SGD',
    /** Saint Helena pound */
    SHP = 'SHP',
    /** Sierra Leonean leone */
    SLL = 'SLL',
    /** Somali shilling */
    SOS = 'SOS',
    /** Surinamese dollar */
    SRD = 'SRD',
    /** South Sudanese pound */
    SSP = 'SSP',
    /** São Tomé and Príncipe dobra */
    STN = 'STN',
    /** Salvadoran colón */
    SVC = 'SVC',
    /** Syrian pound */
    SYP = 'SYP',
    /** Swazi lilangeni */
    SZL = 'SZL',
    /** Thai baht */
    THB = 'THB',
    /** Tajikistani somoni */
    TJS = 'TJS',
    /** Turkmenistan manat */
    TMT = 'TMT',
    /** Tunisian dinar */
    TND = 'TND',
    /** Tongan paʻanga */
    TOP = 'TOP',
    /** Turkish lira */
    TRY = 'TRY',
    /** Trinidad and Tobago dollar */
    TTD = 'TTD',
    /** New Taiwan dollar */
    TWD = 'TWD',
    /** Tanzanian shilling */
    TZS = 'TZS',
    /** Ukrainian hryvnia */
    UAH = 'UAH',
    /** Ugandan shilling */
    UGX = 'UGX',
    /** United States dollar */
    USD = 'USD',
    /** Uruguayan peso */
    UYU = 'UYU',
    /** Uzbekistan som */
    UZS = 'UZS',
    /** Venezuelan bolívar soberano */
    VES = 'VES',
    /** Vietnamese đồng */
    VND = 'VND',
    /** Vanuatu vatu */
    VUV = 'VUV',
    /** Samoan tala */
    WST = 'WST',
    /** CFA franc BEAC */
    XAF = 'XAF',
    /** East Caribbean dollar */
    XCD = 'XCD',
    /** CFA franc BCEAO */
    XOF = 'XOF',
    /** CFP franc (franc Pacifique) */
    XPF = 'XPF',
    /** Yemeni rial */
    YER = 'YER',
    /** South African rand */
    ZAR = 'ZAR',
    /** Zambian kwacha */
    ZMW = 'ZMW',
    /** Zimbabwean dollar */
    ZWL = 'ZWL',
}

/**
 * @description
 * Languages in the form of a ISO 639-1 language code with optional
 * region or script modifier (e.g. de_AT). The selection available is based
 * on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
 * and includes the major spoken languages of the world and any widely-used variants.
 */
export enum LanguageCode {
    /** Afrikaans */
    af = 'af',
    /** Akan */
    ak = 'ak',
    /** Amharic */
    am = 'am',
    /** Arabic */
    ar = 'ar',
    /** Assamese */
    as = 'as',
    /** Azerbaijani */
    az = 'az',
    /** Belarusian */
    be = 'be',
    /** Bulgarian */
    bg = 'bg',
    /** Bambara */
    bm = 'bm',
    /** Bangla */
    bn = 'bn',
    /** Tibetan */
    bo = 'bo',
    /** Breton */
    br = 'br',
    /** Bosnian */
    bs = 'bs',
    /** Catalan */
    ca = 'ca',
    /** Chechen */
    ce = 'ce',
    /** Corsican */
    co = 'co',
    /** Czech */
    cs = 'cs',
    /** Church Slavic */
    cu = 'cu',
    /** Welsh */
    cy = 'cy',
    /** Danish */
    da = 'da',
    /** German */
    de = 'de',
    /** Austrian German */
    de_AT = 'de_AT',
    /** Swiss High German */
    de_CH = 'de_CH',
    /** Dzongkha */
    dz = 'dz',
    /** Ewe */
    ee = 'ee',
    /** Greek */
    el = 'el',
    /** English */
    en = 'en',
    /** Australian English */
    en_AU = 'en_AU',
    /** Canadian English */
    en_CA = 'en_CA',
    /** British English */
    en_GB = 'en_GB',
    /** American English */
    en_US = 'en_US',
    /** Esperanto */
    eo = 'eo',
    /** Spanish */
    es = 'es',
    /** European Spanish */
    es_ES = 'es_ES',
    /** Mexican Spanish */
    es_MX = 'es_MX',
    /** Estonian */
    et = 'et',
    /** Basque */
    eu = 'eu',
    /** Persian */
    fa = 'fa',
    /** Dari */
    fa_AF = 'fa_AF',
    /** Fulah */
    ff = 'ff',
    /** Finnish */
    fi = 'fi',
    /** Faroese */
    fo = 'fo',
    /** French */
    fr = 'fr',
    /** Canadian French */
    fr_CA = 'fr_CA',
    /** Swiss French */
    fr_CH = 'fr_CH',
    /** Western Frisian */
    fy = 'fy',
    /** Irish */
    ga = 'ga',
    /** Scottish Gaelic */
    gd = 'gd',
    /** Galician */
    gl = 'gl',
    /** Gujarati */
    gu = 'gu',
    /** Manx */
    gv = 'gv',
    /** Hausa */
    ha = 'ha',
    /** Hebrew */
    he = 'he',
    /** Hindi */
    hi = 'hi',
    /** Croatian */
    hr = 'hr',
    /** Haitian Creole */
    ht = 'ht',
    /** Hungarian */
    hu = 'hu',
    /** Armenian */
    hy = 'hy',
    /** Interlingua */
    ia = 'ia',
    /** Indonesian */
    id = 'id',
    /** Igbo */
    ig = 'ig',
    /** Sichuan Yi */
    ii = 'ii',
    /** Icelandic */
    is = 'is',
    /** Italian */
    it = 'it',
    /** Japanese */
    ja = 'ja',
    /** Javanese */
    jv = 'jv',
    /** Georgian */
    ka = 'ka',
    /** Kikuyu */
    ki = 'ki',
    /** Kazakh */
    kk = 'kk',
    /** Kalaallisut */
    kl = 'kl',
    /** Khmer */
    km = 'km',
    /** Kannada */
    kn = 'kn',
    /** Korean */
    ko = 'ko',
    /** Kashmiri */
    ks = 'ks',
    /** Kurdish */
    ku = 'ku',
    /** Cornish */
    kw = 'kw',
    /** Kyrgyz */
    ky = 'ky',
    /** Latin */
    la = 'la',
    /** Luxembourgish */
    lb = 'lb',
    /** Ganda */
    lg = 'lg',
    /** Lingala */
    ln = 'ln',
    /** Lao */
    lo = 'lo',
    /** Lithuanian */
    lt = 'lt',
    /** Luba-Katanga */
    lu = 'lu',
    /** Latvian */
    lv = 'lv',
    /** Malagasy */
    mg = 'mg',
    /** Maori */
    mi = 'mi',
    /** Macedonian */
    mk = 'mk',
    /** Malayalam */
    ml = 'ml',
    /** Mongolian */
    mn = 'mn',
    /** Marathi */
    mr = 'mr',
    /** Malay */
    ms = 'ms',
    /** Maltese */
    mt = 'mt',
    /** Burmese */
    my = 'my',
    /** Norwegian Bokmål */
    nb = 'nb',
    /** North Ndebele */
    nd = 'nd',
    /** Nepali */
    ne = 'ne',
    /** Dutch */
    nl = 'nl',
    /** Flemish */
    nl_BE = 'nl_BE',
    /** Norwegian Nynorsk */
    nn = 'nn',
    /** Nyanja */
    ny = 'ny',
    /** Oromo */
    om = 'om',
    /** Odia */
    or = 'or',
    /** Ossetic */
    os = 'os',
    /** Punjabi */
    pa = 'pa',
    /** Polish */
    pl = 'pl',
    /** Pashto */
    ps = 'ps',
    /** Portuguese */
    pt = 'pt',
    /** Brazilian Portuguese */
    pt_BR = 'pt_BR',
    /** European Portuguese */
    pt_PT = 'pt_PT',
    /** Quechua */
    qu = 'qu',
    /** Romansh */
    rm = 'rm',
    /** Rundi */
    rn = 'rn',
    /** Romanian */
    ro = 'ro',
    /** Moldavian */
    ro_MD = 'ro_MD',
    /** Russian */
    ru = 'ru',
    /** Kinyarwanda */
    rw = 'rw',
    /** Sanskrit */
    sa = 'sa',
    /** Sindhi */
    sd = 'sd',
    /** Northern Sami */
    se = 'se',
    /** Sango */
    sg = 'sg',
    /** Sinhala */
    si = 'si',
    /** Slovak */
    sk = 'sk',
    /** Slovenian */
    sl = 'sl',
    /** Samoan */
    sm = 'sm',
    /** Shona */
    sn = 'sn',
    /** Somali */
    so = 'so',
    /** Albanian */
    sq = 'sq',
    /** Serbian */
    sr = 'sr',
    /** Southern Sotho */
    st = 'st',
    /** Sundanese */
    su = 'su',
    /** Swedish */
    sv = 'sv',
    /** Swahili */
    sw = 'sw',
    /** Congo Swahili */
    sw_CD = 'sw_CD',
    /** Tamil */
    ta = 'ta',
    /** Telugu */
    te = 'te',
    /** Tajik */
    tg = 'tg',
    /** Thai */
    th = 'th',
    /** Tigrinya */
    ti = 'ti',
    /** Turkmen */
    tk = 'tk',
    /** Tongan */
    to = 'to',
    /** Turkish */
    tr = 'tr',
    /** Tatar */
    tt = 'tt',
    /** Uyghur */
    ug = 'ug',
    /** Ukrainian */
    uk = 'uk',
    /** Urdu */
    ur = 'ur',
    /** Uzbek */
    uz = 'uz',
    /** Vietnamese */
    vi = 'vi',
    /** Volapük */
    vo = 'vo',
    /** Wolof */
    wo = 'wo',
    /** Xhosa */
    xh = 'xh',
    /** Yiddish */
    yi = 'yi',
    /** Yoruba */
    yo = 'yo',
    /** Chinese */
    zh = 'zh',
    /** Simplified Chinese */
    zh_Hans = 'zh_Hans',
    /** Traditional Chinese */
    zh_Hant = 'zh_Hant',
    /** Zulu */
    zu = 'zu',
}

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}

export class PaginatedList<T> {
    @IsArray()
    items: Array<T>;

    @IsNumber()
    totalItems: number;
}

export class NumberRange {
    @IsNumber()
    @Type(() => Number)
    end: number;

    @IsNumber()
    @Type(() => Number)
    start: number;
}

export class DateRange {
    @IsDate()
    end: Date;

    @IsDate()
    start: Date;
}

export class LocalizedString {
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    value: string;
}

/** Operators for filtering on a String field */
export class StringOperators {
    @IsOptional()
    @IsString()
    contains?: string;

    @IsOptional()
    @IsString()
    eq?: string;

    @IsOptional()
    @IsString()
    in?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isNull?: boolean;

    @IsOptional()
    @IsString()
    notContains?: string;

    @IsOptional()
    @IsString()
    notEq?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notIn?: Array<string>;

    @IsOptional()
    @IsString()
    regex?: string;
}

/** Operators for filtering on a Int or Float field */
export class NumberOperators {
    @IsOptional()
    @IsObject()
    between?: NumberRange;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    eq?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    gt?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    gte?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isNull?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lt?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lte?: number;
}

/** Operators for filtering on a Boolean field */
export class BooleanOperators {
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    eq?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isNull?: boolean;
}

/** Operators for filtering on a DateTime field */
export class DateOperators {
    @IsOptional()
    @IsDate()
    after?: Date;

    @IsOptional()
    @IsDate()
    before?: Date;

    @IsOptional()
    @IsObject()
    between?: DateRange;

    @IsOptional()
    @IsDate()
    eq?: Date;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isNull?: boolean;
}

export class IdOperators {
    @IsOptional()
    @IsString()
    eq?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    in?: Array<string>;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isNull?: boolean;

    @IsOptional()
    @IsString()
    notEq?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notIn?: Array<string>;
}

export class ConfigArgInput {
    @IsString()
    name: string;

    @IsString()
    value: string;
}

export class ConfigurableOperationInput {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigArgInput)
    arguments: Array<ConfigArgInput>;

    @IsString()
    code: string;
}

export class ConfigArgDefinition {
    @IsOptional()
    @IsString()
    defaultValue?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    label?: string;

    @IsBoolean()
    list: boolean;

    @IsString()
    name: string;

    @IsBoolean()
    required: boolean;

    @IsString()
    type: string;
}

export class ConfigurableOperationDefinition {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigArgDefinition)
    args: Array<ConfigArgDefinition>;

    @IsString()
    code: string;

    @IsString()
    description: string;
}

/* --------------- */

export class Coordinate {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}

export class AuthenticationMethod {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsOptional()
    @IsString()
    strategy?: string;

    user?: User;
}

export class Role {
    @IsEntityId()
    id: ID;

    @IsString()
    code: string;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    description: string;

    @IsEnum(Permission, { each: true })
    permissions: Array<Permission>;
}

export class User {
    @IsEntityId()
    id: ID;

    @ValidateNested({ each: true })
    @Type(() => AuthenticationMethod)
    authenticationMethods: Array<AuthenticationMethod>;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    identifier: string;

    @IsOptional()
    @IsDate()
    lastLogin?: Date | null;

    @IsBoolean()
    @Type(() => Boolean)
    verified: boolean;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Role)
    roles?: Array<Role>;
}

export class Customer {
    @IsOptional()
    @IsDate()
    deletedAt: Date | null;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsEmail()
    emailAddress: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber()
    phoneNumber: string | null;

    @IsOptional()
    @Type(() => User)
    user?: User;
}

export class FacetTranslation {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    name: string;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;
}

export class Facet {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    code: string;

    @IsBoolean()
    @Type(() => Boolean)
    isPrivate: boolean;

    @IsOptional()
    @IsEnum(LanguageCode)
    languageCode?: LanguageCode;

    @IsOptional()
    @IsString()
    name?: string;

    @ValidateNested({ each: true })
    @Type(() => FacetTranslation)
    translations: Array<FacetTranslation>;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacetValue)
    values?: Array<FacetValue>;
}

export class FacetValue {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    code: string;

    @IsEntityId()
    facetId: ID;

    @IsOptional()
    @Type(() => Facet)
    facet?: Facet;

    @IsOptional()
    @IsEnum(LanguageCode)
    languageCode?: LanguageCode;

    @IsOptional()
    @IsString()
    name?: string;

    @ValidateNested({ each: true })
    @Type(() => FacetValueTranslation)
    translations: Array<FacetValueTranslation>;
}

export class FacetValueTranslation {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    name: string;
}

export class Asset {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsInt()
    fileSize: number;

    @IsOptional()
    @Type(() => Coordinate)
    focalPoint?: Coordinate;

    @IsInt()
    height: number;

    @IsString()
    mimeType: string;

    @IsString()
    name: string;

    @IsString()
    preview: string;

    @IsString()
    source: string;

    @IsEnum(AssetType)
    type: AssetType;

    @IsInt()
    width: number;
}

export abstract class OrderableAsset {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsEntityId()
    assetId: ID;

    @IsOptional()
    @Type(() => Asset)
    asset?: Asset;

    @IsInt()
    position: number;
}

export class JobPost {
    @IsEntityId()
    id: ID;

    @IsEntityId()
    customerId: ID;

    @IsOptional()
    @Type(() => Customer)
    customer?: Customer;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsOptional()
    @IsDate()
    deletedAt: Date | null;

    @IsOptional()
    @IsDate()
    publishedAt: Date | null;

    @IsOptional()
    @IsDate()
    closedAt: Date | null;

    @IsOptional()
    @IsString()
    title: string | null;

    @IsOptional()
    @IsString()
    description: string | null;

    @IsEnum(JobPostVisibility)
    visibility: JobPostVisibility;

    @IsOptional()
    @IsNumber()
    budget: number | null;

    @IsOptional()
    @IsString()
    currencyCode: string | null;

    @IsEnum(JobPostStatus)
    status: JobPostStatus;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => JobPostAsset)
    assets?: JobPostAsset[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacetValue)
    requiredSkills: FacetValue[];

    @IsOptional()
    @ValidateNested()
    @Type(() => FacetValue)
    requiredCategory: FacetValue | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => FacetValue)
    requiredExperienceLevel: FacetValue | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => FacetValue)
    requiredJobDuration: FacetValue | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => FacetValue)
    requiredJobScope: FacetValue | null;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacetValue)
    facetValues?: FacetValue[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Collection)
    collections?: Collection[];
}

export class JobPostAsset extends OrderableAsset {
    @IsEntityId()
    jobPostId: ID;

    @IsOptional()
    @Type(() => JobPost)
    jobPost?: JobPost;
}

export class CollectionBreadcrumb {
    @IsEntityId()
    id: ID;

    @IsString()
    name: string;

    @IsString()
    slug: string;
}

export class Collection {
    @IsEntityId()
    id: ID;

    @ValidateNested({ each: true })
    @Type(() => CollectionAsset)
    assets?: Array<CollectionAsset>;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CollectionBreadcrumb)
    breadcrumbs?: Array<CollectionBreadcrumb>;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Collection)
    children?: Array<Collection>;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    description: string;

    @IsOptional()
    @Type(() => Asset)
    featuredAsset?: Asset;

    @ValidateNested({ each: true })
    @Type(() => ConfigurableOperation)
    filters: Array<ConfigurableOperation>;

    @IsBoolean()
    @Type(() => Boolean)
    inheritFilters: boolean;

    @IsBoolean()
    @Type(() => Boolean)
    isPrivate: boolean;

    @IsOptional()
    @IsEnum(LanguageCode)
    languageCode?: LanguageCode;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Collection)
    parent?: Collection;

    @IsOptional()
    @IsEntityId()
    parentId?: ID | null;

    @IsInt()
    @ValidateNested()
    position: number;

    @IsString()
    slug: string;

    @ValidateNested({ each: true })
    @Type(() => CollectionTranslation)
    translations: Array<CollectionTranslation>;

    // TODO
    // jobPosts: JobPostList;
}

export class CollectionAsset extends OrderableAsset {
    @IsEntityId()
    collectionId: ID;

    @Type(() => Collection)
    collection: Collection;
}

export class CollectionTranslation {
    @IsEntityId()
    id: ID;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    description: string;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    name: string;

    @IsString()
    slug: string;
}

/* --------------- */

export class CreateAdministratorInput {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    emailAddress: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEntityId({ each: true })
    roleIds: Array<ID>;
}

export class UpdateAdministratorInput {
    @IsEntityId()
    id: ID;

    @IsString()
    @IsOptional()
    @IsEmail()
    emailAddress?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsOptional()
    @IsEntityId({ each: true })
    roleIds?: Array<ID>;
}

export class UpdateActiveAdministratorInput {
    @IsString()
    @IsOptional()
    @IsEmail()
    emailAddress?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsString()
    @IsOptional()
    password?: string;
}

export class CurrentUserRole {
    @IsString()
    code: string;

    @IsString()
    description: string;
}

export class CurrentUser {
    @IsEntityId()
    id: ID;

    @IsString()
    identifier: string;

    @ValidateNested({ each: true })
    @Type(() => CurrentUserRole)
    roles: Array<CurrentUserRole>;

    @IsEnum(Permission, { each: true })
    permissions: Array<Permission>;
}

export class MutationLoginArgs {
    @IsString()
    password: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    rememberMe?: boolean;

    @IsString()
    username: string;
}

export class NativeAuthInput {
    @IsString()
    password: string;

    @IsString()
    username: string;
}

export class AuthenticationInput {
    @IsOptional()
    @ValidateNested()
    native?: NativeAuthInput;
}

export class MutationAuthenticateArgs {
    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => AuthenticationInput)
    input: AuthenticationInput;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    rememberMe?: boolean;
}

export class CreateCustomerInput {
    @IsString()
    @IsEmail()
    emailAddress: string;

    @IsEnum(CustomerType)
    customerType: CustomerType;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
}

export class UpdateCustomerInput {
    @IsEntityId()
    id: ID;

    @IsString()
    @IsOptional()
    @IsEmail()
    emailAddress?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
}

export class RegisterCustomerInput {
    @IsString()
    @IsEmail()
    emailAddress: string;

    @IsEnum(CustomerType)
    customerType: CustomerType;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
}

export class CreateRoleInput {
    @IsString()
    code: string;

    @IsString()
    description: string;

    @IsEnum(Permission, { each: true })
    permissions: Array<Permission>;
}

export class UpdateRoleInput {
    @IsEntityId()
    id: ID;

    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(Permission, { each: true })
    @IsOptional()
    permissions?: Array<Permission>;
}

export class MutationRegisterCustomerAccountArgs {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => RegisterCustomerInput)
    input: RegisterCustomerInput;
}

export class MutationVerifyCustomerAccountArgs {
    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    token: string;
}

export class MutationRefreshCustomerVerificationArgs {
    @IsString()
    @IsEmail()
    emailAddress: string;
}

export class MutationRequestPasswordResetArgs {
    @IsString()
    @IsEmail()
    emailAddress: string;
}

export class MutationResetPasswordArgs {
    @IsString()
    password: string;

    @IsString()
    token: string;
}

export class MutationUpdateCustomerPasswordArgs {
    @IsString()
    currentPassword: string;

    @IsString()
    newPassword: string;
}

export class MutationRequestUpdateCustomerEmailAddressArgs {
    @IsString()
    @IsEmail()
    newEmailAddress: string;

    @IsString()
    password: string;
}

export class MutationUpdateCustomerEmailAddressArgs {
    @IsString()
    token: string;
}

export class MutationCreateAdministratorArgs {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CreateAdministratorInput)
    input: CreateAdministratorInput;
}

export class MutationUpdateAdministratorArgs {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateAdministratorInput)
    input: UpdateAdministratorInput;
}

export class MutationUpdateActiveAdministratorArgs {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateActiveAdministratorInput)
    input: UpdateActiveAdministratorInput;
}

export class MutationAssignRoleToAdministratorArgs {
    @IsEntityId()
    administratorId: ID;

    @IsEntityId()
    roleId: ID;
}

export class MutationDeleteAdministratorArgs {
    @IsEntityId()
    id: ID;
}

export class MutationDeleteAdministratorsArgs {
    ids: Array<ID>;
}

export class QueryAdministratorArgs {
    @IsEntityId()
    id: ID;
}

export class File {
    @IsString()
    originalname: string;

    @IsString()
    mimetype: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    buffer: any;

    @IsNumber()
    @Type(() => Number)
    size: number;
}

export class CreateAssetInput {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => File)
    file: File;
}

export class CoordinateInput {
    @IsNumber()
    @Type(() => Number)
    x: number;

    @IsNumber()
    @Type(() => Number)
    y: number;
}

export class UpdateAssetInput {
    @IsEntityId()
    id: ID;

    @IsOptional()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CoordinateInput)
    focalPoint?: CoordinateInput;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString({ each: true })
    tags?: Array<string>;
}

export class CreateJobPostInput {
    @IsEntityId()
    customerId: ID;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @NotEquals(null)
    @ValidateIf((object, value) => value !== undefined)
    @IsEnum(JobPostVisibility)
    visibility?: JobPostVisibility;

    @IsOptional()
    @IsEnum(CurrencyCode)
    currencyCode?: CurrencyCode;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;

    @IsOptional()
    @ArrayMaxSize(PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS)
    @ArrayMinSize(PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS)
    @IsEntityId({ each: true })
    requiredSkillIds?: Array<ID>;

    @IsOptional()
    @IsEntityId()
    requiredCategoryId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredExperienceLevelId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobDurationId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobScopeId?: ID;
}

export class UpdateJobPostInput {
    @IsEntityId()
    id: ID;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @NotEquals(null)
    @ValidateIf((object, value) => value !== undefined)
    @IsEnum(JobPostVisibility)
    visibility?: JobPostVisibility;

    @IsOptional()
    @IsEnum(CurrencyCode)
    currencyCode?: CurrencyCode;

    @IsInt()
    @IsPositive()
    @Min(5)
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;

    @IsOptional()
    @ArrayMaxSize(PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS)
    @ArrayMinSize(PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS)
    @IsEntityId({ each: true })
    requiredSkillIds?: Array<ID>;

    @IsOptional()
    @IsEntityId()
    requiredCategoryId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredExperienceLevelId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobDurationId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobScopeId?: ID;
}

export class PublishJobPostInput {
    @IsEntityId()
    id: ID;
}

export class MutationCreateJobPostArgs {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @NotEquals(null)
    @ValidateIf((object, value) => value !== undefined)
    @IsEnum(JobPostVisibility)
    visibility?: JobPostVisibility;

    @IsOptional()
    @IsEnum(CurrencyCode)
    currencyCode?: CurrencyCode;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Min(5)
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @ArrayMaxSize(PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS)
    @ArrayMinSize(PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS)
    @IsEntityId({ each: true })
    requiredSkillIds?: Array<ID>;

    @IsOptional()
    @IsEntityId()
    requiredCategoryId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredExperienceLevelId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobDurationId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobScopeId?: ID;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;
}

export class MutationUpdateJobPostArgs {
    @IsEntityId()
    id: ID;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @NotEquals(null)
    @ValidateIf((object, value) => value !== undefined)
    @IsEnum(JobPostVisibility)
    visibility?: JobPostVisibility;

    @IsOptional()
    @IsEnum(CurrencyCode)
    currencyCode?: CurrencyCode;

    @IsOptional()
    @IsInt()
    @IsPositive()
    @Min(5)
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;

    @IsOptional()
    @ArrayMaxSize(PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS)
    @ArrayMinSize(PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS)
    @IsEntityId({ each: true })
    requiredSkillIds?: Array<ID>;

    @IsOptional()
    @IsEntityId()
    requiredCategoryId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredExperienceLevelId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobDurationId?: ID;

    @IsOptional()
    @IsEntityId()
    requiredJobScopeId?: ID;
}

export class MutationPublishJobPostArgs {
    @IsEntityId()
    id: ID;
}

export class FacetValueTranslationInput {
    @IsOptional()
    @IsEntityId()
    id?: ID;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    @IsOptional()
    name?: string;
}

export class CreateFacetValueInput {
    @IsString()
    code: string;

    @IsEntityId()
    facetId: ID;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetValueTranslationInput)
    translations: Array<FacetValueTranslationInput>;
}

export class UpdateFacetValueInput {
    @IsEntityId()
    id: ID;

    @IsString()
    @IsOptional()
    code?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FacetValueTranslationInput)
    translations?: Array<FacetValueTranslationInput>;
}

export class CreateFacetValueWithFacetInput {
    @IsString()
    code: string;

    @IsString()
    name: string;
}

export class FacetTranslationInput {
    @IsOptional()
    @IsEntityId()
    id?: ID;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    @IsOptional()
    name?: string;
}

export class CreateFacetInput {
    @IsString()
    code: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetTranslationInput)
    translations: Array<FacetTranslationInput>;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateFacetValueWithFacetInput)
    values?: CreateFacetValueWithFacetInput[];
}

export class UpdateFacetInput {
    @IsEntityId()
    id: ID;

    @IsString()
    @IsOptional()
    code?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacetTranslationInput)
    translations: Array<FacetTranslationInput>;
}

export class CreateBalanceEntryInput {
    @IsEntityId()
    customerId: ID;

    @IsEnum(BalanceEntryType)
    type: BalanceEntryType;

    @IsInt()
    @IsPositive()
    @IsOptional()
    reviewDays?: number;

    @IsEnum(CurrencyCode)
    currencyCode: CurrencyCode;

    @IsInt()
    @IsPositive()
    credit: number;

    @IsInt()
    @IsPositive()
    debit: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    metadata?: Record<string, string>;
}

export class ConfigArg {
    @IsString()
    name: string;

    @IsString()
    value: string;
}

export class ConfigurableOperation {
    @IsString()
    code: string;
    @IsString()
    args: Array<ConfigArg>;
}

export class CreateCollectionTranslationInput {
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsString()
    description: string;
}

export class CreateCollectionInput {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCollectionTranslationInput)
    translations: Array<CreateCollectionTranslationInput>;

    @IsOptional()
    @IsEntityId()
    featuredAssetId?: ID;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigurableOperation)
    filters: Array<ConfigurableOperation>;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    inheritFilters?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isPrivate?: boolean;

    @IsOptional()
    @IsEntityId()
    parentId?: ID;
}

export class MutationCreateCollectionArgs {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CreateCollectionInput)
    input: CreateCollectionInput;
}

export class UpdateCollectionTranslationInput {
    @IsOptional()
    @IsEntityId()
    id?: ID;

    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateCollectionInput {
    @IsEntityId()
    id: ID;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCollectionTranslationInput)
    @IsOptional()
    translations?: Array<UpdateCollectionTranslationInput>;

    @IsOptional()
    @IsEntityId()
    featuredAssetId?: ID;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_ASSETS_ARRAY_SIZE)
    @ArrayMinSize(MIN_ASSETS_ARRAY_SIZE)
    @IsEntityId({ each: true })
    assetIds?: Array<ID>;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConfigurableOperation)
    @IsOptional()
    filters?: Array<ConfigurableOperation>;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    inheritFilters?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isPrivate?: boolean;

    @IsOptional()
    @IsEntityId()
    parentId?: ID;
}

export class MutationUpdateCollectionArgs {
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateCollectionInput)
    input: UpdateCollectionInput;
}

export class MoveCollectionInput {
    @IsEntityId()
    collectionId: ID;

    @IsNumber()
    @Type(() => Number)
    index: number;

    @IsEntityId()
    parentId: ID;
}

export class MutationMoveCollectionArgs {
    @IsObject()
    @ValidateNested()
    @Type(() => MoveCollectionInput)
    input: MoveCollectionInput;
}

export class Success {
    @IsBoolean()
    @Type(() => Boolean)
    success: boolean;
}

export class GetCurrentUserQuery {
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => CurrentUser)
    me?: CurrentUser | null;
}

export class AttemptLoginMutation {
    @IsObject()
    @ValidateNested()
    @Type(() => CurrentUser)
    login: CurrentUser;
}

export class LogOutMutation {
    @IsObject()
    @ValidateNested()
    @Type(() => Success)
    logout: Success;
}

export class AssetFragment {
    id: string;
    createdAt: any;
    updatedAt: any;
    name: string;
    fileSize: number;
    mimeType: string;
    type: AssetType;
    preview: string;
    source: string;
    width: number;
    height: number;
    focalPoint?: Coordinate | null;
}

export class GetActiveAdministratorQuery {
    activeAdministrator: {
        id: string;
        emailAddress: string;
        firstName: string;
        lastName: string;
        createdAt: any;
        updatedAt: any;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    } | null;
}

export class CreateAdministratorMutation {
    createAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    };
}

export class UpdateAdministratorMutation {
    updateAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    };
}

export class UpdateActiveAdministratorMutation {
    updateActiveAdministrator: {
        id: string;
        createdAt: any;
        updatedAt: any;
        firstName: string;
        lastName: string;
        emailAddress: string;
        user: {
            id: string;
            identifier: string;
            lastLogin?: any | null;
            roles: Array<{
                id: string;
                createdAt: any;
                updatedAt: any;
                code: string;
                description: string;
                permissions: Array<Permission>;
            }>;
        };
    } | null;
}

export class DeleteAdministratorMutation {
    deleteAdministrator: {
        result: DeletionResult;
        message?: string | null;
    };
}

export class DeleteAdministratorsMutation {
    deleteAdministrators: Array<{
        result: DeletionResult;
        message?: string | null;
    }>;
}

export class QueryRoleArgs {
    id: ID;
}

export class MutationCreateRoleArgs {
    input: CreateRoleInput;
}

export class MutationUpdateRoleArgs {
    input: UpdateRoleInput;
}

export class MutationDeleteRoleArgs {
    id: ID;
}

export class MutationDeleteRolesArgs {
    ids: Array<ID>;
}

export class GetRolesQuery {
    roles: {
        totalItems: number;
        items: Array<{
            id: string;
            createdAt: any;
            updatedAt: any;
            code: string;
            description: string;
            permissions: Array<Permission>;
        }>;
    };
}

export class CreateRoleMutation {
    createRole: {
        id: string;
        createdAt: any;
        updatedAt: any;
        code: string;
        description: string;
        permissions: Array<Permission>;
    };
}

export class UpdateRoleMutation {
    updateRole: {
        id: string;
        createdAt: any;
        updatedAt: any;
        code: string;
        description: string;
        permissions: Array<Permission>;
    };
}

export class DeleteRoleMutation {
    deleteRole: {
        result: DeletionResult;
        message?: string | null;
    };
}

export class DeleteRolesMutation {
    deleteRoles: Array<{
        result: DeletionResult;
        message?: string | null;
    }>;
}

export class JobPostSortParameter {
    @IsOptional()
    @IsEnum(SortOrder)
    id?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    closedAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    publishedAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    createdAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    updatedAt?: SortOrder;
}

export class JobPostFilterParameter {
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => JobPostFilterParameter)
    _and?: Array<JobPostFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => JobPostFilterParameter)
    _or?: Array<JobPostFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    id?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    title?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    description?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NumberOperators)
    budget?: NumberOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    facetValueId?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    visibility?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    status?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    closedAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    publishedAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    createdAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    updatedAt?: DateOperators;
}

export class JobPostListOptions {
    /** Takes n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    take?: number | null;

    /** Skips the first n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    skip?: number | null;

    /** Specifies which properties to sort the results by */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => JobPostSortParameter)
    sort?: JobPostSortParameter | null;

    /** Allows the results to be filtered */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => JobPostFilterParameter)
    filter?: JobPostFilterParameter | null;

    /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
    @IsOptional()
    @IsEnum(LogicalOperator)
    filterOperator?: LogicalOperator;
}

export class FacetFilterParameter {
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetFilterParameter)
    _and?: Array<FacetFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetFilterParameter)
    _or?: Array<FacetFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    code?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    createdAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    id?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => BooleanOperators)
    isPrivate?: BooleanOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    languageCode?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    name?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    updatedAt?: DateOperators;
}

export class FacetSortParameter {
    @IsOptional()
    @IsEnum(SortOrder)
    code?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    createdAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    id?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    name?: SortOrder;
    updatedAt?: SortOrder;
}

export class FacetListOptions {
    /** Takes n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    take?: number | null;

    /** Skips the first n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    skip?: number | null;

    /** Specifies which properties to sort the results by */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FacetSortParameter)
    sort?: FacetSortParameter | null;

    /** Allows the results to be filtered */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FacetFilterParameter)
    filter?: FacetFilterParameter | null;

    /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
    @IsOptional()
    @IsEnum(LogicalOperator)
    filterOperator?: LogicalOperator;
}

export class FacetValueFilterParameter {
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetValueFilterParameter)
    _and?: Array<FacetValueFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetValueFilterParameter)
    _or?: Array<FacetValueFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    code?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    createdAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    facetId?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    id?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    languageCode?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    name?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    updatedAt?: DateOperators;
}

export class FacetValueSortParameter {
    @IsOptional()
    @IsEnum(SortOrder)
    id?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    code?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    facetId?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    name?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    updatedAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    createdAt?: SortOrder;
}

export class FacetValueListOptions {
    /** Takes n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    take?: number | null;

    /** Skips the first n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    skip?: number | null;

    /** Specifies which properties to sort the results by */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FacetValueSortParameter)
    sort?: FacetValueSortParameter | null;

    /** Allows the results to be filtered */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FacetValueFilterParameter)
    filter?: FacetValueFilterParameter | null;

    /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
    @IsOptional()
    @IsEnum(LogicalOperator)
    filterOperator?: LogicalOperator;
}

export class CollectionFilterParameter {
    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetValueFilterParameter)
    _and?: Array<CollectionFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetValueFilterParameter)
    _or?: Array<CollectionFilterParameter>;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    createdAt?: DateOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    description?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    id?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => BooleanOperators)
    inheritFilters?: BooleanOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => BooleanOperators)
    isPrivate?: BooleanOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    languageCode?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    name?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => IdOperators)
    parentId?: IdOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NumberOperators)
    position?: NumberOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringOperators)
    slug?: StringOperators;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DateOperators)
    updatedAt?: DateOperators;
}

export class CollectionSortParameter {
    @IsOptional()
    @IsEnum(SortOrder)
    createdAt?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    description?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    id?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    name?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    parentId?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    position?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    slug?: SortOrder;

    @IsOptional()
    @IsEnum(SortOrder)
    updatedAt?: SortOrder;
}

export class CollectionListOptions {
    /** Takes n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    take?: number | null;

    /** Skips the first n results, for use in pagination */
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    skip?: number | null;

    /** Specifies which properties to sort the results by */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionSortParameter)
    sort?: CollectionSortParameter | null;

    /** Allows the results to be filtered */
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionFilterParameter)
    filter?: CollectionFilterParameter | null;

    /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
    @IsOptional()
    @IsEnum(LogicalOperator)
    filterOperator?: LogicalOperator;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    topLevelOnly?: boolean;
}

export enum SearchIndex {
    JobPost = 'JobPost',
    Profile = 'Profile',
}

/**
 * Used to construct boolean expressions for filtering search results
 * by FacetValue ID. Examples:
 *
 * * ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
 * * ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
 * * ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }`
 */
export class FacetValueFilterInput {
    @IsOptional()
    @IsArray()
    @IsEntityId({ each: true })
    and?: ID;

    @IsOptional()
    @IsArray()
    @IsEntityId({ each: true })
    or?: Array<ID>;
}

// Sort parameter classes
export class BaseSearchResultSortParameter {}

export class JobPostSearchResultSortParameter extends BaseSearchResultSortParameter {
    @IsOptional()
    @IsEnum(SortOrder)
    title?: SortOrder;
}

export class ProfileSearchResultSortParameter extends BaseSearchResultSortParameter {}

// Base classes for search functionality
export class BaseSearchResult {
    @IsEntityId()
    Id: ID;

    @IsEntityId({ each: true })
    collectionIds: Array<ID>;

    @IsEntityId({ each: true })
    facetIds: Array<ID>;

    @IsEntityId({ each: true })
    facetValueIds: Array<ID>;

    @IsNumber()
    score: number;
}

export class JobPostSearchResult extends BaseSearchResult {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    currencyCode: string;

    @IsNumber()
    budget: number;
}

export class ProfileSearchResult extends BaseSearchResult {}

// Search input types
export class BaseSearchInput {
    @IsEnum(SearchIndex)
    index: SearchIndex;

    @IsOptional()
    @IsEntityId()
    collectionId?: ID;

    @IsOptional()
    @IsString()
    collectionSlug?: string;

    @IsOptional()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => FacetValueFilterInput)
    facetValueFilters?: Array<FacetValueFilterInput>;

    @IsOptional()
    @IsNumber()
    skip?: number;

    @IsOptional()
    @IsNumber()
    take?: number;

    @IsOptional()
    @IsString()
    term?: string;
}

export class JobPostSearchInput extends BaseSearchInput {
    @IsOptional()
    @ValidateNested()
    @Type(() => JobPostSearchResultSortParameter)
    sort?: JobPostSearchResultSortParameter;
}

export class ProfileSearchInput extends BaseSearchInput {
    @IsOptional()
    @ValidateNested()
    @Type(() => ProfileSearchResultSortParameter)
    sort?: ProfileSearchResultSortParameter;
}

// Search result types
export class SearchResult {
    @IsEnum(SearchIndex)
    index: SearchIndex;

    @IsArray()
    result: ProfileSearchResult[] | JobPostSearchResult[];
}

export class SearchInput {
    @ValidateNested()
    @Type(() => BaseSearchInput, {
        discriminator: {
            property: 'index',
            subTypes: [
                { value: JobPostSearchInput, name: SearchIndex.JobPost },
                { value: ProfileSearchInput, name: SearchIndex.Profile },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    search: JobPostSearchInput | ProfileSearchInput;
}
