import { FOLDER_DIRECTORY, SCIVE_JSON_DIRECTORY, TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Config } from "@/models/config-model";
import { Template } from "@/models/template-model";
import { CliService } from "@/services/cli-service";
import { ConfigService } from "@/services/config-service";
import { FileService } from "@/services/file-service";
import { TemplateService } from "@/services/template-service";
import { newline, standout } from "@/utils/cli-util";
import { isEmpty, tryOrDefault } from "@banjoanton/utils";

export const init = () => {
    const hasFolderDirectory = FileService.checkIfExists(FOLDER_DIRECTORY);
    if (!hasFolderDirectory) {
        Logger.debug(`Creating: ${FOLDER_DIRECTORY}`);
        FileService.createDirectory(FOLDER_DIRECTORY);
    }

    const fileExists = tryOrDefault(() => FileService.readFile(SCIVE_JSON_DIRECTORY));

    if (!fileExists) {
        Logger.debug(`Creating: ${SCIVE_JSON_DIRECTORY}`);
        FileService.writeFile({
            path: SCIVE_JSON_DIRECTORY,
            content: Config.toJSON(Config.default),
        });
    }

    const hasTemplateDirectory = FileService.checkIfExists(TEMPLATES_DIRECTORY);
    if (!hasTemplateDirectory) {
        Logger.debug(`Creating: ${TEMPLATES_DIRECTORY}`);
        FileService.createDirectory(TEMPLATES_DIRECTORY);
    }
};

const hasInitiated = () => FileService.checkIfExists(SCIVE_JSON_DIRECTORY);

const removeTemplate = (template: Template) => {
    const config = ConfigService.loadConfig();
    config.templates = config.templates.filter(t => t.id !== template.id);
    ConfigService.updateConfig(config);

    Logger.debug(`Removing template ${template.name}`);

    FileService.removeDirectory(`${TEMPLATES_DIRECTORY}/${template.id}`);
};

/**
 * Removes config without a corresponding template file.
 * Adds basic config for template files without a corresponding config.
 */
const handleUnsyncedTemplates = () => {
    const config = ConfigService.loadConfig();
    const configTemplates = config.templates;

    const templateFiles = FileService.readDirectory(TEMPLATES_DIRECTORY);

    const templatesToAddConfigFor = templateFiles.filter(templateFile => {
        const templateConfig = configTemplates.find(template => template.id === templateFile);
        return !templateConfig;
    });

    const templateConfigsToRemove = configTemplates.filter(templateConfig => {
        const templateFile = templateFiles.find(tf => tf === templateConfig.id);
        return !templateFile;
    });

    if (isEmpty(templatesToAddConfigFor) && isEmpty(templateConfigsToRemove)) {
        Logger.debug("No unsynced templates found");
        return;
    }

    if (!isEmpty(templatesToAddConfigFor)) {
        Logger.debug(
            `Adding config for unsynced templates: ${templatesToAddConfigFor.join(", ")}}`
        );
        for (const templateFile of templatesToAddConfigFor) {
            Logger.debug(`Adding ${templateFile}`);
            const templateConfig = TemplateService.getTemplateInfoFromContent(templateFile);
            config.templates.push(templateConfig);
        }
        ConfigService.updateConfig(config);
    }

    if (!isEmpty(templateConfigsToRemove)) {
        Logger.debug(
            `Removing unsynced template configs: ${templateConfigsToRemove
                .map(t => t.name)
                .join(", ")}`
        );
        config.templates = configTemplates.filter(
            templateConfig => !templateConfigsToRemove.includes(templateConfig)
        );
        ConfigService.updateConfig(config);
    }
};

type TemplateFile = { content: string; name: string; variables: string[] };
const createTemplateFile = async (id: string): Promise<TemplateFile> => {
    const fileName = await CliService.input({
        message: `Template file name with extension`,
        required: true,
    });

    const nameWithHbs = fileName.endsWith(".hbs") ? fileName : `${fileName}.hbs`;
    const newPath = `${TEMPLATES_DIRECTORY}/${id}/${nameWithHbs}`;

    const fileExists = FileService.checkIfExists(newPath);

    if (fileExists) {
        Logger.error(`Template ${standout(nameWithHbs)} already exists`);
        process.exit(1);
    }

    newline();
    await CliService.openInEditor(newPath);
    const fileContent = FileService.readFile(newPath);

    if (!fileContent) {
        Logger.error(`Could not read file ${newPath}`);
        process.exit(1);
    }

    const addedVariables = [
        ...TemplateService.parseTemplateVariableNames(fileContent),
        ...TemplateService.parseTemplateVariableNames(nameWithHbs),
    ];

    return {
        content: fileContent,
        name: nameWithHbs,
        variables: addedVariables,
    };
};

export const SciveService = {
    init,
    hasInitiated,
    handleUnsyncedTemplates,
    removeTemplate,
    createTemplateFile,
};
