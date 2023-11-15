import { Logger } from "@/logger";
import JSON5 from "json5";

export type Config = {
    debug: boolean;
    templates: string[];
};

const defaultConfig: Config = {
    debug: false,
    templates: [],
};

export const Config = {
    from: (config: Config) => config,
    toJSON: (config: Config) => JSON5.stringify(config, null, 4),
    fromJSON: (json: string) => {
        try {
            Logger.debug("Parsing config from JSON");
            return JSON5.parse(json) as Config;
        } catch {
            Logger.error("Could not parse config from JSON");
            return defaultConfig;
        }
    },
    default: defaultConfig,
};
