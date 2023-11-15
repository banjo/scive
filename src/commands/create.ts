import { TemplateService } from "@/services/template-service";
import { defineCommand } from "citty";

export const createCommand = defineCommand({
    meta: {
        name: "create",
        description: "create a template",
    },
    args: {},
    run: async () => {
        await TemplateService.createTemplate();
        process.exit(0);
    },
});
