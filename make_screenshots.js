import puppeteer from "puppeteer";
import 'dotenv/config';
import slugify from "slugify";
import { mkdir, rm } from 'fs/promises';
import { interceptor, RESOURCES_FOLDER, getTextFromFile } from './src/utils.js';

const RESOLUTIONS = process.env.RESOLUTIONS.split(';');

slugify.extend({'?': ' params '});

const login = async ({mode, page}) => {
    const login = process.env[`USERNAME_${mode.toUpperCase()}`];
    const password = process.env[`PASSWORD_${mode.toUpperCase()}`];

    if (!login || !password) {
        throw new Error(`Логин и/или пароль для режима ${mode} не найден/ы. Проверьте файл .env`)
    }

    await page.goto(`${process.env.URL}login.php`, {
        waitUntil: 'domcontentloaded',
    });

    await page.type('#fld1', login);
    await page.type('#fld2', password);
    await page.click('.formsubmit input');
    await page.waitForSelector('.gid3', {hidden: true});
};

const logout = async ({page}) => {
    await page.goto(`${process.env.URL}login.php`, {
        waitUntil: 'domcontentloaded',
    });

    await page.evaluate(async () => {
        const logoutUrl = `${location.origin}/login.php?action=out&id=${window.UserID}`
        fetch(logoutUrl);
    });

    await page.reload();
    await page.waitForSelector('.gid3');
};

const makeScreenshots = async ({page, links, resolution, authMode}) => {
    try {
        await mkdir(`./screenshots/${resolution}/${authMode}`, { recursive: true }, (err) => {
            if (err) console.log(err);
        });
    } catch (e) {
        console.log(e);
    }
    for(let i = 0; i < links.length; ++i){
        await page.goto(`${process.env.URL}${links[i]}`, {
            waitUntil: 'domcontentloaded',
        });
        const screenName = slugify(links[i]);
        await page.screenshot({ path: `./screenshots/${resolution}/${authMode}/${screenName||'home'}.png`, fullPage: true });
    }
};

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

    const linksText = await getTextFromFile(`./${RESOURCES_FOLDER}/linksToScreen.json`);
    const links = JSON.parse(linksText);

    const modeToLinks = Object.entries(links);

    for(let i = 0; i < modeToLinks.length; ++i){
        const [mode, links] = modeToLinks[i];
        switch (mode){
            case 'unauthorised':
                await makeScreenshots({page, links, resolution, authMode: mode});
                break;
            default:
                try {
                    await login({mode, page});
                    await makeScreenshots({page, links, resolution, authMode: mode});
                    await logout({page});
                }
                catch (e) {
                    console.log(e);
                }
        }
    }
    await browser.close();
}
(async () => {
    try{
        await rm('./screenshots', {recursive: true});
    } catch (e) {}
    await Promise.all(RESOLUTIONS.map(el => execute(el)));
})();