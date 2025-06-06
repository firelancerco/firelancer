import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { InternalServerException } from './error/errors';

export type RestContext = { req: Request; res: Response };

/**
 * Parses in the Nest ExecutionContext of the incoming request, accounting for REST requests.
 */
export function parseContext(context: ExecutionContext | ArgumentsHost): RestContext {
    if (context.getType() === 'http') {
        const httpContext = context.switchToHttp();
        return {
            req: httpContext.getRequest(),
            res: httpContext.getResponse(),
        };
    } else {
        // TODO
        throw new InternalServerException(('Context "' + context.getType() + '" is not supported.') as any);
    }
}
