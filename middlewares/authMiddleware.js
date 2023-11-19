import jwt from "jsonwebtoken";
import config from "../config.js";
import ApiError from "../exceptions/apiError.js";

const authMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return next(ApiError.UnauthorizedError())
            }
            req.user = jwt.verify(token, config.JWT_ACCESS_SECRET)
            next()
        } else{
            return next(ApiError.UnauthorizedError())
        }
    } catch (e) {
        next(ApiError.UnauthorizedError())
    }
};

export default authMiddleware