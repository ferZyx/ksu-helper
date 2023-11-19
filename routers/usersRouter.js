import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import UserController from "../controllers/UserController.js";

export const usersRouter = new Router()

// Никаких параметров
usersRouter.get("/me",
    authMiddleware,
    UserController.get_me)


