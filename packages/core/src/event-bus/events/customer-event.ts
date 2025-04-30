import { CreateCustomerInput, ID, UpdateCustomerInput } from '@firelancerco/common/lib/generated-schema';

import { RequestContext } from '../../common/request-context';
import { Customer } from '../../entity/customer/customer.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type CustomerInputTypes =
    | CreateCustomerInput
    | UpdateCustomerInput
    | (Partial<CreateCustomerInput> & { emailAddress: string })
    | ID;

/**
 * @description
 * This event is fired whenever a Customer is added, updated or deleted.
 */
export class CustomerEvent extends FirelancerEntityEvent<Customer, CustomerInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Customer,
        type: 'created' | 'updated' | 'deleted',
        input?: CustomerInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
