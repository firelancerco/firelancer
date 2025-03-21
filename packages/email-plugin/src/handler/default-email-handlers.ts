/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountRegistrationEvent,
    IdentifierChangeRequestEvent,
    NativeAuthenticationMethod,
    PasswordResetEvent,
} from '@firelancerco/core';

import { EmailEventListener } from '../event-listener';
import { EmailEventHandler } from './event-handler';
import { mockAccountRegistrationEvent, mockEmailAddressChangeEvent, mockPasswordResetEvent } from './mock-events';

export const emailVerificationHandler = new EmailEventListener('email-verification')
    .on(AccountRegistrationEvent)
    .filter(event => !!event.user.getNativeAuthenticationMethod().identifier)
    .filter(event => {
        const nativeAuthMethod = event.user.authenticationMethods.find(m => m instanceof NativeAuthenticationMethod) as
            | NativeAuthenticationMethod
            | undefined;
        return (nativeAuthMethod && !!nativeAuthMethod.identifier) || false;
    })
    .setRecipient(event => event.user.identifier)
    .setFrom('{{ fromAddress }}')
    .setTemplateVars(event => ({
        verificationToken: event.user.getNativeAuthenticationMethod().verificationToken,
    }))
    .setSubject('Please verify your email address')
    .setMockEvent(mockAccountRegistrationEvent);

export const passwordResetHandler = new EmailEventListener('password-reset')
    .on(PasswordResetEvent)
    .setRecipient(event => event.user.identifier)
    .setFrom('{{ fromAddress }}')
    .setTemplateVars(event => ({
        passwordResetToken: event.user.getNativeAuthenticationMethod().passwordResetToken,
    }))
    .setSubject('Forgotten password reset')
    .setMockEvent(mockPasswordResetEvent);

export const emailAddressChangeHandler = new EmailEventListener('email-address-change')
    .on(IdentifierChangeRequestEvent)
    .setRecipient(event => event.user.getNativeAuthenticationMethod().pendingIdentifier!)
    .setFrom('{{ fromAddress }}')
    .setTemplateVars(event => ({
        identifierChangeToken: event.user.getNativeAuthenticationMethod().identifierChangeToken,
    }))
    .setSubject('Please verify your change of email address')
    .setMockEvent(mockEmailAddressChangeEvent);

export const defaultEmailHandlers: Array<EmailEventHandler<any, any>> = [
    emailVerificationHandler,
    passwordResetHandler,
    emailAddressChangeHandler,
];
