import z from 'zod';
import { ID } from './common-types.schema';
import { CurrencyCode } from './currency-code.schema';
import { Money } from './common-enums.schema';

export const BalanceEntryType = z.enum(['FIXED_PRICE', 'BONUS', 'PAYMENT', 'WITHDRAWAL']);

export const BalanceEntryState = z.enum([
    /** The balance entry is pending settlement */
    'PENDING',
    /** The balance entry has been settled */
    'SETTLED',
    /** The balance entry has been rejected */
    'REJECTED',
]);

export const BalanceEntry: z.ZodType<any> = z.object({
    type: BalanceEntryType,
    description: z.string().optional(),
    customerId: ID,
    // customer: Customer.optional(),
    currencyCode: CurrencyCode,
    balance: Money.optional(),
    creduit: Money,
    debit: Money,
    reviewDays: z.number(),
    settledAt: z.coerce.date().optional(),
    prevBalance: Money.optional(),
    prevSettledAt: z.coerce.date().optional(),
    parentId: ID.optional(),
    parent: z.lazy(() => BalanceEntry.optional()),
    children: z.lazy(() => BalanceEntry.array()),
    metadata: z.any().optional(),
    // TODO
    // state
});
