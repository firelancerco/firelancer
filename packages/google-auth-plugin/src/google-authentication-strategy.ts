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
import z from 'zod';

export const GoogleAuthData = z
    .object({
        id_token: z.string().optional(),
        access_token: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.id_token && !data.access_token) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Either id_token or access_token must be provided',
                path: [],
            });
        }
    });

export type GoogleAuthData = z.infer<typeof GoogleAuthData>;

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

    getInputSchema() {
        return GoogleAuthData;
    }

    async authenticate(ctx: RequestContext, data: GoogleAuthData): Promise<User | string> {
        try {
            const googleProfile = await this.getGoogleProfile(data);

            if (!googleProfile?.email) {
                return 'error.google-auth-profile-invalid';
            }

            // Try to find existing user
            const user = await this.externalAuthenticationService.findCustomerUser(ctx, this.name, googleProfile.sub);

            // If user exists. Log in
            if (user) {
                return user;
            }

            // register a new user
            return await this.externalAuthenticationService.createCustomerAndUser(ctx, {
                strategy: this.name,
                externalIdentifier: googleProfile.sub,
                verified: googleProfile.email_verified || false,
                emailAddress: googleProfile.email,
                firstName: googleProfile.given_name ?? '',
                lastName: googleProfile.family_name ?? '',
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
