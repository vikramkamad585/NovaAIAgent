import express from "express"
import dotenv from "dotenv"
import connectDB from "./Configs/ConnectDB.js";
import authRouter from "./Routes/auth.route.js";
import cookieParser from "cookie-parser";
dotenv.config()
import cors from "cors"
import userRouter from "./Routes/user.route.js";
import widgetRouter from "./Routes/widget.route.js";
import billingRouter from "./Routes/billing.route.js";

const app = express()

app.use(express.json())
app.use(cookieParser())

// Public embeddable widget: reflect any origin, no cookies. Mounted BEFORE the
// strict app CORS so the global policy never intercepts the widget's requests
// or preflight (that would break cross-site embedding).
const widgetCors = cors({
    origin: true,
    credentials: false,
    methods: ["GET", "POST"],
})
app.use("/api/widget", widgetCors, widgetRouter)

// Strict CORS for the authenticated app (cookie/JWT), only the trusted frontend.
// Uses CLIENT_URL from env in production, falls back to localhost in dev.
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"
app.use(cors({
    origin: CLIENT_URL,
    credentials:true
}))

app.get("/", (req, res) =>{
    res.json("Hello from server")
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/billing", billingRouter)
const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log(`Server Started on Port ${PORT}`)
    connectDB()
})



