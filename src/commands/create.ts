import { commandAction, commandDescription } from "@/commands";
import { defineCommand } from "citty";

export const createCommand = defineCommand({
    meta: {
        name: "create",
        description: commandDescription.create,
    },
    args: {},
    run: async () => {
        await commandAction.create();
    },
});
