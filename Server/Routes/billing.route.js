import express from "express"
import { isAuth } from "../Middleware/isAuth.js"
import {
    createCheckoutSession,
    verifySession,
} from "../Controllers/billing.controller.js"

const billingRouter = express.Router()

billingRouter.post("/create-checkout-session", isAuth, createCheckoutSession)
billingRouter.post("/verify-session", isAuth, verifySession)

export default billingRouter
