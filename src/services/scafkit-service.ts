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

const updateConfig = (config: Config) => {
    Logger.debug(`Updating config in ${SCAFKIT_JSON_DIRECTORY}`);
    FileService.writeFile({
        path: SCAFKIT_JSON_DIRECTORY,
        content: Config.toJSON(config),
    });
};

const addTemplateConfig = (template: Template) => {
    const config = loadConfig();
    config.templates.push(template);
    updateConfig(config);
};

const removeUnsyncedTemplates = () => {
    const config = loadConfig();
    const configTemplates = config.templates;

    const templateFiles = FileService.readDirectory(TEMPLATES_DIRECTORY);

    const templateFilesToRemove = templateFiles.filter(templateFile => {
        const templateConfig = configTemplates.find(
            template => template.templateFileName === templateFile
        );
        return !templateConfig;
    });

    const templateConfigsToRemove = new Set(
        configTemplates.filter(templateConfig => {
            const templateFile = templateFiles.find(tf => tf === templateConfig.templateFileName);
            return !templateFile;
        })
    );

    if (templateFilesToRemove.length === 0 && templateConfigsToRemove.size === 0) {
        Logger.debug("No unsynced templates found");
        return;
    }

    if (templateFilesToRemove.length > 0) {
        Logger.debug("Removing unsynced templates");
        for (const templateFile of templateFilesToRemove) {
            Logger.debug(`Removing ${templateFile}`);
            FileService.removeFile(`${TEMPLATES_DIRECTORY}/${templateFile}`);
        }
    }

    if (templateConfigsToRemove.size > 0) {
        Logger.debug("Removing unsynced template configs");
        config.templates = configTemplates.filter(
            templateConfig => !templateConfigsToRemove.has(templateConfig)
        );
        updateConfig(config);
    }
};

export const ScafkitService = {
    init,
    hasInitiated,
    loadConfig,
    updateConfig,
    addTemplateConfig,
    removeUnsyncedTemplates,
};
