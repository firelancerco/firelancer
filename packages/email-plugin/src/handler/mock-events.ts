/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountRegistrationEvent,
    IdentifierChangeRequestEvent,
    NativeAuthenticationMethod,
    PasswordResetEvent,
    User,
} from '@firelancerco/core';

export const mockAccountRegistrationEvent = new AccountRegistrationEvent(
    {} as any,
    new User({
        verified: false,
        authenticationMethods: [
            new NativeAuthenticationMethod({
                identifier: 'test@test.com',
                verificationToken: 'MjAxOC0xMS0xM1QxNToxNToxNC42ODda_US2U6UK1WZC7NDAX',
            }),
        ],
        identifier: 'test@test.com',
    }),
);

export const mockPasswordResetEvent = new PasswordResetEvent(
    {} as any,
    new User({
        identifier: 'test@test.com',
        authenticationMethods: [
            new NativeAuthenticationMethod({
                passwordResetToken: 'MjAxOS0wNC0xNVQxMzozMDozOC43MjFa_MA2FR6HRZBW7JWD6',
            }),
        ],
    }),
);

export const mockEmailAddressChangeEvent = new IdentifierChangeRequestEvent(
    {} as any,
    new User({
        identifier: 'old-address@test.com',
        authenticationMethods: [
            new NativeAuthenticationMethod({
                pendingIdentifier: 'new-address@test.com',
                identifierChangeToken: 'MjAxOS0wNC0xNVQxMzozMDozOC43MjFa_MA2FR6HRZBW7JWD6',
            }),
        ],
    }),
);
