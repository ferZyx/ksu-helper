import ApiError from "../exceptions/apiError.js";
import {validationResult} from "express-validator";
import GroupService from "../services/GroupService.js";
import log from "../logging/logging.js";


class GroupController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации данных.", errors.array()))
            }

            const owner = req.user.userId
            const group_name = req.body.name

            const group = await GroupService.create(owner, group_name)
            return res.json(group)
        } catch (e) {
            console.log(e)
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации данных.", errors.array()))
            }

            const groupId = req.body.groupId
            const userId = req.user.userId

            const group = await GroupService.get(groupId)
            if (!group) {
                log.warn("Втф, тут чел хочет удалить группу которой нет. эаэаээаэа треш. вызываю подмогу.\n"
                    + userId + "\ngroup:" + groupId)
                return next(ApiError.BadRequest("Такой группы нет, брат."))
            }
            if (group.owner !== userId) {
                return next(ApiError.BadRequest("Удалить группу может только владелец группы."))
            }
            const deletedGroup = await GroupService.delete(groupId)
            return res.json(deletedGroup)
        } catch (e) {
            next(e)
        }
    }

    async my_group_list(req, res, next) {
        try {
            const userId = req.user.userId

            const groups = await GroupService.get_all_by_userId(userId)
            return res.json(groups)
        } catch (e) {
            console.log(e)
            next(e)
        }
    }

    async info(req, res, next) {
        try {
            const groupId = req.query.groupId

            const group = await GroupService.get(groupId)
            return res.json({
                group,
                hi: "Могу каждого юзера вытащить еще сюда если надо, не думаю что это займет сильно много времени."
            })
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}

export default new GroupController()