/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertNever, normalizeString } from '@firelancerco/common/lib/shared-utils';
import { Logger } from '@firelancerco/core';
import fs from 'fs-extra';
import { createTransport } from 'nodemailer';
import { default as Mail } from 'nodemailer/lib/mailer';
import { LoggerLevel } from 'nodemailer/lib/shared';
import path from 'path';
import { Stream } from 'stream';
import { format } from 'util';

import { loggerCtx } from '../constants';
import {
    EmailDetails,
    EmailTransportOptions,
    SendmailTransportOptions,
    SESTransportOptions,
    SMTPTransportOptions,
} from '../types';

import { EmailSender } from './email-sender';

export type StreamTransportInfo = {
    envelope: {
        from: string;
        to: string[];
    };
    messageId: string;
    message: Stream;
};

/**
 * @description
 * Uses the configured transport to send the generated email.
 */
export class NodemailerEmailSender implements EmailSender {
    private _smtpTransport: Mail | undefined;
    private _sendMailTransport: Mail | undefined;
    private _sesTransport: Mail | undefined;

    async send(email: EmailDetails, options: EmailTransportOptions) {
        switch (options.type) {
            case 'none':
                return;
                break;
            case 'file': {
                const fileName = normalizeString(
                    `${new Date().toISOString()} ${email.recipient} ${email.subject}`,
                    '_',
                );
                const filePath = path.join(options.outputPath, fileName);
                if (options.raw) {
                    await this.sendFileRaw(email, filePath);
                } else {
                    await this.sendFileJson(email, filePath);
                }
                break;
            }
            case 'sendmail':
                await this.sendMail(email, this.getSendMailTransport(options));
                break;
            case 'ses':
                await this.sendMail(email, this.getSesTransport(options));
                break;
            case 'smtp':
                await this.sendMail(email, this.getSmtpTransport(options));
                break;
            case 'testing':
                options.onSend(email);
                break;
            default:
                return assertNever(options);
        }
    }

    private getSmtpTransport(options: SMTPTransportOptions) {
        if (!this._smtpTransport) {
            options.logger = options.logging ? this.createLogger() : false;
            this._smtpTransport = createTransport(options);
        }
        return this._smtpTransport;
    }

    private getSesTransport(options: SESTransportOptions) {
        if (!this._sesTransport) {
            this._sesTransport = createTransport(options);
        }
        return this._sesTransport;
    }

    private getSendMailTransport(options: SendmailTransportOptions) {
        if (!this._sendMailTransport) {
            this._sendMailTransport = createTransport({ sendmail: true, ...options });
        }
        return this._sendMailTransport;
    }

    private async sendMail(email: EmailDetails, transporter: Mail): Promise<any> {
        return transporter.sendMail({
            from: email.from,
            to: email.recipient,
            subject: email.subject,
            html: email.body,
            attachments: email.attachments,
            cc: email.cc,
            bcc: email.bcc,
            replyTo: email.replyTo,
        });
    }

    private async sendFileJson(email: EmailDetails, pathWithoutExt: string) {
        const output = {
            date: new Date().toLocaleString(),
            from: email.from,
            recipient: email.recipient,
            subject: email.subject,
            body: email.body,
            cc: email.cc,
            bcc: email.bcc,
            replyTo: email.replyTo,
        };
        await fs.writeFile(pathWithoutExt + '.json', JSON.stringify(output, null, 2));
    }

    private async sendFileRaw(email: EmailDetails, pathWithoutExt: string) {
        const transporter = createTransport({
            streamTransport: true,
            buffer: true,
        });
        const result = await this.sendMail(email, transporter);
        await this.writeStreamToFile(pathWithoutExt + '.txt', result);
    }

    private async writeStreamToFile(filePath: string, info: StreamTransportInfo): Promise<string> {
        const writeStream = fs.createWriteStream(filePath);
        return new Promise<string>((resolve, reject) => {
            writeStream.on('open', () => {
                info.message.pipe(writeStream);
                writeStream.on('close', () => resolve(filePath));
                writeStream.on('error', reject);
            });
        });
    }

    /**
     * Adapts the FirelancerLogger to work with the bunyan-compatible logger format
     * used by Nodemailer.
     */
    private createLogger() {
        function formatError(args: [object, string, ...string[]]) {
            const [message, ...params] = args;
            return format(message, ...params);
        }
        return {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            level(level: LoggerLevel) {
                /* noop */
            },
            trace(...params: any) {
                Logger.debug(formatError(params), loggerCtx);
            },
            debug(...params: any) {
                Logger.verbose(formatError(params), loggerCtx);
            },
            info(...params: any) {
                Logger.info(formatError(params), loggerCtx);
            },
            warn(...params: any) {
                Logger.warn(formatError(params), loggerCtx);
            },
            error(...params: any) {
                Logger.error(formatError(params), loggerCtx);
            },
            fatal(...params: any) {
                Logger.error(formatError(params), loggerCtx);
            },
        };
    }
}
