import { LOG_FILE_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { CliService } from "@/services/cli-service";
import { ConfigService } from "@/services/config-service";
import { FileService } from "@/services/file-service";
import { PromptService } from "@/services/prompt-service";
import { AsyncCallbackWithArgs, CallbackWithArgs } from "@banjoanton/utils";

export const SETTINGS = ["debug", "logs", "editor"] as const;
export type Setting = (typeof SETTINGS)[number];

const settingDescription: Record<Setting, string> = {
    debug: "Toggle debug mode, saves debug logs to scive-debug.log",
    logs: "Open logs file",
    editor: "Change default editor",
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
};

export const getSettingAction = (setting: Setting) => settingsActions[setting];
