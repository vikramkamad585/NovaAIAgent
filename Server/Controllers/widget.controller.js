import mongoose from "mongoose"
import User from "../Models/user.model.js"
import { buildSystemPrompt, generateReply } from "../Services/gemini.service.js"

const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY = 10

// GET /api/widget/:userId
// Public assistant config — explicit whitelist, never any secrets.
export const getWidgetConfig = async (req, res) => {
    try {
        const { userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({ available: false })
        }

        const user = await User.findById(userId)
        if (!user || !user.isSetupComplete) {
            return res.status(200).json({ available: false })
        }

        return res.status(200).json({
            available: true,
            assistantName: user.assistantName,
            theme: user.theme,
            tone: user.tone,
            businessName: user.businessName,
            businessType: user.businessType,
            businessDescription: user.businessDescription,
            pages: user.pages || [],
            enableVoice: user.enableVoice,
            enableNavigation: user.enableNavigation,
        })
    } catch (error) {
        return res.status(500).json({ available: false, message: `widget config error ${error}` })
    }
}

// Case-insensitive match of the visitor message against saved pages.
const matchNavigation = (message, pages = []) => {
    const text = (message || "").toLowerCase()
    for (const page of pages) {
        const terms = [page.name, ...(page.keywords || [])]
            .filter(Boolean)
            .map((t) => t.toLowerCase())
        if (terms.some((term) => term && text.includes(term))) {
            return { path: page.path, name: page.name }
        }
    }
    return null
}

// POST /api/widget/:userId/chat
export const chatWithAssistant = async (req, res) => {
    try {
        const { userId } = req.params
        const { message, history } = req.body

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ reply: "Assistant not found." })
        }

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ reply: "Please type a message." })
        }

        const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH)

        const user = await User.findById(userId)
        if (!user || !user.isSetupComplete) {
            return res.status(404).json({ reply: "Assistant not found." })
        }

        // Navigation intent: if the visitor asks to go to a saved page, just
        // acknowledge and redirect — no AI call, no long answer.
        if (user.enableNavigation) {
            const nav = matchNavigation(trimmedMessage, user.pages)
            if (nav) {
                return res.status(200).json({
                    reply: `Sure! Opening the ${nav.name} page for you...`,
                    navigate: nav,
                    usage: {
                        totalMessages: user.totalMessages,
                        requestLimit: user.requestLimit,
                    },
                })
            }
        }

        // Guard: usage limit reached
        if (user.totalMessages >= user.requestLimit) {
            return res.status(429).json({
                error: "limit_reached",
                reply: "This assistant has reached its message limit. Please try again later.",
            })
        }

        // Guard: no usable key
        if (!user.geminiApiKey || user.geminiStatus === "invalid") {
            return res.status(200).json({
                error: "unavailable",
                reply: "The assistant is currently unavailable. Please try again later.",
                navigate: null,
            })
        }

        const systemInstruction = buildSystemPrompt(user)

        const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY) : []

        const result = await generateReply({
            apiKey: user.geminiApiKey,
            systemInstruction,
            history: safeHistory,
            message: trimmedMessage,
        })

        if (!result.ok) {
            // Persist the status so the Builder reflects invalid/quota keys.
            if (result.kind === "invalid" || result.kind === "quota_exceeded") {
                user.geminiStatus = result.kind
                await user.save()
            }

            const friendly =
                result.kind === "quota_exceeded"
                    ? "The assistant is busy right now. Please try again in a moment."
                    : result.kind === "invalid"
                    ? "The assistant is currently unavailable. Please try again later."
                    : "Sorry, something went wrong. Please try again."

            return res.status(200).json({ error: result.kind, reply: friendly, navigate: null })
        }

        // Success — count the message and keep status active (atomic increment).
        const updated = await User.findByIdAndUpdate(
            userId,
            { $inc: { totalMessages: 1 }, $set: { geminiStatus: "active" } },
            { new: true }
        )

        // Navigation is handled earlier (short-circuits before the AI call),
        // so a normal AI answer never carries a navigate action.
        return res.status(200).json({
            reply: result.text,
            navigate: null,
            usage: {
                totalMessages: updated.totalMessages,
                requestLimit: updated.requestLimit,
            },
        })
    } catch (error) {
        return res.status(500).json({ reply: `Sorry, something went wrong.`, message: `${error}` })
    }
}
