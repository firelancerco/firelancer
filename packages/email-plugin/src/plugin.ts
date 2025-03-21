/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    EventBus,
    FirelancerPlugin,
    Injector,
    JobQueue,
    JobQueueService,
    Logger,
    PluginCommonModule,
    ProcessContext,
    registerPluginStartupMessage,
    Type,
} from '@firelancerco/core';
import { Inject, MiddlewareConsumer, NestModule, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { isDevModeOptions, resolveTransportSettings } from './common';
import { EMAIL_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { DevMailbox } from './dev-mailbox';
import { EmailProcessor } from './email-processor';
import { EmailEventHandler, EmailEventHandlerWithAsyncData } from './handler/event-handler';
import {
    EmailPluginDevModeOptions,
    EmailPluginOptions,
    EventWithContext,
    InitializedEmailPluginOptions,
    IntermediateEmailDetails,
} from './types';

/**
 * @description
 * The EmailPlugin creates and sends transactional emails based on Firelancer events. By default, it uses an [MJML](https://mjml.io/)-based
 * email generator to generate the email body and [Nodemailer](https://nodemailer.com/about/) to send the emails.
 *
 * ## High-level description
 * Firelancer has an internal events system (see {@link EventBus}) that allows plugins to subscribe to events. The EmailPlugin is configured with {@link EmailEventHandler}s
 * that listen for a specific event and when it is published, the handler defines which template to use to generate the resulting email.
 *
 * The plugin comes with a set of default handler for the following events:
 * - New customer email address verification
 * - Password reset request
 * - Email address change request
 *
 * You can also create your own handler and register them with the plugin - see the {@link EmailEventHandler} docs for more details.
 *
 * ## Installation
 *
 * `yarn add \@firelancerco/email-plugin`
 *
 * or
 *
 * `npm install \@firelancerco/email-plugin`
 *
 * @example
 * ```ts
 * import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '\@firelancerco/email-plugin';
 *
 * const config: FirelancerConfig = {
 *   // Add an instance of the plugin to the plugins array
 *   plugins: [
 *     EmailPlugin.init({
 *       handler: defaultEmailHandlers,
 *       templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
 *       transport: {
 *         type: 'smtp',
 *         host: 'smtp.example.com',
 *         port: 587,
 *         auth: {
 *           user: 'username',
 *           pass: 'password',
 *         }
 *       },
 *     }),
 *   ],
 * };
 * ```
 *
 * ## Email templates

 *
 * You need to copy the templates manually from `node_modules/\@firelancerco/email-plugin/templates` to
 * a location of your choice.
 * 
 * ```ts
 *   EmailPlugin.init({
 *    ...,
 *    templateLoader: new FileBasedTemplateLoader(my/order-confirmation/templates)
 *   })
 * ```
 * ## Customizing templates
 *
 * Emails are generated from templates which use [MJML](https://mjml.io/) syntax. MJML is an open-source HTML-like markup
 * language which makes the task of creating responsive email markup simple. By default, the templates are installed to
 * `<project root>/firelancer/email/templates` and can be freely edited.
 *
 * Dynamic data such as the recipient's name or order items are specified using [Handlebars syntax](https://handlebarsjs.com/):
 * 
 * ### Setting global variables using `globalTemplateVars`
 *
 * `globalTemplateVars` is an object that can be passed to the configuration of the Email Plugin with static object variables.
 * You can also pass an async function that will be called with the `RequestContext` and the `Injector` so you can
 * access services and specific configurations.
 *
 * ### Handlebars helpers
 *
 * The following helper functions are available for use in email templates:
 *
 * * `formatMoney`: Formats an amount of money (which are always stored as integers in Firelancer) as a decimal, e.g. `123` => `1.23`
 * * `formatDate`: Formats a Date value with the [dateformat](https://www.npmjs.com/package/dateformat) package.
 *
 * ## Extending the default email handler
 *
 * The `defaultEmailHandlers` array defines the default handler such as for handling new account registration, order confirmation, password reset
 * etc. These defaults can be extended by adding custom templates for languages other than the default, or even completely new types of emails
 * which respond to any of the available.
 *
 * It is also possible to modify the default handler:
 *
 * ```ts
 * // Rather than importing `defaultEmailHandlers`, you can
 * // import the handler individually
 * import {
 *   orderConfirmationHandler,
 *   emailVerificationHandler,
 *   passwordResetHandler,
 *   emailAddressChangeHandler,
 * } from '\@firelancerco/email-plugin';
 * import { CustomerService } from '\@firelancerco/core';
 *
 * // This allows you to then customize each handler to your needs.
 * // For example, let's set a new subject line to the order confirmation:
 * const myOrderConfirmationHandler = orderConfirmationHandler
 *   .setSubject(`We received your order!`);
 *
 * // Another example: loading additional data and setting new
 * // template variables.
 * const myPasswordResetHandler = passwordResetHandler
 *   .loadData(async ({ event, injector }) => {
 *     const customerService = injector.get(CustomerService);
 *     const customer = await customerService.findOneByUserId(event.ctx, event.user.id);
 *     return { customer };
 *   })
 *   .setTemplateVars(event => ({
 *     passwordResetToken: event.user.getNativeAuthenticationMethod().passwordResetToken,
 *     customer: event.data.customer,
 *   }));
 *
 * // Then you pass the handler to the EmailPlugin init method
 * // individually
 * EmailPlugin.init({
 *   handler: [
 *     myOrderConfirmationHandler,
 *     myPasswordResetHandler,
 *     emailVerificationHandler,
 *     emailAddressChangeHandler,
 *   ],
 *   // ...
 * }),
 * ```
 *
 * For all available methods of extending a handler, see the {@link EmailEventHandler} documentation.
 *
 * ## Dynamic SMTP settings
 *
 * Instead of defining static transport settings, you can also provide a function that dynamically resolves transport settings.
 *
 * @example
 * ```ts
 * import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '\@firelancerco/email-plugin';
 * import { MyTransportService } from './transport.services.ts';
 * const config: FirelancerConfig = {
 *   plugins: [
 *     EmailPlugin.init({
 *       handler: defaultEmailHandlers,
 *       templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
 *       transport: (injector, ctx) => {
 *         if (ctx) {
 *           return injector.get(MyTransportService).getSettings(ctx);
 *         } else {
 *           return {
 *             type: 'smtp',
 *             host: 'smtp.example.com',
 *             // ... etc.
 *           }
 *         }
 *       }
 *     }),
 *   ],
 * };
 * ```
 *
 * ## Dev mode
 *
 * For development, the `transport` option can be replaced by `devMode: true`. Doing so configures Firelancer to use the
 * file transport (See {@link FileTransportOptions}) and outputs emails as rendered HTML files in the directory specified by the
 * `outputPath` property.
 *
 * ```ts
 * EmailPlugin.init({
 *   devMode: true,
 *   route: 'mailbox',
 *   handler: defaultEmailHandlers,
 *   templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
 *   outputPath: path.join(__dirname, 'test-emails'),
 * })
 * ```
 *
 * ### Dev mailbox
 *
 * In dev mode, a webmail-like interface available at the `/mailbox` path, e.g.
 * http://localhost:3000/mailbox. This is a simple way to view the output of all emails generated by the EmailPlugin while in dev mode.
 *
 * ## Troubleshooting SMTP Connections
 *
 * If you are having trouble sending email over and SMTP connection, set the `logging` and `debug` options to `true`. This will
 * send detailed information from the SMTP transporter to the configured logger (defaults to console). For maximum detail combine
 * this with a detail log level in the configured FirelancerLogger:
 *
 * ```ts
 * const config: FirelancerConfig = {
 *   logger: new DefaultLogger({ level: LogLevel.Debug })
 *   // ...
 *   plugins: [
 *     EmailPlugin.init({
 *       // ...
 *       transport: {
 *         type: 'smtp',
 *         host: 'smtp.example.com',
 *         port: 587,
 *         auth: {
 *           user: 'username',
 *           pass: 'password',
 *         },
 *         logging: true,
 *         debug: true,
 *       },
 *     }),
 *   ],
 * };
 * ```
 */
@FirelancerPlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: EMAIL_PLUGIN_OPTIONS, useFactory: () => EmailPlugin.options }, EmailProcessor],
    compatibility: '^1.0.0',
})
export class EmailPlugin implements OnApplicationBootstrap, OnApplicationShutdown, NestModule {
    private static options: InitializedEmailPluginOptions;
    private devMailbox: DevMailbox | undefined;
    private jobQueue: JobQueue<IntermediateEmailDetails> | undefined;
    private testingProcessor: EmailProcessor | undefined;

    /** @internal */
    constructor(
        private eventBus: EventBus,
        private moduleRef: ModuleRef,
        private emailProcessor: EmailProcessor,
        private jobQueueService: JobQueueService,
        private processContext: ProcessContext,
        @Inject(EMAIL_PLUGIN_OPTIONS) private options: InitializedEmailPluginOptions,
    ) {}

    /**
     * Set the plugin options.
     */
    static init(options: EmailPluginOptions | EmailPluginDevModeOptions): Type<EmailPlugin> {
        if (options.templateLoader) {
            Logger.info(`Using custom template loader '${options.templateLoader.constructor.name}'`);
        } else {
            throw new Error('You must either supply a templatePath or provide a custom templateLoader');
        }
        this.options = options as InitializedEmailPluginOptions;
        return EmailPlugin;
    }

    /** @internal */
    async onApplicationBootstrap(): Promise<void> {
        await this.initInjectableStrategies();
        await this.setupEventSubscribers();
        const transport = await resolveTransportSettings(this.options, new Injector(this.moduleRef));
        if (!isDevModeOptions(this.options) && transport.type === 'testing') {
            // When running tests, we don't want to go through the JobQueue system,
            // so we just call the email sending logic directly.
            this.testingProcessor = new EmailProcessor(this.options, this.moduleRef, this.eventBus);
            await this.testingProcessor.init();
        } else {
            await this.emailProcessor.init();
            this.jobQueue = await this.jobQueueService.createQueue({
                name: 'send-email',
                process: job => {
                    return this.emailProcessor.process(job.data);
                },
            });
        }
    }

    async onApplicationShutdown() {
        await this.destroyInjectableStrategies();
    }

    configure(consumer: MiddlewareConsumer) {
        if (isDevModeOptions(this.options) && this.processContext.isServer) {
            Logger.info('Creating dev mailbox middleware', loggerCtx);
            this.devMailbox = new DevMailbox();
            consumer.apply(this.devMailbox.serve(this.options)).forRoutes(this.options.route);
            this.devMailbox.handleMockEvent((handler, event) => this.handleEvent(handler, event));
            registerPluginStartupMessage('Dev mailbox', this.options.route);
        }
    }

    private async initInjectableStrategies() {
        const injector = new Injector(this.moduleRef);
        if (typeof this.options.emailGenerator?.init === 'function') {
            await this.options.emailGenerator.init(injector);
        }
        if (typeof this.options.emailSender?.init === 'function') {
            await this.options.emailSender.init(injector);
        }
    }

    private async destroyInjectableStrategies() {
        if (typeof this.options.emailGenerator?.destroy === 'function') {
            await this.options.emailGenerator.destroy();
        }
        if (typeof this.options.emailSender?.destroy === 'function') {
            await this.options.emailSender.destroy();
        }
    }

    private async setupEventSubscribers() {
        for (const handler of EmailPlugin.options.handlers) {
            this.eventBus.ofType(handler.event).subscribe(event => {
                return this.handleEvent(handler, event);
            });
        }
    }

    private async handleEvent(
        handler: EmailEventHandler | EmailEventHandlerWithAsyncData<any>,
        event: EventWithContext,
    ) {
        Logger.debug(`Handling event "${handler.type}"`, loggerCtx);
        // const { type } = handler;
        try {
            const injector = new Injector(this.moduleRef);
            let globalTemplateVars = this.options.globalTemplateVars;
            if (typeof globalTemplateVars === 'function') {
                globalTemplateVars = await globalTemplateVars(event.ctx, injector);
            }
            const result = await handler.handle(event as any, globalTemplateVars as { [key: string]: any }, injector);
            if (!result) {
                return;
            }
            if (this.jobQueue) {
                await this.jobQueue.add(result, { retries: 5 });
            } else if (this.testingProcessor) {
                await this.testingProcessor.process(result);
            }
        } catch (e: any) {
            Logger.error(e.message, loggerCtx, e.stack);
        }
    }
}
