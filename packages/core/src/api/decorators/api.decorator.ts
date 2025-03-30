import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getApiType } from '../../common/get-api-type';
import { Request } from 'express';

/**
 * @description
 * Resolver param decorator which returns which Api the request came though.
 * This is useful because sometimes the same resolver will have different behaviour
 * depending whether it is being called from the shop API or the admin API.
 *
 * Returns a string of type ApiType.
 *
 * @example
 * ```ts
 *  \@Get()
 *  getAdministrators(\@Api() apiType: ApiType) {
 *    if (apiType === 'admin') {
 *      // ...
 *    }
 *  }
 * ```
 */
export const Api = createParamDecorator((data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request) {
        throw new Error('No request object found in execution context');
    }
    return getApiType(request);
});
