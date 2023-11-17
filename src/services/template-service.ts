import { TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { getTemplateAction } from "@/models/template-actions-model";
import { Template } from "@/models/template-model";
import { CliService } from "@/services/cli-service";
import { ConfigService } from "@/services/config-service";
import { FileService } from "@/services/file-service";
import { PromptService } from "@/services/prompt-service";
import { SciveService } from "@/services/scive-service";
import { clear, highlight, newline, showHeader, standout } from "@/utils/cli-util";
import { TemplateUtil } from "@/utils/template-util";
import { isDefined, isUUID, uniq } from "@banjoanton/utils";
import Handlebars from "handlebars";
import { randomUUID } from "node:crypto";
import { UnknownRecord } from "type-fest";

const parseTemplate = (template: string, data: UnknownRecord) => Handlebars.compile(template)(data);

const parseTemplateVariableNames = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const matches = content.match(regex);

    if (!matches) {
        return [];
    }

    const variableNames = matches.map(match => match.replace("{{", "").replace("}}", ""));
    return uniq(variableNames);
};

/**
 * Santize folder, checks if it is a valid uuid, if not,
 * it will create a new uuid and move the folder
 * @param folderName - folder name
 * @returns - { id, name }
 */
const sanitizeFolder = (folderName: string) => {
    let id;
    let name;
    if (isUUID(folderName)) {
        id = folderName;
        name = folderName;
    } else {
        id = randomUUID();
        name = folderName;
        FileService.moveDirectory(
            `${TEMPLATES_DIRECTORY}/${folderName}`,
            `${TEMPLATES_DIRECTORY}/${id}`
        );
    }

    return { id, name };
};

const getVariablesFromFiles = (files: string[], folderPath: string) => {
    const templateSummary = files.map(fileName => {
        const content = FileService.readFile(`${folderPath}/${fileName}`);
        if (!isDefined(content)) {
            Logger.error(`Could not read file ${fileName}`);
            process.exit(1);
        }
        return { content, fileName };
    });

    const templateVariables = templateSummary.reduce((acc, file) => {
        const variables = parseTemplateVariableNames(file.content);
        const nameVariables = parseTemplateVariableNames(file.fileName);
        return [...acc, ...variables, ...nameVariables];
    }, [] as string[]);

    return templateVariables;
};

const getTemplateInfoFromContent = (folderName: string) => {
    const { id, name } = sanitizeFolder(folderName);
    const templateDirectory = `${TEMPLATES_DIRECTORY}/${id}`;

    const templateFiles = FileService.readDirectory(templateDirectory, true);
    const templateVariables = getVariablesFromFiles(templateFiles, templateDirectory);

    const template = Template.from({
        description: "Scive template",
        id,
        name,
        tags: [],
        files: templateFiles,
        variables: templateVariables,
    });

    return template;
};

const createTemplateFromWizard = async (id: string) => {
    const files = [];
    let continueAddingFiles = true;

    showHeader("Template wizard");

    while (continueAddingFiles) {
        const file = await SciveService.createTemplateFile(id);
        files.push(file);
        continueAddingFiles = await CliService.confirm({
            message: `Add another file?`,
            defaultValue: false,
        });
    }

    const onError = () => {
        Logger.error(`Could not get prompt`);
        const newPath = `${TEMPLATES_DIRECTORY}/${id}`;
        FileService.removeDirectory(newPath);
    };

    const allVariables = uniq(
        files.reduce((acc, file) => [...acc, ...file.variables], [] as string[])
    );

    const name = await PromptService.templateName({ onError });
    const description = await PromptService.templateDescription({ onError });
    const tags = await PromptService.templateTags({ onError });
    const variables = await PromptService.templateVariables(allVariables, onError);

    const template = Template.from({
        id,
        description,
        name,
        tags: TemplateUtil.commaSeparatedToSanitizedArray(tags),
        files: files.map(f => f.name),
        variables: TemplateUtil.commaSeparatedToSanitizedArray(variables),
    });

    ConfigService.addTemplateConfig(template);

    Logger.success(`Created template ${highlight(name)}`);
};

const createTemplateFromFolder = async (id: string) => {
    showHeader("Template from folder");
    const directory = await PromptService.directory();

    const newPath = `${TEMPLATES_DIRECTORY}/${id}`;

    FileService.createDirectory(newPath);
    FileService.copyDirectory(`${process.cwd()}/${directory}`, newPath, path => `${path}.hbs`);
    const files = FileService.readDirectory(newPath, true);

    const onError = () => {
        Logger.error(`Could not get prompt`);
        FileService.removeDirectory(newPath);
    };

    const name = await PromptService.templateName({ onError });
    const description = await PromptService.templateDescription({ onError });
    const tags = await PromptService.templateTags({ onError });

    const variables = getVariablesFromFiles(files, newPath);
    const templateVariables = await PromptService.templateVariables(variables, onError);

    const template = Template.from({
        id,
        description,
        name,
        tags: TemplateUtil.commaSeparatedToSanitizedArray(tags),
        variables: TemplateUtil.commaSeparatedToSanitizedArray(templateVariables),
        files,
    });

    ConfigService.addTemplateConfig(template);
    Logger.success(`Created template ${highlight(name)}`);
};

const createTemplateFromFile = async (id: string) => {
    showHeader("Template from file");
    const file = await PromptService.file();

    const newPath = `${TEMPLATES_DIRECTORY}/${id}`;
    FileService.createDirectory(newPath);

    const fileName = file.split("/").pop();
    if (!isDefined(fileName)) {
        Logger.error(`Could not get file name from ${file}`);
        process.exit(1);
    }

    FileService.copyFile(file, `${newPath}/${fileName}.hbs`);

    const onError = () => {
        Logger.error(`Could not get prompt`);
        FileService.removeDirectory(newPath);
    };

    const name = await PromptService.templateName({ onError });
    const description = await PromptService.templateDescription({ onError });
    const tags = await PromptService.templateTags({ onError });

    const variables = parseTemplateVariableNames(fileName);
    const templateVariables = await PromptService.templateVariables(variables, onError);

    const template = Template.from({
        id,
        description,
        name,
        tags: TemplateUtil.commaSeparatedToSanitizedArray(tags),
        variables: TemplateUtil.commaSeparatedToSanitizedArray(templateVariables),
        files: [fileName],
    });

    ConfigService.addTemplateConfig(template);
    Logger.success(`Created template ${highlight(name)}`);
};

type CreationType = "wizard" | "folder" | "file";
const createTemplate = async () => {
    const id = randomUUID();
    showHeader("Create");

    const creationStyle = await CliService.select<CreationType>({
        message: "Select creation style",
        options: [
            { value: "wizard", label: "Wizard", hint: "Create template through a wizard" },
            {
                label: "Folder",
                value: "folder",
                hint: "Create template from existing folder",
            },
            {
                label: "File",
                value: "file",
                hint: "Create template from existing file in current directory",
            },
        ],
    });

    if (creationStyle === "wizard") {
        await createTemplateFromWizard(id);
    } else if (creationStyle === "folder") {
        await createTemplateFromFolder(id);
    } else {
        await createTemplateFromFile(id);
    }
};

const runTemplate = async () => {
    const templates = ConfigService.getTemplates();

    if (templates.length === 0) {
        Logger.error("No templates found, create one first");
        process.exit(1);
    }

    const templateName = await CliService.select({
        message: "Select template",
        options: templates.map(template => ({
            value: template.name,
            label: template.name,
            hint: template.description,
        })),
    });

    const template = templates.find(t => t.name === templateName);

    if (!template) {
        Logger.error(`Template ${standout(templateName)} not found`);
        process.exit(1);
    }

    const templateVariables = template.variables;

    const templateData: UnknownRecord = {};
    for (const variable of templateVariables) {
        const value = await CliService.input({
            message: `Enter value for ${standout(variable)}`,
        });
        templateData[variable] = value;
    }

    const directory = await PromptService.directory();
    const templateFiles = template.files;

    for (const file of templateFiles) {
        const templateContent = FileService.readFile(
            `${TEMPLATES_DIRECTORY}/${template.id}/${file}`
        );

        if (!templateContent) {
            Logger.error(`Could not read template file ${file}`);
            process.exit(1);
        }

        const parsedTemplate = parseTemplate(templateContent, templateData);
        const parsedFileName = parseTemplate(file, templateData);

        const newPath = `${directory}/${parsedFileName.replace(".hbs", "")}`;
        FileService.writeFile({ path: newPath, content: parsedTemplate });
    }

    newline();
    Logger.success(`Created ${template.name}`);
};

const listTemplates = async (name?: string) => {
    clear();
    const templates = ConfigService.getTemplates();
    showHeader("Templates");

    if (templates.length === 0) {
        Logger.warning("No templates found");
        process.exit(0);
    }

    let template = name ? templates.find(t => t.name === name)?.name : undefined;
    if (!template) {
        // eslint-disable-next-line require-atomic-updates
        template = await CliService.select({
            message: "Select template to modify",
            options: templates.map(t => ({
                value: t.name,
                label: t.name,
                hint: t.description,
            })),
        });
    }

    const templateId = templates.find(t => t.name === template)?.id;

    if (!templateId) {
        Logger.error(`Template id for ${standout(template)} not found`);
        process.exit(1);
    }

    newline();

    while (true) {
        const updatedTemplates = ConfigService.getTemplates();
        const selectedTemplate = updatedTemplates.find(t => t.id === templateId);

        if (!selectedTemplate) {
            Logger.error(`Template ${standout(template)} not found`);
            process.exit(1);
        }

        showHeader(`Template ${template}`);

        const templateOptions = await PromptService.templateAction();
        const action = getTemplateAction(templateOptions);
        await action(selectedTemplate);
    }
};

export const TemplateService = {
    parseTemplate,
    createTemplate,
    parseTemplateVariableNames,
    runTemplate,
    listTemplates,
    getTemplateInfoFromContent,
    sanitizeFolder,
    getVariablesFromFiles,
};
