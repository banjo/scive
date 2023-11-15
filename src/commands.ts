import { TemplateService } from "@/services/template-service";
import { AsyncCallback } from "@banjoanton/utils";

export const COMMANDS = ["create"] as const;
export type Command = (typeof COMMANDS)[number];

export type CommandMap = Record<Command, AsyncCallback>;

export const commandMap: CommandMap = {
    create: async () => {
        await TemplateService.createTemplate();
        process.exit(0);
    },
};
