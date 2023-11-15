import { TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Template } from "@/models/template-model";
import { CliService } from "@/services/cli-service";
import { FileService } from "@/services/file-service";
import { PromptService } from "@/services/prompt-service";
import { ScafkitService } from "@/services/scafkit-service";
import { dim, highlight, newline, standout } from "@/utils/cli-util";
import { isUUID, uniq, uuid } from "@banjoanton/utils";
import Handlebars from "handlebars";
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
        id = uuid();
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
        if (!content) {
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
        description: "Scafkit template",
        id,
        name,
        tags: [],
        files: templateFiles,
        variables: templateVariables,
    });

    return template;
};

const createTemplateFromWizard = async (id: string) => {
    const files: { content: string; name: string }[] = [];
    let continueAddingFiles = true;

    while (continueAddingFiles) {
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
        Logger.info(
            `Create the template file using ${standout("handlebars")}, save and close when ready`
        );
        await CliService.execute(`code --wait ${newPath}`);
        const fileContent = FileService.readFile(newPath);

        if (!fileContent) {
            Logger.error(`Could not read file ${newPath}`);
            process.exit(1);
        }

        files.push({ content: fileContent, name: nameWithHbs });

        continueAddingFiles = await CliService.confirm({
            message: `Add another file?`,
            defaultValue: false,
        });
    }

    const addedVariables = files.reduce((acc, file) => {
        const fileVariables = parseTemplateVariableNames(file.content);
        const nameVariables = parseTemplateVariableNames(file.name);
        return [...acc, ...fileVariables, ...nameVariables];
    }, [] as string[]);

    const onError = () => {
        Logger.error(`Could not get prompt`);
        const newPath = `${TEMPLATES_DIRECTORY}/${id}`;
        FileService.removeDirectory(newPath);
    };

    const name = await PromptService.templateName(onError);
    const description = await PromptService.templateDescription(onError);
    const tags = await PromptService.templateTags(onError);
    const variables = await PromptService.templateVariables(addedVariables, onError);

    const template = Template.from({
        id,
        description,
        name,
        tags: tags.split(","),
        files: files.map(f => f.name),
        variables: variables.split(","),
    });

    ScafkitService.addTemplateConfig(template);

    Logger.success(`Created template ${highlight(name)}`);
};

const createTemplateFromFolder = async (id: string) => {
    const directory = await PromptService.directory();

    const newPath = `${TEMPLATES_DIRECTORY}/${id}`;

    FileService.createDirectory(newPath);
    FileService.copyDirectory(`${process.cwd()}/${directory}`, newPath, path => `${path}.hbs`);
    const files = FileService.readDirectory(newPath, true);

    const onError = () => {
        Logger.error(`Could not get prompt`);
        FileService.removeDirectory(newPath);
    };

    const name = await PromptService.templateName(onError);
    const description = await PromptService.templateDescription(onError);
    const tags = await PromptService.templateTags(onError);

    const variables = getVariablesFromFiles(files, newPath);
    const templateVariables = await PromptService.templateVariables(variables, onError);

    const template = Template.from({
        id,
        description,
        name,
        tags: tags.split(","),
        variables: templateVariables.split(","),
        files,
    });

    ScafkitService.addTemplateConfig(template);
    Logger.success(`Created template ${highlight(name)}`);
};

const createTemplate = async () => {
    Logger.log("Create template");
    const id = uuid();

    const creationStyle = await CliService.select({
        message: "Select creation style",
        options: [
            { value: "wizard", label: "Wizard", hint: "Create template through a wizard" },
            {
                label: "Folder",
                value: "folder",
                hint: "Create template from existing folder",
            },
        ],
    });

    if (creationStyle === "wizard") {
        await createTemplateFromWizard(id);
    } else {
        await createTemplateFromFolder(id);
    }
};

const runTemplate = async () => {
    const templates = ScafkitService.getTemplates();

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

const listTemplates = () => {
    const templates = ScafkitService.getTemplates();

    if (templates.length === 0) {
        Logger.warning("No templates found");
        process.exit(0);
    }

    newline();
    Logger.log("Templates");
    for (const template of templates) {
        Logger.log(`👉 ${standout(template.name)} - ${dim(template.description)}`);
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
