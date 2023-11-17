import { isEmpty } from "@banjoanton/utils";

const commaSeparatedToSanitizedArray = (value: string) =>
    isEmpty(value) ? [] : value.split(",").map(v => v.trim());

export const TemplateUtil = { commaSeparatedToSanitizedArray };
