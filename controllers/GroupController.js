import ApiError from "../exceptions/apiError.js";
import {validationResult} from "express-validator";
import GroupService from "../services/GroupService.js";
import mongoose from "mongoose";
import {GroupDTO} from "../dtos/GroupDTO.js";


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

    async get_all(req, res, next) {
        try {
            // Есть смысл пагинацию сделать. Фильтры, Ордеринг
            const groups = await GroupService.get_all()
            return res.json(groups)
        } catch (e) {
            console.log(e)
            next(e)
        }
    }

    async get_one(req, res, next) {
        try {
            const groupId = req.params.group_id
            if (!mongoose.Types.ObjectId.isValid(groupId)){
                return next(ApiError.BadRequest("Указан невалидный group_id"))
            }
            const group = await GroupService.get_one(groupId)
            if (!group){
                return next(ApiError.Not_Found("Группа не найдена."))
            }
            const groupDTO = new GroupDTO(group)

            const isAdmin = req.user.roles.includes("Admin")
            const isGroupAdmin = group.admins.some(admin => admin._id.toString() === req.user.userId)
            const isGroupMember = group.members.some(member => member._id.toString() === req.user.userId)

            if (isAdmin ){
                return res.json(groupDTO)
            }
            if (isGroupAdmin){
                return res.json(groupDTO.forGroupAdmin())
            }
            if (isGroupMember){
                return res.json(groupDTO.forMembers())
            }
            return res.json(groupDTO.forRandom())

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
            const deletedGroup = await GroupService.delete(groupId)
            return res.json(deletedGroup)
        } catch (e) {
            next(e)
        }
    }

    // async my_group_list(req, res, next) {
    //     try {
    //         const userId = req.user.userId
    //
    //         const groups = await GroupService.get_all_by_userId(userId)
    //         return res.json(groups)
    //     } catch (e) {
    //         console.log(e)
    //         next(e)
    //     }
    // }

    // async info(req, res, next) {
    //     try {
    //         const groupId = req.query.groupId
    //
    //         const group = await GroupService.get_one(groupId)
    //         return res.json({
    //             group,
    //             hi: "Могу каждого юзера вытащить еще сюда если надо, не думаю что это займет сильно много времени."
    //         })
    //     } catch (e) {
    //         console.log(e)
    //         next(e)
    //     }
    // }

    // async give_group_admin_rights(req,res, next){
    //     try{
    //         const userId = req.body.userId
    //
    //         const group = req.group
    //         if (!group.members.includes(userId)){
    //             next(ApiError.Not_Found("Пользователь с указанным идентификатором не найден в группе."))
    //         }
    //         if (group.admins.includes(userId)){
    //             next(ApiError.Conflict("Пользователь уже является администратором группы."))
    //         }
    //
    //         res.json(GroupService.give_group_admin_rights(group.userId))
    //     }catch (e) {
    //         console.log(e)
    //         next(e)
    //     }
    // }
}

export default new GroupController()