import { commandAction, commandDescription } from "@/commands";
import { defineCommand } from "citty";

export const listCommand = defineCommand({
    meta: {
        name: "list",
        description: commandDescription.list,
    },
    args: {},
    run: async () => {
        await commandAction.list();
    },
});
