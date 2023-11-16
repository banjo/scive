import { getSettingAction } from "@/models/settings-model";
import { ConfigService } from "@/services/config-service";
import { PromptService } from "@/services/prompt-service";
import { showHeader } from "@/utils/cli-util";

const handleSettings = async () => {
    showHeader("Settings");

    while (true) {
        const selected = await PromptService.settingsAction();
        const config = ConfigService.loadConfig();
        const action = getSettingAction(selected);
        await action(config);
    }
};

export const SettingsService = { handleSettings };
