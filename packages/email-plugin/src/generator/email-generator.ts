/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectableStrategy } from '@firelancerco/core';

import { EmailDetails, EmailPluginOptions } from '../types';

/**
 * @description
 * An EmailGenerator generates the subject and body details of an email.
 */
export interface EmailGenerator extends InjectableStrategy {
    /**
     * @description
     * Any necessary setup can be performed here.
     */
    onInit?(options: EmailPluginOptions): void | Promise<void>;

    /**
     * @description
     * Given a subject and body from an email template, this method generates the final
     * interpolated email text.
     */
    generate(
        from: string,
        subject: string,
        body: string,
        templateVars: { [key: string]: any },
    ): Pick<EmailDetails, 'from' | 'subject' | 'body'>;
}
