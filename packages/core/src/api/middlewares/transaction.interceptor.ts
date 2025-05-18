import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, firstValueFrom } from 'rxjs';

import { parseContext } from '../../common/parse-context';
import { internal_getRequestContext, internal_setRequestContext, RequestContext } from '../../common/request-context';
import { TransactionWrapper } from '../../connection/transaction-wrapper';
import { TransactionalConnection } from '../../connection/transactional-connection';
import {
    TRANSACTION_ISOLATION_LEVEL_METADATA_KEY,
    TRANSACTION_MODE_METADATA_KEY,
    TransactionIsolationLevel,
    TransactionMode,
} from '../decorators/transaction.decorator';

/**
 * @description
 * Used by the Transaction decorator to create a transactional query runner
 * and attach it to the RequestContext.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(
        private connection: TransactionalConnection,
        private transactionWrapper: TransactionWrapper,
        private reflector: Reflector,
    ) {}

    /* eslint-disable @typescript-eslint/no-explicit-any */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const { req } = parseContext(context);
        const ctx: RequestContext | undefined = internal_getRequestContext(req, context);
        if (ctx) {
            const transactionMode = this.reflector.get<TransactionMode>(
                TRANSACTION_MODE_METADATA_KEY,
                context.getHandler(),
            );
            const transactionIsolationLevel = this.reflector.get<TransactionIsolationLevel | undefined>(
                TRANSACTION_ISOLATION_LEVEL_METADATA_KEY,
                context.getHandler(),
            );

            return from(
                this.transactionWrapper.executeInTransaction(
                    ctx,
                    _ctx => {
                        // Registers transactional request context associated
                        // with execution handler function
                        internal_setRequestContext(req, _ctx, context);
                        return firstValueFrom(next.handle());
                    },
                    transactionMode,
                    transactionIsolationLevel,
                    this.connection.rawConnection,
                ),
            );
        } else {
            return next.handle();
        }
    }
}
