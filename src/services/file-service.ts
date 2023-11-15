import { Logger } from "@/logger";
import { tryOrDefault } from "@banjoanton/utils";
import fs from "node:fs";

type TemplateFileProps = {
    path: string;
    content: string;
};

const writeFile = ({ content, path }: TemplateFileProps) => {
    try {
        fs.writeFileSync(path, content);
        return true;
    } catch (error) {
        Logger.error(`Could not write file ${path}`, error);
        return false;
    }
};

const readFile = (path: string) => {
    const content = fs.readFileSync(path, "utf8");

    if (!content) {
        Logger.debug(`Could not read file ${path}`);
        return undefined;
    }

    return content;
};

const createDirectory = (path: string) => {
    try {
        fs.mkdirSync(path);
        return true;
    } catch (error) {
        Logger.error(`Could not create directory ${path}`, error);
        return false;
    }
};

const checkIfExists = (path: string) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

const removeFile = (path: string) => {
    try {
        fs.unlinkSync(path);
        return true;
    } catch (error) {
        Logger.error(`Could not remove file ${path}`, error);
        return false;
    }
};

const removeDirectory = (path: string) => {
    try {
        fs.rmdirSync(path);
        return true;
    } catch (error) {
        Logger.error(`Could not remove directory ${path}`, error);
        return false;
    }
};

const readDirectory = (path: string, recursive = false) => {
    const files = tryOrDefault(() => fs.readdirSync(path, { recursive, encoding: "utf8" }));

    if (!files) {
        Logger.debug(`Could not read directory ${path}`);
        return [];
    }

    return files;
};

const moveDirectory = (oldPath: string, newPath: string) => {
    try {
        fs.renameSync(oldPath, newPath);
        return true;
    } catch (error) {
        Logger.error(`Could not move directory ${oldPath} to ${newPath}`, error);
        return false;
    }
};

export const FileService = {
    writeFile,
    readFile,
    createDirectory,
    checkIfExists,
    removeFile,
    readDirectory,
    removeDirectory,
    moveDirectory,
};
