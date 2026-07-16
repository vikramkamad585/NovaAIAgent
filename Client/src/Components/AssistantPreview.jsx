import React, { useState } from "react"

// Equalizer bars — each animates with a staggered delay for a wave effect
const bars = [
  { h: "h-2", d: "0ms" },
  { h: "h-4", d: "150ms" },
  { h: "h-6", d: "300ms" },
  { h: "h-3", d: "450ms" },
  { h: "h-5", d: "600ms" },
]

// Four selectable themes. `dot` is the color shown in the top-right switcher.
const themes = {
  dark: {
    label: "Dark",
    dot: "bg-purple-500",
    card: "bg-gradient-to-b from-[#1e1633] via-[#171226] to-[#0d0a17] ring-1 ring-white/10 shadow-2xl shadow-purple-900/40",
    orb: "bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-lg shadow-fuchsia-500/40",
    ring: "bg-purple-500/30",
    ring2: "bg-fuchsia-500/20",
    title: "text-white",
    subtitle: "text-gray-400",
    status: "text-green-400",
    bar: "from-green-400 to-emerald-300",
    mic: "bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-fuchsia-500/40",
    micPing: "bg-fuchsia-500/40",
  },
  light: {
    label: "Light",
    dot: "bg-white ring-1 ring-gray-300",
    card: "bg-gradient-to-b from-white to-purple-50 ring-1 ring-gray-200 shadow-2xl shadow-purple-200/60",
    orb: "bg-gradient-to-br from-purple-500 to-green-500 shadow-lg shadow-purple-300/60",
    ring: "bg-purple-400/30",
    ring2: "bg-green-400/20",
    title: "text-gray-900",
    subtitle: "text-gray-500",
    status: "text-purple-600",
    bar: "from-purple-500 to-green-500",
    mic: "bg-gradient-to-br from-purple-600 to-green-500 shadow-purple-300/60",
    micPing: "bg-purple-500/30",
  },
  glass: {
    label: "Glass",
    dot: "bg-sky-400",
    card: "bg-slate-800/50 backdrop-blur-xl ring-1 ring-white/30 shadow-2xl shadow-sky-400/30",
    orb: "bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/40",
    ring: "bg-sky-400/30",
    ring2: "bg-cyan-300/20",
    title: "text-white drop-shadow-md",
    subtitle: "text-white/80",
    status: "text-cyan-300",
    bar: "from-cyan-300 to-sky-200",
    mic: "bg-gradient-to-br from-sky-400 to-blue-500 shadow-cyan-400/40",
    micPing: "bg-sky-400/40",
  },
  neon: {
    label: "Neon",
    dot: "bg-green-400",
    card: "bg-black ring-1 ring-green-400/40 shadow-[0_0_40px_rgba(74,222,128,0.25)]",
    orb: "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-green-400 shadow-[0_0_30px_rgba(236,72,153,0.7)]",
    ring: "bg-pink-500/30",
    ring2: "bg-green-400/30",
    title: "text-green-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]",
    subtitle: "text-green-200/60",
    status: "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]",
    bar: "from-pink-500 to-green-400",
    mic: "bg-gradient-to-br from-pink-500 to-green-400 shadow-[0_0_20px_rgba(236,72,153,0.7)]",
    micPing: "bg-green-400/40",
  },
}

const themeOrder = ["light", "dark", "glass", "neon"]

function AssistantPreview({ name = "Nova AI", theme: initialTheme = "dark" }) {
  const [activeTheme, setActiveTheme] = useState(
    themes[initialTheme] ? initialTheme : "dark"
  )
  const t = themes[activeTheme]

  return (
    <div className={`relative w-[300px] rounded-3xl p-6 transition-colors duration-500 ${t.card}`}>
      {/* Theme switcher dots */}
      <div className="absolute right-5 top-5 flex items-center gap-1.5">
        {themeOrder.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTheme(key)}
            aria-label={`${themes[key].label} theme`}
            title={`${themes[key].label} theme`}
            className={`h-2.5 w-2.5 rounded-full transition ${themes[key].dot} ${
              activeTheme === key
                ? "ring-2 ring-white/70 ring-offset-1 ring-offset-transparent scale-125"
                : "opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>

      {/* Orb with breathing animation + glow rings */}
      <div className="mt-6 flex justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className={`absolute h-24 w-24 rounded-full ${t.ring} animate-[glow-ring_3s_ease-out_infinite]`} />
          <span className={`absolute h-24 w-24 rounded-full ${t.ring2} animate-[glow-ring_3s_ease-out_infinite_1.5s]`} />
          <span className={`relative h-20 w-20 rounded-full animate-[breathe_3s_ease-in-out_infinite] ${t.orb}`} />
        </div>
      </div>

      {/* Greeting */}
      <h3 className={`mt-5 text-center text-xl font-bold ${t.title}`}>
        Hello! I'm {name}
      </h3>
      <p className={`mt-2 text-center text-xs leading-relaxed ${t.subtitle}`}>
        Your smart voice assistant.
        <br />
        Ask anything about your website.
      </p>

      {/* Status */}
      <p className={`mt-5 text-center text-sm font-semibold ${t.status}`}>
        Listening...
      </p>

      {/* Equalizer wave */}
      <div className="mt-3 flex items-end justify-center gap-1">
        {bars.map((bar, i) => (
          <span
            key={i}
            className={`w-1 ${bar.h} rounded-full bg-gradient-to-t ${t.bar} animate-[wave_1s_ease-in-out_infinite]`}
            style={{ animationDelay: bar.d }}
          />
        ))}
      </div>

      {/* Mic button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95 ${t.mic}`}
        >
          <span className={`absolute inline-flex h-full w-full rounded-full animate-ping ${t.micPing}`} />
          <svg className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AssistantPreview
