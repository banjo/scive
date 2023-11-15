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
    onError?: () => Promise<void>;
    defaultValue?: string;
}) => {
    const res = await consola.prompt(message, { type: "text", initial: defaultValue });

    if (isSymbol(res)) {
        if (onError) await onError();
        Logger.error(`Could not prompt input ${message}`);
        process.exit(1);
    }

    return res;
};

export const CommandService = {
    execute,
    promptInput,
};
