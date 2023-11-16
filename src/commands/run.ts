import { getCommandDescription } from "@/commands";
import { TemplateService } from "@/services/template-service";
import { defineCommand } from "citty";

export const run = defineCommand({
    meta: {
        name: "run",
        description: getCommandDescription("run"),
    },
    args: {},
    run: async () => {
        await TemplateService.runTemplate();
        process.exit(0);
    },
});
