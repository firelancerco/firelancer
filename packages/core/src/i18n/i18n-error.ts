/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import { LogLevel } from '../config';

export interface I18nExceptionOptions extends HttpExceptionOptions {
    variables?: { [key: string]: string | number };
}

/**
 * @description
 * All errors thrown in the Firelancer server must use or extend this error class. This allows the
 * error message to be translated before being served to the client.
 *
 * The error messages should be provided in the form of a string key which corresponds to
 * a key defined in the `i18n/messages/<languageCode>.json` files.
 *
 * Note that this class should not be directly used in code, but should be extended by
 * a more specific Error class.
 */
export abstract class I18nException extends HttpException {
    private readonly key: string;
    private readonly variables: { [key: string]: string | number };
    private readonly logLevel: LogLevel;

    /**
     * @param key The translation key for the error message
     * @param status HTTP response status code
     * @param variables Variables to be interpolated in the translated message
     * @param options Additional HTTP exception options
     */
    constructor(
        key: string,
        status: number,
        variables: Record<string, any> = {},
        logLevel: LogLevel = LogLevel.Warn,
        options?: HttpExceptionOptions,
    ) {
        super(key, status, options);
        this.key = key;
        this.variables = variables;
        this.logLevel = logLevel;
    }

    getKey() {
        return this.key;
    }

    getVariables() {
        return this.variables;
    }

    getLogLevel() {
        return this.logLevel;
    }
}
