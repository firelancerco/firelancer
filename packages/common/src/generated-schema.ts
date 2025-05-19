export type Coordinate = {
    x: number;
    y: number;
};
export enum AssetType {
    BINARY = 'BINARY',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}
export type Asset = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    fileSize: number;
    focalPoint?: Coordinate | undefined;
    height: number;
    mimeType: string;
    name: string;
    preview: string;
    source: string;
    width: number;
    type: AssetType;
};
export type AssetList = {
    items: Asset[];
    totalItems: number;
};
export type OrderableAsset = {
    id: ID;
    createdAt: Date;
    assetId: ID;
    asset?: Asset | undefined;
    position: number;
};
export type CurrentUserRole = {
    code: string;
    description: string;
};
export type CurrentUser = {
    id: ID;
    identifier: string;
    verified: boolean;
    roles: CurrentUserRole[];
    permissions: Permission[];
};
export enum BalanceEntryType {
    FIXED_PRICE = 'FIXED_PRICE',
    BONUS = 'BONUS',
    PAYMENT = 'PAYMENT',
    WITHDRAWAL = 'WITHDRAWAL',
}
export enum BalanceEntryState {
    PENDING = 'PENDING',
    SETTLED = 'SETTLED',
    REJECTED = 'REJECTED',
}
export type BalanceEntry = {
    type: BalanceEntryType;
    description?: string | undefined;
    customerId: ID;
    currencyCode: CurrencyCode;
    balance?: Money | undefined;
    creduit: Money;
    debit: Money;
    reviewDays: number;
    settledAt?: Date | undefined;
    prevBalance?: Money | undefined;
    prevSettledAt?: Date | undefined;
    parentId?: ID | undefined;
    parent?: BalanceEntry | undefined;
    children: BalanceEntry[];
    metadata?: any | undefined;
};
export type CollectionBreadcrumb = {
    id: ID;
    name: string;
    slug: string;
};
export type Money = number;
export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}
export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}
export enum Permission {
    Authenticated = 'Authenticated',
    SuperAdmin = 'SuperAdmin',
    Owner = 'Owner',
    Public = 'Public',
    CreateAdministrator = 'CreateAdministrator',
    ReadAdministrator = 'ReadAdministrator',
    UpdateAdministrator = 'UpdateAdministrator',
    DeleteAdministrator = 'DeleteAdministrator',
    CreateCustomer = 'CreateCustomer',
    ReadCustomer = 'ReadCustomer',
    UpdateCustomer = 'UpdateCustomer',
    DeleteCustomer = 'DeleteCustomer',
    CreateJobPost = 'CreateJobPost',
    ReadJobPost = 'ReadJobPost',
    UpdateJobPost = 'UpdateJobPost',
    DeleteJobPost = 'DeleteJobPost',
    CreateAsset = 'CreateAsset',
    ReadAsset = 'ReadAsset',
    UpdateAsset = 'UpdateAsset',
    DeleteAsset = 'DeleteAsset',
    CreateFacet = 'CreateFacet',
    ReadFacet = 'ReadFacet',
    UpdateFacet = 'UpdateFacet',
    DeleteFacet = 'DeleteFacet',
}
export type ID = string | number;
export type PaginatedList = {
    items: any[];
    totalItems: number;
};
export type LocalizedString = {
    languageCode: LanguageCode;
    value: string;
};
export type ConfigArg = {
    name: string;
    value: string;
};
export type ConfigArgDefinition = {
    defaultValue?: string | undefined;
    description?: string | undefined;
    label?: string | undefined;
    list: boolean;
    name: string;
    required: boolean;
    type: string;
};
export type ConfigurableOperation = {
    args: ConfigArg[];
    code: string;
};
export type ConfigArgInput = {
    name: string;
    value: string;
};
export type ConfigurableOperationInput = {
    arguments: ConfigArgInput[];
    code: string;
};
export type ConfigurableOperationDefinition = {
    args: ConfigArgDefinition[];
    code: string;
    description: string;
};
export type StringOperators = {
    eq?: string | undefined;
    notEq?: string | undefined;
    contains?: string | undefined;
    notContains?: string | undefined;
    in?: string[] | undefined;
    notIn?: string[] | undefined;
    regex?: string | undefined;
    isNull?: boolean | undefined;
};
export type IdOperators = {
    eq?: string | undefined;
    notEq?: string | undefined;
    in?: string[] | undefined;
    notIn?: string[] | undefined;
    isNull?: boolean | undefined;
};
export type BooleanOperators = {
    eq?: boolean | undefined;
    isNull?: boolean | undefined;
};
export type NumberRange = {
    end: number;
    start: number;
};
export type NumberOperators = {
    eq?: number | undefined;
    lt?: number | undefined;
    lte?: number | undefined;
    gt?: number | undefined;
    gte?: number | undefined;
    between?: NumberRange | undefined;
    isNull?: boolean | undefined;
};
export type DateRange = {
    end: Date;
    start: Date;
};
export type DateOperators = {
    after?: Date | undefined;
    before?: Date | undefined;
    between?: DateRange | undefined;
    eq?: Date | undefined;
    isNull?: boolean | undefined;
};
export type Success = {
    success: boolean;
};
export type FacetValueFilterInput = {
    and?: ID | undefined;
    or?: ID[] | undefined;
};
export enum SearchIndex {
    JobPost = 'JobPost',
    Profile = 'Profile',
}
export type BaseSearchResultSortParameter = {};
export type JobPostSearchResultSortParameter = {
    title?: SortOrder | undefined;
};
export type ProfileSearchResultSortParameter = {
    title?: SortOrder | undefined;
    overview?: SortOrder | undefined;
};
export type BaseSearchResult = {
    id: ID;
    collectionIds: ID[];
    facetIds: ID[];
    facetValueIds: ID[];
    score: number;
};
export type JobPostSearchResult = {
    id: ID;
    collectionIds: ID[];
    facetIds: ID[];
    facetValueIds: ID[];
    score: number;
    title: string;
    description: string;
    currencyCode: string;
    budget: number;
};
export type ProfileSearchResult = {
    id: ID;
    collectionIds: ID[];
    facetIds: ID[];
    facetValueIds: ID[];
    score: number;
    title: string;
    overview: string;
};
export type BaseSearchInput = {
    index: SearchIndex;
    collectionId?: ID | undefined;
    collectionSlug?: string | undefined;
    facetValueFilters?: FacetValueFilterInput[] | undefined;
    skip?: number | undefined;
    take?: number | undefined;
    term?: string | undefined;
};
export type JobPostSearchInput = {
    index: SearchIndex;
    collectionId?: ID | undefined;
    collectionSlug?: string | undefined;
    facetValueFilters?: FacetValueFilterInput[] | undefined;
    skip?: number | undefined;
    take?: number | undefined;
    term?: string | undefined;
    sort?: JobPostSearchResultSortParameter | undefined;
};
export type ProfileSearchInput = {
    index: SearchIndex;
    collectionId?: ID | undefined;
    collectionSlug?: string | undefined;
    facetValueFilters?: FacetValueFilterInput[] | undefined;
    skip?: number | undefined;
    take?: number | undefined;
    term?: string | undefined;
    sort?: ProfileSearchResultSortParameter | undefined;
};
export type SearchResult = {
    index: SearchIndex;
    result: (ProfileSearchResult | JobPostSearchResult)[];
};
export type SearchInput = {
    search:
        | {
              index: 'JobPost';
              collectionId?: ID | undefined;
              collectionSlug?: string | undefined;
              facetValueFilters?: FacetValueFilterInput[] | undefined;
              skip?: number | undefined;
              take?: number | undefined;
              term?: string | undefined;
              sort?: JobPostSearchResultSortParameter | undefined;
          }
        | {
              index: 'Profile';
              collectionId?: ID | undefined;
              collectionSlug?: string | undefined;
              facetValueFilters?: FacetValueFilterInput[] | undefined;
              skip?: number | undefined;
              take?: number | undefined;
              term?: string | undefined;
              sort?: ProfileSearchResultSortParameter | undefined;
          };
};
export enum CurrencyCode {
    AED = 'AED',
    AFN = 'AFN',
    ALL = 'ALL',
    AMD = 'AMD',
    ANG = 'ANG',
    AOA = 'AOA',
    ARS = 'ARS',
    AUD = 'AUD',
    AWG = 'AWG',
    AZN = 'AZN',
    BAM = 'BAM',
    BBD = 'BBD',
    BDT = 'BDT',
    BGN = 'BGN',
    BHD = 'BHD',
    BIF = 'BIF',
    BMD = 'BMD',
    BND = 'BND',
    BOB = 'BOB',
    BRL = 'BRL',
    BSD = 'BSD',
    BTN = 'BTN',
    BWP = 'BWP',
    BYN = 'BYN',
    BZD = 'BZD',
    CAD = 'CAD',
    CDF = 'CDF',
    CHF = 'CHF',
    CLP = 'CLP',
    CNY = 'CNY',
    COP = 'COP',
    CRC = 'CRC',
    CUC = 'CUC',
    CUP = 'CUP',
    CVE = 'CVE',
    CZK = 'CZK',
    DJF = 'DJF',
    DKK = 'DKK',
    DOP = 'DOP',
    DZD = 'DZD',
    EGP = 'EGP',
    ERN = 'ERN',
    ETB = 'ETB',
    EUR = 'EUR',
    FJD = 'FJD',
    FKP = 'FKP',
    GBP = 'GBP',
    GEL = 'GEL',
    GHS = 'GHS',
    GIP = 'GIP',
    GMD = 'GMD',
    GNF = 'GNF',
    GTQ = 'GTQ',
    GYD = 'GYD',
    HKD = 'HKD',
    HNL = 'HNL',
    HRK = 'HRK',
    HTG = 'HTG',
    HUF = 'HUF',
    IDR = 'IDR',
    ILS = 'ILS',
    INR = 'INR',
    IQD = 'IQD',
    IRR = 'IRR',
    ISK = 'ISK',
    JMD = 'JMD',
    JOD = 'JOD',
    JPY = 'JPY',
    KES = 'KES',
    KGS = 'KGS',
    KHR = 'KHR',
    KMF = 'KMF',
    KPW = 'KPW',
    KRW = 'KRW',
    KWD = 'KWD',
    KYD = 'KYD',
    KZT = 'KZT',
    LAK = 'LAK',
    LBP = 'LBP',
    LKR = 'LKR',
    LRD = 'LRD',
    LSL = 'LSL',
    LYD = 'LYD',
    MAD = 'MAD',
    MDL = 'MDL',
    MGA = 'MGA',
    MKD = 'MKD',
    MMK = 'MMK',
    MNT = 'MNT',
    MOP = 'MOP',
    MRU = 'MRU',
    MUR = 'MUR',
    MVR = 'MVR',
    MWK = 'MWK',
    MXN = 'MXN',
    MYR = 'MYR',
    MZN = 'MZN',
    NAD = 'NAD',
    NGN = 'NGN',
    NIO = 'NIO',
    NOK = 'NOK',
    NPR = 'NPR',
    NZD = 'NZD',
    OMR = 'OMR',
    PAB = 'PAB',
    PEN = 'PEN',
    PGK = 'PGK',
    PHP = 'PHP',
    PKR = 'PKR',
    PLN = 'PLN',
    PYG = 'PYG',
    QAR = 'QAR',
    RON = 'RON',
    RSD = 'RSD',
    RUB = 'RUB',
    RWF = 'RWF',
    SAR = 'SAR',
    SBD = 'SBD',
    SCR = 'SCR',
    SDG = 'SDG',
    SEK = 'SEK',
    SGD = 'SGD',
    SHP = 'SHP',
    SLL = 'SLL',
    SOS = 'SOS',
    SRD = 'SRD',
    SSP = 'SSP',
    STN = 'STN',
    SVC = 'SVC',
    SYP = 'SYP',
    SZL = 'SZL',
    THB = 'THB',
    TJS = 'TJS',
    TMT = 'TMT',
    TND = 'TND',
    TOP = 'TOP',
    TRY = 'TRY',
    TTD = 'TTD',
    TWD = 'TWD',
    TZS = 'TZS',
    UAH = 'UAH',
    UGX = 'UGX',
    USD = 'USD',
    UYU = 'UYU',
    UZS = 'UZS',
    VES = 'VES',
    VND = 'VND',
    VUV = 'VUV',
    WST = 'WST',
    XAF = 'XAF',
    XCD = 'XCD',
    XOF = 'XOF',
    XPF = 'XPF',
    YER = 'YER',
    ZAR = 'ZAR',
    ZMW = 'ZMW',
    ZWL = 'ZWL',
}
export enum CustomerRole {
    SELLER = 'SELLER',
    BUYER = 'BUYER',
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
export enum JobPostState {
    DRAFT = 'DRAFT',
    DRAFT_DELETED = 'DRAFT_DELETED',
    REQUESTED = 'REQUESTED',
    REJECTED = 'REJECTED',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}
export enum JobPostVisibility {
    PUBLIC = 'PUBLIC',
    INVITE_ONLY = 'INVITE_ONLY',
}
export type JobPostProcessState = {
    name: string;
    to: string[];
};
export enum LanguageCode {
    af = 'af',
    ak = 'ak',
    am = 'am',
    ar = 'ar',
    as = 'as',
    az = 'az',
    be = 'be',
    bg = 'bg',
    bm = 'bm',
    bn = 'bn',
    bo = 'bo',
    br = 'br',
    bs = 'bs',
    ca = 'ca',
    ce = 'ce',
    co = 'co',
    cs = 'cs',
    cu = 'cu',
    cy = 'cy',
    da = 'da',
    de = 'de',
    de_AT = 'de_AT',
    de_CH = 'de_CH',
    dz = 'dz',
    ee = 'ee',
    el = 'el',
    en = 'en',
    en_AU = 'en_AU',
    en_CA = 'en_CA',
    en_GB = 'en_GB',
    en_US = 'en_US',
    eo = 'eo',
    es = 'es',
    es_ES = 'es_ES',
    es_MX = 'es_MX',
    et = 'et',
    eu = 'eu',
    fa = 'fa',
    fa_AF = 'fa_AF',
    ff = 'ff',
    fi = 'fi',
    fo = 'fo',
    fr = 'fr',
    fr_CA = 'fr_CA',
    fr_CH = 'fr_CH',
    fy = 'fy',
    ga = 'ga',
    gd = 'gd',
    gl = 'gl',
    gu = 'gu',
    gv = 'gv',
    ha = 'ha',
    he = 'he',
    hi = 'hi',
    hr = 'hr',
    ht = 'ht',
    hu = 'hu',
    hy = 'hy',
    ia = 'ia',
    id = 'id',
    ig = 'ig',
    ii = 'ii',
    is = 'is',
    it = 'it',
    ja = 'ja',
    jv = 'jv',
    ka = 'ka',
    ki = 'ki',
    kk = 'kk',
    kl = 'kl',
    km = 'km',
    kn = 'kn',
    ko = 'ko',
    ks = 'ks',
    ku = 'ku',
    kw = 'kw',
    ky = 'ky',
    la = 'la',
    lb = 'lb',
    lg = 'lg',
    ln = 'ln',
    lo = 'lo',
    lt = 'lt',
    lu = 'lu',
    lv = 'lv',
    mg = 'mg',
    mi = 'mi',
    mk = 'mk',
    ml = 'ml',
    mn = 'mn',
    mr = 'mr',
    ms = 'ms',
    mt = 'mt',
    my = 'my',
    nb = 'nb',
    nd = 'nd',
    ne = 'ne',
    nl = 'nl',
    nl_BE = 'nl_BE',
    nn = 'nn',
    ny = 'ny',
    om = 'om',
    or = 'or',
    os = 'os',
    pa = 'pa',
    pl = 'pl',
    ps = 'ps',
    pt = 'pt',
    pt_BR = 'pt_BR',
    pt_PT = 'pt_PT',
    qu = 'qu',
    rm = 'rm',
    rn = 'rn',
    ro = 'ro',
    ro_MD = 'ro_MD',
    ru = 'ru',
    rw = 'rw',
    sa = 'sa',
    sd = 'sd',
    se = 'se',
    sg = 'sg',
    si = 'si',
    sk = 'sk',
    sl = 'sl',
    sm = 'sm',
    sn = 'sn',
    so = 'so',
    sq = 'sq',
    sr = 'sr',
    st = 'st',
    su = 'su',
    sv = 'sv',
    sw = 'sw',
    sw_CD = 'sw_CD',
    ta = 'ta',
    te = 'te',
    tg = 'tg',
    th = 'th',
    ti = 'ti',
    tk = 'tk',
    to = 'to',
    tr = 'tr',
    tt = 'tt',
    ug = 'ug',
    uk = 'uk',
    ur = 'ur',
    uz = 'uz',
    vi = 'vi',
    vo = 'vo',
    wo = 'wo',
    xh = 'xh',
    yi = 'yi',
    yo = 'yo',
    zh = 'zh',
    zh_Hans = 'zh_Hans',
    zh_Hant = 'zh_Hant',
    zu = 'zu',
}
export type Role = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    permissions: Permission[];
};
export type RoleList = {
    items: Role[];
    totalItems: number;
};
export type RoleSortParameter = {
    id?: SortOrder | undefined;
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    description?: SortOrder | undefined;
    code?: SortOrder | undefined;
};
export type RoleFilterParameter = {
    _and?: RoleFilterParameter[] | undefined;
    _or?: RoleFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    slug?: StringOperators | undefined;
    code?: StringOperators | undefined;
};
export type RoleListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: RoleSortParameter | undefined;
    filter?: RoleFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
};
export type AuthenticationMethod = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    strategy?: string | undefined;
    user: any;
};
export type User = {
    id: ID;
    createdAt: Date;
    authenticationMethods?: AuthenticationMethod[] | undefined;
    identifier: string;
    lastLogin?: Date | undefined;
    verified: boolean;
    roles: Role[];
};
export type CreateAdministratorInput = {
    emailAddress: string;
    firstName: string;
    lastName: string;
    password: string;
    roleIds: ID[];
};
export type UpdateAdministratorInput = {
    id: ID;
    emailAddress?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    password?: string | undefined;
    roleIds?: ID[] | undefined;
};
export type UpdateActiveAdministratorInput = {
    firstName?: string | undefined;
    lastName?: string | undefined;
    emailAddress?: string | undefined;
    password?: string | undefined;
};
export type AssignRoleToAdministratorInput = {
    administratorId: ID;
    roleId: ID;
};
export type DeleteAdministratorInput = {
    id: ID;
};
export type DeleteAdministratorsInput = {
    ids: ID[];
};
export type MutationCreateAdministratorArgs = {
    input: CreateAdministratorInput;
};
export type MutationUpdateAdministratorArgs = {
    input: UpdateAdministratorInput;
};
export type MutationUpdateActiveAdministratorArgs = {
    input: UpdateActiveAdministratorInput;
};
export type MutationAssignRoleToAdministratorArgs = {
    input: AssignRoleToAdministratorInput;
};
export type MutationDeleteAdministratorArgs = {
    input: DeleteAdministratorInput;
};
export type MutationDeleteAdministratorsArgs = {
    input: DeleteAdministratorsInput;
};
export type Administrator = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    lastName: string;
    emailAddress: string;
    user?: User | undefined;
};
export type AdministratorList = {
    items: Administrator[];
    totalItems: number;
};
export type File = {
    originalname: string;
    mimetype: string;
    buffer: any;
    size: number;
};
export type CoordinateInput = {
    x: number;
    y: number;
};
export type CreateAssetInput = {
    file: File;
};
export type DeleteAssetInput = {
    assetId: ID;
    force?: boolean | undefined;
};
export type DeleteAssetsInput = {
    assetId: ID[];
    force?: boolean | undefined;
};
export type UpdateAssetInput = {
    id: ID;
    name?: string | undefined;
    focalPoint?: CoordinateInput | undefined;
};
export type AuthenticationInput = {
    native?:
        | {
              username: string;
              password: string;
          }
        | undefined;
};
export type MutationAuthenticateArgs = {
    input: AuthenticationInput;
    rememberMe?: boolean | undefined;
};
export type MutationLoginArgs = {
    password: string;
    username: string;
    rememberMe?: boolean | undefined;
};
export type Collection = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    languageCode: LanguageCode;
    name: string;
    slug: string;
    description: string;
    breadcrumbs?: CollectionBreadcrumb[] | undefined;
    filters?: ConfigurableOperation[] | undefined;
    parent?: Collection | undefined;
    children?: Collection[] | undefined;
    assets?: CollectionAsset[] | undefined;
    translations?: CollectionTranslation[] | undefined;
    isPrivate: boolean;
    inheritFilters: boolean;
};
export type CollectionTranslation = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    languageCode: LanguageCode;
    name: string;
    slug: string;
};
export type CollectionAsset = {
    id: ID;
    createdAt: Date;
    assetId: ID;
    asset?: Asset | undefined;
    position: number;
    collectionId: ID;
    collection?: Collection | undefined;
};
export type CollectionList = {
    items: Collection[];
    totalItems: number;
};
export type CollectionSortParameter = {
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    name?: SortOrder | undefined;
    position?: SortOrder | undefined;
    description?: SortOrder | undefined;
    slug?: SortOrder | undefined;
};
export type CollectionFilterParameter = {
    _and?: CollectionFilterParameter[] | undefined;
    _or?: CollectionFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    languageCode?: StringOperators | undefined;
    name?: StringOperators | undefined;
    slug?: StringOperators | undefined;
    position?: NumberOperators | undefined;
    description?: StringOperators | undefined;
    parentId?: IdOperators | undefined;
    topLevelOnly?: BooleanOperators | undefined;
    isRoot?: BooleanOperators | undefined;
    isPrivate?: BooleanOperators | undefined;
    inheritFilters?: BooleanOperators | undefined;
};
export type CollectionListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: CollectionSortParameter | undefined;
    filter?: CollectionFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
    topLevelOnly?: boolean | undefined;
};
export type MoveCollectionInput = {
    collectionId: ID;
    index: number;
    parentId: ID;
};
export type CreateCollectionTranslationInput = {
    languageCode: LanguageCode;
    name: string;
    slug: string;
    description: string;
};
export type UpdateCollectionTranslationInput = {
    id?: ID | undefined;
    languageCode: LanguageCode;
    name?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
};
export type CreateCollectionInput = {
    translations: CreateCollectionTranslationInput[];
    featuredAssetId?: ID | undefined;
    assetIds?: ID[] | undefined;
    filters: ConfigurableOperation[];
    inheritFilters?: boolean | undefined;
    isPrivate?: boolean | undefined;
    parentId?: ID | undefined;
};
export type UpdateCollectionInput = {
    id: ID;
    translations?: UpdateCollectionTranslationInput[] | undefined;
    featuredAssetId?: ID | undefined;
    assetIds?: ID[] | undefined;
    filters?: ConfigurableOperation[] | undefined;
    inheritFilters?: boolean | undefined;
    isPrivate?: boolean | undefined;
    parentId?: ID | undefined;
};
export type MutationMoveCollectionArgs = {
    input: MoveCollectionInput;
};
export type MutationCreateCollectionArgs = {
    input: CreateCollectionInput;
};
export type MutationUpdateCollectionArgs = {
    input: UpdateCollectionInput;
};
export type Customer = {
    id: ID;
    firstName: string;
    lastName: string;
    emailAddress: string;
    role: CustomerRole | null;
    phoneNumber: string | null;
    user?: User | undefined;
    deletedAt: Date | null;
    history: HistoryEntry[];
};
export type CustomerList = {
    items: Customer[];
    totalItems: number;
};
export type CustomerSortParameter = {
    id?: SortOrder | undefined;
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    firstName?: SortOrder | undefined;
    lastName?: SortOrder | undefined;
    emailAddress?: SortOrder | undefined;
    phoneNumber?: SortOrder | undefined;
};
export type CustomerFilterParameter = {
    _and?: CustomerFilterParameter[] | undefined;
    _or?: CustomerFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    firstName?: StringOperators | undefined;
    lastName?: StringOperators | undefined;
    emailAddress?: StringOperators | undefined;
    phoneNumber?: StringOperators | undefined;
};
export type CustomerListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: CustomerSortParameter | undefined;
    filter?: CustomerFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
};
export type CreateCustomerInput = {
    firstName: string;
    lastName: string;
    emailAddress: string;
    role: CustomerRole;
    phoneNumber?: string | undefined;
};
export type UpdateCustomerInput = {
    id: ID;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phoneNumber?: string | undefined;
    role?: CustomerRole | undefined;
    emailAddress?: string | undefined;
};
export type MutationCreateCustomerArgs = {
    input: CreateCustomerInput;
};
export type MutationUpdateCustomerArgs = {
    input: UpdateCustomerInput;
};
export type HistoryEntry = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    type: HistoryEntryType;
    data: any;
    isPublic: boolean;
    administrator: Administrator;
};
export type HistoryEntryList = {
    items: HistoryEntry[];
    totalItems: number;
};
export type VerifyRequestedJobPostInput = {
    id: ID;
};
export type MutationVerifyRequestedJobPostArgs = {
    input: VerifyRequestedJobPostInput;
};
export type JobPost = {
    id: ID;
    customerId: ID;
    customer?: Customer | undefined;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: (Date | null) | undefined;
    publishedAt?: (Date | null) | undefined;
    closedAt?: (Date | null) | undefined;
    rejectedAt?: (Date | null) | undefined;
    editedAt?: (Date | null) | undefined;
    state: JobPostState;
    title?: (string | null) | undefined;
    description?: (string | null) | undefined;
    visibility: JobPostVisibility;
    budget?: (number | null) | undefined;
    currencyCode?: (string | null) | undefined;
    requiredSkills: FacetValue[];
    requiredCategory?: (FacetValue | null) | undefined;
    requiredExperienceLevel?: (FacetValue | null) | undefined;
    requiredJobDuration?: (FacetValue | null) | undefined;
    requiredJobScope?: (FacetValue | null) | undefined;
    facetValues?: FacetValue[] | undefined;
    assets?: JobPostAsset[] | undefined;
    collections?: Collection[] | undefined;
};
export type JobPostAsset = {
    id: ID;
    createdAt: Date;
    assetId: ID;
    asset?: Asset | undefined;
    position: number;
    jobPostId: ID;
    jobPost?: JobPost | undefined;
};
export type JobPostList = {
    items: JobPost[];
    totalItems: number;
};
export type JobPostSortParameter = {
    id?: SortOrder | undefined;
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    closedAt?: SortOrder | undefined;
    publishedAt?: SortOrder | undefined;
};
export type JobPostFilterParameter = {
    _and?: JobPostFilterParameter[] | undefined;
    _or?: JobPostFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    title?: StringOperators | undefined;
    description?: StringOperators | undefined;
    budget?: NumberOperators | undefined;
    facetValueId?: IdOperators | undefined;
    visibility?: StringOperators | undefined;
    state?: StringOperators | undefined;
    publishedAt?: DateOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    closedAt?: DateOperators | undefined;
};
export type JobPostListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: JobPostSortParameter | undefined;
    filter?: JobPostFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
};
export enum JobState {
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    RETRYING = 'RETRYING',
    RUNNING = 'RUNNING',
}
export type Job = {
    id: ID;
    createdAt: Date;
    startedAt?: Date | undefined;
    settledAt?: Date | undefined;
    queueName: string;
    state: JobState;
    progress: number;
    data?: any | undefined;
    result?: any | undefined;
    error?: any | undefined;
    isSettled: boolean;
    duration: number;
    retries: number;
    attempts: number;
};
export type JobQueue = {
    name: string;
    running: boolean;
};
export type JobList = {
    items: Job[];
    totalItems: number;
};
export type CreateRoleInput = {
    code: string;
    description: string;
    permissions: Permission[];
};
export type UpdateRoleInput = {
    id: ID;
    code?: string | undefined;
    description?: string | undefined;
    permissions?: Permission[] | undefined;
};
export type DeleteRoleInput = {
    id: ID;
};
export type DeleteRolesInput = {
    ids: ID[];
};
export type MutationCreateRoleArgs = {
    input: CreateRoleInput;
};
export type MutationUpdateRoleArgs = {
    input: UpdateRoleInput;
};
export type MutationDeleteRoleArgs = {
    input: DeleteRoleInput;
};
export type MutationDeleteRolesArgs = {
    input: DeleteRolesInput;
};
export type CreateFacetValueWithFacetInput = {
    code: string;
    name: string;
};
export type FacetTranslationInput = {
    id?: ID | undefined;
    languageCode: LanguageCode;
    name?: string | undefined;
};
export type CreateFacetInput = {
    code: string;
    translations: FacetTranslationInput[];
    values?: CreateFacetValueWithFacetInput[] | undefined;
};
export type UpdateFacetInput = {
    id: ID;
    code?: string | undefined;
    translations?: FacetTranslationInput[] | undefined;
};
export type FacetValueTranslationInput = {
    id?: ID | undefined;
    languageCode: LanguageCode;
    name?: string | undefined;
};
export type CreateFacetValueInput = {
    code: string;
    facetId: ID;
    translations: FacetValueTranslationInput[];
};
export type UpdateFacetValueInput = {
    id: ID;
    code?: string | undefined;
    translations?: FacetValueTranslationInput[] | undefined;
};
export type MutationCreateFacetArgs = {
    input: CreateFacetInput;
};
export type MutationUpdateFacetArgs = {
    input: UpdateFacetInput;
};
export type MutationCreateFacetValuesArgs = {
    input: CreateFacetValueInput[];
};
export type MutationUpdateFacetValuesArgs = {
    input: UpdateFacetValueInput[];
};
export type FacetTranslation = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    languageCode: LanguageCode;
};
export type Facet = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    languageCode?: LanguageCode | undefined;
    name?: string | undefined;
    translations: FacetTranslation[];
    facetValues?: FacetValue[] | undefined;
};
export type FacetList = {
    items: Facet[];
    totalItems: number;
};
export type FacetSortParameter = {
    id?: SortOrder | undefined;
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    code?: SortOrder | undefined;
    name?: SortOrder | undefined;
};
export type FacetFilterParameter = {
    _and?: FacetFilterParameter[] | undefined;
    _or?: FacetFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    code?: StringOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    languageCode?: StringOperators | undefined;
    name?: StringOperators | undefined;
};
export type FacetListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: FacetSortParameter | undefined;
    filter?: FacetFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
};
export type FacetValueTranslation = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    languageCode: LanguageCode;
    name: string;
};
export type FacetValue = {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    facetId: ID;
    languageCode?: LanguageCode | undefined;
    name?: string | undefined;
    translations: FacetValueTranslation[];
    facet?: Facet | undefined;
};
export type FacetValueList = {
    items: FacetValue[];
    totalItems: number;
};
export type FacetValueSortParameter = {
    id?: SortOrder | undefined;
    createdAt?: SortOrder | undefined;
    updatedAt?: SortOrder | undefined;
    code?: SortOrder | undefined;
    facetId?: SortOrder | undefined;
    name?: SortOrder | undefined;
};
export type FacetValueFilterParameter = {
    _and?: FacetValueFilterParameter[] | undefined;
    _or?: FacetValueFilterParameter[] | undefined;
    id?: IdOperators | undefined;
    code?: StringOperators | undefined;
    createdAt?: DateOperators | undefined;
    updatedAt?: DateOperators | undefined;
    languageCode?: StringOperators | undefined;
    name?: StringOperators | undefined;
    facetId?: IdOperators | undefined;
};
export type FacetValueListOptions = {
    take?: number | undefined;
    skip?: number | undefined;
    sort?: FacetValueSortParameter | undefined;
    filter?: FacetValueFilterParameter | undefined;
    filterOperator?: LogicalOperator | undefined;
};
