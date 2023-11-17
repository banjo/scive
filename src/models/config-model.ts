import { Logger } from "@/logger";
import { Editor } from "@/models/editor-model";
import { Template } from "@/models/template-model";

export type Config = {
    debug: boolean;
    editor?: Editor;
    templates: Template[];
};

const defaultConfig: Config = {
    debug: false,
    editor: undefined,
    templates: [],
};

export const Config = {
    from: (config: Config) => config,
    toJSON: (config: Config) => JSON.stringify(config, null, 4),
    fromJSON: (json: string) => {
        try {
            Logger.debug("Parsing config from JSON");
            return JSON.parse(json) as Config;
        } catch {
            Logger.error("Could not parse config from JSON");
            return defaultConfig;
        }
    },
    default: defaultConfig,
};
