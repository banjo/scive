import { getCommandDescription } from "@/commands";
import { TemplateService } from "@/services/template-service";
import { defineCommand } from "citty";

export const create = defineCommand({
    meta: {
        name: "create",
        description: getCommandDescription("create"),
    },
    args: {},
    run: async () => {
        await TemplateService.createTemplate();
        process.exit(0);
    },
});
