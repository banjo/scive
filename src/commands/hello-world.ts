import { Logger } from "@/logger";
import { defineCommand } from "citty";

export const helloWorldCommand = defineCommand({
    meta: {
        name: "Hello world",
        description: "A sub command example",
    },
    args: {
        name: {
            type: "string",
            description: "Your name",
        },
    },
    run(ctx) {
        Logger.debug("Running hello world command");
        if (ctx.args.name) {
            console.log(`Hello ${ctx.args.name}!`);
            return;
        }

        Logger.debug("tjo");
        process.exit(0);
    },
});
