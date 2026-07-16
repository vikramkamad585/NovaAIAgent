import mongoose from "mongoose"

const billingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        plan: {
            type: String,
            default: "pro",
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "usd",
        },
        stripeSessionId: {
            type: String,
            required: true,
            unique: true,
        },
        stripePaymentIntentId: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
        },
        periodStart: {
            type: Date,
            default: null,
        },
        periodEnd: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
)

const Billing = mongoose.model("Billing", billingSchema)

export default Billing
