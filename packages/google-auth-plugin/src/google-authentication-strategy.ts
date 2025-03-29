/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { GoogleAuthData } from './shared-schema';

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

    async authenticate(ctx: RequestContext, data: GoogleAuthData): Promise<User | string> {
        if (!data?.action) {
            return 'error.google-auth-action-required';
        }

        if (!['login', 'register'].includes(data.action)) {
            return 'error.google-auth-invalid-action-value';
        }

        try {
            const profile = await this.getGoogleProfile(data);

            if (!profile?.email) {
                return 'error.google-auth-profile-invalid';
            }

            // Try to find existing user
            const user = await this.externalAuthenticationService.findCustomerUser(ctx, this.name, profile.sub);

            if (user) {
                return user;
            }

            // Handle login attempt for non-existent user
            if (data.action === 'login') {
                return 'error.user-not-registered';
            }

            // Handle registration
            if (!data.customer_type) {
                return 'error.register-customer-type-required';
            }

            return await this.externalAuthenticationService.createCustomerAndUser(ctx, {
                strategy: this.name,
                externalIdentifier: profile.sub,
                verified: profile.email_verified || false,
                emailAddress: profile.email,
                firstName: profile.given_name ?? '',
                lastName: profile.family_name ?? '',
                type: data.customer_type,
            });
        } catch (error: any) {
            return error.message ?? 'error.unkown-error';
        }
    }

    private async getGoogleProfile(data: GoogleAuthData): Promise<any | null> {
        if (data.access_token) {
            return this.fetchUserInfo(data.access_token);
        } else if (data.id_token) {
            return this.verifyIdToken(data.id_token);
        }
        return null;
    }

    private async fetchUserInfo(accessToken: string): Promise<any> {
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error: any) {
            throw new UserInputException(`error.google-failed-to-fetch-user-info`, {
                message: error.response?.data?.error_description || error.message,
            });
        }
    }

    private async verifyIdToken(idToken: string): Promise<any> {
        try {
            const ticket = await this.client.verifyIdToken({ idToken, audience: this.clientId });
            return ticket.getPayload();
        } catch (error: any) {
            throw new UserInputException(`error.google-failed-to-fetch-user-info`, {
                message: error.response?.data?.error_description || error.message,
            });
        }
    }
}
