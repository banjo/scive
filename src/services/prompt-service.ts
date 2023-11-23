import { Logger } from "@/logger";
import { Editor, EDITORS } from "@/models/editor-model";
import { getSettingDescription, Setting, SETTINGS } from "@/models/settings-model";
import {
    getTemplateActionDescription,
    TEMPLATE_ACTIONS,
    TemplateAction,
} from "@/models/template-actions-model";
import { CliService } from "@/services/cli-service";
import { standout } from "@/utils/cli-util";
import { Callback, capitalize } from "@banjoanton/utils";
import pkg from "enquirer";
import { globby } from "globby";
const { prompt } = pkg;

const directory = async () => {
    const subdirectories = await globby("**/*", {
        onlyDirectories: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    if (subdirectories.length === 0) {
        Logger.debug("No subdirectories found, using current directory");
        return ".";
    }

    const answer: { dir: string } = await prompt({
        type: "autocomplete",
        message: "Select directory",
        choices: ["./", ...subdirectories],
        name: "dir",
    });

    return answer.dir;
};

const file = async () => {
    const files = await globby("**/*", {
        onlyFiles: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    if (files.length === 0) {
        Logger.debug("No files found");
        return ".";
    }

    const answer: { file: string } = await prompt({
        type: "autocomplete",
        message: "Select file",
        choices: files,
        name: "file",
    });

    return answer.file;
};

const templateName = async ({
    onError,
    defaultValue,
}: {
    defaultValue?: string;
    onError?: Callback;
}) =>
    await CliService.input({
        message: `Template name ${standout("[for scive use]")}`,
        onError,
        required: true,
        defaultValue,
    });

const templateDescription = async ({
    onError,
    defaultValue,
}: {
    onError?: Callback;
    defaultValue?: string;
}) =>
    await CliService.input({
        message: `Template description ${standout("[for scive use]")}`,
        onError,
        required: true,
        defaultValue,
    });

const templateTags = async ({
    onError,
    defaultValue,
}: {
    onError?: Callback;
    defaultValue?: string;
}) =>
    await CliService.input({
        message: `Template tags ${standout("[comma separated]")}`,
        onError,
        defaultValue,
    });

const templateVariables = async (defaultValues: string[], onError?: Callback) =>
    await CliService.input({
        message: `Template variables ${standout("[comma separated]")}`,
        onError,
        defaultValue: defaultValues.join(","),
    });

const templateAction = async (onError?: Callback): Promise<TemplateAction> =>
    await CliService.select<TemplateAction>({
        message: "Select option",
        options: TEMPLATE_ACTIONS.map(a => ({
            label: capitalize(a),
            value: a,
            hint: getTemplateActionDescription(a),
        })),
        onError,
    });

const settingsAction = async () =>
    await CliService.select<Setting>({
        message: "What do you want to do?",
        options: SETTINGS.map(setting => ({
            value: setting,
            label: capitalize(setting),
            hint: getSettingDescription(setting),
        })),
    });

const editor = async () =>
    await CliService.select<Editor>({
        message: "Select editor (will be saved in config)",
        options: EDITORS.map(e => ({
            value: e,
            label: e,
        })),
    });

export const PromptService = {
    directory,
    templateName,
    templateDescription,
    templateTags,
    templateVariables,
    templateAction,
    settingsAction,
    editor,
    file,
};
