import puppeteer from "puppeteer";
import 'dotenv/config';
import { interceptor } from './src/utils';

const RESOLUTIONS = process.env.RESOLUTIONS.split(';');

const execute = async (resolution) => {
    //TODO: доделать передачу браузера?
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [`--window-size=${resolution}`],
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', interceptor({page, browser}));

    await page.goto(process.env.URL, {
        waitUntil: 'domcontentloaded',
    });

    //TODO: Я ДОПИШУ ТУТ СЦЕНАРИЙ "ПРОЙТИ ВЕЗДЕ И ПОСКРИНИТЬ"
}
(async () => {
    await Promise.all(RESOLUTIONS.map(el => execute(el)));
})();