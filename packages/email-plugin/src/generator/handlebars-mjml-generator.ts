/* eslint-disable @typescript-eslint/no-explicit-any */
import dateFormat from 'dateformat';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

import { InitializedEmailPluginOptions } from '../types';

import { EmailGenerator } from './email-generator';

/**
 * @description
 * Uses Handlebars (https://handlebarsjs.com/) to output MJML (https://mjml.io) which is then
 * compiled down to responsive email HTML.
 */
export class HandlebarsMjmlGenerator implements EmailGenerator {
    async onInit(options: InitializedEmailPluginOptions) {
        if (options.templateLoader.loadPartials) {
            const partials = await options.templateLoader.loadPartials();
            partials.forEach(({ name, content }: any) => Handlebars.registerPartial(name, content));
        }
        this.registerHelpers();
    }

    generate(from: string, subject: string, template: string, templateVars: any) {
        const compiledFrom = Handlebars.compile(from, { noEscape: true });
        const compiledSubject = Handlebars.compile(subject);
        const compiledTemplate = Handlebars.compile(template);
        // We enable prototype properties here, aware of the security implications
        // described here: https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access
        // This is needed because some Firelancer entities use getters on the entity
        // prototype (e.g. Order.total) which may need to be interpolated.
        const fromResult = compiledFrom(templateVars, { allowProtoPropertiesByDefault: true });
        const subjectResult = compiledSubject(templateVars, { allowProtoPropertiesByDefault: true });
        const mjml = compiledTemplate(templateVars, { allowProtoPropertiesByDefault: true });
        const body = mjml2html(mjml).html;
        return { from: fromResult, subject: subjectResult, body };
    }

    private registerHelpers() {
        Handlebars.registerHelper('formatDate', (date: Date | undefined, format: string | object) => {
            if (!date) {
                return date;
            }
            if (typeof format !== 'string') {
                format = 'default';
            }
            return dateFormat(date, format);
        });

        Handlebars.registerHelper('formatMoney', (amount?: number, currencyCode?: string, locale?: string) => {
            if (amount == null) {
                return amount;
            }
            // Last parameter is a generic "options" object which is not used here.
            // If it's supplied, it means the helper function did not receive the additional, optional parameters.
            // See https://handlebarsjs.com/api-reference/helpers.html#the-options-parameter
            if (!currencyCode || typeof currencyCode === 'object') {
                return (amount / 100).toFixed(2);
            }
            // Same reasoning for `locale` as for `currencyCode` here.
            return new Intl.NumberFormat(typeof locale === 'object' ? undefined : locale, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount / 100);
        });
    }
}
