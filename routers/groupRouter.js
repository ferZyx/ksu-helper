import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import GroupController from "../controllers/GroupController.js";
import {body} from "express-validator"
import roleMiddleware from "../middlewares/roleMiddleware.js";

// const customRegex = /^[a-zA-Z0-9_\-\.]+$/;

const groupRouter = new Router()


groupRouter.post("",
    authMiddleware,
    body("name", "Поле name не должно быть пустым").notEmpty(),
    GroupController.create)

groupRouter.get("",
    authMiddleware,
    roleMiddleware(['Admin']),
    GroupController.get_all)

groupRouter.get("/:group_id",
    authMiddleware,
    GroupController.get_one)




export default groupRouter