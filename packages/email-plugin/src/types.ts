/* eslint-disable @typescript-eslint/no-explicit-any */
import { Omit } from '@firelancerco/common/lib/shared-utils';
import { FirelancerEvent, Injector, RequestContext, SerializedRequestContext } from '@firelancerco/core';
import { Attachment } from 'nodemailer/lib/mailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { EmailGenerator } from './generator/email-generator';
import { EmailEventHandler } from './handler/event-handler';
import { EmailSender } from './sender/email-sender';
import { TemplateLoader } from './template-loader/template-loader';

/**
 * @description
 * A FirelancerEventEvent which also includes a `ctx` property containing the current
 * {@link RequestContext}, which is used to determine language to use when generating the email.
 */
export type EventWithContext = FirelancerEvent & { ctx: RequestContext };

/**
 * @description
 * A FirelancerEvent with a {@link RequestContext} and a `data` property which contains the
 * value resolved from the {@link EmailEventHandler}`.loadData()` callback.
 */
export type EventWithAsyncData<Event extends EventWithContext, R> = Event & { data: R };

/**
 * @description
 * Allows you to dynamically load the "globalTemplateVars" key async and access Firelancer services
 * to create the object. This is not a requirement. You can also specify a simple static object if your
 * projects doesn't need to access async or dynamic values.
 */
export type GlobalTemplateVarsFn = (ctx: RequestContext, injector: Injector) => Promise<{ [key: string]: any }>;

/**
 * @description
 * Configuration for the EmailPlugin.
 */
export interface EmailPluginOptions {
    /**
     * @description
     * An optional TemplateLoader which can be used to load templates from a custom location or async service.
     * The default uses the FileBasedTemplateLoader which loads templates from `<project root>/firelancer/email/templates`
     */
    templateLoader: TemplateLoader;
    /**
     * @description
     * Configures how the emails are sent.
     */
    transport:
        | EmailTransportOptions
        | ((injector?: Injector, ctx?: RequestContext) => EmailTransportOptions | Promise<EmailTransportOptions>);
    /**
     * @description
     * An array of {@link EmailEventHandler}s which define which Firelancer events will trigger
     * emails, and how those emails are generated.
     */
    handlers: Array<EmailEventHandler<string, any>>;
    /**
     * @description
     * An object containing variables which are made available to all templates. For example,
     * the storefront URL could be defined here and then used in the "email address verification"
     * email. Use the GlobalTemplateVarsFn if you need to retrieve variables from Firelancer or
     * plugin services.
     */
    globalTemplateVars?: { [key: string]: any } | GlobalTemplateVarsFn;
    /**
     * @description
     * An optional allowed EmailSender, used to allow custom implementations of the send functionality
     * while still utilizing the existing emailPlugin functionality.
     */
    emailSender?: EmailSender;
    /**
     * @description
     * An optional allowed EmailGenerator, used to allow custom email generation functionality to
     * better match with custom email sending functionality.
     *
     * @default HandlebarsMjmlGenerator
     */
    emailGenerator?: EmailGenerator;
}

/**
 * EmailPLuginOptions type after initialization, where templateLoader and themeInjector are no longer optional
 */
export type InitializedEmailPluginOptions = EmailPluginOptions & {
    templateLoader: TemplateLoader;
};

/**
 * @description
 * Configuration for running the EmailPlugin in development mode.
 */
export interface EmailPluginDevModeOptions extends Omit<EmailPluginOptions, 'transport'> {
    devMode: true;
    /**
     * @description
     * The path to which html email files will be saved rather than being sent.
     */
    outputPath: string;
    /**
     * @description
     * The route to the dev mailbox server.
     */
    route: string;
}

/**
 * @description
 * A union of all the possible transport options for sending emails.
 */
export type EmailTransportOptions =
    | SMTPTransportOptions
    | SendmailTransportOptions
    | FileTransportOptions
    | NoopTransportOptions
    | SESTransportOptions
    | TestingTransportOptions;

/**
 * @description
 * The SMTP transport options of [Nodemailer](https://nodemailer.com/smtp/)
 */
export interface SMTPTransportOptions extends SMTPTransport.Options {
    type: 'smtp';
    /**
     * @description
     * If true, uses the configured {@link FirelancerLogger} to log messages from Nodemailer as it interacts with
     * the SMTP server.
     *
     * @default false
     */
    logging?: boolean;
}

/**
 * @description
 * The SES transport options of [Nodemailer](https://nodemailer.com/transports/ses//)
 *
 * See [Nodemailers's SES docs](https://nodemailer.com/transports/ses/) for more details
 *
 * @example
 * ```ts
 *  import { SES, SendRawEmailCommand } from '\@aws-sdk/client-ses'
 *
 *  const ses = new SES({
 *     apiVersion: '2010-12-01',
 *     region: 'eu-central-1',
 *     credentials: {
 *         accessKeyId: process.env.SES_ACCESS_KEY || '',
 *         secretAccessKey: process.env.SES_SECRET_KEY || '',
 *     },
 *  })
 *
 *  const config: FirelancerConfig = {
 *   // Add an instance of the plugin to the plugins array
 *   plugins: [
 *     EmailPlugin.init({
 *       handler: defaultEmailHandlers,
 *       templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
 *       transport: {
 *         type: 'ses',
 *         SES: { ses, aws: { SendRawEmailCommand } },
 *         sendingRate: 10, // optional messages per second sending rate
 *       },
 *     }),
 *   ],
 * };
 *  ```
 */
export interface SESTransportOptions extends SESTransport.Options {
    type: 'ses';
}

/**
 * @description
 * Uses the local Sendmail program to send the email.
 */
export interface SendmailTransportOptions {
    type: 'sendmail';
    /** path to the sendmail command (defaults to ‘sendmail’) */
    path?: string;
    /** either ‘windows’ or ‘unix’ (default). Forces all newlines in the output to either use Windows syntax <CR><LF> or Unix syntax <LF> */
    newline?: string;
}

/**
 * @description
 * Outputs the email as an HTML file for development purposes.
 */
export interface FileTransportOptions {
    type: 'file';
    /** The directory in which the emails will be saved */
    outputPath: string;
    /** When set to true, a raw text file will be output rather than an HTML file */
    raw?: boolean;
}

/**
 * @description
 * Does nothing with the generated email. Intended for use in testing where we don't care about the email transport,
 * or when using a custom {@link EmailSender} which does not require transport options.
 */
export interface NoopTransportOptions {
    type: 'none';
}

/**
 * @description
 * The final, generated email details to be sent.
 */
export interface EmailDetails<Type extends 'serialized' | 'unserialized' = 'unserialized'> {
    from: string;
    recipient: string;
    subject: string;
    body: string;
    attachments: Array<Type extends 'serialized' ? SerializedAttachment : Attachment>;
    cc?: string;
    bcc?: string;
    replyTo?: string;
}

/**
 * @description
 * Forwards the raw GeneratedEmailContext object to a provided callback, for use in testing.
 */
export interface TestingTransportOptions {
    type: 'testing';
    /**
     * @description
     * Callback to be invoked when an email would be sent.
     */
    onSend: (details: EmailDetails) => void;
}

/**
 * @description
 * A function used to load async data for use by an {@link EmailEventHandler}.
 */
export type LoadDataFn<Event extends EventWithContext, R> = (context: {
    event: Event;
    injector: Injector;
}) => Promise<R>;

export type OptionalToNullable<O> = {
    [K in keyof O]-?: undefined extends O[K] ? NonNullable<O[K]> | null : O[K];
};

/**
 * @description
 * An object defining a file attachment for an email. Based on the object described
 * [here in the Nodemailer docs](https://nodemailer.com/message/attachments/), but
 * only uses the `path` property to define a filesystem path or a URL pointing to
 * the attachment file.
 */
export type EmailAttachment = Omit<Attachment, 'raw'> & { path?: string };

export type SerializedAttachment = OptionalToNullable<Omit<EmailAttachment, 'content'> & { content: string | null }>;

export type IntermediateEmailDetails = {
    ctx: SerializedRequestContext;
    type: string;
    from: string;
    recipient: string;
    templateVars: any;
    subject: string;
    templateFile: string;
    attachments: SerializedAttachment[];
    cc?: string;
    bcc?: string;
    replyTo?: string;
};

/**
 * @description
 * The object passed to the {@link TemplateLoader} `loadTemplate()` method.
 */
export interface LoadTemplateInput {
    /**
     * @description
     * The type corresponds to the string passed to the EmailEventListener constructor.
     */
    type: string;
    /**
     * @description
     * The template name is specified by the EmailEventHander's call to
     * the `addTemplate()` method, and will default to `body.hbs`
     */
    templateName: string;
    /**
     * @description
     * The variables defined by the globalTemplateVars as well as any variables defined in the
     * EmailEventHandler's `setTemplateVars()` method.
     */
    templateVars: any;
}

export interface Partial {
    name: string;
    content: string;
}

/**
 * @description
 * A function used to define template variables available to email templates.
 * See {@link EmailEventHandler}.setTemplateVars().
 */
export type SetTemplateVarsFn<Event> = (event: Event, globals: { [key: string]: any }) => { [key: string]: any };

/**
 * @description
 * A function used to define attachments to be sent with the email.
 * See https://nodemailer.com/message/attachments/ for more information about
 * how attachments work in Nodemailer.
 */
export type SetAttachmentsFn<Event> = (event: Event) => EmailAttachment[] | Promise<EmailAttachment[]>;

/**
 * @description
 * A function used to define the subject to be sent with the email.
 */
export type SetSubjectFn<Event> = (event: Event, ctx: RequestContext, injector: Injector) => string | Promise<string>;

/**
 * @description
 * Optional address-related fields for sending the email.
 */
export interface OptionalAddressFields {
    /**
     * @description
     * Comma separated list of recipients email addresses that will appear on the _Cc:_ field
     */
    cc?: string;
    /**
     * @description
     * Comma separated list of recipients email addresses that will appear on the _Bcc:_ field
     */
    bcc?: string;
    /**
     * @description
     * An email address that will appear on the _Reply-To:_ field
     */
    replyTo?: string;
}

/**
 * @description
 * A function used to set the {@link OptionalAddressFields}.
 */
export type SetOptionalAddressFieldsFn<Event> = (
    event: Event,
) => OptionalAddressFields | Promise<OptionalAddressFields>;
