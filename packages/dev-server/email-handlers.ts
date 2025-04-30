import { emailAddressChangeHandler, emailVerificationHandler, passwordResetHandler } from '@firelancerco/email-plugin';

const extendedEmailVerificationHandler = emailVerificationHandler
    .setTemplateVars(event => ({
        verificationToken: event.user.getNativeAuthenticationMethod().verificationToken,
        subject: {
            en: 'Please verify your email address',
            ar: 'يرجى التحقق من عنوان بريدك الإلكتروني',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

const extendedPasswordResetHandler = passwordResetHandler
    .setTemplateVars(event => ({
        passwordResetToken: event.user.getNativeAuthenticationMethod().passwordResetToken,
        subject: {
            en: 'Forgotten password reset',
            ar: 'إعادة تعيين كلمة المرور',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

const extendedEmailAddressChangeHandler = emailAddressChangeHandler
    .setTemplateVars(event => ({
        identifierChangeToken: event.user.getNativeAuthenticationMethod().identifierChangeToken,
        subject: {
            en: 'Please verify your change of email address',
            ar: 'تحقق من عنوان بريدك الإلكتروني الجديد',
        },
    }))
    .setSubject((_event, ctx) => `{{subject.${ctx.languageCode}}}`);

export default [extendedEmailVerificationHandler, extendedPasswordResetHandler, extendedEmailAddressChangeHandler];
