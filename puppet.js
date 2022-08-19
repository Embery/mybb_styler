import puppeteer from "puppeteer";
import 'dotenv/config';
import { access, readFile } from 'fs/promises';
import { constants } from "fs";
import path from 'path';

(async () => {
    //TODO: доделать передачу браузера и разрешения/вьюпорта
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1920,1080'],
    });
    const page = await browser.newPage();

    const getTextFromFile = async (pathToFile) => {
        try {
            await access(pathToFile, constants.R_OK);
        } catch (e) {
            return '';
        }
        const buffer = await readFile(pathToFile);
        return buffer.toString();
    };

    const getFiles = async () => {
        const dir =  path.dirname('src');
        const footerContent = await getTextFromFile(path.resolve(dir, `src/footer.html`));
        const headerContent = await getTextFromFile(path.resolve(dir, `src/header.html`));
        const announcementContent = await getTextFromFile(path.resolve(dir, `src/announcement.html`));
        const replyContent = await getTextFromFile(path.resolve(dir, `src/reply.html`));
        return {footerContent, headerContent, announcementContent, replyContent};
    };

    const replacer = (files) => async (page, files = {}) => {
        await page.evaluate(async (content) => {
            const {headerContent, footerContent, announcementContent, replyContent} = content;

            const header = document.querySelector('#html-header');
            if (header) {
                header.innerHTML = headerContent;
            } else {
                document.querySelector('#mybb-counter').insertAdjacentHTML('afterend', `<div id="html-header">${headerContent}</div>`);
            }

            const footer = document.querySelector('#html-footer');
            if (footer) {
                footer.innerHTML = footerContent;
            } else {
                document.querySelector('.punbb').insertAdjacentHTML('beforeend', `<div id="html-footer">${footerContent}</div>`);
            }

            //TODO - будет рисоваться на всех страницах, подумать, как сделать только на главной
            const announcement = document.querySelector('#pun-announcement');
            const announcementDefault = 
            `<div id="pun-announcement" class="section">
                <h2><span>Объявление</span></h2>
                <div class="container">
                    <div class="html-box">
                        ${announcementContent}
                    </div>
                </div>
            </div>`;
            if (announcement) {
                announcement.innerHTML = announcementDefault
            } else {
                document.querySelector('#pun-ulinks').insertAdjacentHTML('afterend', announcementDefault);
            }
            
            const reply = document.querySelector('.fs-box.hashelp');
            if (reply) {
                reply.insertAdjacentHTML('beforeend', replyContent);
            }
        }, files)
    };

    await page.setRequestInterception(true);

    page.on('request', async (interceptedRequest) => {
        const isRequestingHTML = interceptedRequest.headers().accept?.includes('text/html');
        const isForumUrl = interceptedRequest.url().startsWith(process.env.URL);
        const isGet = interceptedRequest.method() === 'GET';
        const isStyle = interceptedRequest.headers().accept?.includes('text/css');
        const isForumCss = interceptedRequest.url().startsWith('https://forumstatic.ru');

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

            const dir =  path.dirname('src');
            const style = await getTextFromFile(path.resolve(dir, `src/${fileName}.css`));
            interceptedRequest.respond({body: style, contentType: 'text/css; charset=utf-8'});
        } 
        else interceptedRequest.continue();;
    });

    await page.goto(process.env.URL, {
        waitUntil: 'domcontentloaded',
    });
})();