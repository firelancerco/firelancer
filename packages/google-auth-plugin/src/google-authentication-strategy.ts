/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomerType } from '@firelancerco/common/lib/shared-schema';
import {
    AuthenticationStrategy,
    ExternalAuthenticationService,
    Injector,
    RequestContext,
    User,
    UserInputException,
} from '@firelancerco/core';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

export type GoogleAuthData = {
    id_token?: string;
    access_token?: string;
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

    async authenticate(ctx: RequestContext, data: GoogleAuthData): Promise<User | false> {
        let payload: any | undefined = undefined;

        if (data.access_token) {
            const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                },
            });
            payload = userInfoResponse.data;
        } else if (data.id_token) {
            const ticket = await this.client.verifyIdToken({
                idToken: data.id_token,
                audience: this.clientId,
            });
            payload = ticket.getPayload();
        }

        if (!payload || !payload.email) {
            return false;
        }

        const user = await this.externalAuthenticationService.findCustomerUser(ctx, this.name, payload.sub);
        if (user) {
            return user;
        }

        // user does not exist; register new user
        if (!data.type) {
            throw new UserInputException('error.register-customer-type-required');
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
