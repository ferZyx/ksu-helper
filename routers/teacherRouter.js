import {Router} from "express";
import BrowserController from "../controllers/BrowserController.js";
import TeacherController from "../controllers/TeacherController.js";

const teacherRouter = new Router()

teacherRouter.get('/get_all_teachers', BrowserController.allChecksCall, TeacherController.get_all_teachers)
export default teacherRouter