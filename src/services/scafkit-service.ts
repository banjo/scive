import { FOLDER_DIRECTORY, SCAFKIT_JSON_DIRECTORY, TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { Template } from "@/models/template-model";
import { FileService } from "@/services/file-service";
import { tryOrDefault } from "@banjoanton/utils";

export const init = () => {
    const hasFolderDirectory = FileService.checkIfExists(FOLDER_DIRECTORY);
    if (!hasFolderDirectory) {
        Logger.debug(`Creating: ${FOLDER_DIRECTORY}`);
        FileService.createDirectory(FOLDER_DIRECTORY);
    }

    const fileExists = tryOrDefault(() => {
        return FileService.readFile(SCAFKIT_JSON_DIRECTORY);
    });

    if (!fileExists) {
        Logger.debug(`Creating: ${SCAFKIT_JSON_DIRECTORY}`);
        FileService.writeFile({
            path: SCAFKIT_JSON_DIRECTORY,
            content: Config.toJSON(Config.default),
        });
    }

    const hasTemplateDirectory = FileService.checkIfExists(TEMPLATES_DIRECTORY);
    if (!hasTemplateDirectory) {
        Logger.debug(`Creating: ${TEMPLATES_DIRECTORY}`);
        FileService.createDirectory(TEMPLATES_DIRECTORY);
    }
};

const hasInitiated = () => {
    return FileService.checkIfExists(SCAFKIT_JSON_DIRECTORY);
};

const loadConfig = () => {
    Logger.debug(`Loading config from ${SCAFKIT_JSON_DIRECTORY}`);
    const config = tryOrDefault(() => {
        const json = FileService.readFile(SCAFKIT_JSON_DIRECTORY);

        if (!json) {
            return undefined;
        }

        return Config.fromJSON(json);
    });

    if (!config) {
        Logger.error(`Could not load config from ${SCAFKIT_JSON_DIRECTORY}, using default config`);
        return Config.default;
    }

    return config;
};

const updateConfig = async (config: Config) => {
    Logger.debug(`Updating config in ${SCAFKIT_JSON_DIRECTORY}`);
    await FileService.writeFile({
        path: SCAFKIT_JSON_DIRECTORY,
        content: Config.toJSON(config),
    });
};

const addTemplateConfig = async (template: Template) => {
    const config = loadConfig();
    config.templates.push(template);
    await updateConfig(config);
};

export const ScafkitService = {
    init,
    hasInitiated,
    loadConfig,
    updateConfig,
    addTemplateConfig,
};
