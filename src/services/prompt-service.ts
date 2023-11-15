import { CliService } from "@/services/cli-service";
import { standout } from "@/utils/cli-util";
import { Callback } from "@banjoanton/utils";
import { globby } from "globby";

const directory = async () => {
    const subdirectories = await globby("**/*", {
        onlyDirectories: true,
        gitignore: true,
        cwd: process.cwd(),
    });

    const directory = await CliService.select({
        message: "Select directory",
        options: subdirectories.map(subdirectory => ({
            value: subdirectory,
            label: subdirectory,
        })),
    });

    return directory;
};

const templateName = async (onError?: Callback) =>
    await CliService.input({
        message: `Template name ${standout("[for scafkit use]")}`,
        onError,
        required: true,
    });

const templateDescription = async (onError?: Callback) =>
    await CliService.input({
        message: `Template description ${standout("[for scafkit use]")}`,
        onError,
        required: true,
    });

const templateTags = async (onError?: Callback) =>
    await CliService.input({
        message: `Template tags ${standout("[comma separated]")}`,
        onError,
    });

const templateVariables = async (defaultValues: string[], onError?: Callback) =>
    await CliService.input({
        message: `Template variables ${standout("[comma separated]")}`,
        onError,
        defaultValue: defaultValues.join(","),
    });

export const PromptService = {
    directory,
    templateName,
    templateDescription,
    templateTags,
    templateVariables,
};
