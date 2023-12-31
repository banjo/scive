import { isDev } from "@/runtime";
import { homedir } from "node:os";

export const FOLDER_NAME = isDev() ? ".scive-dev" : ".scive";
export const FOLDER_DIRECTORY = `${homedir()}/${FOLDER_NAME}`;

export const SCIVE_JSON_FILE_NAME = "scive.json";
export const SCIVE_JSON_DIRECTORY = `${FOLDER_DIRECTORY}/${SCIVE_JSON_FILE_NAME}`;

export const TEMPLATES_DIRECTORY_NAME = "templates";
export const TEMPLATES_DIRECTORY = `${FOLDER_DIRECTORY}/${TEMPLATES_DIRECTORY_NAME}`;

export const LOG_FILE_NAME = "scive-debug.log";
export const LOG_FILE_DIRECTORY = `${FOLDER_DIRECTORY}/${LOG_FILE_NAME}`;
