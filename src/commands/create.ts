import { commandMap } from "@/commands";
import { defineCommand } from "citty";

export const createCommand = defineCommand({
    meta: {
        name: "create",
        description: "create a template",
    },
    args: {},
    run: async () => {
        await commandMap.create();
    },
});
