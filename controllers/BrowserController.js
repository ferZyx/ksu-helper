import config from "../config.js";
import puppeteer from "puppeteer";
import ScheduleService from "../services/ScheduleService.js";
import log from "../logging/logging.js";
import BrowserService from "../services/BrowserService.js";
// import ping from "ping";
// import ApiError from "../exceptions/apiError.js";
// import axios from "axios";


class BrowserController {
    browser;
    auth_cookie;
    faculties_data;
    isAuthing;

    constructor() {
        if (config.START_BROWSER) {
            this.isAuthing = true;
            this.launchBrowser().then(() => log.info("Браузер запущен"))
        }
    }

    allChecksCall = async (req, res, next) => {
        try {
            if (!this.browser?.isConnected()) {
                await this.launchBrowser();
            }
            if (await this.isAuthing) {
                throw new Error("Не произведена авторизация")
            }
            next();
        } catch (e) {
            log.error("Ошибка в allChecksCall мидлваре(" + e.message, e)
            next(e)
        }
    }

    async launchBrowser() {
        try {
            if (config.DEBUG) {
                this.browser = await puppeteer.launch({
                    headless: false,
                    args: ['--window-size=900,800', '--window-position=-10,0',],
                    ignoreHTTPSErrors: true,
                })
            } else {
                if (config.PROXY_LOGIN && config.USE_PROXY) {
                    this.browser = await puppeteer.launch({
                        headless: "new",
                        args: ["--no-sandbox", `--proxy-server=${config.HTTP_PROXY}`],
                        executablePath: '/usr/bin/google-chrome-stable',
                        ignoreHTTPSErrors: true,
                    })
                } else {
                    this.browser = await puppeteer.launch({
                        headless: "new",
                        args: ["--no-sandbox"],
                        executablePath: '/usr/bin/google-chrome-stable',
                        ignoreHTTPSErrors: true,
                    })
                }
            }
            if (config.PROXY_LOGIN && config.USE_PROXY) {
                const page = await this.browser.newPage()
                await page.authenticate({username: config.PROXY_LOGIN, password: config.PROXY_PASSWORD});
                await page.goto('https://2ip.ru');
                await page.close()
                console.log("Прокси авторизован")
            }
            if (config.AUTO_KSU_AUTH) {
                await this.auth()
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    // need to fix this shit.
    async restartBrowser(req, res, next) {
        try {
            await BrowserService.restartBrowser()
            return res.json("Restarted")
        } catch (e) {
            next(e)
        }
    }

    async makeHtmlScreenShot(req, res, next) {
        const htmlCode = req.body
        console.log(htmlCode)
        try {
            const screenshotBuffer = await BrowserService.getScreenshotBufferByHtml(htmlCode)
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Length', screenshotBuffer.length);

            res.send(screenshotBuffer);
        } catch (e) {
            next(e)
        }
    }

    async auth() {
        try {
            console.log("Начинаю авторизацию")
            this.isAuthing = true;
            const {faculties_data, auth_cookie} = await ScheduleService.get_faculty_list(this.browser)
            console.log("Мы авторизованы")
            this.faculties_data = faculties_data
            this.auth_cookie = {cookie: auth_cookie, time: Date.now()}
            log.info("Произведена авторизация/получен список факультетов на schedule.buketov.edu.kz")
        } catch (e) {
            log.error("Не получилось авторизоваться на schedule.buketov.edu.kz | " + e.message)
        }finally {
            this.isAuthing = false;
        }
    }

    async authIfNot() {
        const page = await this.browser.newPage();
        try {
            await page.goto(`${config.KSU_DOMAIN}/view1.php?id=5044&Kurs=3&Otdel=рус&Stud=10&d=1&m=Read`)
            await page.waitForSelector("header", {timeout: 2000})

            const elementExists = await page.evaluate(() => {
                return !!document.querySelector('table');
            });
            await page.close()

            if (!elementExists) {
                await this.auth()
            }
        } catch (e) {
            await page.close()
            log.error("Ошибка при попытке проверить авторизован или нет. " + e.message, {stack: e.stack})
        }

    }

    // async isKsuAlive() {
    //     const page = await this.browser.newPage();
    //     try {
    //         await page.goto("https://schedule.buketov.edu.kz/view1.php?id=5044&Kurs=3&Otdel=рус&Stud=10&d=1&m=Read", {timeout:3000})
    //         return true; // Возвращает true, если сайт доступен, иначе false
    //     } catch (e) {
    //         log.error("Ошибка при попытке пингануть ксу: " + e.message, e)
    //         return false;
    //     }finally {
    //         await page.close()
    //     }
    // }

}

export default new BrowserController()