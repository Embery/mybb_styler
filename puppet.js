import puppeteer from "puppeteer";
import 'dotenv/config';

import footerContent from './src/footer.js';
import headerContent from './src/header.js';
import announcementContent from './src/announcement.js';
import replyContent from './src/reply.js';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1920,1080'],
    });
    const page = await browser.newPage();

    const replacer = async (page) => {
        await page.evaluate(async (content) => {
            const {headerContent, footerContent, announcementContent} = content;

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
            
            // const reply = document.querySelector('.fs-box.hashelp');
            // if (reply) {
            //     reply.innerHTML = '';
            // }
        }, {
            footerContent,
            headerContent,
            announcementContent,
            replyContent,
        })
    };

    await page.setRequestInterception(true);

    page.on('request', async (interceptedRequest) => {
        const isRequestingHTML = interceptedRequest.headers().accept?.includes('text/html');
        const isForumUrl = interceptedRequest.url().startsWith(process.env.URL);
        if(isRequestingHTML && isForumUrl){
            const tmpPage = await browser.newPage();
            await tmpPage.goto(interceptedRequest.url(), {
                waitUntil: 'domcontentloaded'
            });
            await page.bringToFront();

            await replacer(tmpPage);

            const html = await tmpPage.evaluate(() => document.documentElement.outerHTML);
            await tmpPage.close();
            
            interceptedRequest.respond({body: html, contentType: 'text/html; charset=utf-8'});
        } else interceptedRequest.continue();;
    });

    await page.goto(process.env.URL + 'viewtopic.php?id=1', {
        waitUntil: 'domcontentloaded',
    });
})();