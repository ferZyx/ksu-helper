import {Router} from "express";
import UserController from "../controllers/UserController.js"
import {body} from "express-validator"
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

// Регулярное выражение для проверки английских букв
const englishLettersRegex = /^[a-zA-Z]+$/;

// const roleMiddleware = require('./middlewares/roleMiddleware')
const authRouter = new Router()

authRouter.post('/registration', [
    body('username', "Имя пользователя не может быть пустым").notEmpty(),
    body('username', "Имя пользователя должно содержать только английские буквы без спец. символов").matches(englishLettersRegex),
    body('password', "Пароль должен быть больше 4 и меньше 10 символов").isLength({min: 4, max: 10})
],
    UserController.registration)
authRouter.post('/login', UserController.login)
authRouter.post('/logout', authMiddleware, UserController.logout)
authRouter.post('/refresh', UserController.refresh)

authRouter.get('/isAdmin', authMiddleware, roleMiddleware(['Admin']), UserController.isAdmin)

export default authRouter