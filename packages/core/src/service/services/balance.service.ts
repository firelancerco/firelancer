import { PaginatedList } from '@firelancerco/common/lib/shared-types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';

import { RelationPaths } from '../../api/decorators/relations.decorator';
import { ListQueryOptions, RequestContext } from '../../common';
import { CreateBalanceEntryInput, ID } from '../../common/shared-schema';
import { TransactionalConnection } from '../../connection';
import { BalanceEntry } from '../../entity/balance-entry/balance-entry.entity';
import { Customer } from '../../entity/customer/customer.entity';
import { EventBus } from '../../event-bus';
import { BalanceEntryEvent } from '../../event-bus/events/balance-entry-event';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';

/**
 * @description
 * Contains methods relating to Balance entities.
 */
@Injectable()
export class BalanceService implements OnModuleInit {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private eventBus: EventBus,
    ) {}
    onModuleInit() {
        this.eventBus.ofType(BalanceEntryEvent).subscribe(async event => {
            if (event.type == 'created') {
                await this.trySettleBalance(event.ctx, event.entity.id);
            }
        });
    }

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<BalanceEntry>,
        relations?: RelationPaths<BalanceEntry>,
    ): Promise<PaginatedList<BalanceEntry>> {
        return this.listQueryBuilder
            .build(BalanceEntry, options, {
                ctx,
                relations: relations ?? [],
            })
            .getMany()
            .then(items => ({
                items,
                totalItems: items.length,
            }));
    }

    async create(ctx: RequestContext, input: CreateBalanceEntryInput): Promise<BalanceEntry> {
        return this.connection.withTransaction(ctx, async ctx => {
            // TODO: perform some constraints checking for customer
            const entry = new BalanceEntry(input);
            entry.validate();
            await this.connection.getRepository(ctx, BalanceEntry).save(entry);
            await this.eventBus.publish(new BalanceEntryEvent(ctx, entry, 'created', input.type, input));
            return entry;
        });
    }

    async trySettleBalance(ctx: RequestContext, entryId: ID): Promise<BalanceEntry> {
        return this.connection.withTransaction(ctx, async ctx => {
            const entry = await this.connection.getEntityOrThrow(ctx, BalanceEntry, entryId);
            if (entry.isEligibleForSettlement()) {
                const latestSettledEntry = await this.getLatestSettledEntry(ctx, entry.customer);
                entry.prevSettledAt = latestSettledEntry?.settledAt ?? null;
                entry.prevBalance = latestSettledEntry?.balance ?? null;
                entry.balance = (entry.prevBalance ?? 0) + entry.credit - entry.debit;
                entry.settledAt = new Date();
                await this.connection.getRepository(ctx, BalanceEntry).save(entry);
            }
            return entry;
        });
    }

    private async getLatestSettledEntry(ctx: RequestContext, customer: Customer): Promise<BalanceEntry | undefined> {
        return this.connection
            .getRepository(ctx, BalanceEntry)
            .findOne({
                where: {
                    customer: customer,
                    balance: Not(IsNull()),
                    settledAt: Not(IsNull()),
                },
                order: {
                    settledAt: 'DESC',
                },
            })
            .then(result => result ?? undefined);
    }
}
