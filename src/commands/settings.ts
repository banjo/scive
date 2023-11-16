import { getCommandDescription } from "@/commands";
import { SettingsService } from "@/services/settings-service";
import { defineCommand } from "citty";

export const settings = defineCommand({
    meta: {
        name: "settings",
        description: getCommandDescription("settings"),
    },
    args: {},
    run: async () => {
        await SettingsService.handleSettings();
        process.exit(0);
    },
});
