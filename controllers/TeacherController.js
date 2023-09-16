import log from "../logging/logging.js";
import BrowserController from "./BrowserController.js";

class TeacherController{
    async get_all_teachers(req, res, next){
        let all_teachers = []
        try{
            const page = await BrowserController.browser.newPage();
            await page.goto('https://buketov.edu.kz/ru/page/faculty');

            const faculties = (await page.$$('h4 a')).slice(0, 12);

            for (const faculty of faculties) {
                const facultyHrefHandle = await faculty.getProperty('href');
                const facultyHref = await facultyHrefHandle.jsonValue();
                const facultyName = await faculty.evaluate(node => node.textContent);

                const facultyPage = await BrowserController.browser.newPage();
                await facultyPage.goto(facultyHref);
                await facultyPage.waitForSelector('div.dropdown a');

                const departments = await facultyPage.$$('div.dropdown a');

                for (const department of departments) {
                    const departmentHrefHandle = await department.getProperty('href');
                    const departmentHref = await departmentHrefHandle.jsonValue();
                    const departmentName = await department.evaluate(node => node.textContent);

                    const teachersPage = await BrowserController.browser.newPage();
                    await teachersPage.goto(departmentHref + '3');

                    const teachers = await teachersPage.$$(`div.col-md-7 a`);
                    for (const teacher of teachers) {
                        const teacherHrefHandle = await teacher.getProperty('href');
                        const teacherHref = await teacherHrefHandle.jsonValue();
                        const teacherName = await teacher.evaluate(node => node.textContent);

                        all_teachers.push({
                            name:teacherName, faculty:facultyName, department:departmentName, href:teacherHref
                        })
                    }
                    await teachersPage.close()
                }
                await facultyPage.close(); // Закрываем страницу кафедры
            }
            return res.json(all_teachers)
        }catch (e) {
            log.error("Ошибка при получении списка всех преподавателей")
            console.error(e)
            next(e)
        }
    }
}

export default new TeacherController()