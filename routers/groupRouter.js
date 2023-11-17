import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import GroupController from "../controllers/GroupController.js";
import {body} from "express-validator"

// const customRegex = /^[a-zA-Z0-9_\-\.]+$/;

const groupRouter = new Router()


// Кушает в бади пока что только поле name(Любое не пустое)
groupRouter.put("/create",
    authMiddleware,
    body("name", "Поле name не должно быть пустым").notEmpty(),
    GroupController.create)

// Кушает в бади поле groupId,
groupRouter.delete("/delete",
    authMiddleware,
    body("groupId", "Поле groupId не должно быть пустым").notEmpty(),
    GroupController.delete)

// Никаких параметров
groupRouter.get("/my_group_list",
    authMiddleware,
    GroupController.my_group_list)

//
groupRouter.get("/info",
    authMiddleware,
    GroupController.info)


// groupRouter.post("/access_join_request")
// groupRouter.post("/deny_join_request")
// groupRouter.post("/give_group_admin_rights")
// groupRouter.post("/delete_group_admin_rights")
// groupRouter.post("/send_join_request")
// groupRouter.post("/leave_group")
//
// groupRouter.get("/search")
// groupRouter.get("/get_group_info_by_userId")


export default groupRouter