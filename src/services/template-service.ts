import Handlebars from "handlebars";
import { UnknownRecord } from "type-fest";

const parseTemplate = (template: string, data: UnknownRecord) => {
    return Handlebars.compile(template)(data);
};

export const TemplateService = {
    parseTemplate,
};
