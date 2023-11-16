import { Config } from "@/models/config-model";
import { CliService } from "@/services/cli-service";
import { ConfigService } from "@/services/config-service";
import { AsyncCallbackWithArgs, CallbackWithArgs } from "@banjoanton/utils";

export const SETTINGS = ["debug"] as const;
export type Setting = (typeof SETTINGS)[number];

const settingDescription: Record<Setting, string> = {
    debug: "Toggle debug mode globally",
};

export const getSettingDescription = (setting: Setting) => settingDescription[setting];

const settingsActions: Record<Setting, CallbackWithArgs<Config> | AsyncCallbackWithArgs<Config>> = {
    debug: async (config: Config) => {
        const shouldEnable = await CliService.confirm({
            message: `Do you want to enable debug mode?`,
            defaultValue: config.debug,
        });
        const updatedConfig = { ...config, debug: shouldEnable };
        ConfigService.updateConfig(updatedConfig);
    },
};

export const getSettingAction = (setting: Setting) => settingsActions[setting];
