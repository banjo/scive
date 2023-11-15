import { FOLDER_DIRECTORY, SCAFKIT_JSON_DIRECTORY, TEMPLATES_DIRECTORY } from "@/constants";
import { Logger } from "@/logger";
import { FileService } from "@/services/file-service";
import { tryOrDefaultAsync } from "@banjoanton/utils";

export const init = async () => {
    const hasFolderDirectory = await FileService.checkIfExists(FOLDER_DIRECTORY);
    if (!hasFolderDirectory) {
        Logger.debug(`Creating: ${FOLDER_DIRECTORY}`);
        await FileService.createDirectory(FOLDER_DIRECTORY);
    }

    const fileExists = await tryOrDefaultAsync(async () => {
        return await FileService.readFile(SCAFKIT_JSON_DIRECTORY);
    });

    if (!fileExists) {
        Logger.debug(`Creating: ${SCAFKIT_JSON_DIRECTORY}`);
        await FileService.writeFile({
            path: SCAFKIT_JSON_DIRECTORY,
            content: JSON.stringify({
                templates: [],
            }),
        });
    }

    const hasTemplateDirectory = await FileService.checkIfExists(TEMPLATES_DIRECTORY);
    if (!hasTemplateDirectory) {
        Logger.debug(`Creating: ${TEMPLATES_DIRECTORY}`);
        await FileService.createDirectory(TEMPLATES_DIRECTORY);
    }
};

const hasInitiated = async () => {
    return await FileService.checkIfExists(SCAFKIT_JSON_DIRECTORY);
};

export const ScafkitService = {
    init,
    hasInitiated,
};
