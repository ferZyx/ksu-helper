import config from "../config.js";
import puppeteer from "puppeteer";
import ScheduleService from "../services/ScheduleService.js";
import log from "../logging/logging.js";
import ping from "ping";
import ApiError from "../exceptions/apiError.js";
import axios from "axios";


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
            if (!await this.isKsuAlive()) {
                return next(ApiError.ServiceUnavailable("ksu.kz наелся и спит о_О"));
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
                this.browser = await puppeteer.launch({headless: false, args: ['--window-size=900,800','--window-position=-10,0']})
            } else {
                this.browser = await puppeteer.launch({
                    headless: "new",
                    args: ["--no-sandbox"],
                    executablePath: '/usr/bin/google-chrome-stable'
                })
            }
            await this.auth()
        } catch (e) {
            throw new Error(e)
        }
    }

    async restartBrowser(){
        try{
            await this.browser.close()
            await this.launchBrowser()
        }catch (e) {
            throw e
        }
    }

    async auth() {
        try {
            const {faculties_data, auth_cookie} = await ScheduleService.get_faculty_list(this.browser)
            this.faculties_data = faculties_data
            this.auth_cookie = {cookie: auth_cookie, time:Date.now()}
            log.info("Произведена авторизация/получен список факультетов на schedule.ksu.kz")
        } catch (e) {
            log.error("Не получилось авторизоваться на schedule.ksu.kz | " + e.message)
        }
    }

    async authIfNot() {
        const page = await this.browser.newPage();
        try {
            await page.goto("https://schedule.ksu.kz/view1.php?id=5044&Kurs=3&Otdel=рус&Stud=10&d=1&m=Read")
            await page.waitForSelector("header", {timeout: 2000})

            const elementExists = await page.evaluate(() => {
                return !!document.querySelector('table');
            });
            await page.close()

            if (!elementExists){
                await this.auth()
            }
        } catch (e) {
            await page.close()
            log.error("Ошибка при попытке проверить авторизован или нет. " + e.message, {stack:e.stack})
        }

    }

    async isKsuAlive() {
        try {
            await axios.get("https://schedule.ksu.kz/view1.php?id=5044&Kurs=3&Otdel=рус&Stud=10&d=1&m=Read", {timeout:3000})
            return true; // Возвращает true, если сайт доступен, иначе false
        } catch (e) {
            log.error("Ошибка при попытке пингануть ксу: " + e.message, e)
            return false;
        }
    }

}

export default new BrowserController()