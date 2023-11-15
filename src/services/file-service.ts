import { Logger } from "@/logger";
import fsSync from "node:fs";
import fs from "node:fs/promises";

type TemplateFileProps = {
    path: string;
    content: string;
};

const writeFile = async ({ content, path }: TemplateFileProps) => {
    try {
        await fs.writeFile(path, content);
        return true;
    } catch (error) {
        Logger.error(`Could not write file ${path}`, error);
        return false;
    }
};

const readFile = async (path: string) => {
    const content = await fs.readFile(path, "utf8");

    if (!content) {
        Logger.debug(`Could not read file ${path}`);
        return undefined;
    }

    return content;
};

const readFileSync = (path: string) => {
    const content = fsSync.readFileSync(path, "utf8");

    if (!content) {
        Logger.error(`Could not read file ${path}`);
        return undefined;
    }

    return content;
};

const createDirectory = async (path: string) => {
    try {
        await fs.mkdir(path);
        return true;
    } catch (error) {
        Logger.error(`Could not create directory ${path}`, error);
        return false;
    }
};

const checkIfExists = async (path: string) => {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

const removeFile = async (path: string) => {
    try {
        await fs.unlink(path);
        return true;
    } catch (error) {
        Logger.error(`Could not remove file ${path}`, error);
        return false;
    }
};

export const FileService = {
    writeFile,
    readFile,
    readFileSync,
    createDirectory,
    checkIfExists,
    removeFile,
};
