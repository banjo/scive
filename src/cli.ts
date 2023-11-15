import { Command, commandAction, commandDescription, COMMANDS } from "@/commands";
import { Logger } from "@/logger";
import { setDebug } from "@/runtime";
import { CommandService } from "@/services/cli-service";
import { ScafkitService } from "@/services/scafkit-service";
import { standout } from "@/utils/cli-util";
import { capitalize } from "@banjoanton/utils";
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
        run: () => import("@/commands/run").then(m => m.runCommand),
        create: () => import("@/commands/create").then(m => m.createCommand),
        list: () => import("@/commands/list").then(m => m.listCommand),
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

        ScafkitService.removeUnsyncedTemplates();
    },
    run: async ctx => {
        Logger.debug("Running main command");

        const commandName = await CommandService.promptSelect({
            message: "What action do you want to take?",
            options: COMMANDS.map(c => ({
                label: capitalize(c),
                value: c,
                hint: commandDescription[c],
            })),
        });

        Logger.debug(`Selected command ${standout(commandName)}`);
        const command = commandAction[commandName as Command];
        await command();
    },
});
