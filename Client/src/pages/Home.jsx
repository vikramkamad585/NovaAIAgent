import React from "react"
import { useNavigate } from "react-router-dom"
import AssistantPreview from "../Components/AssistantPreview"

const steps = [
  {
    num: "01",
    title: "Sign up free",
    desc: "Continue with Google and create your assistant instantly.",
    color: "text-purple-600",
  },
  {
    num: "02",
    title: "Customize assistant",
    desc: "Set your business name, tone, voice and theme.",
    color: "text-blue-600",
  },
  {
    num: "03",
    title: "Train your assistant",
    desc: "Add business details and personalize responses.",
    color: "text-green-600",
  },
  {
    num: "04",
    title: "Embed anywhere",
    desc: "Copy one script tag and add it to your website.",
    color: "text-orange-500",
  },
]

function Home({ user }) {
  const navigate = useNavigate()

  return (
    <div className="w-full">
    <div className="bg-grid relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-gradient-to-b from-white via-purple-50/50 to-green-50/40">
      {/* Soft floating background glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-300/30 blur-3xl animate-[float-slow_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-green-300/25 blur-3xl animate-[float-slow_11s_ease-in-out_infinite_1s]" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl animate-[float-slow_13s_ease-in-out_infinite_2s]" />

      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-28 text-center sm:pt-28">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-white/70 px-4 py-1.5 text-xs font-medium text-purple-700 shadow-sm shadow-purple-200/40 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Voice AI for modern websites
        </span>

        {/* Heading */}
        <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
          Add a{" "}
          <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 bg-clip-text text-transparent">
            Virtual Assistant
          </span>
          <br />
          to your website
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
          Create a smart voice-enabled assistant that talks to visitors, answers
          questions and helps users navigate your website instantly.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/builder")}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-green-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-300/50 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300/60 active:translate-y-0"
          >
            Build Your Assistant
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <span className="text-sm text-gray-400">
            Free plan · 200 AI responses
          </span>
        </div>

        {/* Assistant preview with glow */}
        <div className="relative mt-16 flex justify-center">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-64 w-64 self-center rounded-full bg-gradient-to-br from-purple-400/40 to-green-400/40 blur-3xl" />
          <AssistantPreview
            name={user?.assistantName || "Nova AI"}
            theme={user?.theme || "dark"}
          />
        </div>
      </section>
    </div>

    {/* Get started section */}
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white to-purple-50/50 px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-gray-500 backdrop-blur">
          How it works
        </span>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Get started in minutes
        </h2>
        <p className="mt-3 text-sm text-gray-500 sm:text-base">
          Simple setup. No complicated integration.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 text-left shadow-sm shadow-purple-100/50 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-purple-200/70 hover:shadow-xl hover:shadow-purple-200/50"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-green-50 text-lg font-extrabold ring-1 ring-inset ring-gray-100 ${step.color}`}>
                {step.num}
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {step.desc}
              </p>
              <span className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br from-purple-400/0 to-green-400/0 blur-2xl transition group-hover:from-purple-400/20 group-hover:to-green-400/20" />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="relative w-full bg-gradient-to-b from-[#171226] to-[#0d0a17] px-6 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-green-500 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
            <span className="text-lg font-bold text-white">
              Nova<span className="text-purple-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Voice AI assistant for websites
          </p>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} NovaAI. All rights reserved.
        </p>
      </div>
    </footer>
    </div>
  )
}

export default Home
