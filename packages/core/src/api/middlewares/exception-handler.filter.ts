import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { parseContext } from '../../common';
import { ConfigService } from '../../config';
import { I18nException, I18nService } from '../../i18n';

/**
 * Logs thrown I18nExceptions via the configured FirelancerLogger.
 */
@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
    constructor(
        private configService: ConfigService,
        private i18nService: I18nService,
    ) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        for (const handler of this.configService.systemOptions.errorHandlers) {
            void handler.handleServerError(exception, { host });
        }

        const { req, res } = parseContext(host);
        const status = exception.getStatus();

        if (exception instanceof I18nException) {
            exception = this.i18nService.translateError(req, exception);
        }

        res.status(status).json(exception);
    }
}
