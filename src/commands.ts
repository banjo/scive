import { TemplateService } from "@/services/template-service";
import { AsyncCallback, Callback } from "@banjoanton/utils";

export const COMMANDS = ["run", "create", "list"] as const;
export type Command = (typeof COMMANDS)[number];

export type CommandMap = Record<Command, AsyncCallback | Callback>;

export const commandAction: CommandMap = {
    run: async () => {
        await TemplateService.runTemplate();
        process.exit(0);
    },
    create: async () => {
        await TemplateService.createTemplate();
        process.exit(0);
    },
    list: () => {
        TemplateService.listTemplates();
        process.exit(0);
    },
};

export const commandDescription: Record<Command, string> = {
    run: "Create new files from a template",
    create: "Create a new template through a wizard",
    list: "List all local templates",
};
