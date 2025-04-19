import "i18next";
import en from "./src/i18n/messages/en.json";

export type TMessages = typeof en;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
        en: TMessages;
    };
    // other
  }
}

