import { Logger } from "@/logger";
import { isSymbol } from "@banjoanton/utils";
import consola from "consola";
import { execa, Options } from "execa";

const execute = async (command: string, opt?: Options) => {
    const args = command.split(" ");
    try {
        await execa(args[0], args.slice(1), opt);
    } catch (error) {
        Logger.error(`Could not execute command ${command}`, error);
        process.exit(1);
    }
};

const promptInput = async ({
    message,
    onError,
    defaultValue,
}: {
    message: string;
    onError?: () => Promise<void> | void;
    defaultValue?: string;
}) => {
    const res = await consola.prompt(message, { type: "text", initial: defaultValue });

    if (isSymbol(res) || res === "" || res === undefined) {
        if (onError) await onError();
        Logger.error(`Could not prompt input`);
        process.exit(1);
    }

    return res;
};

const promptSelect = async ({
    message,
    onError,
    options,
}: {
    message: string;
    onError?: () => Promise<void> | void;
    options: { value: string; label: string; hint?: string }[];
}): Promise<string> => {
    const res = await consola.prompt(message, { type: "select", options: options });

    if (isSymbol(res)) {
        if (onError) await onError();
        Logger.error(`Could not prompt input ${message}`);
        process.exit(1);
    }

    return res as unknown as string; // bug with consola types, it returns a string
};

export const CommandService = {
    execute,
    promptInput,
    promptSelect,
};
