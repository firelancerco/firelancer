import { CustomerType } from '@firelancerco/common/lib/shared-schema';
import {
    AuthenticationStrategy,
    ExternalAuthenticationService,
    Injector,
    RequestContext,
    User,
    UserInputException,
} from '@firelancerco/core';
import { OAuth2Client } from 'google-auth-library';

export type GoogleAuthData = {
    token: string;
    type?: CustomerType;
};

export class GoogleAuthenticationStrategy implements AuthenticationStrategy<GoogleAuthData> {
    readonly name = 'google';
    private client: OAuth2Client;
    private externalAuthenticationService: ExternalAuthenticationService;

    constructor(private clientId: string) {
        this.client = new OAuth2Client(clientId);
    }

    init(injector: Injector) {
        this.externalAuthenticationService = injector.get(ExternalAuthenticationService);
    }

    /**
     * Implements https://developers.google.com/identity/sign-in/web/backend-auth
     */
    async authenticate(ctx: RequestContext, data: GoogleAuthData): Promise<User | false> {
        const ticket = await this.client.verifyIdToken({
            idToken: data.token,
            audience: this.clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return false;
        }

        const user = await this.externalAuthenticationService.findCustomerUser(ctx, this.name, payload.sub);
        if (user) {
            return user;
        }

        if (!data.type) {
            throw new UserInputException('error.customer-type-required');
        }

        return this.externalAuthenticationService.createCustomerAndUser(ctx, {
            strategy: this.name,
            externalIdentifier: payload.sub,
            verified: payload.email_verified || false,
            emailAddress: payload.email,
            firstName: payload.given_name ?? '',
            lastName: payload.family_name ?? '',
            type: data.type,
        });
    }
}
