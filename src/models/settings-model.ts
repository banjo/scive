import { FOLDER_DIRECTORY, LOG_FILE_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { CliService } from "@/services/cli-service";
import { ConfigService } from "@/services/config-service";
import { FileService } from "@/services/file-service";
import { PromptService } from "@/services/prompt-service";
import { AsyncCallbackWithArgs, CallbackWithArgs } from "@banjoanton/utils";

export const SETTINGS = ["debug", "logs", "editor", "update", "reset"] as const;
export type Setting = (typeof SETTINGS)[number];

const settingDescription: Record<Setting, string> = {
    debug: "Toggle debug mode, saves debug logs to scive-debug.log",
    logs: "Open logs file",
    editor: "Change default editor",
    reset: "A hard reset, removes all config and templates",
    update: "Update scive",
};

export const getSettingDescription = (setting: Setting) => settingDescription[setting];

const settingsActions: Record<Setting, CallbackWithArgs<Config> | AsyncCallbackWithArgs<Config>> = {
    debug: async (config: Config) => {
        const shouldEnable = await CliService.confirm({
            message: `Do you want to enable debug mode?`,
            defaultValue: config.debug,
        });
        Logger.debug(`Debug mode set to: ${shouldEnable}`);
        const updatedConfig = { ...config, debug: shouldEnable };
        ConfigService.updateConfig(updatedConfig);
    },
    logs: () => {
        const logFileExists = FileService.checkIfExists(LOG_FILE_DIRECTORY);
        if (!logFileExists) {
            Logger.warning("No logs found");
            return;
        }

        Logger.debug(`Opening logs file: ${LOG_FILE_DIRECTORY}`);
        CliService.openInEditor(LOG_FILE_DIRECTORY);
    },
    editor: async (config: Config) => {
        const editor = await PromptService.editor();
        const updatedConfig = { ...config, editor };
        ConfigService.updateConfig(updatedConfig);
    },
    update: async () => {
        Logger.debug("Updating scive");
        await CliService.execute("npm install -g scive");
        Logger.success("Successfully updated scive");
        process.exit(0);
    },
    reset: async () => {
        const shouldReset = await CliService.confirm({
            message: `Do you want to reset scive?`,
            defaultValue: false,
        });

        if (!shouldReset) {
            Logger.debug("Reset aborted");
            return;
        }

        Logger.debug("Resetting scive");
        FileService.removeDirectory(FOLDER_DIRECTORY);
        Logger.success("Successfully reset scive");
        process.exit(0);
    },
};

export const getSettingAction = (setting: Setting) => settingsActions[setting];
