// This file is for any 3rd party JS libs which don't have a corresponding @types/ package.
import "i18next"

declare module 'i18next-icu' {
    // default
}

declare module 'i18next-fs-backend' {
    // default
}

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "en";
        resources: {
            en: typeof import("./src/i18n/messages/en.json");
        };
    }
}
