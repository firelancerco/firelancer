import { JsonCompatible } from '@firelancerco/common/lib/shared-types';
import { intersect, isObject } from '@firelancerco/common/lib/shared-utils';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ParseKeys, TFunction } from 'i18next';
import { EntityManager } from 'typeorm';

import { CurrencyCode, ID, LanguageCode, Permission } from '@firelancerco/common/lib/generated-schema';
import { CachedSession } from '../config/strategies/session-cache/session-cache-strategy';
import { getPermissions } from '../service/helpers/utils/get-user-permissions';
import { REQUEST_CONTEXT_KEY, REQUEST_CONTEXT_MAP_KEY, TRANSACTION_MANAGER_KEY } from './constants';
import { ApiType } from './get-api-type';

export type SerializedRequestContext = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _req?: any;
    _session: JsonCompatible<Required<CachedSession>>;
    _apiType: ApiType;
    _isAuthorized: boolean;
    _authorizedAsOwnerOnly: boolean;
    _languageCode: LanguageCode;
};

/**
 * This object is used to store the RequestContext on the Express Request object.
 */
interface RequestContextStore {
    /**
     * This is the default RequestContext for the handler.
     */
    default: RequestContext;
    /**
     * If a transaction is started, the resulting RequestContext is stored here.
     * This RequestContext will have a transaction manager attached via the
     * TRANSACTION_MANAGER_KEY symbol.
     *
     * When a transaction is started, the TRANSACTION_MANAGER_KEY symbol is added to the RequestContext
     * object. This is then detected inside the internal_setRequestContext function and the
     * RequestContext object is stored in the RequestContextStore under the withTransactionManager key.
     */
    withTransactionManager?: RequestContext;
}

interface RequestWithStores extends Request {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [REQUEST_CONTEXT_MAP_KEY]?: Map<Function, RequestContextStore> | undefined;
    [REQUEST_CONTEXT_KEY]?: RequestContextStore | undefined;
}

/**
 * @description
 * This function is used to set the RequestContext on the `req` object. This is the underlying
 * mechanism by which we are able to access the `RequestContext` from different places.
 *
 * For example, here is a diagram to show how, in an incoming API request, we are able to store
 * and retrieve the `RequestContext` in a resolver:
 */
export function internal_setRequestContext(
    req: RequestWithStores,
    ctx: RequestContext,
    executionContext?: ExecutionContext,
) {
    // If we have access to the `ExecutionContext`, it means we are able to bind
    // the `ctx` object to the specific "handler", i.e. the controller (for REST).
    let item: RequestContextStore | undefined;
    if (executionContext && typeof executionContext.getHandler === 'function') {
        const map = req[REQUEST_CONTEXT_MAP_KEY] || new Map();
        item = map.get(executionContext.getHandler());
        const ctxHasTransaction = Object.getOwnPropertySymbols(ctx).includes(TRANSACTION_MANAGER_KEY);
        if (item) {
            item.default = item.default ?? ctx;
            if (ctxHasTransaction) {
                item.withTransactionManager = ctx;
            }
        } else {
            item = {
                default: ctx,
                withTransactionManager: ctxHasTransaction ? ctx : undefined,
            };
        }
        map.set(executionContext.getHandler(), item);

        req[REQUEST_CONTEXT_MAP_KEY] = map;
    }
    // We also bind to a shared key so that we can access the `ctx` object
    // later even if we don't have a reference to the `ExecutionContext`
    req[REQUEST_CONTEXT_KEY] = item ?? {
        default: ctx,
    };
}

/**
 * @description
 * Gets the RequestContext from the `req` object. See internal_setRequestContext
 * for more details on this mechanism.
 */
export function internal_getRequestContext(
    req: RequestWithStores,
    executionContext?: ExecutionContext,
): RequestContext | undefined {
    let item: RequestContextStore | undefined;
    if (executionContext && typeof executionContext.getHandler === 'function') {
        const map = req[REQUEST_CONTEXT_MAP_KEY];
        item = map?.get(executionContext.getHandler());
        // If we have a ctx associated with the current handler (resolver function), we
        // return it. Otherwise, we fall back to the shared key which will be there.
        if (item) {
            return item.withTransactionManager || item.default;
        }
    }

    if (!item) {
        item = req[REQUEST_CONTEXT_KEY];
    }

    const transactionalCtx =
        item?.withTransactionManager &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item.withTransactionManager as any as EntityManager | undefined)?.queryRunner?.isReleased === false
            ? item.withTransactionManager
            : undefined;

    return transactionalCtx || item?.default;
}

/**
 * @description
 * The RequestContext holds information relevant to the current request, which may be
 * required at various points of the stack.
 *
 * It is a good practice to inject the RequestContext (using the Ctx decorator) into
 * _all_ resolvers & REST handler, and then pass it through to the service layer.
 *
 * This allows the service layer to access information about the current user, the active language, and so on.
 * In addition, the TransactionalConnection relies on the presence of the RequestContext object in order
 * to correctly handle per-request database transactions.
 *
 * @example
 * ```ts
 * \@GET()
 * getData(\@Ctx() ctx: RequestContext) {
 *   return this.myService.getData(ctx);
 * }
 * ```
 */
export class RequestContext {
    private readonly _req?: Request;
    private readonly _apiType: ApiType;
    private readonly _session?: CachedSession;
    private readonly _isAuthorized: boolean;
    private readonly _authorizedAsOwnerOnly: boolean;
    private readonly _currencyCode: CurrencyCode;
    private readonly _languageCode: LanguageCode;
    private readonly _translationFn: TFunction;

    constructor(options: {
        req?: Request;
        apiType: ApiType;
        session?: CachedSession;
        isAuthorized: boolean;
        authorizedAsOwnerOnly: boolean;
        currencyCode?: CurrencyCode;
        languageCode?: LanguageCode;
        translationFn?: TFunction;
    }) {
        const { req, apiType, session, currencyCode, languageCode, translationFn } = options;
        this._req = req;
        this._apiType = apiType;
        this._session = session;
        this._isAuthorized = options.isAuthorized;
        this._authorizedAsOwnerOnly = options.authorizedAsOwnerOnly;
        this._currencyCode = currencyCode || CurrencyCode.USD;
        this._languageCode = languageCode || LanguageCode.en;
        this._translationFn = translationFn || (((key: string) => key) as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    /**
     * @description
     * Creates an "empty" RequestContext object. This is only intended to be used
     * when a service method must be called outside the normal request-response
     * cycle, e.g. when programmatically populating data. Usually a better alternative
     * is to use the RequestContextService `create()` method, which allows more control
     * over the resulting RequestContext object.
     */
    static empty(): RequestContext {
        return new RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
        });
    }

    /**
     * @description
     * Returns `true` if there is an active Session & User associated with this request,
     * and that User has the specified permissions.
     */
    userHasPermissions(permissions: Permission[]): boolean {
        const user = this.session?.user;
        if (!user) {
            return false;
        }
        if (permissions.length === 0) {
            return true;
        }
        const matched = intersect(permissions, getPermissions(user.roles));
        const hasPermissions = permissions.length === matched.length;

        return hasPermissions;
    }

    /**
     * @description
     * Creates a new RequestContext object from a serialized object created by the
     * `serialize()` method.
     */
    static deserialize(ctxObject: SerializedRequestContext): RequestContext {
        return new RequestContext({
            req: ctxObject._req,
            apiType: ctxObject._apiType,
            session: {
                ...ctxObject._session,
                expires: ctxObject._session?.expires && new Date(ctxObject._session.expires),
            },
            isAuthorized: ctxObject._isAuthorized,
            authorizedAsOwnerOnly: ctxObject._authorizedAsOwnerOnly,
            languageCode: ctxObject._languageCode,
        });
    }

    /**
     * @description
     * Serializes the RequestContext object into a JSON-compatible simple object.
     * This is useful when you need to send a RequestContext object to another
     * process, e.g. to pass it to the Job Queue via the JobQueueService.
     */
    serialize(): SerializedRequestContext {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serializableThis: any = Object.assign({}, this);
        if (this._req) {
            serializableThis._req = this.shallowCloneRequestObject(this._req);
        }
        return JSON.parse(JSON.stringify(serializableThis));
    }

    /**
     * @description
     * Creates a shallow copy of the RequestContext instance. This means that
     * mutations to the copy itself will not affect the original,
     * but deep mutations *will* also affect the original.
     */
    copy(): RequestContext {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    /**
     * The Express "Request" object is huge and contains many circular
     * references. We will preserve just a subset of the whole, by preserving
     * only the serializable properties up to 2 levels deep.
     * @private
     */
    private shallowCloneRequestObject(req: Request) {
        function copySimpleFieldsToDepth(target: Record<string, unknown>, maxDepth: number, depth: number = 0) {
            const result: Record<string, unknown> = {};
            for (const key in target) {
                if (key === 'host' && depth === 0) {
                    // avoid Express "deprecated: req.host" warning
                    continue;
                }
                let val: unknown;
                try {
                    val = target[key];
                } catch (e: unknown) {
                    val = String(e);
                }

                if (Array.isArray(val)) {
                    depth++;
                    result[key] = val.map(v => {
                        if (!isObject(v) && typeof val !== 'function') {
                            return v;
                        } else {
                            return copySimpleFieldsToDepth(v, maxDepth, depth);
                        }
                    });
                    depth--;
                } else if (!isObject(val) && typeof val !== 'function') {
                    result[key] = val;
                } else if (depth < maxDepth) {
                    depth++;
                    result[key] = copySimpleFieldsToDepth(val as Record<string, unknown>, maxDepth, depth);
                    depth--;
                }
            }
            return result;
        }
        return copySimpleFieldsToDepth(req as unknown as Record<string, unknown>, 1);
    }

    /**
     * @description
     * The raw Express request object.
     */
    get req(): Request | undefined {
        return this._req;
    }

    /**
     * @description
     * Signals which API this request was received by, e.g. `admin` or `shop`.
     */
    get apiType(): ApiType {
        return this._apiType;
    }

    get currencyCode(): CurrencyCode {
        return this._currencyCode;
    }

    get languageCode(): LanguageCode {
        return this._languageCode;
    }

    get session(): CachedSession | undefined {
        return this._session;
    }

    get activeUserId(): ID | undefined {
        return this.session?.user?.id;
    }

    /**
     * @description
     * True if the current session is authorized to access the current controller method.
     */
    get isAuthorized(): boolean {
        return this._isAuthorized;
    }

    /**
     * @description
     * True if the current anonymous session is only authorized to operate on entities that
     * are owned by the current session.
     */
    get authorizedAsOwnerOnly(): boolean {
        return this._authorizedAsOwnerOnly;
    }

    /**
     * @description
     * Translate the given i18n key
     */
    translate(key: ParseKeys, variables?: { [k: string]: unknown }): string {
        try {
            return this._translationFn(key, variables);
        } catch (e) {
            return `Translation format error: ${JSON.stringify(e instanceof Error && e.message)}). Original key: ${key}`;
        }
    }
}
