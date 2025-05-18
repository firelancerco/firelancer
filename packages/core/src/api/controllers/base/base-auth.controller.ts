import { Request, Response } from 'express';
import { CurrentUser, MutationAuthenticateArgs } from '@firelancerco/common/lib/generated-schema';

import { ForbiddenException, InvalidCredentialsException, UserInputException } from '../../../common/error/errors';
import { extractSessionToken } from '../../../common/extract-session-token';
import { ApiType } from '../../../common/get-api-type';
import { RequestContext } from '../../../common/request-context';
import { setSessionToken } from '../../../common/set-session-token';
import { LogLevel } from '../../../config';
import { ConfigService } from '../../../config/config.service';
import { AuthOptions } from '../../../config/firelancer-config';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../../config/strategies/authentication/default/native-authentication-strategy';
import { User } from '../../../entity';
import { getUserPermissions } from '../../../service/helpers/utils/get-user-permissions';
import { AdministratorService } from '../../../service/services/administrator.service';
import { AuthService } from '../../../service/services/auth.service';
import { UserService } from '../../../service/services/user.service';
import { BadRequestException } from '@nestjs/common';

export class BaseAuthController {
    constructor(
        protected authService: AuthService,
        protected userService: UserService,
        protected administratorService: AdministratorService,
        protected configService: ConfigService,
    ) {}

    /**
     * Attempts a login given the username and password of a user. If successful, returns
     * the user data and returns the token either in a cookie or in the response body.
     */
    async baseLogin(args: any, ctx: RequestContext, req: Request, res: Response) {
        const result = await this.authenticateAndCreateSession(
            ctx,
            {
                input: { [NATIVE_AUTH_STRATEGY_NAME]: args },
                rememberMe: args.rememberMe,
            },
            req,
            res,
        );

        return res.send(result);
    }

    async logout(ctx: RequestContext, req: Request, res: Response) {
        const authOptions = this.configService.authOptions;
        const token = extractSessionToken(req, authOptions.tokenMethod);
        if (!token) {
            return res.send({ logout: { success: false } });
        }

        await this.authService.destroyAuthenticatedSession(ctx, token);

        setSessionToken({
            req,
            res,
            authOptions: authOptions as Required<AuthOptions>,
            rememberMe: false,
            sessionToken: '',
        });

        return res.send({ success: true });
    }

    /**
     * Returns information about the current authenticated user.
     */
    async me(ctx: RequestContext, apiType: ApiType) {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new ForbiddenException(LogLevel.Verbose);
        }

        if (apiType === 'admin') {
            const administrator = await this.administratorService.findOneByUserId(ctx, userId, ['user.roles']);
            if (!administrator) {
                throw new ForbiddenException(LogLevel.Verbose);
            }
        }

        const user = await this.userService.getUserById(ctx, userId);
        if (!user) {
            throw new ForbiddenException(LogLevel.Verbose);
        }

        return this.publiclyAccessibleUser(user);
    }

    /**
     * Creates an authenticated session and sets the session token.
     */
    protected async authenticateAndCreateSession(
        ctx: RequestContext,
        args: MutationAuthenticateArgs,
        req: Request,
        res: Response,
    ) {
        if (!args.input || Object.keys(args.input).length === 0) {
            throw new BadRequestException('Validation error: No authentication method provided');
        }

        const [method, data] = Object.entries(args.input)[0];
        const { apiType } = ctx;

        const session = await this.authService.authenticate(ctx, apiType, method, data);

        if (apiType === 'admin') {
            const administrator = await this.administratorService.findOneByUserId(ctx, session.user.id);
            if (!administrator) {
                throw new InvalidCredentialsException();
            }
        }

        setSessionToken({
            req,
            res,
            sessionToken: session.token,
            rememberMe: args.rememberMe || false,
            authOptions: this.configService.authOptions,
        });

        return this.publiclyAccessibleUser(session.user);
    }

    /**
     * Updates the password of an existing User.
     */
    protected async updatePassword(ctx: RequestContext, currentPassword: string, newPassword: string): Promise<void> {
        const { activeUserId } = ctx;
        if (!activeUserId) {
            throw new ForbiddenException();
        }

        await this.userService.updatePassword(ctx, activeUserId, currentPassword, newPassword);
    }

    /**
     * Exposes a subset of the User properties which we want to expose to the public API.
     */
    protected publiclyAccessibleUser(user: User): CurrentUser {
        return {
            id: user.id,
            identifier: user.identifier,
            verified: user.verified,
            roles: user.roles.map(role => ({ code: role.code, description: role.description })),
            permissions: getUserPermissions(user),
        };
    }
}
