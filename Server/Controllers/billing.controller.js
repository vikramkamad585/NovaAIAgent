import Stripe from "stripe"
import User from "../Models/user.model.js"
import Billing from "../Models/billing.model.js"

// Lazily instantiate Stripe so it reads STRIPE_SECRET_KEY only at first use —
// after dotenv.config() has run (ES module imports evaluate before it).
let stripeClient
const getStripe = () => {
    if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
    return stripeClient
}

const CLIENT_URL = "http://localhost:5173"
const PRO_REQUEST_LIMIT = 1000000
const PRO_DAYS = 90
const PRO_AMOUNT = 20 // USD
const PRO_UNIT_AMOUNT = 2000 // cents

// POST /api/billing/create-checkout-session
export const createCheckoutSession = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Block a second upgrade while Pro is still active.
        if (
            user.plan === "pro" &&
            user.proExpiresAt &&
            new Date(user.proExpiresAt) > new Date()
        ) {
            return res
                .status(400)
                .json({ message: "You already have an active Pro plan" })
        }

        const session = await getStripe().checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: PRO_UNIT_AMOUNT,
                        product_data: {
                            name: "Nova Pro — 3 Months",
                            description: "Unlimited AI messages and premium features",
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${CLIENT_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/billing?checkout=cancelled`,
            client_reference_id: String(req.userId),
            metadata: { userId: String(req.userId) },
        })

        await Billing.create({
            userId: req.userId,
            amount: PRO_AMOUNT,
            currency: "usd",
            stripeSessionId: session.id,
            status: "created",
        })

        return res.status(200).json({ url: session.url })
    } catch (error) {
        console.log("createCheckoutSession error", error?.message || error)
        return res
            .status(500)
            .json({ message: `Failed to start checkout ${error?.message || error}` })
    }
}

// POST /api/billing/verify-session
export const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.body
        if (!sessionId) {
            return res.status(400).json({ message: "Missing session id" })
        }

        const billing = await Billing.findOne({ stripeSessionId: sessionId })
        if (!billing) {
            return res.status(404).json({ message: "Unknown session" })
        }
        if (String(billing.userId) !== String(req.userId)) {
            return res.status(403).json({ message: "This session is not yours" })
        }

        // Idempotent: already processed → just return current user.
        if (billing.status === "paid") {
            const user = await User.findById(req.userId)
            return res.status(200).json({ message: "Already upgraded to Pro", user })
        }

        const session = await getStripe().checkout.sessions.retrieve(sessionId)
        if (session.payment_status !== "paid") {
            billing.status = "failed"
            await billing.save()
            return res.status(400).json({ message: "Payment not completed" })
        }

        const periodStart = new Date()
        const periodEnd = new Date(
            periodStart.getTime() + PRO_DAYS * 24 * 60 * 60 * 1000
        )

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    plan: "pro",
                    proExpiresAt: periodEnd,
                    requestLimit: PRO_REQUEST_LIMIT,
                    totalMessages: 0,
                },
            },
            { new: true }
        )

        billing.status = "paid"
        billing.stripePaymentIntentId = session.payment_intent || ""
        billing.periodStart = periodStart
        billing.periodEnd = periodEnd
        await billing.save()

        return res.status(200).json({ message: "Upgraded to Pro", user })
    } catch (error) {
        console.log("verifySession error", error?.message || error)
        return res
            .status(500)
            .json({ message: `Failed to verify payment ${error?.message || error}` })
    }
}
