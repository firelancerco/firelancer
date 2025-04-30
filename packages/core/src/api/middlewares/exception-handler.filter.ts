/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { fromError, isZodErrorLike } from 'zod-validation-error';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';

import { parseContext } from '../../common';
import { ConfigService, Logger } from '../../config';
import { I18nException, I18nService } from '../../i18n';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
    constructor(
        private readonly configService: ConfigService,
        private readonly i18nService: I18nService,
    ) {}

    catch(exception: Error, host: ArgumentsHost): void {
        Logger.error(JSON.stringify(exception));

        const { req, res } = parseContext(host);

        for (const handler of this.configService.systemOptions.errorHandlers) {
            void handler.handleServerError(exception, { host });
        }

        let status: number;
        let message: string;
        let error: string;
        let details: any;

        if (exception instanceof ZodValidationException || exception instanceof ZodSerializationException) {
            exception = exception.getZodError();
        }

        if (isZodErrorLike(exception)) {
            exception = new BadRequestException(fromError(exception).message);
        }

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'object'
                    ? (exceptionResponse as any).message || exceptionResponse
                    : exceptionResponse;
            error = exception.name;
            details = (exceptionResponse as any).details || undefined;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
            details = exception instanceof Error ? exception.message : undefined;
        }

        if (exception instanceof I18nException) {
            message = this.i18nService.translateError(req, exception).message;
        }

        res.status(status).json({
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: req.url,
            details,
        });
    }
}
