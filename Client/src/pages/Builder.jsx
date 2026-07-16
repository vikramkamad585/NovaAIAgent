import React, { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { CLIENT_URL, ServerUrl } from "../App"

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "glass", label: "Glass" },
  { value: "neon", label: "Neon" },
]

const toneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "sales", label: "Sales" },
]

function Builder({ user, setUser }) {
  // Field state
  const [editAssistant, setEditAssistant] = useState(!user?.isSetupComplete)
  const [assistantName, setAssistantName] = useState(user?.assistantName || "")
  const [businessName, setBusinessName] = useState(user?.businessName || "")
  const [businessType, setBusinessType] = useState(user?.businessType || "")
  const [businessDescription, setBusinessDescription] = useState(
    user?.businessDescription || ""
  )

  // Appearance state — dark & friendly active by default
  const [theme, setTheme] = useState(user?.theme || "dark")
  const [tone, setTone] = useState(user?.tone || "friendly")

  // Gemini API key
  const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || "")
  const [showKey, setShowKey] = useState(false)

  // Navigation pages
  const [pages, setPages] = useState(user?.pages || [])
  const [pageName, setPageName] = useState("")
  const [pagePath, setPagePath] = useState("")
  const [pageKeywords, setPageKeywords] = useState("")

  // Prefill the form once the user data is available (it may load after mount,
  // so the initial useState values above can be empty on first render).
  useEffect(() => {
    if (!user) return
    setAssistantName(user.assistantName || "")
    setBusinessName(user.businessName || "")
    setBusinessType(user.businessType || "")
    setBusinessDescription(user.businessDescription || "")
    setTheme(user.theme || "dark")
    setTone(user.tone || "friendly")
    setGeminiApiKey(user.geminiApiKey || "")
    setPages(user.pages || [])
    setEditAssistant(!user.isSetupComplete)
  }, [user])

  const handleAddPage = () => {
    if (!pageName.trim()) return toast.error("Page name is required")
    if (!pagePath.trim()) return toast.error("Page path is required")
    if (!pagePath.trim().startsWith("/"))
      return toast.error("Path must start with a slash, e.g. /pricing")

    const path = pagePath.trim()
    if (pages.some((p) => p.path.toLowerCase() === path.toLowerCase()))
      return toast.error("A page with this path already exists")

    const newPage = {
      name: pageName.trim(),
      path,
      keywords: pageKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    }
    setPages((prev) => [...prev, newPage])
    setPageName("")
    setPagePath("")
    setPageKeywords("")
  }

  const handleDeletePage = (index) => {
    setPages((prev) => prev.filter((_, i) => i !== index))
  }

  // Save assistant
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update a field's value and clear its error as the user types.
  const update = (setter, field) => (e) => {
    setter(e.target.value)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!assistantName.trim()) e.assistantName = "Assistant name is required"
    if (!businessName.trim()) e.businessName = "Business name is required"
    if (!businessType.trim()) e.businessType = "Business type is required"
    if (!businessDescription.trim())
      e.businessDescription = "Business description is required"
    else if (businessDescription.trim().length < 10)
      e.businessDescription = "Please add at least 10 characters"
    if (!geminiApiKey.trim()) e.geminiApiKey = "Gemini API key is required"
    return e
  }

  const handleSave = async () => {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields")
      return
    }
    try {
      setLoading(true)
      const res = await axios.post(
        ServerUrl + "/api/user/save-assistant",
        {
          assistantName,
          businessName,
          businessType,
          businessDescription,
          tone,
          theme,
          geminiApiKey,
          pages,
        },
        { withCredentials: true }
      )
      setUser(res.data.user)
      toast.success(res.data.message || "Assistant saved successfully")
      setEditAssistant(false)
    } catch (error) {
      console.log("save assistant error", error)
      toast.error(error?.response?.data?.message || "Failed to save assistant")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"

  // Input class for a validated field — red border/ring when it has an error.
  const fieldClass = (name) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 ${
      errors[name]
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-purple-400 focus:ring-purple-100"
    }`
  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    ) : null

  const optionClass = (active) =>
    `rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
    }`

  // ---- Derived values for the status card ----
  const isPro = user?.plan === "pro"

  // Free plan: messages remaining
  const messagesLeft = Math.max(
    0,
    (user?.requestLimit || 0) - (user?.totalMessages || 0)
  )

  // Pro plan: days left until expiry
  const daysRemaining = user?.proExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.proExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0

  // Gemini status label + color
  const geminiStatusMap = {
    active: { label: "Active", color: "text-green-600" },
    quota_exceeded: { label: "Quota Exceeded", color: "text-orange-500" },
    invalid: { label: "Invalid", color: "text-red-500" },
  }
  const geminiStatusLabel = geminiStatusMap[user?.geminiStatus]?.label || "Inactive"
  const geminiStatusColor = geminiStatusMap[user?.geminiStatus]?.color || "text-gray-400"

  // ---- Embed script ----
  const embedScript = `<script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedScript)
      toast.success("Script copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy script")
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#f8f8fc] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900">Assistant Builder</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your virtual assistant
        </p>

        {user.isSetupComplete && !editAssistant && (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Assistant
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                  {user?.assistantName || "Nova AI"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your assistant is ready to use on your website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditAssistant(true)}
                className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
              >
                Edit Assistant
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Current Plan */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">Current Plan</p>
                <p className="mt-1 text-lg font-bold capitalize text-gray-900">
                  {user?.plan || "Free"}
                </p>
              </div>

              {/* Gemini Status */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">Gemini Status</p>
                <p className={`mt-1 text-lg font-bold capitalize ${geminiStatusColor}`}>
                  {geminiStatusLabel}
                </p>
              </div>

              {/* Messages left (free) or Days remaining (pro) */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  {isPro ? "Days Remaining" : "Messages Left"}
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {isPro ? `${daysRemaining} days` : messagesLeft}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Embed script */}
        {user.isSetupComplete && !editAssistant && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {/* Where to paste */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-700">
                Where to paste this script?
              </h3>
              <p className="mt-1 text-xs text-amber-600">
                Paste this script before the closing{" "}
                <code className="font-mono font-semibold">&lt;/body&gt;</code>{" "}
                tag of your website HTML file.
              </p>

              <p className="mt-3 text-xs font-medium text-amber-700">Example:</p>
              <pre className="mt-2 whitespace-pre-wrap break-all rounded-lg bg-[#0d0a17] p-4 text-xs leading-relaxed">
                <code className="font-mono text-green-400">
                  {"<body>\n"}
                  {"   Your Website Content\n\n"}
                  {"   " + embedScript}
                  {"\n</body>"}
                </code>
              </pre>
            </div>

            {/* Embed code */}
            <p className="mt-6 text-sm font-semibold text-gray-900">Embed Code</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#0d0a17] p-4">
              <code className="flex-1 break-all font-mono text-xs text-green-400">
                {embedScript}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy embed script"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        )}

       {editAssistant && <div>
        {/* Basic Information */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>

          <div className="mt-5 space-y-4">
            <div>
              <input
                type="text"
                value={assistantName}
                onChange={update(setAssistantName, "assistantName")}
                placeholder="Assistant Name"
                className={fieldClass("assistantName")}
              />
              <FieldError name="assistantName" />
            </div>
            <div>
              <input
                type="text"
                value={businessName}
                onChange={update(setBusinessName, "businessName")}
                placeholder="Business Name"
                className={fieldClass("businessName")}
              />
              <FieldError name="businessName" />
            </div>
            <div>
              <input
                type="text"
                value={businessType}
                onChange={update(setBusinessType, "businessType")}
                placeholder="Business Type"
                className={fieldClass("businessType")}
              />
              <FieldError name="businessType" />
            </div>
            <div>
              <textarea
                rows={4}
                value={businessDescription}
                onChange={update(setBusinessDescription, "businessDescription")}
                placeholder="Business Description"
                className={`${fieldClass("businessDescription")} resize-none`}
              />
              <FieldError name="businessDescription" />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">Appearance</h2>

          {/* Theme */}
          <p className="mt-5 text-sm font-medium text-gray-500">Theme</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={optionClass(theme === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tone */}
          <p className="mt-6 text-sm font-medium text-gray-500">Assistant Tone</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {toneOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTone(opt.value)}
                className={optionClass(tone === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Gemini API Key */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Gemini API KEY</h2>
              <p className="mt-1 text-sm text-gray-500">
                Add your Gemini API key to power your assistant
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:opacity-90 active:scale-[0.98]"
            >
              Get API KEY
            </a>
          </div>

          <div className="relative mt-5">
            <input
              type={showKey ? "text" : "password"}
              value={geminiApiKey}
              onChange={update(setGeminiApiKey, "geminiApiKey")}
              placeholder="AIza..."
              className={`${fieldClass("geminiApiKey")} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            >
              {showKey ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <FieldError name="geminiApiKey" />

          <p className="mt-3 text-xs text-gray-400">
            Your API key is securely stored and only used for generating AI
            responses.
          </p>
        </section>

        {/* Navigation Pages */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Navigation Pages</h2>
              <p className="mt-1 text-sm text-gray-500">
                Assistant can redirect users
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPage}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:opacity-90 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Add
            </button>
          </div>

          {/* Inputs */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Page Name"
              className={inputClass}
            />
            <input
              type="text"
              value={pagePath}
              onChange={(e) => setPagePath(e.target.value)}
              placeholder="/pricing"
              className={inputClass}
            />
            <input
              type="text"
              value={pageKeywords}
              onChange={(e) => setPageKeywords(e.target.value)}
              placeholder="Pricing Plan"
              className={inputClass}
            />
          </div>

          {/* Added pages list */}
          {pages.length > 0 && (
            <div className="mt-5 divide-y divide-gray-100">
              {pages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {page.name}
                    </p>
                    <p className="text-xs text-gray-400">{page.path}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePage(index)}
                    aria-label={`Delete ${page.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save button */}
        <button
          disabled={loading}
          onClick={handleSave}
          className="mt-6 h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-green-500 text-base font-semibold text-white shadow-lg shadow-purple-200 transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : user?.isSetupComplete
            ? "Update Assistant"
            : "Save Assistant"}
        </button>
        </div>}

      </div>
    </div>
  )
}

export default Builder
