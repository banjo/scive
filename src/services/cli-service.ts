import { Logger } from "@/logger";
import { Callback, isSymbol, tryOrDefaultAsync } from "@banjoanton/utils";
import consola from "consola";
import { Options, execa } from "execa";

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

const select = async <T extends string>({
    message,
    onError,
    options,
}: {
    message: string;
    onError?: () => Promise<void> | void;
    options: { value: string; label: string; hint?: string }[];
}): Promise<T> => {
    const res = await consola.prompt(message, { type: "select", options });

    if (isSymbol(res)) {
        if (onError) await onError();
        Logger.error(`Could not prompt input ${message}`);
        process.exit(1);
    }

    return res as unknown as T; // bug with consola types, it returns a string
};

const multiSelect = async <T extends string>({
    message,
    onError,
    options,
}: {
    message: string;
    onError?: () => Promise<void> | void;
    options: { value: string; label: string; hint?: string }[];
}): Promise<T[]> => {
    const res = await consola.prompt(message, { type: "multiselect", options });

    if (isSymbol(res)) {
        if (onError) await onError();
        Logger.error(`Could not prompt input ${message}`);
        process.exit(1);
    }

    return res as unknown as T[]; // bug with consola types, it returns a string
};

const confirm = async ({ message, defaultValue }: { message: string; defaultValue: boolean }) => {
    const res = await consola.prompt(message, { type: "confirm", initial: defaultValue });

    if (isSymbol(res)) {
        Logger.error(`Could not prompt input`);
        process.exit(1);
    }

    return res;
};

const openDirectory = async (path: string) => {
    await execute(`open ${path}`);
};

const isCodeInstalled = async () => {
    const isInstalled = await tryOrDefaultAsync(
        async () => {
            await execa("code", ["--version"], {
                stdio: "ignore",
            });
            return true;
        },
        { fallbackValue: false }
    );
    return isInstalled;
};

const openInEditor = async (
    path: string,
    config?: { waitForClose: boolean; newWindow: boolean }
) => {
    const { waitForClose = true, newWindow = false } = config ?? {};

    const isInstalled = await isCodeInstalled();

    if (!isInstalled) {
        Logger.warning("Must have VSCode installed to open in editor");
        return;
    }

    Logger.log(`Opening ${path} in editor${waitForClose ? ", waiting for close" : ""}`);
    await execute(`code ${waitForClose ? "--wait" : ""} ${newWindow ? "-n" : ""} ${path}`);
};

export const CliService = {
    execute,
    input,
    select,
    confirm,
    openDirectory,
    openInEditor,
    multiSelect,
};
