import express from "express"
import { googleAuth, logout } from "../Controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/google", googleAuth)
authRouter.get("/logout", logout)


export default authRouter