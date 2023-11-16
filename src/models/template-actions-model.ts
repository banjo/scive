import { TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { Template } from "@/models/template-model";
import { CliService } from "@/services/cli-service";
import { FileService } from "@/services/file-service";
import { PromptService } from "@/services/prompt-service";
import { SciveService } from "@/services/scive-service";
import { AsyncCallbackWithArgs, CallbackWithArgs } from "@banjoanton/utils";

export const TEMPLATE_ACTIONS = [
    "open",
    "edit",
    "rename",
    "description",
    "add",
    "remove",
    "tags",
    "delete",
] as const;

export type TemplateAction = (typeof TEMPLATE_ACTIONS)[number];

const templateDescriptions: Record<TemplateAction, string> = {
    open: "Open template directory",
    edit: "Edit template directory in VS Code",
    rename: "Rename template",
    description: "Edit template description",
    add: "Add files to template",
    remove: "Remove files from template",
    tags: "Edit template tags",
    delete: "Delete template",
};

export const getTemplateActionDescription = (action: TemplateAction) =>
    templateDescriptions[action];

const templateActions: Record<
    TemplateAction,
    CallbackWithArgs<Template> | AsyncCallbackWithArgs<Template>
> = {
    open: async (template: Template) => {
        await CliService.openDirectory(`${TEMPLATES_DIRECTORY}/${template.id}`);
        Logger.success(`Successfully opened template ${template.name}`);
        process.exit(0);
    },
    edit: async (template: Template) => {
        await CliService.openInEditor(`${TEMPLATES_DIRECTORY}/${template.id}`, {
            waitForClose: false,
            newWindow: true,
        });

        Logger.success(`Successfully saved template ${template.name}`);

        process.exit(0);
    },
    rename: async (template: Template) => {
        const newName = await PromptService.templateName({ defaultValue: template.name });
        const updatedTemplate = Template.from({ ...template, name: newName });
        SciveService.updateTemplateConfig(updatedTemplate);

        Logger.success(`Updated name for template ${template.name}`);
    },
    description: async (template: Template) => {
        const newDescription = await PromptService.templateDescription({
            defaultValue: template.description,
        });
        const updatedTemplate = Template.from({ ...template, description: newDescription });
        SciveService.updateTemplateConfig(updatedTemplate);

        Logger.success(`Updated description for template ${template.name}`);
    },
    add: async (template: Template) => {
        const newFile = await SciveService.createTemplateFile(template.id);
        const updatedTemplate = Template.from({
            ...template,
            files: [...template.files, newFile.name],
            variables: [...template.variables, ...newFile.variables],
        });
        SciveService.updateTemplateConfig(updatedTemplate);

        Logger.success(`Added file ${newFile.name} to template ${template.name}`);
    },
    remove: async (template: Template) => {
        const filesToRemove = await CliService.multiSelect({
            message: "Select files to remove with spaec, continue with enter",
            options: template.files.map(file => ({
                value: file,
                label: file,
            })),
        });

        const updatedTemplate = Template.from({
            ...template,
            files: template.files.filter(file => !filesToRemove.includes(file)),
        });

        SciveService.updateTemplateConfig(updatedTemplate);

        for (const file of filesToRemove) {
            Logger.debug(`Removing file ${file}`);
            FileService.removeFile(`${TEMPLATES_DIRECTORY}/${template.id}/${file}`);
        }

        Logger.success(`Removed ${filesToRemove.length} files from template ${template.name}`);
    },
    tags: async (template: Template) => {
        const newTags = await PromptService.templateTags({ defaultValue: template.tags.join(",") });
        const updatedTemplate = Template.from({ ...template, tags: newTags.split(",") });
        SciveService.updateTemplateConfig(updatedTemplate);
        Logger.success(`Updated tags for template ${template.name}`);
    },
    delete: (template: Template) => {
        const shouldDelete = CliService.confirm({
            message: `Are you sure you want to delete ${template.name}?`,
            defaultValue: false,
        });

        if (!shouldDelete) {
            Logger.debug(`Not deleting template ${template.name}`);
            return;
        }

        Logger.debug(`Removing template ${template.name}`);
        SciveService.removeTemplate(template);
        Logger.success(`Removed template ${template.name}`);
        process.exit(0);
    },
};

export const getTemplateAction = (action: TemplateAction) => templateActions[action];
