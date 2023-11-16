import {
    getTemplateActionDescription,
    TEMPLATE_ACTIONS,
    TemplateAction,
} from "@/models/template-actions-model";
import { CliService } from "@/services/cli-service";
import { standout } from "@/utils/cli-util";
import { Callback, capitalize } from "@banjoanton/utils";
import { globby } from "globby";

const directory = async () => {
    const subdirectories = await globby("**/*", {
        onlyDirectories: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    const dir = await CliService.select({
        message: "Select directory",
        options: subdirectories.map(subdirectory => ({
            value: subdirectory,
            label: subdirectory,
        })),
    });

    return dir;
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

export const PromptService = {
    directory,
    templateName,
    templateDescription,
    templateTags,
    templateVariables,
    templateAction,
};
