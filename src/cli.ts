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
        create: () => import("@/commands/create").then(m => m.createCommand),
    },
    setup: ctx => {
        const config = ScafkitService.loadConfig();

        if (ctx.args.debug || config.debug) {
            setDebug(true);
            Logger.debug("Debug mode enabled");
        }

        const isInitiated = ScafkitService.hasInitiated();
        if (isInitiated) {
            Logger.debug("Scafkit already initiated");
        } else {
            Logger.debug("Initializing scafkit");
            ScafkitService.init();
        }
    },
    run: ctx => {
        Logger.debug("Running main command");
    },
});
