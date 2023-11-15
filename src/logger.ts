import { isDebug } from "@/runtime";
import consola from "consola";
import pc from "picocolors";

const error = (message: string, ...optionalParams: unknown[]) =>
    consola.error(message, ...optionalParams);

const warning = (message: string, ...optionalParams: unknown[]) =>
    consola.warn(message, ...optionalParams);

const info = (message: string, ...optionalParams: unknown[]) =>
    consola.info(message, ...optionalParams);

const success = (message: string, ...optionalParams: unknown[]) =>
    consola.success(message, ...optionalParams);

const log = (message: string, ...optionalParams: unknown[]) =>
    consola.log(message, ...optionalParams);

const debug = (message: string | unknown) => {
    if (!isDebug()) return;

    if (typeof message === "string") {
        consola.log(`🔍 ${pc.dim(message)}`);
    } else {
        consola.log(message);
    }
};

export const Logger = {
    error,
    warning,
    info,
    success,
    debug,
    log,
};
