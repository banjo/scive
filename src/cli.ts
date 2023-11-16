import { Command, COMMANDS, getCommandDescription } from "@/commands";
import { create } from "@/commands/create";
import { list } from "@/commands/list";
import { run } from "@/commands/run";
import { Logger } from "@/logger";
import { setDebug } from "@/runtime";
import { CliService } from "@/services/cli-service";
import { SciveService } from "@/services/scive-service";
import { showHeader, standout } from "@/utils/cli-util";
import { capitalize } from "@banjoanton/utils";
import { defineCommand, runCommand } from "citty";
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
        run,
        create,
        list,
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
        showHeader(`Scive ${version}`);

        const commandName = await CliService.select<Command>({
            message: "What action do you want to take?",
            options: COMMANDS.map(c => ({
                label: capitalize(c),
                value: c,
                hint: getCommandDescription(c),
            })),
        });

        Logger.debug(`Selected command ${standout(commandName)}`);

        switch (commandName) {
            case "create": {
                await runCommand(create, { rawArgs: [] });
                break;
            }
            case "list": {
                await runCommand(list, { rawArgs: [] });
                break;
            }
            case "run": {
                await runCommand(run, { rawArgs: [] });
                break;
            }
        }
    },
});
