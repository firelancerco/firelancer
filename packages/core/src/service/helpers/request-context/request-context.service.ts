import { intersect } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserInputException } from '../../../common';
import { ApiType, getApiType } from '../../../common/get-api-type';
import { RequestContext } from '../../../common/request-context';
import { CurrencyCode, LanguageCode, Permission } from '../../../common/shared-schema';
import { ConfigService } from '../../../config/config.service';
import { CachedSession, CachedSessionUser } from '../../../config/strategies/session-cache/session-cache-strategy';
import { User } from '../../../entity';
import { getPermissions } from '../utils/get-user-permissions';
const ms = require('ms'); // eslint-disable-line @typescript-eslint/no-require-imports

/**
 * @description
 * Creates new link instances.
 */
@Injectable()
export class RequestContextService {
    constructor(private configService: ConfigService) {}

    /**
     * @description
     * Creates a RequestContext based on the config provided. This can be useful when interacting
     * with services outside the request-response cycle, for example in stand-alone scripts or in
     * worker jobs.
     */
    create(config: {
        req?: Request;
        apiType: ApiType;
        languageCode?: LanguageCode;
        currencyCode?: CurrencyCode;
        user?: User;
    }): RequestContext {
        const { req, apiType, languageCode, currencyCode, user } = config;
        let session: CachedSession | undefined;
        if (user) {
            session = {
                user: {
                    id: user.id,
                    identifier: user.identifier,
                    verified: user.verified,
                    roles: user?.roles ?? [],
                },
                id: 0,
                token: '__dummy_session_token__',
                expires: new Date(Date.now() + ms('1y')),
                cacheExpiry: ms('1y'),
            };
        }
        return new RequestContext({
            req,
            apiType,
            session,
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            languageCode,
            currencyCode,
        });
    }

    /**
     * @description
     * Creates a new RequestContext based on an Express request object. This is used internally
     * in the API layer by the AuthGuard, and creates the RequestContext which is then passed
     * to all resolvers & controllers.
     */
    fromRequest(req: Request, session?: CachedSession, requiredPermissions?: Permission[]): RequestContext {
        const apiType = getApiType(req);

        const hasOwnerPermission = !!requiredPermissions && requiredPermissions.includes(Permission.Owner);
        const languageCode = this.getLanguageCode(req);
        const currencyCode = this.getCurrencyCode(req);
        const user = session && session.user;
        const isAuthorized = this.userHasPermissions(requiredPermissions ?? [], user);
        const authorizedAsOwnerOnly = !isAuthorized && hasOwnerPermission;
        const translationFn = (req as any).t; // eslint-disable-line @typescript-eslint/no-explicit-any
        return new RequestContext({
            req,
            apiType,
            session,
            isAuthorized,
            authorizedAsOwnerOnly,
            languageCode,
            currencyCode,
            translationFn,
        });
    }

    private getLanguageCode(req: Request): LanguageCode | undefined {
        const queryLanguage = req.query && (req.query.languageCode as LanguageCode);
        const headerLanguage = req.header('Accept-Language')?.split(',')[0] as LanguageCode;
        return queryLanguage || headerLanguage || this.configService.defaultLanguageCode;
    }

    private getCurrencyCode(req: Request): CurrencyCode | undefined {
        const queryCurrencyCode = req.query && (req.query.currencyCode as CurrencyCode);
        if (queryCurrencyCode && this.configService.availableCurrencyCodes.includes(queryCurrencyCode)) {
            throw new UserInputException('error.currency-not-available');
        }
        return queryCurrencyCode;
    }

    /**
     * TODO: Deprecate and remove, since this function is now handled internally in the RequestContext.
     */
    userHasPermissions(permissions: Permission[], user?: CachedSessionUser): boolean {
        if (!user) {
            return false;
        }
        if (permissions.length === 0) {
            return true;
        }
        const matched = intersect(permissions, getPermissions(user.roles));
        return matched.length === permissions.length;
    }
}
