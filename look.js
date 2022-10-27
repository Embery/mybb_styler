import puppeteer from "puppeteer";
import 'dotenv/config';
import { interceptor } from './src/utils.js';


const LOOK_RESOLUTION = process.env.LOOK_RESOLUTION;

(async () => {
    //TODO: доделать передачу браузера?
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [`--window-size=${LOOK_RESOLUTION}`],
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', interceptor({page, browser}));

    await page.goto(process.env.URL, {
        waitUntil: 'domcontentloaded',
    });
})();