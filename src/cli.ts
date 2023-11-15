import { Logger } from "@/logger";
import { setDebug } from "@/runtime";
import { ScafkitService } from "@/services/scafkit-service";
import { defineCommand } from "citty";
import { version } from "../package.json";

export const main = defineCommand({
    meta: {
        name: "scafkit",
        version,
        description: "Example CLI",
    },
    args: {
        debug: {
            type: "boolean",
            description: "Run in debug mode",
            required: false,
            default: false,
            alias: "d",
        },
    },
    subCommands: {
        helloWorld: () => import("@/commands/hello-world").then(m => m.helloWorldCommand),
    },
    setup: ctx => {
        if (ctx.args.debug) {
            setDebug(true);
            Logger.debug("Debug mode enabled");
        }
    },
    run: async ctx => {
        Logger.debug("Running main command");

        const isInitiated = await ScafkitService.hasInitiated();
        if (isInitiated) {
            Logger.debug("Scafkit already initiated");
        } else {
            Logger.debug("Initializing scafkit");
            await ScafkitService.init();
        }

        console.log("Hello world!");
    },
});
