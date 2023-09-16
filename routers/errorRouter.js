import {Router} from "express";

const errorRouter = new Router()

errorRouter.get("/:code", (req,res) => res.status(req.params.code).json(req.params.code))

export default errorRouter