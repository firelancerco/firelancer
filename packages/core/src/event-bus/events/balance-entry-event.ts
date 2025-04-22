import { BalanceEntryType, ID } from '@firelancerco/common/lib/generated-schema';
import { RequestContext } from '../../common/request-context';
import { BalanceEntry } from '../../entity/balance-entry/balance-entry.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type BalanceInput = ID;

/**
 * @description
 * This event is fired whenever one BalanceEntry is added, updated or deleted.
 */
export class BalanceEntryEvent extends FirelancerEntityEvent<BalanceEntry, BalanceInput> {
    public readonly balanceType: BalanceEntryType | string;

    constructor(
        ctx: RequestContext,
        entity: BalanceEntry,
        type: 'created' | 'updated' | 'deleted',
        balanceType: BalanceEntryType | string,
        input?: BalanceInput,
    ) {
        super(entity, type, ctx, input);
        this.balanceType = balanceType;
    }
}
