import {
    HistoryEntryType,
    MutationAuthenticateArgs,
    MutationLoginArgs,
    MutationRefreshCustomerVerificationArgs,
    MutationRegisterCustomerAccountArgs,
    MutationRequestPasswordResetArgs,
    MutationRequestUpdateCustomerEmailAddressArgs,
    MutationResetPasswordArgs,
    MutationUpdateCustomerEmailAddressArgs,
    MutationUpdateCustomerPasswordArgs,
    MutationVerifyCustomerAccountArgs,
    Permission,
} from '@firelancerco/common/lib/generated-shop-schema';
import { Body, Controller, Get, Post, Request, Response } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';

import { Allow } from '../../../api/decorators/allow.decorator';
import { Ctx } from '../../../api/decorators/request-context.decorator';
import { Transaction } from '../../../api/decorators/transaction.decorator';
import { coreSchemas } from '../../../api/schema/core-schemas';
import { ForbiddenException, NativeAuthStrategyException } from '../../../common/error/errors';
import { RequestContext } from '../../../common/request-context';
import { setSessionToken } from '../../../common/set-session-token';
import { Logger } from '../../../config';
import { ConfigService } from '../../../config/config.service';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../../config/strategies/authentication/default/native-authentication-strategy';
import { AdministratorService } from '../../../service/services/administrator.service';
import { AuthService } from '../../../service/services/auth.service';
import { CustomerService } from '../../../service/services/customer.service';
import { HistoryService } from '../../../service/services/history.service';
import { UserService } from '../../../service/services/user.service';
import { BaseAuthController } from '../base/base-auth.controller';

@Controller('auth')
export class ShopAuthController extends BaseAuthController {
    constructor(
        authService: AuthService,
        userService: UserService,
        administratorService: AdministratorService,
        configService: ConfigService,
        protected customerService: CustomerService,
        protected historyService: HistoryService,
    ) {
        super(authService, userService, administratorService, configService);
    }

    @Transaction()
    @Post('login')
    @Allow(Permission.Public)
    async login(
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationLoginArgs))
        args: MutationLoginArgs,
    ) {
        this.requireNativeAuthStrategy();
        return super.baseLogin(args, ctx, req, res);
    }

    @Transaction()
    @Post('authenticate')
    @Allow(Permission.Public)
    async authenticate(
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationAuthenticateArgs))
        args: MutationAuthenticateArgs,
    ) {
        const result = await this.authenticateAndCreateSession(ctx, args, req, res);
        return res.send({ login: result });
    }

    @Transaction()
    @Post('logout')
    @Allow(Permission.Public)
    async logout(@Ctx() ctx: RequestContext, @Request() req: ExpressRequest, @Response() res: ExpressResponse) {
        return super.logout(ctx, req, res);
    }

    @Get('me')
    @Allow(Permission.Authenticated)
    me(@Ctx() ctx: RequestContext) {
        return super.me(ctx, 'shop');
    }

    @Transaction()
    @Post('register')
    @Allow(Permission.Public)
    async registerCustomerAccount(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationRegisterCustomerAccountArgs))
        args: MutationRegisterCustomerAccountArgs,
    ) {
        this.requireNativeAuthStrategy();
        await this.customerService.registerCustomerAccount(ctx, args.input);
        return { sucess: true };
    }

    @Throttle({ default: { ttl: 60000, limit: 20 } })
    @Transaction()
    @Post('verify')
    @Allow(Permission.Public)
    async verifyCustomerAccount(
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationVerifyCustomerAccountArgs))
        args: MutationVerifyCustomerAccountArgs,
    ): Promise<void> {
        this.requireNativeAuthStrategy();
        const { token, password } = args;
        const customer = await this.customerService.verifyCustomerEmailAddress(ctx, token, password || undefined);
        const session = await this.authService.createAuthenticatedSessionForUser(
            ctx,
            // We know that there is a user, since the Customer
            // was found with the .getCustomerByUserId() method.
            customer.user!,
            NATIVE_AUTH_STRATEGY_NAME,
        );

        setSessionToken({
            req,
            res,
            authOptions: this.configService.authOptions,
            rememberMe: true,
            sessionToken: session.token,
        });

        res.send(this.publiclyAccessibleUser(session.user));
    }

    @Transaction()
    @Post('refresh-verification')
    @Allow(Permission.Public)
    async refreshCustomerVerification(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationRefreshCustomerVerificationArgs))
        args: MutationRefreshCustomerVerificationArgs,
    ): Promise<{ success: boolean }> {
        this.requireNativeAuthStrategy();
        await this.customerService.refreshVerificationToken(ctx, args.emailAddress);
        return { success: true };
    }

    @Transaction()
    @Post('request-reset-password')
    @Allow(Permission.Public)
    async requestPasswordReset(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationRequestPasswordResetArgs))
        args: MutationRequestPasswordResetArgs,
    ): Promise<{ success: boolean }> {
        this.requireNativeAuthStrategy();
        await this.customerService.requestPasswordReset(ctx, args.emailAddress);
        return { success: true };
    }

    @Throttle({ default: { ttl: 60000, limit: 20 } })
    @Transaction()
    @Post('reset-password')
    @Allow(Permission.Public)
    async resetPassword(
        @Ctx() ctx: RequestContext,
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationRequestPasswordResetArgs))
        args: MutationResetPasswordArgs,
    ): Promise<void> {
        this.requireNativeAuthStrategy();
        const { token, password } = args;
        const user = await this.customerService.resetPassword(ctx, token, password);
        const authUser = await super.authenticateAndCreateSession(
            ctx,
            {
                input: {
                    [NATIVE_AUTH_STRATEGY_NAME]: {
                        username: user.identifier,
                        password: args.password,
                    },
                },
            },
            req,
            res,
        );

        res.send(authUser);
    }

    @Transaction()
    @Post('update-password')
    @Allow(Permission.Owner)
    async updateCustomerPassword(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationUpdateCustomerPasswordArgs))
        args: MutationUpdateCustomerPasswordArgs,
    ): Promise<{ success: boolean }> {
        this.requireNativeAuthStrategy();

        await super.updatePassword(ctx, args.currentPassword, args.newPassword);

        if (ctx.activeUserId) {
            const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
            if (customer) {
                await this.historyService.createHistoryEntryForCustomer({
                    ctx,
                    customerId: customer.id,
                    type: HistoryEntryType.CUSTOMER_PASSWORD_UPDATED,
                    data: {},
                });
            }
        }

        return { success: true };
    }

    @Transaction()
    @Post('request-update-email')
    @Allow(Permission.Owner)
    async requestUpdateCustomerEmailAddress(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationRequestUpdateCustomerEmailAddressArgs))
        args: MutationRequestUpdateCustomerEmailAddressArgs,
    ): Promise<{ success: boolean }> {
        this.requireNativeAuthStrategy();
        if (!ctx.activeUserId) {
            throw new ForbiddenException();
        }
        await this.authService.verifyUserPassword(ctx, ctx.activeUserId, args.password);
        const result = await this.customerService.requestUpdateEmailAddress(
            ctx,
            ctx.activeUserId,
            args.newEmailAddress,
        );
        return {
            success: result,
        };
    }

    @Throttle({ default: { ttl: 60000, limit: 20 } })
    @Transaction()
    @Post('update-email')
    @Allow(Permission.Owner)
    async updateCustomerEmailAddress(
        @Ctx() ctx: RequestContext,
        @Body(new ZodValidationPipe(coreSchemas.shop.MutationUpdateCustomerEmailAddressArgs))
        args: MutationUpdateCustomerEmailAddressArgs,
    ): Promise<{ success: boolean }> {
        this.requireNativeAuthStrategy();
        const result = await this.customerService.updateEmailAddress(ctx, args.token);
        return { success: result };
    }

    protected requireNativeAuthStrategy() {
        const { shopAuthenticationStrategy } = this.configService.authOptions;
        const nativeAuthStrategyIsConfigured = !!shopAuthenticationStrategy.find(
            strategy => strategy.name === NATIVE_AUTH_STRATEGY_NAME,
        );
        if (!nativeAuthStrategyIsConfigured) {
            const authStrategyNames = shopAuthenticationStrategy.map(s => s.name).join(', ');
            const errorMessage =
                'This REST operation requires that the NativeAuthenticationStrategy be configured for the Shop API.\n' +
                `Currently the following AuthenticationStrategies are enabled: ${authStrategyNames}`;
            Logger.error(errorMessage);
            throw new NativeAuthStrategyException();
        }
    }
}
