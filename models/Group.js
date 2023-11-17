import {Schema, model} from "mongoose";

const GroupSchema = new Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    owner: {type: String, ref: "User", field:"_id"},
    members: {type: Array, ref: "User", field:"_id"},
    admins: {type:Array, ref:"User", field: "_id"},
    join_requests: {type:Array, ref:"User", field: "_id"},
}, {
    timestamps: true,
})

export default model("Group", GroupSchema)