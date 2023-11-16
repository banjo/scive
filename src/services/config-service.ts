import { SCIVE_JSON_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { Template } from "@/models/template-model";
import { FileService } from "@/services/file-service";
import { tryOrDefault } from "@banjoanton/utils";

const loadConfig = () => {
    Logger.debug(`Loading config from ${SCIVE_JSON_DIRECTORY}`);
    const config = tryOrDefault(() => {
        const json = FileService.readFile(SCIVE_JSON_DIRECTORY);

        if (!json) {
            return undefined;
        }

        return Config.fromJSON(json);
    });

    if (!config) {
        Logger.debug(`Could not load config from ${SCIVE_JSON_DIRECTORY}, using default config`);
        return Config.default;
    }

    return config;
};

const updateConfig = (config: Config) => {
    Logger.debug(`Updating config in ${SCIVE_JSON_DIRECTORY}`);
    FileService.writeFile({
        path: SCIVE_JSON_DIRECTORY,
        content: Config.toJSON(config),
    });
};

const addTemplateConfig = (template: Template) => {
    const config = loadConfig();
    config.templates.push(template);
    Logger.debug(`Adding template config for ${template.name}`);
    updateConfig(config);
};

const updateTemplateConfig = (template: Template) => {
    const config = loadConfig();
    const templateIndex = config.templates.findIndex(t => t.id === template.id);

    if (templateIndex === -1) {
        Logger.error(`Could not find template with id ${template.id}`);
        process.exit(1);
    }

    config.templates[templateIndex] = template;
    Logger.debug(`Updating template config for ${template.name}`);
    updateConfig(config);
};

const getTemplates = () => {
    const config = loadConfig();
    return config.templates;
};

export const ConfigService = {
    loadConfig,
    updateConfig,
    addTemplateConfig,
    updateTemplateConfig,
    getTemplates,
};
