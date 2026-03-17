# MyApp — Password Manager

A personal password manager web application built with React, TypeScript, Node.js, Express, and PostgreSQL.
Passwords are checked against the Have I Been Pwned database to detect breaches in real time.
Includes an AI Security Advisor powered by Groq (LLaMA 3.3 70B).

---

## What this app does

- View all saved passwords in a table with show/hide and copy features
- Breach detection badge per password (via HIBP Pwned Passwords API)
- Security Dashboard with a score meter and per-password status visualization
- Add / Edit / Delete passwords via a slide-in panel
- AI Security Advisor — ask questions about any saved account's security
- Passwords stored in PostgreSQL, encrypted with AES-256-GCM
- JWT authentication with 24h token expiry
- CI/CD pipeline via GitHub Actions — tests must pass before merging to main

---

## Project structure
```
myapp/                              ← balozsolt/myapp (frontend repo)
└── src/
    ├── components/
    │   ├── SideMenu/               Navigation sidebar
    │   ├── ProtectedRoute/         JWT auth guard
    │   └── AIAdvisorPanel/         AI chat panel component
    ├── pages/
    │   ├── AllItems/               Password table with breach badges + AI button
    │   ├── SecurityDashboard/      Score meter and breach visualization
    │   ├── Login/                  Login page
    │   ├── Register/               Register page
    │   └── Help/                   Help page (placeholder)
    ├── services/
    │   ├── api.ts                  All HTTP calls to the backend
    │   └── hibp.ts                 Have I Been Pwned API integration
    ├── App.tsx                     Root component and routing
    └── index.tsx                   App entry point

myapp-backend/                      ← balozsolt/myapp-backend (backend repo)
├── routes/
│   ├── auth.js                     Register / login / status endpoints
│   ├── passwords.js                Password CRUD endpoints
│   └── ai.js                       AI security advisor endpoint
├── utils/
│   ├── crypto.js                   AES-256-GCM encrypt/decrypt helpers
│   └── auth.js                     PBKDF2 hash/derive/salt helpers
├── middleware/
│   └── authenticate.js             JWT verification middleware
├── __tests__/
│   ├── crypto.test.js              Unit tests for crypto utils
│   └── auth.test.js                Unit tests for auth utils
├── .github/
│   └── workflows/
│       └── ci.yml                  GitHub Actions CI pipeline
├── server.js                       Express server entry point
├── db.js                           PostgreSQL connection and table setup
└── package.json
```

---

## Requirements

- Node.js v18 or higher
- npm (comes with Node.js)
- Docker Desktop (for local PostgreSQL)

---

## How to run locally

You need **two terminals open at the same time** — one for the frontend, one for the backend.

### Terminal 1 — Start the backend
```cmd
cd myapp-backend
docker-compose up -d        ← start local PostgreSQL
npm install
npm run dev                 ← starts with nodemon (auto-restarts on save)
```
Backend runs at `http://localhost:3001`
Health check: `http://localhost:3001/health`

### Terminal 2 — Start the frontend
```cmd
cd myapp
npm install
npm start
```
App opens automatically at `http://localhost:3000`

**Note:** For local dev, create `myapp/.env.development.local` with:
```
REACT_APP_API_URL=https://myapp-backend-production-e91a.up.railway.app
```
This points local frontend at the Railway backend (avoids needing local PostgreSQL with data).

---

## Running tests
```cmd
cd myapp-backend
npm test
```

36 tests across `__tests__/crypto.test.js` and `__tests__/auth.test.js`.

---

## API endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/auth/status` | ✗ | Check if account exists |
| GET | `/api/passwords` | ✓ | Fetch all passwords |
| POST | `/api/passwords` | ✓ | Add a new password |
| PUT | `/api/passwords/:id` | ✓ | Update a password |
| DELETE | `/api/passwords/:id` | ✓ | Delete a password |
| POST | `/api/ai/advise` | ✓ | Ask AI security advisor |
| GET | `/health` | ✗ | Check if server is running |

---

## Production Deployment

| Service | Provider | URL |
|---|---|---|
| Frontend (React) | Vercel | https://myapp-tau-tan.vercel.app |
| Backend (Node.js) | Railway | https://myapp-backend-production-e91a.up.railway.app |
| Database (PostgreSQL) | Railway | Internal to Railway network |

### How Deployment Works

Both services auto-deploy when you push to `main`:
```
git add .
git commit -m "Your change"
git push
```

Vercel rebuilds the React frontend (~1-2 minutes).
Railway restarts the Node.js backend (~30 seconds).

**Branch protection is enabled on main** — CI tests must pass before any PR can merge.

### Environment Variables

**Frontend (Vercel dashboard):**
```
REACT_APP_API_URL = https://myapp-backend-production-e91a.up.railway.app
```

**Backend (Railway dashboard):**
```
DATABASE_URL    = (auto-injected by Railway when PostgreSQL is linked)
JWT_SECRET      = your-secret-key
NODE_ENV        = production
PORT            = (auto-injected by Railway)
GROQ_API_KEY    = your-groq-api-key
```

### Health Check
```
https://myapp-backend-production-e91a.up.railway.app/health
→ {"status":"ok"}
```