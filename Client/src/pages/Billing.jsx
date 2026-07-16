import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { ServerUrl } from "../App"

const freeFeatures = [
  "200 AI messages",
  "Voice assistant",
  "Navigation support",
  "Basic customization",
]

const proFeatures = [
  "Unlimited AI messages",
  "Advanced AI assistant",
  "Priority performance",
  "Unlimited navigation",
  "Premium support",
]

const geminiStatusMap = {
  active: { label: "Active", color: "text-green-600" },
  quota_exceeded: { label: "Quota Exceeded", color: "text-orange-500" },
  invalid: { label: "Invalid", color: "text-red-500" },
}

function Billing({ user, setUser }) {
  const [upgrading, setUpgrading] = useState(false)
  const verifiedRef = useRef(false)

  const isPro = user?.plan === "pro"

  const messagesLeft = Math.max(
    0,
    (user?.requestLimit || 0) - (user?.totalMessages || 0)
  )

  const daysRemaining = user?.proExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.proExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const geminiStatusLabel =
    geminiStatusMap[user?.geminiStatus]?.label || "Inactive"
  const geminiStatusColor =
    geminiStatusMap[user?.geminiStatus]?.color || "text-gray-400"

  // Handle the Stripe return (success verify / cancel), once.
  useEffect(() => {
    if (verifiedRef.current) return
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")
    const cancelled = params.get("checkout")

    if (cancelled === "cancelled") {
      verifiedRef.current = true
      toast.error("Payment cancelled")
      window.history.replaceState({}, "", "/billing")
      return
    }

    if (sessionId) {
      verifiedRef.current = true
      const verify = async () => {
        try {
          const res = await axios.post(
            ServerUrl + "/api/billing/verify-session",
            { sessionId },
            { withCredentials: true }
          )
          setUser(res.data.user)
          toast.success(res.data.message || "Upgraded to Pro!")
        } catch (error) {
          console.log("verify error", error)
          toast.error(
            error?.response?.data?.message || "Could not verify payment"
          )
        } finally {
          window.history.replaceState({}, "", "/billing")
        }
      }
      verify()
    }
  }, [setUser])

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)
      const res = await axios.post(
        ServerUrl + "/api/billing/create-checkout-session",
        {},
        { withCredentials: true }
      )
      window.location.href = res.data.url
    } catch (error) {
      console.log("upgrade error", error)
      toast.error(error?.response?.data?.message || "Could not start checkout")
      setUpgrading(false)
    }
  }

  const Check = ({ light }) => (
    <svg
      className={`h-4 w-4 shrink-0 ${light ? "text-white" : "text-green-500"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  )

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#f8f8fc] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900">
          Billing &amp; Subscription
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your AI assistant plan and usage.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Current Plan</p>
            <p className="mt-1 text-lg font-bold capitalize text-gray-900">
              {user?.plan || "Free"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Gemini Status</p>
            <p className={`mt-1 text-lg font-bold capitalize ${geminiStatusColor}`}>
              {geminiStatusLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">
              {isPro ? "Days Remaining" : "Messages Left"}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {isPro ? `${daysRemaining} days` : messagesLeft}
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Free Plan</h2>
            <p className="mt-3 text-4xl font-extrabold text-gray-900">$0</p>
            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            {!isPro && (
              <div className="mt-6 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-500">
                Current Plan
              </div>
            )}
          </div>

          {/* Pro */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-green-500 p-6 shadow-lg shadow-purple-200 sm:p-8">
            <h2 className="text-lg font-bold text-white">Pro Plan</h2>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-4xl font-extrabold text-white">$20</p>
              <p className="mb-1 text-xs text-white/80">3 Months Access</p>
            </div>
            <ul className="mt-6 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                  <Check light />
                  {f}
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="mt-6 rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white">
                Active — {daysRemaining} days left
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="mt-6 w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {upgrading ? "Redirecting..." : "Upgrade Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Billing
