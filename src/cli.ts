import { Command, commandAction, commandDescription, COMMANDS } from "@/commands";
import { Logger } from "@/logger";
import { setDebug } from "@/runtime";
import { CliService } from "@/services/cli-service";
import { SciveService } from "@/services/scive-service";
import { heading, standout } from "@/utils/cli-util";
import { capitalize } from "@banjoanton/utils";
import { defineCommand } from "citty";
import { version } from "../package.json";

export const main = defineCommand({
    meta: {
        name: "scive",
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
        const config = SciveService.loadConfig();

        if (ctx.args.debug || config.debug) {
            setDebug(true);
            Logger.debug("Debug mode enabled");
        }

        const isInitiated = SciveService.hasInitiated();
        if (isInitiated) {
            Logger.debug("Scive already initiated");
        } else {
            Logger.debug("Initializing scive");
            SciveService.init();
        }

        SciveService.handleUnsyncedTemplates();
    },
    run: async ctx => {
        Logger.debug("Running main command");

        Logger.log(heading(`Scive ${version}`));

        const commandName = await CliService.select({
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
