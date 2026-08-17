import React, { useState } from "react"
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from "../utils/firebase.js"
import axios from 'axios'
import { useNavigate } from "react-router-dom"
import { ServerUrl } from "../App.jsx"
import toast from "react-hot-toast"



const steps = [
  {
    title: "Sign up free",
    desc: "Continue with Google and create your assistant instantly.",
    color: "bg-purple-100 text-purple-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
      </svg>
    ),
  },
  {
    title: "Customize assistant",
    desc: "Set your business name, tone, voice and theme.",
    color: "bg-blue-100 text-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 3.9M15.4 6.6l-6.8 3.9" />
      </svg>
    ),
  },
  {
    title: "Train your assistant",
    desc: "Add business details and personalize responses.",
    color: "bg-green-100 text-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    title: "Embed anywhere",
    desc: "Copy one script tag and add it to your website.",
    color: "bg-orange-100 text-orange-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
]

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function Login({setUser}) {

const navigate = useNavigate()
const [loading, setLoading] = useState(false)

const handleLogin = async () => {
    try{
        setLoading(true)
        const result = await signInWithPopup(auth, provider)
        const {displayName, email} = result.user
        const res = await axios.post(ServerUrl + "/api/auth/google", {name: displayName, email}, {withCredentials:true})
        setUser(res.data)
        toast.success('Login Successfully.')
        navigate('/')
    }catch(error){
        setLoading(false)
        // Ignore the user simply closing the Google popup.
        if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
            toast.error('Login Failed...')
        }
        console.log("error", error)
    }
}
  return (
    <div className="bg-grid relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-purple-50 to-green-50 flex items-center justify-center px-6 py-12">
      {/* Login / redirect loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/60 bg-white/80 px-10 py-9 shadow-2xl shadow-purple-200/50 backdrop-blur-xl">
            {/* Spinner with breathing brand orb */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full border-4 border-purple-100 border-t-purple-600 border-r-green-500 animate-spin" />
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-green-500 shadow-lg shadow-purple-300/50 animate-[breathe_2.5s_ease-in-out_infinite]" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">Signing you in…</p>
              <p className="mt-1 text-sm text-gray-500">Setting up your workspace — just a moment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating background glows */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl animate-[float-slow_10s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-green-300/25 blur-3xl animate-[float-slow_12s_ease-in-out_infinite_1.5s]" />

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-white/70 px-4 py-1.5 text-xs font-medium text-purple-700 shadow-sm shadow-purple-200/40 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            AI Voice Assistant Platform
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900">
            Build AI Assistants{" "}
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 bg-clip-text text-transparent">
              For Any Website
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-gray-500">
            Create customizable AI voice assistants that talk, guide users, and
            integrate into any website instantly.
          </p>

          <button onClick={handleLogin}
            type="button"
            disabled={loading}
            className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-500 px-6 py-3.5 text-white font-semibold shadow-lg shadow-purple-300/50 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300/60 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm">
                  <GoogleIcon />
                </span>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-4 text-sm text-gray-400">
            Free plan includes 200 AI responses
          </p>
        </div>

        {/* Right — glass panel */}
        <div className="relative rounded-3xl border border-white/60 bg-white/60 p-6 sm:p-8 shadow-2xl shadow-purple-200/50 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Setup Process</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Launch in Minutes
              </h2>
            </div>
            <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-300/50 ring-1 ring-white/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="group flex items-start gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-purple-200/70 hover:shadow-lg hover:shadow-purple-200/40"
              >
                <span className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl transition group-hover:scale-105 ${step.color}`}>
                  {step.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chat widget */}
      <button
        type="button"
        aria-label="Open chat"
        className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-green-500 text-white shadow-lg shadow-green-300/50 transition hover:scale-105 active:scale-95"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400/40 animate-ping" />
        <svg className="relative w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </div>
  )
}

export default Login
