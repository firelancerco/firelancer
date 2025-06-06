/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type } from '@firelancerco/common/lib/shared-types';
import { Injector, Logger } from '@firelancerco/core';

import { serializeAttachments } from '../attachment-utils';
import { loggerCtx } from '../constants';
import { EmailEventListener } from '../event-listener';
import {
    EmailAttachment,
    EventWithAsyncData,
    EventWithContext,
    IntermediateEmailDetails,
    LoadDataFn,
    SetAttachmentsFn,
    SetOptionalAddressFieldsFn,
    SetSubjectFn,
    SetTemplateVarsFn,
} from '../types';

/**
 * @description
 * The EmailEventHandler defines how the EmailPlugin will respond to a given event.
 *
 * A handler is created by creating a new {@link EmailEventListener} and calling the `.on()` method
 * to specify which event to respond to.
 *
 * @example
 * ```ts
 * const passwordResetHandler = new EmailEventListener('password-reset')
 *   .on(PasswordResetEvent)
 *   .setRecipient(event => event.user.identifier)
 *   .setFrom('{{ fromAddress }}')
 *   .setSubject('Forgotten password reset')
 *   .setTemplateVars(event => ({
 *         passwordResetToken: event.user.getNativeAuthenticationMethod().passwordResetToken,
 *   }))
 * ```
 *
 * The string argument passed into the `EmailEventListener` constructor is used to identify the handler, and
 * also to locate the directory of the email template files. So in the example above, there should be a directory
 * `<app root>/static/email/templates/password-reset` which contains a Handlebars template named `body.hbs`.
 *
 * ## Handling other languages
 *
 * By default, the handler will respond to all events and use the same subject and body template.
 * Where the server is intended to support multiple languages, the `.addTemplate()` method may be used
 * to define the subject and body template for specific language.
 *
 * The language is determined by looking at the `languageCode` property of the event's `ctx` ({@link RequestContext}) object.
 *
 * @example
 * ```ts
 * const extendedPasswordResetHandler = passwordResetHandler
 *   .addTemplate({
 *     languageCode: LanguageCode.ar,
 *     templateFile: 'body.ar.hbs',
 *     subject: 'Forgotten Password Reset',
 *   })
 * ```
 *
 * ## Defining a custom handler
 *
 * Let's say you have a plugin which defines a new event type, `QuoteRequestedEvent`. In your plugin you have defined a mutation
 * which is executed when the customer requests a quote in your storefront, and in your resolver, you use the {@link EventBus} to publish a
 * new `QuoteRequestedEvent`.
 *
 * You now want to email the customer with their quote. Here are the steps you would take to set this up:
 *
 * ### 1. Create a new handler
 *
 * ```ts
 * import { EmailEventListener } from `\@firelancerco/email-plugin`;
 * import { QuoteRequestedEvent } from `./events`;
 *
 * const quoteRequestedHandler = new EmailEventListener('quote-requested')
 *   .on(QuoteRequestedEvent)
 *   .setRecipient(event => event.customer.emailAddress)
 *   .setSubject(`Here's the quote you requested`)
 *   .setFrom('{{ fromAddress }}')
 *   .setTemplateVars(event => ({ details: event.details }));
 * ```
 *
 * ### 2. Create the email template
 *
 * Next you need to make sure there is a template defined at `<app root>/static/email/templates/quote-requested/body.hbs`. The path
 * segment `quote-requested` must match the string passed to the `EmailEventListener` constructor.
 *
 * The template would look something like this:
 *
 * ```handlebars
 * {{> header title="Here's the quote you requested" }}
 *
 * <mj-section background-color="#fafafa">
 *     <mj-column>
 *         <mj-text color="#525252">
 *             Thank you for your interest in our products! Here's the details
 *             of the quote you recently requested:
 *         </mj-text>
 *
 *         <--! your custom email layout goes here -->
 *     </mj-column>
 * </mj-section>
 *
 *
 * {{> footer }}
 * ```
 *
 * You can find pre-made templates on the [MJML website](https://mjml.io/templates/).
 *
 * ### 3. Register the handler
 *
 * Finally, you need to register the handler with the EmailPlugin:
 *
 * ```ts {hl_lines=[8]}
 * import { defaultEmailHandlers, EmailPlugin } from '\@firelancerco/email-plugin';
 * import { quoteRequestedHandler } from './plugins/quote-plugin';
 *
 * const config: FirelancerConfig = {
 *   // Add an instance of the plugin to the plugins array
 *   plugins: [
 *     EmailPlugin.init({
 *       handler: [...defaultEmailHandlers, quoteRequestedHandler],
 *       // ... etc
 *     }),
 *   ],
 * };
 * ```
 */
export class EmailEventHandler<T extends string = string, Event extends EventWithContext = EventWithContext> {
    private setRecipientFn: (event: Event) => string;
    private setSubjectFn?: SetSubjectFn<Event>;
    private setTemplateVarsFn: SetTemplateVarsFn<Event>;
    private setAttachmentsFn?: SetAttachmentsFn<Event>;
    private setOptionalAddressFieldsFn?: SetOptionalAddressFieldsFn<Event>;
    private filterFns: Array<(event: Event) => boolean> = [];
    private defaultSubject: string;
    private from: string;
    private _mockEvent: Omit<Event, 'ctx' | 'data'> | undefined;

    constructor(
        public listener: EmailEventListener<T>,
        public event: Type<Event>,
    ) {}

    /** @internal */
    get type(): T {
        return this.listener.type;
    }

    /** @internal */
    get mockEvent(): Omit<Event, 'ctx' | 'data'> | undefined {
        return this._mockEvent;
    }

    /**
     * @description
     * Defines a predicate function which is used to determine whether the event will trigger an email.
     * Multiple filter functions may be defined.
     */
    filter(filterFn: (event: Event) => boolean): EmailEventHandler<T, Event> {
        this.filterFns.push(filterFn);
        return this;
    }

    /**
     * @description
     * A function which defines how the recipient email address should be extracted from the incoming event.
     *
     * The recipient can be a plain email address: `'foobar@example.com'`
     * Or with a formatted name (includes unicode support): `'Ноде Майлер <foobar@example.com>'`
     * Or a comma-separated list of addresses: `'foobar@example.com, "Ноде Майлер" <bar@example.com>'`
     */
    setRecipient(setRecipientFn: (event: Event) => string): EmailEventHandler<T, Event> {
        this.setRecipientFn = setRecipientFn;
        return this;
    }

    /**
     * @description
     * A function which returns an object hash of variables which will be made available to the Handlebars template
     * and subject line for interpolation.
     */
    setTemplateVars(templateVarsFn: SetTemplateVarsFn<Event>): EmailEventHandler<T, Event> {
        this.setTemplateVarsFn = templateVarsFn;
        return this;
    }

    /**
     * @description
     * Sets the default subject of the email. The subject string may use Handlebars variables defined by the
     * setTemplateVars() method.
     */
    setSubject(defaultSubject: string | SetSubjectFn<Event>): EmailEventHandler<T, Event> {
        if (typeof defaultSubject === 'string') {
            this.defaultSubject = defaultSubject;
        } else {
            this.setSubjectFn = defaultSubject;
        }
        return this;
    }

    /**
     * @description
     * Sets the default from field of the email. The from string may use Handlebars variables defined by the
     * setTemplateVars() method.
     */
    setFrom(from: string): EmailEventHandler<T, Event> {
        this.from = from;
        return this;
    }

    /**
     * @description
     * A function which allows {@link OptionalAddressFields} to be specified such as "cc" and "bcc".
     */
    setOptionalAddressFields(optionalAddressFieldsFn: SetOptionalAddressFieldsFn<Event>) {
        this.setOptionalAddressFieldsFn = optionalAddressFieldsFn;
        return this;
    }

    /**
     * @description
     * Defines one or more files to be attached to the email. An attachment can be specified
     * as either a `path` (to a file or URL) or as `content` which can be a string, Buffer or Stream.
     *
     * **Note:** When using the `content` to pass a Buffer or Stream, the raw data will get serialized
     * into the job queue. For this reason the total size of all attachments passed as `content` should kept to
     * **less than ~50k**. If the attachments are greater than that limit, a warning will be logged and
     * errors may result if using the DefaultJobQueuePlugin with certain DBs such as MySQL/MariaDB.
     *
     * @example
     * ```ts
     * const testAttachmentHandler = new EmailEventListener('activate-voucher')
     *   .on(ActivateVoucherEvent)
     *   // ... omitted some steps for brevity
     *   .setAttachments(async (event) => {
     *     const { imageUrl, voucherCode } = await getVoucherDataForUser(event.user.id);
     *     return [
     *       {
     *         filename: `voucher-${voucherCode}.jpg`,
     *         path: imageUrl,
     *       },
     *     ];
     *   });
     * ```
     */
    setAttachments(setAttachmentsFn: SetAttachmentsFn<Event>) {
        this.setAttachmentsFn = setAttachmentsFn;
        return this;
    }

    /**
     * @description
     * Allows data to be loaded asynchronously which can then be used as template variables.
     * The `loadDataFn` has access to the event, the TypeORM `Connection` object, and an
     * `inject()` function which can be used to inject any of the providers exported
     * by the {@link PluginCommonModule}. The return value of the `loadDataFn` will be
     * added to the `event` as the `data` property.
     *
     * @example
     * ```ts
     * new EmailEventListener('order-confirmation')
     *   .on(OrderStateTransitionEvent)
     *   .filter(event => event.toState === 'PaymentSettled' && !!event.order.customer)
     *   .loadData(({ event, injector }) => {
     *     const orderService = injector.get(OrderService);
     *     return orderService.getOrderPayments(event.order.id);
     *   })
     *   .setTemplateVars(event => ({
     *     order: event.order,
     *     payments: event.data,
     *   }))
     *   // ...
     * ```
     */
    loadData<R>(
        loadDataFn: LoadDataFn<Event, R>,
    ): EmailEventHandlerWithAsyncData<R, T, Event, EventWithAsyncData<Event, R>> {
        const asyncHandler = new EmailEventHandlerWithAsyncData(loadDataFn, this.listener, this.event);
        asyncHandler.setRecipientFn = this.setRecipientFn;
        asyncHandler.setTemplateVarsFn = this.setTemplateVarsFn;
        asyncHandler.setAttachmentsFn = this.setAttachmentsFn;
        asyncHandler.setOptionalAddressFieldsFn = this.setOptionalAddressFieldsFn;
        asyncHandler.filterFns = this.filterFns;
        asyncHandler.defaultSubject = this.defaultSubject;
        asyncHandler.from = this.from;
        asyncHandler._mockEvent = this._mockEvent as any;
        return asyncHandler;
    }

    /**
     * @description
     * Used internally by the EmailPlugin to handle incoming events.
     *
     * @internal
     */
    async handle(
        event: Event,
        globals: { [key: string]: any } = {},
        injector: Injector,
    ): Promise<IntermediateEmailDetails | undefined> {
        for (const filterFn of this.filterFns) {
            if (!filterFn(event)) {
                return;
            }
        }
        if (this instanceof EmailEventHandlerWithAsyncData) {
            try {
                (event as EventWithAsyncData<Event, any>).data = await this._loadDataFn({
                    event,
                    injector,
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    Logger.error(err.message, loggerCtx, err.stack);
                } else {
                    Logger.error(String(err), loggerCtx);
                }
                return;
            }
        }
        if (!this.setRecipientFn) {
            throw new Error(
                `No setRecipientFn has been defined. Remember to call ".setRecipient()" when setting up the EmailEventHandler for ${this.type}`,
            );
        }
        if (this.from === undefined) {
            throw new Error(
                `No from field has been defined. Remember to call ".setFrom()" when setting up the EmailEventHandler for ${this.type}`,
            );
        }
        const { ctx } = event;
        const subject = this.setSubjectFn ? await this.setSubjectFn(event, ctx, injector) : this.defaultSubject;
        if (subject == null) {
            throw new Error(
                `No subject field has been defined. Remember to call ".setSubject()" when setting up the EmailEventHandler for ${this.type}`,
            );
        }
        const recipient = this.setRecipientFn(event);
        const templateVars = this.setTemplateVarsFn ? this.setTemplateVarsFn(event, globals) : {};
        let attachmentsArray: EmailAttachment[] = [];
        try {
            attachmentsArray = (await this.setAttachmentsFn?.(event)) ?? [];
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(e.message, loggerCtx, e.stack);
            }
        }
        const attachments = await serializeAttachments(attachmentsArray);
        const optionalAddressFields = (await this.setOptionalAddressFieldsFn?.(event)) ?? {};
        return {
            ctx: event.ctx.serialize(),
            type: this.type,
            recipient,
            from: this.from,
            templateVars: { ...globals, ...templateVars },
            subject,
            templateFile: `body.hbs`,
            attachments,
            ...optionalAddressFields,
        };
    }

    /**
     * @description
     * Optionally define a mock Event which is used by the dev mode mailbox app for generating mock emails
     * from this handler, which is useful when developing the email templates.
     */
    setMockEvent(event: Omit<Event, 'ctx' | 'data'>): EmailEventHandler<T, Event> {
        this._mockEvent = event;
        return this;
    }
}

/**
 * @description
 * Identical to the {@link EmailEventHandler} but with a `data` property added to the `event` based on the result
 * of the `.loadData()` function.
 */
export class EmailEventHandlerWithAsyncData<
    Data,
    T extends string = string,
    InputEvent extends EventWithContext = EventWithContext,
    Event extends EventWithAsyncData<InputEvent, Data> = EventWithAsyncData<InputEvent, Data>,
> extends EmailEventHandler<T, Event> {
    constructor(
        public _loadDataFn: LoadDataFn<InputEvent, Data>,
        listener: EmailEventListener<T>,
        event: Type<InputEvent>,
    ) {
        super(listener, event as any);
    }
}
