import User from "../models/User.js"
import Role from "../models/Role.js"
import bcrypt from "bcryptjs";
import TokenService from "../services/TokenService.js"
import {validationResult} from "express-validator";
import token from "../models/Token.js";
import ApiError from "../exceptions/apiError.js";
import Token from "../models/Token.js";
import tokenService from "../services/TokenService.js";

class UserService {
    async registration(username, password) {
        const candidate = await User.findOne({username})
        if (candidate) {
            throw ApiError.BadRequest("Пользователь с таким именем уже существует", )
        }
        const salt = await bcrypt.genSalt(8);
        const hashPassword = await bcrypt.hash(password, salt);

        const userRole = await Role.findOne({value: "User"})

        const user = await User.create({username, password: hashPassword, roles: [userRole.value]})
        const { password:psw, ...userData } = user.toObject();
        const tokens = TokenService.generateTokens({userId: user._id, username, roles: [userRole.value]})
        await TokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            userData
        }
    }

    async login(username, password) {
        const user = await User.findOne({username})
        if (!user) {
            throw ApiError.BadRequest("Пользователя с таким именем не найдено.", )
        }

        const correctPassword = await bcrypt.compareSync(password, user.password)
        if (!correctPassword){
            throw ApiError.BadRequest("Вы ввели неверный пароль.", )
        }

        const { password:psw, ...userData } = user.toObject();
        const tokens = TokenService.generateTokens({userId: user._id, username:user.username, roles: user.roles})
        await TokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            userData
        }
    }

    async logout(refreshToken) {
        return await TokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if (!refreshToken){
            throw ApiError.UnauthorizedError()
        }

        const tokenData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = tokenService.findToken(refreshToken)

        if (!tokenData || !tokenFromDb){
            throw ApiError.UnauthorizedError()
        }

        const user = await User.findById(tokenData.userId)

        const { password:psw, ...userData } = user.toObject();
        const tokens = TokenService.generateTokens({userId: user._id, username:user.username, roles: user.roles})
        await TokenService.saveToken(user._id, tokens.refreshToken)

        return {
            ...tokens,
            userData
        }
    }
}

export default new UserService()