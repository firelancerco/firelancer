import { LoggerService } from '@nestjs/common';

/**
 * @description
 * An enum of valid logging levels.
 */
export enum LogLevel {
    /**
     * @description
     * Log Errors only. These are usually indicative of some potentially
     * serious issue, so should be acted upon.
     */
    Error = 0,
    /**
     * @description
     * Warnings indicate that some situation may require investigation
     * and handling. But not as serious as an Error.
     */
    Warn = 1,
    /**
     * @description
     * Logs general information such as startup messages.
     */
    Info = 2,
    /**
     * @description
     * Logs additional information
     */
    Verbose = 3,
    /**
     * @description
     * Logs detailed info useful in debug scenarios, including stack traces for
     * all errors. In production this would probably generate too much noise.
     */
    Debug = 4,
}

/**
 * @description
 * The FirelancerLogger interface defines the shape of a logger service which may be provided in
 * the config.
 */
export interface FirelancerLogger {
    error(message: string, context?: string, trace?: string): void;
    warn(message: string, context?: string): void;
    info(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    setDefaultContext?(defaultContext: string): void;
}

const noopLogger: FirelancerLogger = {
    error() {
        /* */
    },
    warn() {
        /* */
    },
    info() {
        /* */
    },
    verbose() {
        /* */
    },
    debug() {
        /* */
    },
};

/**
 * @description
 * The Logger is responsible for all logging in a Firelancer application.
 *
 * It is intended to be used as a static class:
 *
 * @example
 * ```ts
 * import { Logger } from '\@firelancerco/core';
 *
 * Logger.info(`Some log message`, 'My Firelancer Plugin');
 * ```
 *
 * The actual implementation - where the logs are written to - is defined by the FirelancerLogger
 * instance configured in the FirelancerConfig. By default, the DefaultLogger is used, which
 * logs to the console.
 *
 * ## Implementing a custom logger
 *
 * A custom logger can be passed to the `logger` config option by creating a class which implements the
 * FirelancerLogger interface. For example, here is how you might go about implementing a logger which
 * logs to a file:
 *
 * @example
 * ```ts
 * import { FirelancerLogger } from '\@firelancerco/core';
 * import fs from 'fs';
 *
 * // A simple custom logger which writes all logs to a file.
 * export class SimpleFileLogger implements FirelancerLogger {
 *     private logfile: fs.WriteStream;
 *
 *     constructor(logfileLocation: string) {
 *         this.logfile = fs.createWriteStream(logfileLocation, { flags: 'w' });
 *     }
 *
 *     error(message: string, context?: string) {
 *         this.logfile.write(`ERROR: [${context}] ${message}\n`);
 *     }
 *     warn(message: string, context?: string) {
 *         this.logfile.write(`WARN: [${context}] ${message}\n`);
 *     }
 *     info(message: string, context?: string) {
 *         this.logfile.write(`INFO: [${context}] ${message}\n`);
 *     }
 *     verbose(message: string, context?: string) {
 *         this.logfile.write(`VERBOSE: [${context}] ${message}\n`);
 *     }
 *     debug(message: string, context?: string) {
 *         this.logfile.write(`DEBUG: [${context}] ${message}\n`);
 *     }
 * }
 *
 * // in the FirelancerConfig
 * export const config = {
 *     // ...
 *     logger: new SimpleFileLogger('server.log'),
 * }
 * ```
 */
export class Logger implements LoggerService {
    private static _instance: typeof Logger = Logger;
    private static _logger: FirelancerLogger;

    static get logger(): FirelancerLogger {
        return this._logger || noopLogger;
    }

    private get instance(): typeof Logger {
        const { _instance } = Logger;
        return _instance;
    }

    static useLogger(logger: FirelancerLogger) {
        Logger._logger = logger;
    }

    error(message: string, trace?: string, context?: string) {
        this.instance.error(message, context, trace);
    }

    warn(message: string, context?: string) {
        this.instance.warn(message, context);
    }

    log(message: string, context?: string) {
        this.instance.info(message, context);
    }

    verbose(message: string, context?: string) {
        this.instance.verbose(message, context);
    }

    debug(message: string, context?: string) {
        this.instance.debug(message, context);
    }

    static error(message: string, context?: string, trace?: string): void {
        Logger.logger.error(message, context, trace);
    }

    static warn(message: string, context?: string): void {
        Logger.logger.warn(message, context);
    }

    static info(message: string, context?: string): void {
        Logger.logger.info(message, context);
    }

    static verbose(message: string, context?: string): void {
        Logger.logger.verbose(message, context);
    }

    static debug(message: string, context?: string): void {
        Logger.logger.debug(message, context);
    }
}
