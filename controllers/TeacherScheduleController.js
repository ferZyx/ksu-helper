import TeacherScheduleService from "../services/TeacherScheduleService.js";
import log from "../logging/logging.js";
import ApiError from "../exceptions/apiError.js";

class TeacherScheduleController {
    async get_departments_list(req, res, next) {
        try {
            const departments = await TeacherScheduleService.get_departments_list()
            return res.json(departments)
        } catch (e) {
            log.error("Ошибка при попытке получить список кафедр" + e.message, {stack: e.stack})
            next(e)
        }
    }

    async get_teachers_list(req, res, next) {
        try {
            const id = req.params.id
            if (isNaN(id)) {
                return next(ApiError.BadRequest("Указан некорректный параметр id кафедры"))
            }

            const teachers = await TeacherScheduleService.get_teachers_list(id)
            return res.json(teachers)
        } catch (e) {
            log.error("Ошибка при попытке получить список преподавателей кафедры" + e.message, {stack: e.stack})
            next(e)
        }
    }

    async get_teacher_schedule(req, res, next) {
        try {
            const id = req.params.id
            if (isNaN(id)) {
                return next(ApiError.BadRequest("Указан некорректный параметр id преподавателя"))
            }

            const schedule = await TeacherScheduleService.get_teacher_schedule(id)
            return res.json(schedule)
        } catch (e) {
            log.error("Ошибка при попытке получить расписание препода" + e.message, {stack: e.stack})
            next(e)
        }
    }

}

export default new TeacherScheduleController()