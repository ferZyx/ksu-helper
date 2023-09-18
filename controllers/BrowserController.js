import config from "../config.js";
import puppeteer from "puppeteer";
import ScheduleService from "../services/ScheduleService.js";
import log from "../logging/logging.js";
import ping from "ping";
import ApiError from "../exceptions/apiError.js";


class BrowserController{
    browser;
    auth_cookie;
    faculties_data;

    constructor() {
        this.launchBrowser().then(() => log.info("Браузер запущен"))
    }

    allChecksCall = async (req, res, next) => {
        try {
            if (!this.browser.isConnected()) {
                await this.launchBrowser();
            }
            // if (!await this.isKsuAlive()) {
            //     return next(ApiError.ServiceUnavailable("ksu.kz наелся и спит о_О"));
            // }
            if (!await this.isAuthed()) {
                await this.auth();
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
                this.browser = await puppeteer.launch({headless: false})
            } else {
                this.browser = await puppeteer.launch({
                    headless: "new",
                    args: ["--no-sandbox"],
                    executablePath: '/usr/bin/google-chrome-stable'
                })
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    async auth() {
        try {
            const {faculties_data, auth_cookie} = await ScheduleService.get_faculty_list(this.browser)
            this.faculties_data = faculties_data
            this.auth_cookie = {cookie: auth_cookie, time:Date.now()}
            log.info("Произведена авторизация/получен список факультетов на schedule.ksu.kz")
        } catch (e) {
            throw new Error(e)
        }

    }

    async isAuthed() {
        const page = await this.browser.newPage();
        try {
            await page.goto("https://schedule.ksu.kz/view1.php?id=5044&Kurs=3&Otdel=рус&Stud=10&d=1&m=Read")
            await page.waitForSelector("header", {timeout: 7000})

            const elementExists = await page.evaluate(() => {
                return !!document.querySelector('table');
            });
            await page.close()

            return elementExists
        } catch (e) {
            await page.close()
            throw new Error(e)
        }

    }

    async isKsuAlive() {
        try {
            const result = await ping.promise.probe('schedule.ksu.kz', {timeout: 10});
            return result.alive; // Возвращает true, если сайт доступен, иначе false
        } catch (e) {
            log.error("Ошибка при попытке пингануть ксу: " + e.message, e)
            return false;
        }
    }

}

export default new BrowserController()