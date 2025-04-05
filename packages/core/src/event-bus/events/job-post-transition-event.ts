import { RequestContext } from '../../common/request-context';
import { JobPost } from '../../entity';
import { JobPostState } from '../../service';
import { FirelancerEvent } from '../firelancer-event';

/**
 * @description
 * This event is fired whenever an {@link Order} transitions from one {@link OrderState} to another.
 */
export class JobPostStateTransitionEvent extends FirelancerEvent {
    constructor(
        public fromState: JobPostState,
        public toState: JobPostState,
        public ctx: RequestContext,
        public jobPost: JobPost,
    ) {
        super();
    }
}
