import Group from "../models/Group.js";


class GroupService {
    async create(owner, name) {
        return Group.create({
            name,
            url: "Тут короче будет функция, которая будет генерировать рандомную залупу, и потом глядеть нет ли этой залупы уже у какой либо группы. если такая залупа есть то рекурсия. ГЕНИААААААААААААЛЬНО. КТо придумал? ВЛади придумал. ХЕХЕХЕХХЕХЕХХЕХЕХХЕ",
            owner,
            members:[owner],
            admins: [owner],
            join_requests: []
        })
    }

    async get(_id) {
        try{
            return Group.findOne({_id});
        }catch (e) {
            throw new Error(`Ошибка при поптыке получить группу id: ${_id}. error: ${e.stack}`)
        }
    }

    async delete(_id){
        try{
            return Group.deleteOne({_id}, {returnDocument:"before"});
        }catch (e) {
            throw new Error(`Ошибка при поптыке удалить группу id: ${_id}. error: ${e.stack}`)
        }
    }

    async get_all_by_userId(userId){
        try{
            return Group.find({members:userId});
        }catch (e) {
            throw new Error(`Ошибка при попытке получить список групп юзера: ${userId}. error: ${e.stack}`)
        }
    }

}

export default new GroupService()