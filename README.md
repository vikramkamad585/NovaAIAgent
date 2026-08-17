# NovaAI — AI Voice Assistant Platform

Build customizable AI voice assistants that talk to your visitors, answer questions, and navigate your website — then embed them on **any** website with a single `<script>` tag.

NovaAI is a full-stack MERN application: a React dashboard where you configure your assistant, an Express + MongoDB backend, and a self-contained embeddable widget powered by Google Gemini.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Embedding the Widget](#embedding-the-widget)
- [Deployment (Render)](#deployment-render)
- [Development Standards](#development-standards)

---

## Features

- **Google Login** — one-click authentication via Firebase.
- **Assistant Builder** — configure name, business details, tone (friendly / professional / sales), and theme (light / dark / glass / neon).
- **Embeddable Widget** — a voice-first assistant that drops into any site via one script tag; renders in a Shadow DOM so it never clashes with the host page's CSS.
- **Voice interaction** — speech-to-text input and text-to-speech replies via the browser's Web Speech API.
- **AI chat** — powered by Google Gemini, using each user's own API key with business context and tone baked into the system prompt.
- **Smart navigation** — the assistant can redirect visitors to configured pages ("take me to pricing").
- **Usage limits & billing** — free plan (200 messages) with a Stripe-powered Pro upgrade (unlimited messages).
- **Environment-aware URLs** — automatically targets localhost in development and production URLs when deployed.

---

## Tech Stack

**Frontend** — `Client/`
- React 19 + Vite 8
- Tailwind CSS v4
- React Router 7
- Firebase (Google Auth)
- Axios, React Hot Toast

**Backend** — `Server/`
- Node.js + Express 5 (ES modules)
- MongoDB + Mongoose
- JWT (httpOnly cookie auth)
- `@google/genai` (Gemini)
- Stripe (payments)
- cors, cookie-parser, dotenv

**Embeddable Widget** — `Client/public/assistant.js`
- Vanilla JavaScript (no framework), Shadow DOM, Web Speech API

---

## Project Structure

```
NovaAIAgent/
├── Client/                     # React dashboard (Vite)
│   ├── public/
│   │   └── assistant.js        # Embeddable widget (served at /assistant.js)
│   ├── src/
│   │   ├── Components/         # Navbar, ProtectedRoute, AssistantPreview
│   │   ├── pages/             # Login, Home, Builder, Billing
│   │   ├── utils/            # firebase.js
│   │   ├── App.jsx           # Routes + exported ServerUrl / CLIENT_URL
│   │   └── main.jsx
│   ├── .env.development       # Dev URLs (committed — no secrets)
│   ├── .env.production        # Prod URLs (committed — no secrets)
│   └── .env.example
│
└── Server/                     # Express API
    ├── Configs/              # ConnectDB.js, token.js
    ├── Controllers/          # auth, user, widget, billing
    ├── Middleware/           # isAuth.js (JWT cookie auth)
    ├── Models/              # user.model.js, billing.model.js
    ├── Routes/             # auth, user, widget, billing
    ├── Services/          # gemini.service.js
    ├── index.js
    ├── .env                # Secrets (git-ignored — never commit)
    └── .env.example
```

---

## Prerequisites

Before running the project you need:

| Requirement | Notes |
|---|---|
| **Node.js** | v18+ (developed on v24) |
| **MongoDB** | A connection string (MongoDB Atlas or local) |
| **Google Gemini API key** | From [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — configured per-user in the Builder |
| **Firebase project** | For Google authentication (config in `Client/src/utils/firebase.js`) |
| **Stripe account** | Test keys for the billing feature ([dashboard.stripe.com](https://dashboard.stripe.com)) |

---

## Environment Variables

### Server (`Server/.env`) — **secrets, never commit**

```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Client — **URLs only, safe to commit**

Vite loads these automatically by mode: `.env.development` for `npm run dev`, `.env.production` for `npm run build`.

```env
VITE_SERVER_URL=http://localhost:8000     # http://localhost:8000 (dev) / your API URL (prod)
VITE_CLIENT_URL=http://localhost:5173     # http://localhost:5173 (dev) / your client URL (prod)
```

> Copy each `.env.example` to `.env` and fill in real values. The server `.env` is git-ignored; the client env files contain only URLs and are committed.

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/vikramkamad585/NovaAIAgent.git
cd NovaAIAgent

# 2. Backend
cd Server
npm install
cp .env.example .env          # then fill in real values
npm run dev                   # starts on http://localhost:8000

# 3. Frontend (new terminal)
cd Client
npm install
npm run dev                   # starts on http://localhost:5173
```

Open http://localhost:5173, sign in with Google, and configure your assistant in the Builder. Add a **valid Gemini API key** (starts with `AIza`) to enable chat.

---

## Available Scripts

**Server** (`Server/`)
| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload). Production: `node index.js` |

**Client** (`Client/`)
| Script | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |

---

## API Reference

Base URL: `http://localhost:8000`

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/google` | — | Google login; sets JWT cookie |
| GET | `/logout` | — | Clears the auth cookie |

### User — `/api/user` (cookie auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/current-user` | Get the logged-in user (auto-downgrades expired Pro) |
| POST | `/save-assistant` | Save assistant config |

### Widget — `/api/widget` (public, permissive CORS)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/:userId` | Public assistant config (no secrets) |
| POST | `/:userId/chat` | Chat with the assistant (Gemini) |

### Billing — `/api/billing` (cookie auth)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-checkout-session` | Start a Stripe Checkout session |
| POST | `/verify-session` | Verify payment & upgrade to Pro |

---

## Embedding the Widget

After completing setup in the Builder, copy the generated snippet and paste it before the closing `</body>` tag of any website:

```html
<script src="https://your-client-url/assistant.js" data-user-id="YOUR_USER_ID"></script>
```

The widget:
- Loads its config from your server based on `data-user-id`.
- Auto-detects the API base (localhost in dev, production otherwise).
- Renders inside a Shadow DOM (no CSS conflicts with the host site).
- Supports voice input/output in Chrome, Edge, and Safari (Firefox lacks the Web Speech API).

---

## Deployment (Render)

**Backend — Web Service**
- Root Directory: `Server`
- Build: `npm install`
- Start: `node index.js`
- Environment: set `PORT`, `CLIENT_URL`, `MONGODB_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY` in the dashboard.

**Frontend — Static Site**
- Root Directory: `Client`
- Build: `npm install && npm run build`
- Publish Directory: `dist`
- URLs come from the committed `.env.production` (or set `VITE_SERVER_URL` / `VITE_CLIENT_URL` in the dashboard).
- **Add a rewrite rule** so client-side routing works: `Source: /*` → `Destination: /index.html` → `Action: Rewrite`.

---

## Development Standards

- **Secrets stay out of Git.** Real credentials live only in `Server/.env` (git-ignored). Commit `.env.example` with placeholders so required variables are documented.
- **URLs are environment-driven**, never hardcoded — the client uses `import.meta.env.VITE_*` (with localhost fallbacks) and the server uses `process.env.CLIENT_URL`.
- **Consistent structure** — features are split into `Routes → Controllers → Services/Models`. Keep new endpoints in this pattern.
- **Auth** — protected routes use the `isAuth` middleware (JWT httpOnly cookie); public widget routes use a separate permissive CORS policy.
- **Public endpoints never leak secrets** — the widget config endpoint returns an explicit whitelist of fields (never the raw user document).
- **Match existing code style** — ES modules on the server, functional React components with hooks on the client, Tailwind utility classes for styling.
- **Test before committing** — run `npm run build` (client) and verify the server boots cleanly.
- **Branch & commit** — work on feature branches; write clear, present-tense commit messages.

---

## License

This project is for educational/demo purposes.
