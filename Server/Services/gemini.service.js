import { GoogleGenAI } from "@google/genai"

// Stable alias tracking the current Flash-Lite model — the fastest, lowest-
// latency Gemini tier (~1-2s replies) with generous quota, ideal for a chat
// widget. Avoids "model no longer available" errors that hit pinned versions.
const MODEL = "gemini-flash-lite-latest"

// Build the assistant persona / system instruction from the user's saved config.
export const buildSystemPrompt = (config) => {
    const {
        assistantName = "Nova",
        tone = "friendly",
        businessName = "",
        businessType = "",
        businessDescription = "",
        pages = [],
    } = config || {}

    const toneLine = {
        friendly: "Speak in a warm, friendly and approachable manner.",
        professional: "Speak in a polished, professional and concise manner.",
        sales: "Speak in a persuasive, enthusiastic and sales-oriented manner, gently guiding the user toward taking action.",
    }[tone] || "Speak in a warm, friendly and approachable manner."

    const lines = [
        `You are ${assistantName}, a helpful voice assistant embedded on a website.`,
        toneLine,
    ]

    if (businessName) lines.push(`The business is called "${businessName}".`)
    if (businessType) lines.push(`Business type: ${businessType}.`)
    if (businessDescription) lines.push(`About the business: ${businessDescription}`)

    if (Array.isArray(pages) && pages.length > 0) {
        const pageList = pages
            .map((p) => `- "${p.name}" (${p.path})${p.keywords?.length ? ` — keywords: ${p.keywords.join(", ")}` : ""}`)
            .join("\n")
        lines.push(
            "The website has these pages you can guide visitors to:",
            pageList,
            "If a visitor asks to go to or find one of these pages, tell them you're taking them there."
        )
    }

    lines.push(
        "Keep answers short and conversational (1-3 sentences) since replies may be spoken aloud.",
        "Only answer questions related to this business and website. If asked something unrelated, politely steer back."
    )

    return lines.join("\n")
}

// Classify an SDK error into one of our geminiStatus kinds.
const classifyError = (error) => {
    const status = error?.status || error?.code || error?.response?.status
    const message = `${error?.message || ""} ${JSON.stringify(error?.error || "")}`.toLowerCase()

    if (
        status === 429 ||
        message.includes("resource_exhausted") ||
        message.includes("quota") ||
        message.includes("rate limit")
    ) {
        return "quota_exceeded"
    }

    if (
        status === 400 ||
        status === 401 ||
        status === 403 ||
        message.includes("api_key_invalid") ||
        message.includes("api key not valid") ||
        message.includes("permission_denied") ||
        message.includes("invalid api key")
    ) {
        return "invalid"
    }

    return "error"
}

/**
 * Generate a reply from Gemini using the owner's API key.
 * @returns {Promise<{ok:boolean, text?:string, kind?:string}>}
 *   ok:true  -> text is the reply
 *   ok:false -> kind is "quota_exceeded" | "invalid" | "error"
 */
export const generateReply = async ({ apiKey, systemInstruction, history = [], message }) => {
    try {
        const ai = new GoogleGenAI({ apiKey })

        // Map history ({role:"user"|"model", text}) to the SDK's contents shape,
        // then append the new user message.
        const contents = [
            ...history
                .filter((h) => h && h.text && (h.role === "user" || h.role === "model"))
                .map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
            { role: "user", parts: [{ text: message }] },
        ]

        const response = await ai.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction,
                // Cap output so replies stay short and fast. (Note: thinkingConfig
                // is intentionally omitted — some API keys/projects reject
                // `thinkingBudget` with 400 INVALID_ARGUMENT.)
                maxOutputTokens: 200,
            },
        })

        const text = response?.text?.trim()
        if (!text) {
            return { ok: false, kind: "error" }
        }

        return { ok: true, text }
    } catch (error) {
        console.log("Gemini error", error?.message || error)
        return { ok: false, kind: classifyError(error) }
    }
}
