import BrowserController from "../controllers/BrowserController.js";
import ApiError from "../exceptions/apiError.js";
import HtmlService from "./HtmlService.js";

function getQueryParam(url, paramName) {
    const urlParts = url.split('?');
    const queryString = urlParts[1] || '';
    const queryParams = {};

    queryString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        queryParams[key] = decodeURIComponent(value);
    });

    return queryParams[paramName] || null;
}

class TeacherScheduleService {
    async get_departments_list() {
        try {
            const page = await BrowserController.browser.newPage()
            await page.goto("https://schedule.ksu.kz/kafedra.php")

            const linksSelector = 'table a';

            await page.waitForSelector(linksSelector)

            const links = await page.$$(linksSelector)
            const linkObjects = [];

            for (const link of links) {
                const name = await (await link.getProperty('textContent')).jsonValue();
                const href = await (await link.getProperty('href')).jsonValue();
                const id = await getQueryParam(href, "IdKaf")

                linkObjects.push({name, href, id})
            }


            await page.close()

            return linkObjects
        } catch (e) {
            throw e
        }
    }

    async get_teachers_list(departmentId) {
        const page = await BrowserController.browser.newPage()
        await page.goto(`https://schedule.ksu.kz/report_prep.php?d=1&IdKaf=${departmentId}`)

        const tableSelector = 'table'

        await page.waitForSelector(tableSelector)
        const tables = await page.$$(tableSelector);

        const secondTable = tables[1];

        if (!secondTable) {
            throw ApiError.ServiceUnavailable("Не получилось получить вторую табличку на странице кафдеры. в ней хранится список преподов")
        }

        const links = await secondTable.$$('a');

        const linkObjects = [];

        for (const link of links) {
            const name = await (await link.getProperty('textContent')).jsonValue();
            const href = await (await link.getProperty('href')).jsonValue();
            const id = await getQueryParam(href, 'IdPrep')
            if (name === '- '){
                continue
            }
            linkObjects.push({name, href, id, departmentId})
        }

        await page.close()

        return linkObjects
    }

    async get_teacher_schedule(id) {
        const page = await BrowserController.browser.newPage()
        await page.goto(`https://schedule.ksu.kz/report_prep1.php?IdPrep=${id}`)

        const tr_list_selector = 'table tr'

        await page.waitForSelector(tr_list_selector)

        const tableHTML = await page.evaluate((selector) => {
            const table = document.querySelector(selector);
            return table ? table.outerHTML : null;
        }, "table");

        await page.close()

        const tableData = HtmlService.htmlTableToJson(tableHTML)

        const schedule = []
        for (let i = 1; i< tableData.length;i++){
            const dailySchedule = {}
            dailySchedule['day'] = tableData[i][0]
            const groups = []
            for (let j = 1; j< tableData[i].length;j++){
                const time = tableData[0][j]
                let group =  tableData[i][j]
                if (group === '-'){
                    group = ""
                }
                groups.push({
                    time, group
                })
            }
            dailySchedule['groups'] = groups
            schedule.push(dailySchedule)
        }

        return schedule
    }
}

export default new TeacherScheduleService()