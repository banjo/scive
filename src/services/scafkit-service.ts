import { FOLDER_DIRECTORY, SCAFKIT_JSON_DIRECTORY, TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { Template } from "@/models/template-model";
import { FileService } from "@/services/file-service";
import { TemplateService } from "@/services/template-service";
import { isEmpty, tryOrDefault } from "@banjoanton/utils";

export const init = () => {
    const hasFolderDirectory = FileService.checkIfExists(FOLDER_DIRECTORY);
    if (!hasFolderDirectory) {
        Logger.debug(`Creating: ${FOLDER_DIRECTORY}`);
        FileService.createDirectory(FOLDER_DIRECTORY);
    }

    const fileExists = tryOrDefault(() => FileService.readFile(SCAFKIT_JSON_DIRECTORY));

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

const hasInitiated = () => FileService.checkIfExists(SCAFKIT_JSON_DIRECTORY);

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
        Logger.debug(`Could not load config from ${SCAFKIT_JSON_DIRECTORY}, using default config`);
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

const getTemplates = () => {
    const config = loadConfig();
    return config.templates;
};

/**
 * Removes config without a corresponding template file.
 * Adds basic config for template files without a corresponding config.
 */
const handleUnsyncedTemplates = () => {
    const config = loadConfig();
    const configTemplates = config.templates;

    const templateFiles = FileService.readDirectory(TEMPLATES_DIRECTORY);

    const templatesToAddConfigFor = templateFiles.filter(templateFile => {
        const templateConfig = configTemplates.find(template => template.id === templateFile);
        return !templateConfig;
    });

    const templateConfigsToRemove = new Set(
        configTemplates.filter(templateConfig => {
            const templateFile = templateFiles.find(tf => tf === templateConfig.id);
            return !templateFile;
        })
    );

    if (isEmpty(templatesToAddConfigFor) && isEmpty(templateConfigsToRemove)) {
        Logger.debug("No unsynced templates found");
        return;
    }

    if (!isEmpty(templatesToAddConfigFor)) {
        Logger.debug("Adding config for unsynced templates");
        for (const templateFile of templatesToAddConfigFor) {
            Logger.debug(`Adding ${templateFile}`);
            const templateConfig = TemplateService.getTemplateInfoFromContent(templateFile);
            config.templates.push(templateConfig);
        }
        updateConfig(config);
    }

    if (!isEmpty(templateConfigsToRemove)) {
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
    handleUnsyncedTemplates,
    getTemplates,
};
