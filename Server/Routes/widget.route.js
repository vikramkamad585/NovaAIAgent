import express from "express"
import { getWidgetConfig, chatWithAssistant } from "../Controllers/widget.controller.js"

const widgetRouter = express.Router()

// Public — no auth. Used by the embeddable widget on third-party sites.
widgetRouter.get("/:userId", getWidgetConfig)
widgetRouter.post("/:userId/chat", chatWithAssistant)

export default widgetRouter
