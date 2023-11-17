import {Schema, model} from "mongoose";

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    roles: {type: Array, ref: "Role"},
    group: {type:String, ref:"Group", field: "_id"}
}, {
    timestamps: true,
})

export default model("User", UserSchema)