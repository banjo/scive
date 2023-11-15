import { commandAction, commandDescription } from "@/commands";
import { defineCommand } from "citty";

export const runCommand = defineCommand({
    meta: {
        name: "run",
        description: commandDescription.run,
    },
    args: {},
    run: async () => {
        await commandAction.run();
    },
});
