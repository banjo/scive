import { Logger } from "@/logger";
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

export const FileService = {
    writeFile,
    readFile,
    createDirectory,
    checkIfExists,
};
