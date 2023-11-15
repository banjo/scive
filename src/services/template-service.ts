import { TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Template } from "@/models/template-model";
import { CommandService } from "@/services/cli-service";
import { FileService } from "@/services/file-service";
import { ScafkitService } from "@/services/scafkit-service";
import { dim, highlight, newline, standout } from "@/utils/cli-util";
import { uuid } from "@banjoanton/utils";
import { globby } from "globby";
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
    return [...new Set(variableNames)];
};

const createTemplate = async () => {
    Logger.log("Create template");

    const id = uuid();

    const files: { content: string; name: string }[] = [];
    let continueAddingFiles = true;

    while (continueAddingFiles) {
        const fileName = await CommandService.promptInput({
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
        await CommandService.execute(`code --wait ${newPath}`);

        const fileContent = FileService.readFile(newPath);

        if (!fileContent) {
            Logger.error(`Could not read file ${newPath}`);
            process.exit(1);
        }

        files.push({ content: fileContent, name: nameWithHbs });

        continueAddingFiles = await CommandService.promptConfirm({
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
        Logger.error(`Could not prompt input`);
        const newPath = `${TEMPLATES_DIRECTORY}/${id}`;
        FileService.removeDirectory(newPath);
    };

    const name = await CommandService.promptInput({
        message: `Template name ${standout("[for scafkit use]")}`,
        onError,
        required: true,
    });
    const description = await CommandService.promptInput({
        message: `Template description ${standout("[for scafkit use]")}`,
        onError,
        required: true,
    });
    const tags = await CommandService.promptInput({
        message: `Template tags ${standout("[comma separated]")}`,
        onError,
    });
    const variables = await CommandService.promptInput({
        message: `Template variables ${standout("[comma separated]")}`,
        onError,
        defaultValue: addedVariables.join(","),
    });

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

    const subdirectories = await globby("**/*", {
        onlyDirectories: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    const directory = await CommandService.promptSelect({
        message: "Select directory",
        options: subdirectories.map(subdirectory => ({ value: subdirectory, label: subdirectory })),
    });

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
};
