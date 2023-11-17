import { LOG_FILE_DIRECTORY } from "@/constants";
import { FileService } from "@/services/file-service";

let DEBUG = false;

export const setDebug = (value: boolean) => {
    DEBUG = value;
    FileService.removeFile(LOG_FILE_DIRECTORY);
    FileService.assureFile(LOG_FILE_DIRECTORY);
};
export const isDebug = () => DEBUG;
export const isDev = () => process.env.NODE_ENV === "development";
