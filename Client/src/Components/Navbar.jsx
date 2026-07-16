import React, { useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { ServerUrl } from "../App"

function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      setUser(null)
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.log("logout error", error)
      toast.error("Logout failed")
    }
  }

  // Only render the navbar when a user is logged in
  if (!user) return null

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U"

  const styleFor = (active) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition ${
      active
        ? "bg-gradient-to-r from-purple-600 to-green-500 text-white shadow-md shadow-purple-300/50"
        : "text-gray-500 hover:text-gray-900"
    }`

  // Builder is active on both the home route and /builder
  const builderActive =
    location.pathname === "/" || location.pathname.startsWith("/builder")

  const closeMenu = () => setMenuOpen(false)

  const Logo = (
    <NavLink to="/" onClick={closeMenu} className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-green-500 text-white shadow-lg shadow-purple-300/40 ring-1 ring-white/50 transition group-hover:scale-105">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-gray-900">
        Nova<span className="bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text text-transparent">AI</span>
      </span>
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 bg-white/70 shadow-sm shadow-purple-100/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Left — logo */}
        {Logo}

        {/* Right — desktop nav + user */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-gray-200/70 bg-gray-100/60 p-1 backdrop-blur">
            <NavLink to="/builder" className={styleFor(builderActive)}>
              Builder
            </NavLink>
            <NavLink to="/billing" className={({ isActive }) => styleFor(isActive)}>
              Billing
            </NavLink>
          </nav>

          {/* User chip */}
          <div className="flex items-center gap-2.5 rounded-full border border-gray-200/70 bg-white/80 px-2 py-1 shadow-sm backdrop-blur transition hover:shadow-md">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-green-500 text-sm font-semibold text-white ring-1 ring-white/50">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || "User"}
              </p>
              <p className="max-w-[140px] truncate text-xs text-gray-400">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile — hamburger / close toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200/60 bg-white/90 px-4 pb-4 pt-3 shadow-lg backdrop-blur-xl">
          {/* User info */}
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-green-500 text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || "User"}
              </p>
              <p className="max-w-[200px] truncate text-xs text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/builder"
              onClick={closeMenu}
              className={`${styleFor(builderActive)} w-full text-center`}
            >
              Builder
            </NavLink>
            <NavLink
              to="/billing"
              onClick={closeMenu}
              className={({ isActive }) => `${styleFor(isActive)} w-full text-center`}
            >
              Billing
            </NavLink>
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              closeMenu()
              handleLogout()
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            LogOut
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar
