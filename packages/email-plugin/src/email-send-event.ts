import { RequestContext, FirelancerEvent } from '@firelancerco/core';

import { EmailDetails } from './types';

/**
 * @description
 * This event is fired when an email sending attempt has been made. If the sending was successful,
 * the `success` property will be `true`, and if not, the `error` property will contain the error
 * which occurred.
 */
export class EmailSendEvent extends FirelancerEvent {
    constructor(
        public readonly ctx: RequestContext,
        public readonly details: EmailDetails,
        public readonly success: boolean,
        public readonly error?: Error,
    ) {
        super();
    }
}
