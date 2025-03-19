import { DynamicModule, Type } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DataSourceOptions } from 'typeorm';
import { PermissionDefinition } from '../common/permission-definition';
import { CurrencyCode, LanguageCode } from '../common/shared-schema';
import { Middleware } from '../common/shared-types';
import { JobBufferStorageStrategy } from '../job-queue';
import { AssetImportStrategy } from './strategies/asset-import/asset-import-strategy';
import { AssetNamingStrategy } from './strategies/asset/asset-naming-strategy';
import { AssetPreviewStrategy } from './strategies/asset/asset-preview-strategy';
import { AssetStorageStrategy } from './strategies/asset/asset-storage-strategy';
import { AuthenticationStrategy } from './strategies/authentication/authentication-strategy';
import { PasswordHashingStrategy } from './strategies/authentication/password-hashing-strategy';
import { PasswordValidationStrategy } from './strategies/authentication/password-validation-strategy';
import { CollectionFilter } from './strategies/catalog/collection-filter';
import { EntityIdStrategy } from './strategies/entity/entity-id-strategy';
import { MoneyStrategy } from './strategies/entity/money-strategy';
import { JobQueueStrategy } from './strategies/job-queue/job-queue-strategy';
import { FirelancerLogger } from './strategies/logger/firelancer-logger';
import { SessionCacheStrategy } from './strategies/session-cache/session-cache-strategy';
import { ErrorHandlerStrategy } from './strategies/system/error-handler-strategy';

/**
 * @description
 * The ApiOptions define how the Firelancer REST APIs are exposed, as well as allowing the API layer
 * to be extended with middleware.
 */
export interface ApiOptions {
    /**
     * @description
     * Set the hostname of the server. If not set, the server will be available on localhost.
     */
    hostname: string;
    /**
     * @description
     * Which port the firelancer server should listen on.
     */
    port: number;
    /**
     * @description
     * The path to the admin REST API endpoints.
     */
    adminApiPath: string;
    /**
     * @description
     * The path to the shop REST API endpoints.
     */
    shopApiPath: string;
    /**
     * @description
     * The maximum number of items that may be returned by a query which returns a `PaginatedList` response. In other words,
     * this is the upper limit of the `take` input option.
     *
     * @default 100
     */
    shopListQueryLimit?: number;
    /**
     * @description
     * The maximum number of items that may be returned by a query which returns a `PaginatedList` response. In other words,
     * this is the upper limit of the `take` input option.
     *
     * @default 1000
     */
    adminListQueryLimit?: number;
    /**
     * @description
     * Set the CORS handling for the server. See the [express CORS docs](https://github.com/expressjs/cors#configuration-options).
     */
    cors?: boolean | CorsOptions;
    /**
     * @description
     * Custom Express or NestJS middleware for the server.
     *
     * @default []
     */
    middlewares?: Middleware[];
}

/**
 * @description
 * The AuthOptions define how authentication and authorization is managed.
 *
 */
export interface AuthOptions {
    /**
     * @description
     * Disable authentication & permissions checks.
     * NEVER set the to true in production. It exists
     * only to aid certain development tasks.
     *
     * @default false
     */
    disableAuth?: boolean;
    /**
     * @description
     * Sets the method by which the session token is delivered and read.
     *
     * * 'cookie': Upon login, a 'Set-Cookie' header will be returned to the client, setting a
     *   cookie containing the session token. A browser-based client (making requests with credentials)
     *   should automatically send the session cookie with each request.
     * * 'bearer': Upon login, the token is returned in the response and should be then stored by the
     *   client app. Each request should include the header `Authorization: Bearer <token>`.
     *
     * Note that if the bearer method is used, firelancer will automatically expose the configured
     * `authTokenHeaderKey` in the server's CORS configuration (adding `Access-Control-Expose-Headers: firelancer-auth-token`
     * by default).
     *
     */
    tokenMethod?: 'cookie' | 'bearer' | ReadonlyArray<'cookie' | 'bearer'>;
    /**
     * @description
     * Options related to the handling of cookies when using the 'cookie' tokenMethod.
     */
    cookieOptions?: CookieOptions;
    /**
     * @description
     * Sets the header property which will be used to send the auth token when using the 'bearer' method.
     */
    authTokenHeaderKey?: string;
    /**
     * @description
     * Session duration, i.e. the time which must elapse from the last authenticated request
     * after which the user must re-authenticate.
     *
     * Expressed as a string describing a time span per
     * [zeit/ms](https://github.com/zeit/ms.js).  Eg: `60`, `'2 days'`, `'10h'`, `'7d'`
     *
     * @default '1y'
     */
    sessionDuration?: string | number;
    /**
     * @description
     * This strategy defines how sessions will be cached. By default, sessions are cached using a simple
     * in-memory caching strategy which is suitable for development and low-traffic, single-instance
     * deployments.
     *
     * @default InMemorySessionCacheStrategy
     */
    sessionCacheStrategy?: SessionCacheStrategy;
    /**
     * @description
     * The "time to live" of a given item in the session cache. This determines the length of time (in seconds)
     * that a cache entry is kept before being considered "stale" and being replaced with fresh data
     * taken from the database.
     *
     * @default 300
     */
    sessionCacheTTL?: number;
    /**
     * @description
     * Determines whether new User accounts require verification of their email address.
     *
     * If set to "true", the customer will be required to verify their email address using a verification token
     * they receive in their email. See the `registerCustomerAccount` mutation for more details on the verification behavior.
     *
     * @default true
     */
    requireVerification?: boolean;
    /**
     * @description
     * Sets the length of time that a verification token is valid for, after which the verification token must be refreshed.
     *
     * Expressed as a string describing a time span per
     * [zeit/ms](https://github.com/zeit/ms.js).  Eg: `60`, `'2 days'`, `'10h'`, `'7d'`
     *
     * @default '7d'
     */
    verificationTokenDuration?: string | number;
    /**
     * @description
     * Configures the credentials to be used to create a superadmin
     */
    superadminCredentials?: SuperadminCredentials;
    /**
     * @description
     * Configures one or more AuthenticationStrategies which defines how authentication
     * is handled in the Shop API.
     * @default NativeAuthenticationStrategy
     */
    shopAuthenticationStrategy?: AuthenticationStrategy[];
    /**
     * @description
     * Configures one or more AuthenticationStrategy which defines how authentication
     * is handled in the Admin API.
     *
     * @default NativeAuthenticationStrategy
     */
    adminAuthenticationStrategy?: AuthenticationStrategy[];
    /**
     * @description
     * Allows you to customize the way passwords are hashed when using the NativeAuthenticationStrategy.
     *
     * @default BcryptPasswordHashingStrategy
     */
    passwordHashingStrategy?: PasswordHashingStrategy;
    /**
     * @description
     * Allows you to set a custom policy for passwords when using the NativeAuthenticationStrategy.
     * By default, it uses the DefaultPasswordValidationStrategy, which will impose a minimum length
     * of four characters. To improve security for production, you are encouraged to specify a more strict
     * policy, which you can do like this:
     *
     * @example
     * ```ts
     * {
     *   passwordValidationStrategy: new DefaultPasswordValidationStrategy({
     *     // Minimum eight characters, at least one letter and one number
     *     regexp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
     *   }),
     * }
     * ```
     *
     * @default DefaultPasswordValidationStrategy
     */
    passwordValidationStrategy?: PasswordValidationStrategy;
    /**
     * @description
     * Allows custom Permissions to be defined, which can be used to restrict access to custom
     * REST controllers defined in plugins.
     *
     * @default []
     */
    customPermissions?: PermissionDefinition[];
}

/**
 * @description
 * Options for the handling of the cookies used to track sessions (only applicable if
 * `authOptions.tokenMethod` is set to `'cookie'`). These options are passed directly
 * to the Express [cookie-session middleware](https://github.com/expressjs/cookie-session).
 */
export interface CookieOptions {
    /**
     * @description
     * The name of the cookies to set.
     * If set to a string, both cookies for the Admin API and Shop API will have the same name.
     * If set as an object, it makes it possible to give different names to the Admin API and the Shop API cookies
     */
    name?: string | { shop: string; admin: string };
    /**
     * @description
     * The secret used for signing the session cookies for authenticated users. Only applies
     * tokenMethod is set to 'cookie'.
     *
     * In production applications, this should not be stored as a string in
     * source control for security reasons, but may be loaded from an external
     * file not under source control, or from an environment variable, for example.
     */
    secret?: string;
    /**
     * @description
     * a string indicating the path of the cookie.
     *
     * @default '/'
     */
    path?: string;
    /**
     * @description
     * a string indicating the domain of the cookie (no default).
     */
    domain?: string;
    /**
     * @description
     * a boolean or string indicating whether the cookie is a "same site" cookie (false by default). This can be set to 'strict',
     * 'lax', 'none', or true (which maps to 'strict').
     *
     * @default false
     */
    sameSite?: 'strict' | 'lax' | 'none' | boolean;
    /**
     * @description
     * a boolean indicating whether the cookie is only to be sent over HTTPS (false by default for HTTP, true by default for HTTPS).
     */
    secure?: boolean;
    /**
     * @description
     * a boolean indicating whether the cookie is only to be sent over HTTPS (use this if you handle SSL not in your node process).
     */
    secureProxy?: boolean;
    /**
     * @description
     * a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript (true by default).
     *
     * @default true
     */
    httpOnly?: boolean;
    /**
     * @description
     * a boolean indicating whether the cookie is to be signed (true by default). If this is true, another cookie of the same name with the .sig
     * suffix appended will also be sent, with a 27-byte url-safe base64 SHA1 value representing the hash of cookie-name=cookie-value against the
     * first Keygrip key. This signature key is used to detect tampering the next time a cookie is received.
     */
    signed?: boolean;
    /**
     * @description
     * a boolean indicating whether to overwrite previously set cookies of the same name (true by default). If this is true, all cookies set during
     * the same request with the same name (regardless of path or domain) are filtered out of the Set-Cookie header when setting this cookie.
     */
    overwrite?: boolean;
    /**
     * @description
     * A number representing the milliseconds from Date.now() for expiry
     */
    maxAge?: number;
    /**
     * @description
     * a Date object indicating the cookie's expiration date (expires at the end of session by default).
     */
    expires?: Date;
}

/**
 * @description
 * The AssetOptions define how assets (images and other files) are named and stored, and how preview images are generated.
 *
 * **Note**: If you are using the `AssetServerPlugin`, it is not necessary to configure these options.
 * */
export interface AssetOptions {
    /**
     * @description
     * Defines how asset files and preview images are named before being saved.
     *
     * @default DefaultAssetNamingStrategy
     */
    assetNamingStrategy?: AssetNamingStrategy;
    /**
     * @description
     * Defines the strategy used for storing uploaded binary files.
     *
     * @default NoAssetStorageStrategy
     */
    assetStorageStrategy?: AssetStorageStrategy;
    /**
     * @description
     * Defines the strategy used for creating preview images of uploaded assets.
     *
     * @default NoAssetPreviewStrategy
     */
    assetPreviewStrategy?: AssetPreviewStrategy;
    /**
     * @description
     * An array of the permitted file types that may be uploaded as Assets. Each entry
     * should be in the form of a valid
     * [unique file type specifier](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers)
     * i.e. either a file extension (".pdf") or a mime type ("image/*", "audio/mpeg" etc.).
     *
     * @default image, audio, video MIME types plus PDFs
     */
    permittedFileTypes?: string[];
    /**
     * @description
     * The max file size in bytes for uploaded assets.
     *
     * @default 20971520  //20MB
     */
    uploadMaxFileSize?: number;
}

/**
 * @description
 * Options related to the built-in job queue.
 */
export interface JobQueueOptions {
    /**
     * @description
     * Defines how the jobs in the queue are persisted and accessed.
     */
    jobQueueStrategy?: JobQueueStrategy;
    jobBufferStorageStrategy?: JobBufferStorageStrategy;
    /**
     * @description
     * Defines the queues that will run in this process.
     * This can be used to configure only certain queues to run in this process.
     * If its empty all queues will be run. Note: this option is primarily intended
     * to apply to the Worker process. Jobs will _always_ get published to the queue
     * regardless of this setting, but this setting determines whether they get
     * _processed_ or not.
     */
    activeQueues?: string[];
    /**
     * @description
     * Prefixes all job queue names with the passed string. This is useful with multiple deployments
     * in cloud environments using services such as Amazon SQS or Google Cloud Tasks.
     *
     * For example, we might have a staging and a production deployment in the same account/project and
     * each one will need its own task queue. We can achieve this with a prefix.
     */
    prefix?: string;
}

/**
 * @description
 * Options related to job-posts and collections.
 */
export interface CatalogOptions {
    /**
     * @description
     * Allows custom CollectionFilters to be defined.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collectionFilters?: Array<CollectionFilter<any>>;
}

/**
 * @description
 * Options relating to system functions.
 */
export interface SystemOptions {
    /**
     * @description
     * Defines an array of ErrorHandlerStrategy instances which are used to define logic to be executed
     * when an error occurs, either on the server or the worker.
     *
     * @default []
     */
    errorHandlers?: ErrorHandlerStrategy[];
}

/**
 * @description
 * Options relating to the internal handling of entities.
 */
export interface EntityOptions {
    /**
     * @description
     * Defines the strategy used for both storing the primary keys of entities
     * in the database, and the encoding & decoding of those ids when exposing
     * entities via the API. The default uses a simple auto-increment integer
     * strategy.
     *
     * :::caution
     * Note: changing from an integer-based strategy to a uuid-based strategy
     * on an existing Firelancer database will lead to problems with broken foreign-key
     * references. To change primary key types like this, you'll need to start with
     * a fresh database.
     * :::
     */

    entityIdStrategy?: EntityIdStrategy<'increment' | 'uuid'>;
    /**
     * @description
     * Defines the strategy used to store and round monetary values.
     *
     * @default DefaultMoneyStrategy
     */
    moneyStrategy?: MoneyStrategy;
}

/**
 * @description
 * Options related to importing & exporting data.
 */
export interface ImportExportOptions {
    /**
     * @description
     * The directory in which assets to be imported are located.
     *
     * @default __dirname
     */
    importAssetsDir?: string;
    /**
     * @description
     * This strategy determines how asset files get imported based on the path given in the
     * import CSV or via the {@link AssetImporter} `getAssets()` method.
     */
    assetImportStrategy?: AssetImportStrategy;
}

/**
 * @description
 * These credentials will be used to create the Superadmin user & administrator
 * when firelancer first bootstraps.
 */
export interface SuperadminCredentials {
    /**
     * @description
     * The identifier to be used to create a superadmin account
     * @default 'superadmin'
     */
    identifier: string;
    /**
     * @description
     * The password to be used to create a superadmin account
     * @default 'superadmin'
     */
    password: string;
}

export interface FirelancerConfig {
    /**
     * @description
     * Configuration for the REST APIs, including hostname, port, CORS settings,
     * middleware etc.
     */
    apiOptions: ApiOptions;
    /**
     * @description
     * Configuration for the handling of Assets.
     */
    assetOptions?: AssetOptions;
    /**
     * @description
     * Configuration for authorization.
     */
    authOptions: AuthOptions;
    /**
     * @description
     * The connection options used by TypeORM to connect to the database.
     * See the [TypeORM documentation](https://typeorm.io/#/connection-options) for a
     * full description of all available options.
     */
    dbConnectionOptions: DataSourceOptions;
    /**
     * @description
     * The default languageCode of the app.
     *
     * @default LanguageCode.en
     */
    defaultLanguageCode?: LanguageCode;
    /**
     * @description
     * Specifies the currencies that are available for use in the application.
     *
     * @default [CurrencyCode.USD]
     */
    availableCurrencyCodes?: CurrencyCode[];
    /**
     * @description
     * An array of plugins.
     *
     * @default []
     */
    plugins?: Array<DynamicModule | Type<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
    /**
     * @description
     * Configures how the job queue is persisted and processed.
     */
    jobQueueOptions?: JobQueueOptions;
    /**
     * @description
     * Configuration for Collections.
     */
    catalogOptions?: CatalogOptions;
    /**
     * @description
     * Configures system options
     */
    systemOptions?: SystemOptions;
    /**
     * @description
     * Provide a logging service which implements the FirelancerLogger interface.
     * Note that the logging of SQL queries is controlled separately by the
     * `dbConnectionOptions.logging` property.
     *
     * @default DefaultLogger
     */
    logger?: FirelancerLogger;
    /**
     * @description
     * Defines the strategy used for both storing the primary keys of entities
     * in the database, and the encoding & decoding of those ids when exposing
     * entities via the API. The default uses a simple auto-increment integer
     * strategy.
     *
     * @default AutoIncrementIdStrategy
     */
    entityOptions?: EntityOptions;
    /**
     * @description
     * Configuration settings for data import and export.
     */
    importExportOptions?: ImportExportOptions;
}

/**
 * @description
 * This interface represents the firelancerConfig object available at run-time, i.e. the user-supplied
 * config values have been merged with the defaultConfig values.
 */
export interface RuntimeFirelancerConfig extends Required<FirelancerConfig> {
    apiOptions: Required<ApiOptions>;
    assetOptions: Required<AssetOptions>;
    authOptions: Required<AuthOptions>;
    jobQueueOptions: Required<JobQueueOptions>;
    catalogOptions: Required<CatalogOptions>;
    systemOptions: Required<SystemOptions>;
    entityOptions: Required<EntityOptions>;
    importExportOptions: Required<ImportExportOptions>;
}

type DeepPartialSimple<T> = {
    [P in keyof T]?:
        | null
        | (T[P] extends Array<infer U>
              ? Array<DeepPartialSimple<U>>
              : T[P] extends ReadonlyArray<infer X>
                ? ReadonlyArray<DeepPartialSimple<X>>
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  T[P] extends Type<any>
                  ? T[P]
                  : DeepPartialSimple<T[P]>);
};

export type PartialFirelancerConfig = DeepPartialSimple<FirelancerConfig>;
