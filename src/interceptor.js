import path from 'path';
import { getFiles, replacer, getTextFromFile, RESOURCES_FOLDER } from './utils.js';

const createScriptsMap = async () => {
    const mapingText = await getTextFromFile(`./${RESOURCES_FOLDER}/scriptsMap.json`);
    const scriptsMapping = JSON.parse(mapingText);

    const map = new Map();
    scriptsMapping.forEach(({from, to}) => map.set(from, to));
    return map;
};

export const interceptor = ({browser, page}) => async (interceptedRequest) => {
    const isRequestingHTML = interceptedRequest.headers().accept?.includes('text/html');
    const isForumUrl = interceptedRequest.url().startsWith(process.env.URL);
    const isGet = interceptedRequest.method() === 'GET';
    const isStyle = interceptedRequest.headers().accept?.includes('text/css');
    const isForumCss = interceptedRequest.url().startsWith('https://forumstatic.ru');

    const scriptsMap = await createScriptsMap();
    const isRequestingScripts = interceptedRequest.url().split('/').at(-1).split('?')[0].split('.').at(-1) === 'js';

    if(isRequestingHTML && isForumUrl && isGet){
        const tmpPage = await browser.newPage();
        await tmpPage.goto(interceptedRequest.url(), {
            waitUntil: 'domcontentloaded'
        });
        await page.bringToFront();

        const files = await getFiles();
        await replacer(files)(tmpPage, files);

        const html = await tmpPage.evaluate(() => document.documentElement.outerHTML);
        await tmpPage.close();

        interceptedRequest.respond({body: html, contentType: 'text/html; charset=utf-8'});
    } else if(isStyle && !isForumUrl && isGet && isForumCss) {
        const urlParts = interceptedRequest.url().split('/');
        const fileName = urlParts?.[urlParts.length - 1]?.replace(/\.[1-9]+\./, '.').split('.')[0];

        const dir =  path.dirname('.');
        const style = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/${fileName}.css`));
        if (style.length ) {
            interceptedRequest.respond({body: style, contentType: 'text/css; charset=utf-8'});
        } else {
            interceptedRequest.continue();
        }
    } else if(isRequestingScripts) {
        const url = interceptedRequest.url();
        if(scriptsMap.has(url)) {
            const fileName = scriptsMap.get(url);
            const dir =  path.dirname('.');
            const script = await getTextFromFile(path.resolve(dir, `${RESOURCES_FOLDER}/${fileName}`));
            interceptedRequest.respond({body: script, contentType: 'text/javascript; charset=utf-8'});
        } else {
            interceptedRequest.continue();
        }
    }
    else interceptedRequest.continue();
};