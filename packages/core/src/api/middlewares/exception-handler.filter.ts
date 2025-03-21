/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { InternalServerException, parseContext } from '../../common';
import { ConfigService, Logger } from '../../config';
import { I18nException, I18nService } from '../../i18n';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
    constructor(
        private readonly configService: ConfigService,
        private readonly i18nService: I18nService,
    ) {}

    catch(exception: Error, host: ArgumentsHost): void {
        // Process the exception through all configured error handlers
        this.processErrorHandlers(exception, host);

        const { req, res } = parseContext(host);

        if (exception instanceof HttpException) {
            this.handleHttpException(exception, req, res);
        } else {
            this.handleUnknownException(exception, req, res);
        }
    }

    private processErrorHandlers(exception: Error, host: ArgumentsHost): void {
        for (const handler of this.configService.systemOptions.errorHandlers) {
            void handler.handleServerError(exception, { host });
        }
    }

    private handleHttpException(exception: HttpException, req: any, res: any): void {
        const status = exception.getStatus();

        // Translate the exception if it's an i18n-aware exception
        if (exception instanceof I18nException) {
            exception = this.i18nService.translateError(req, exception);
        }

        res.status(status).json(exception);
    }

    private handleUnknownException(exception: Error, req: any, res: any): void {
        // Log unknown exceptions
        Logger.error(exception.message, exception.stack);

        // Convert to InternalServerException and translate it
        const internalException = new InternalServerException(exception.message);
        const translatedError = this.i18nService.translateError(req, internalException);

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(translatedError);
    }
}
