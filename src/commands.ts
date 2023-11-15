import { TemplateService } from "@/services/template-service";
import { AsyncCallback } from "@banjoanton/utils";

export const COMMANDS = ["run", "create"] as const;
export type Command = (typeof COMMANDS)[number];

export type CommandMap = Record<Command, AsyncCallback>;

export const commandAction: CommandMap = {
    run: async () => {
        await TemplateService.runTemplate();
        process.exit(0);
    },
    create: async () => {
        await TemplateService.createTemplate();
        process.exit(0);
    },
};

export const commandDescription: Record<Command, string> = {
    run: "Create a new file from a template",
    create: "Create a new template via a wizard",
};
