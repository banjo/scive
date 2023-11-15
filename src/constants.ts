import { homedir } from "node:os";

export const FOLDER_NAME = ".scafkit";
export const FOLDER_DIRECTORY = `${homedir()}/${FOLDER_NAME}`;

export const SCAFKIT_JSON_FILE_NAME = "scafkit.json";
export const SCAFKIT_JSON_DIRECTORY = `${FOLDER_DIRECTORY}/${SCAFKIT_JSON_FILE_NAME}`;

export const TEMPLATES_DIRECTORY_NAME = "templates";
export const TEMPLATES_DIRECTORY = `${FOLDER_DIRECTORY}/${TEMPLATES_DIRECTORY_NAME}`;
