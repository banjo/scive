import { Logger } from "@/logger";
import { Callback, isSymbol } from "@banjoanton/utils";
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

const input = async ({
    message,
    onError,
    defaultValue,
    required = false,
}: {
    message: string;
    onError?: Callback;
    defaultValue?: string;
    required?: boolean;
}) => {
    let res = undefined;

    if (required) {
        while (res === undefined || res === "") {
            res = await consola.prompt(message, { type: "text", initial: defaultValue });
        }
    } else {
        res = await consola.prompt(message, { type: "text", initial: defaultValue });
    }

    if (isSymbol(res)) {
        if (onError) onError();
        process.exit(1);
    }

    return res ?? "";
};

const select = async ({
    message,
    onError,
    options,
}: {
    message: string;
    onError?: () => Promise<void> | void;
    options: { value: string; label: string; hint?: string }[];
}): Promise<string> => {
    const res = await consola.prompt(message, { type: "select", options });

    if (isSymbol(res)) {
        if (onError) await onError();
        Logger.error(`Could not prompt input ${message}`);
        process.exit(1);
    }

    return res as unknown as string; // bug with consola types, it returns a string
};

const confirm = async ({ message, defaultValue }: { message: string; defaultValue: boolean }) => {
    const res = await consola.prompt(message, { type: "confirm", initial: defaultValue });

    if (isSymbol(res)) {
        Logger.error(`Could not prompt input`);
        process.exit(1);
    }

    return res;
};

export const CliService = {
    execute,
    input,
    select,
    confirm,
};
