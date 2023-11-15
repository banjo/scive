import { TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Template } from "@/models/template-model";
import { CommandService } from "@/services/cli-service";
import { FileService } from "@/services/file-service";
import { ScafkitService } from "@/services/scafkit-service";
import { newline, standout } from "@/utils/cli-util";
import { uniq } from "@banjoanton/utils";
import { globby } from "globby";
import Handlebars from "handlebars";
import { UnknownRecord } from "type-fest";

const parseTemplate = (template: string, data: UnknownRecord) => {
    return Handlebars.compile(template)(data);
};

const parseTemplateVariableNames = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const matches = content.match(regex);

    if (!matches) {
        return [];
    }

    const variableNames = matches.map(match => match.replace("{{", "").replace("}}", ""));
    return [...new Set(variableNames)];
};

const createTemplate = async () => {
    Logger.log("Create template");

    const fileName = await CommandService.promptInput({
        message: `Template file name with extension`,
    });

    const nameWithHbs = fileName.endsWith(".hbs") ? fileName : `${fileName}.hbs`;
    const newPath = `${TEMPLATES_DIRECTORY}/${nameWithHbs}`;

    const fileExists = await FileService.checkIfExists(newPath);

    if (fileExists) {
        Logger.error(`Template ${standout(nameWithHbs)} already exists`);
        process.exit(1);
    }

    newline();
    Logger.info("Create the template file using handlebars and close the editor when ready");
    await CommandService.execute(`code --wait ${newPath}`);

    const fileContent = await FileService.readFile(newPath);

    if (!fileContent) {
        Logger.error(`Could not read file ${newPath}`);
        process.exit(1);
    }

    const addedVariables = uniq([
        ...parseTemplateVariableNames(fileContent),
        ...parseTemplateVariableNames(fileName),
    ]);

    const onPromptError = () => {
        FileService.removeFile(newPath);
    };

    const name = await CommandService.promptInput({
        message: `Template name ${standout("[for scafkit use]")}`,
        onError: onPromptError,
    });
    const description = await CommandService.promptInput({
        message: `Template description ${standout("[for scafkit use]")}`,
        onError: onPromptError,
    });
    const tags = await CommandService.promptInput({
        message: `Template tags ${standout("[comma separated]")}`,
        onError: onPromptError,
    });
    const variables = await CommandService.promptInput({
        message: `Template variables ${standout("[comma separated]")}`,
        onError: onPromptError,
        defaultValue: addedVariables.join(","),
    });

    const template = Template.from({
        description,
        name,
        tags: tags.split(","),
        templateFileName: nameWithHbs,
        variables: variables.split(","),
    });

    ScafkitService.addTemplateConfig(template);
};

const runTemplate = async () => {
    const templates = ScafkitService.getTemplates();

    if (templates.length === 0) {
        Logger.error("No templates found, create one first");
        process.exit(1);
    }

    const templateName = await CommandService.promptSelect({
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
        const value = await CommandService.promptInput({
            message: `Enter value for ${standout(variable)}`,
        });
        templateData[variable] = value;
    }

    const templateContent = FileService.readFile(
        `${TEMPLATES_DIRECTORY}/${template.templateFileName}`
    );

    if (!templateContent) {
        Logger.error(`Could not read template file ${template.templateFileName}`);
        process.exit(1);
    }

    const parsedTemplate = parseTemplate(templateContent, templateData);
    const parsedFileName = parseTemplate(template.templateFileName, templateData);

    const subdirectories = await globby("**/*", {
        onlyDirectories: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    const directory = await CommandService.promptSelect({
        message: "Select directory",
        options: subdirectories.map(subdirectory => ({ value: subdirectory, label: subdirectory })),
    });

    const newPath = `${directory}/${parsedFileName.replace(".hbs", "")}`;

    FileService.writeFile({ path: newPath, content: parsedTemplate });
    newline();
    Logger.success(`Created ${newPath}`);
};

export const TemplateService = {
    parseTemplate,
    createTemplate,
    parseTemplateVariableNames,
    runTemplate,
};
