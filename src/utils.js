import { access, readFile } from 'fs/promises';
import { constants } from "fs";
import path from 'path';

export const RESOURCES_FOLDER = 'resources';

export const getTextFromFile = async (pathToFile) => {
    try {
        await access(pathToFile, constants.R_OK);
        const buffer = await readFile(pathToFile);
        return buffer.toString();
    } catch (e) {
        return '';
    }
};

export const getFiles = async () => {
    const dir =  path.dirname('.');
    const footerContent = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/footer.html`));
    const headerContent = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/header.html`));
    const announcementContent = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/announcement.html`));
    const replyContent = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/reply.html`));
    return {footerContent, headerContent, announcementContent, replyContent};
};

export { replacer } from './fileReplacer.js';
export { interceptor } from './interceptor.js';