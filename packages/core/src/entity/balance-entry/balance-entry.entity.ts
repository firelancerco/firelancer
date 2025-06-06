/* eslint-disable @typescript-eslint/no-explicit-any */
import { BalanceEntryState, BalanceEntryType, CurrencyCode, ID } from '@firelancerco/common/lib/generated-schema';

import date from 'date-fns';
import { Check, Column, DeepPartial, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Calculated, UserInputException } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
import { EntityId } from '../entity-id.decorator';
import { Money } from '../money.decorator';

/**
 * @description
 * Balance Entry
 */
@Entity()
@Check('"balance" = COALESCE("prevBalance", 0) + "credit" - "debit"')
@Check('"prevSettledAt" < "settledAt"')
@Check(
    '("prevSettledAt" IS NULL AND "prevBalance" IS NULL) OR ("prevSettledAt" IS NOT NULL AND "prevBalance" IS NOT NULL)',
)
@Check('"settledAt" IS NULL OR "rejectedAt" IS NULL')
export class BalanceEntry extends FirelancerEntity {
    constructor(input?: DeepPartial<BalanceEntry>) {
        super(input);
    }

    @Column()
    type: BalanceEntryType;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @EntityId()
    customerId: ID;

    @ManyToOne(() => Customer)
    customer: Customer;

    @Column('varchar')
    currencyCode: CurrencyCode;

    @Money({ nullable: true })
    balance: number | null;

    @Money({ default: 0 })
    credit: number;

    @Money({ default: 0 })
    debit: number;

    @Column({ default: 0 })
    reviewDays: number;

    @Column({ type: 'timestamp', nullable: true })
    settledAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    rejectedAt: Date | null;

    @Money({ nullable: true })
    prevBalance: number | null;

    @Column({ type: 'timestamp', nullable: true })
    prevSettledAt: Date | null;

    @EntityId({ nullable: true })
    parentId: ID | null;

    @ManyToOne(() => BalanceEntry, entry => entry.children, { nullable: true, onDelete: 'CASCADE' })
    parent: BalanceEntry | null;

    @OneToMany(() => BalanceEntry, entry => entry.parent)
    children: BalanceEntry[];

    @Column('simple-json', { nullable: true })
    metadata: any;

    @Calculated({
        expression: `
            CASE
                WHEN balance IS NOT NULL AND settledAt IS NOT NULL THEN 'SETTLED'
                WHEN balance IS NULL AND settledAt IS NULL THEN 'PENDING'
                WHEN rejectedAt IS NOT NULL THEN 'REJECTED'
            END
        `,
    })
    get status(): BalanceEntryState | undefined {
        if (this.balance !== null && this.settledAt !== null) {
            return BalanceEntryState.SETTLED;
        }

        if (this.balance === null && this.settledAt === null) {
            return BalanceEntryState.PENDING;
        }

        if (this.rejectedAt !== null) {
            return BalanceEntryState.REJECTED;
        }
    }

    isEligibleForSettlement() {
        const reviewExpiryDate = date.addDays(this.createdAt, this.reviewDays);
        const hasReviewPeriodElapsed = this.reviewDays === 0 || date.isBefore(reviewExpiryDate, new Date());
        return this.status === 'PENDING' && hasReviewPeriodElapsed;
    }

    validate() {
        if (this.debit < 0) {
            // TODO
            throw new UserInputException('entry.debit-cannot-be-negative-number' as any);
        }

        if (this.credit < 0) {
            // TODO
            throw new UserInputException('entry.credit-cannot-be-negative-number' as any);
        }

        if (!Number.isInteger(this.debit)) {
            // TODO
            throw new UserInputException('entry.debit-must-be-integer-number' as any);
        }

        if (!Number.isInteger(this.credit)) {
            // TODO
            throw new UserInputException('entry.credit-must-be-integer-number' as any);
        }
    }
}
