import { getCommandDescription } from "@/commands";
import { TemplateService } from "@/services/template-service";
import { defineCommand } from "citty";

export const list = defineCommand({
    meta: {
        name: "list",
        description: getCommandDescription("list"),
    },
    args: {
        name: {
            type: "positional",
            required: false,
            description: "Modify a specific template",
        },
    },
    run: async ctx => {
        const name = ctx.args.name;
        await TemplateService.listTemplates(name);
        process.exit(0);
    },
});
