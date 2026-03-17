# Architecture Decision Records (ADR)

This document captures every significant technology or design choice made in this project,
and the reasoning behind each one. Updated as the project evolves.

---

## ADR-001 — Frontend Framework: React

**Decision:** Use React as the UI framework.

**Why:** React lets us break the UI into small, self-contained pieces called components (e.g. `SideMenu`, `AllItems`), so each screen can be built and maintained independently without affecting the others — similar to how a well-structured team owns separate parts of a product.

---

## ADR-002 — Language: TypeScript

**Decision:** Use TypeScript instead of plain JavaScript.

**Why:** TypeScript catches mistakes while you're writing code, before the app even runs — like spell-check but for code logic. It forces every piece of data to have a clearly defined shape, which prevents entire categories of bugs.

---

## ADR-003 — Routing: React Router

**Decision:** Use React Router for navigation between pages.

**Why:** React Router makes clicking menu items change the visible page without reloading the browser, making the app feel fast and native — like a real application rather than a traditional website.

---

## ADR-004 — Styling: Per-component CSS files

**Decision:** Each component has its own `.css` file (e.g. `SideMenu.css`, `AllItems.css`).

**Why:** Keeping styles alongside the component they belong to means changes to one screen can't accidentally break the look of another — the same principle as keeping each team's work in separate lanes.

---

## ADR-005 — State Management: React useState

**Decision:** Use React's built-in `useState` hook for local component state.

**Why:** `useState` is the simplest tool for managing UI state (e.g. "is this password visible?"). Avoids introducing a heavier state management library before it's needed.

---

## ADR-006 — Breach Detection: HIBP Pwned Passwords API

**Decision:** Use the Have I Been Pwned Pwned Passwords API (free tier) to check if passwords have appeared in known data breaches.

**Why:** This API is free, requires no API key, and uses k-anonymity so the real password is never sent over the network — only the first 5 characters of its SHA-1 hash. This is the same approach used by major password managers.

---

## ADR-007 — Breach Check Location: Browser (client-side)

**Decision:** HIBP API calls are made directly from the React frontend in the browser.

**Why:** Simpler to implement at this stage — no backend involvement needed. Acceptable for now because k-anonymity already protects the password. When a backend exists, this could be moved server-side for extra control.

---

## ADR-008 — Data Layer: Hardcoded data first, backend second

**Decision:** Built the frontend UI with hardcoded dummy data before adding a real backend.

**Why:** Validating the UI design before investing in database and API work reduces wasted effort if the design needs to change. Standard industry practice: "fake it before you make it."

---

## ADR-009 — Backend Framework: Node.js with Express

**Decision:** Use Node.js with Express for the backend API.

**Why:** Node.js uses JavaScript — the same language as the frontend — minimising the number of new languages to learn simultaneously. Express is the most widely used minimal backend framework for Node.js.

---

## ADR-010 — Database: SQLite

**Decision:** Use SQLite for local data storage in Phase I.

**Why:** SQLite requires zero installation and stores the entire database as a single file (`passwords.db`). Ideal for local development and learning before moving to a production-grade database like PostgreSQL.

---

## ADR-011 — SQLite Library: sqlite3 (not better-sqlite3)

**Decision:** Use the `sqlite3` npm package rather than `better-sqlite3`.

**Why:** `better-sqlite3` requires compiling native C++ code during installation, which needs Python and Windows build tools — a setup that proved problematic on Windows with Node v24. The `sqlite3` package ships with pre-built Windows binaries and installs without any build tools.

**Trade-off:** `sqlite3` uses an asynchronous callback style which is slightly more verbose than `better-sqlite3`'s synchronous API.

---

## ADR-012 — API Design: REST

**Decision:** The backend exposes a REST API (GET, POST, PUT, DELETE over HTTP).

**Why:** REST is the most widely understood API pattern in the industry. Every endpoint maps to a single, predictable action, making it easy to reason about and test manually in a browser.

---

## ADR-013 — Port Configuration: Frontend :3000, Backend :3001

**Decision:** React dev server runs on port 3000, Node backend on port 3001, both on the same machine.

**Why:** Two separate processes can't share the same port. Running them side by side on different ports is the standard local development pattern for full-stack apps.

---

## ADR-014 — CORS: Enabled for localhost:3000 only

**Decision:** The backend allows cross-origin requests only from `http://localhost:3000`.

**Why:** Browsers block requests between different origins (ports count as different origins) by default as a security measure. CORS middleware explicitly whitelists the React dev server, while blocking requests from anywhere else.

---

## ADR-015 — Encryption Strategy (planned for Phase II)

**Decision:** AES-256 for vault passwords, PBKDF2 for master login password.

**Why:** AES-256 is a reversible encryption algorithm — required for vault passwords because the original value needs to be retrieved for use. PBKDF2 is a one-way hash — correct for login passwords because we only ever need to verify a match, never retrieve the original value. This is the same pattern used by LastPass, 1Password, and other production password managers.

---

## ADR-016 — Shared Data Source: passwordData.ts / api.ts

**Decision:** All components import password data from a single service file (`api.ts`) rather than each making their own HTTP calls.

**Why:** If the backend URL or data shape changes, it only needs to be updated in one place. This pattern is called a "service layer" and is standard in professional frontend codebases.

## ADR-017 — Authentication:
 JWT chosen for session management because it is stateless (the backend doesn't need to store sessions in a database) and is the industry standard for REST API authentication.


## "ADR-018 — Password hashing:
 PBKDF2 with 310,000 iterations chosen for master password hashing, matching OWASP's current recommendation for production password managers.

 

## ADR-019: Switch from SQLite to PostgreSQL
Status: Accepted
Date: 2026-03-09
Context: SQLite stores data in a single file which works locally but is unreliable on cloud platforms where the filesystem can reset on redeploy. PostgreSQL is the industry standard for production applications.
Decision: Migrate from sqlite3 to pg (node-postgres) with a connection pool.
Consequences:

Query syntax changes from ? to $1, $2 numbered parameters
Connection pool replaces single file connection
RETURNING * can replace separate SELECT after INSERT/UPDATE
Requires Docker locally for development
Enables free hosted PostgreSQL on Railway in production


## ADR-020: Docker for Local PostgreSQL Development
Status: Accepted
Date: 2026-03-09
Context: PostgreSQL needs to run locally for development. Installing it directly on Windows is messy and version-dependent.
Decision: Use Docker Desktop with docker-compose to run PostgreSQL in a container locally.
Consequences:

Single command to start/stop the database (docker-compose up -d / docker-compose down)
Consistent environment across machines
node_modules must never be committed to git (Windows binaries are incompatible with Linux containers)


## ADR-021: Vercel + Railway for Production Hosting
Status: Accepted
Date: 2026-03-09
Context: Need free production hosting for a personal single-user app.
Decision: Vercel for the React frontend, Railway for the Node.js backend and PostgreSQL database.
Consequences:

Both services auto-deploy on git push to main — no manual deployment steps
Vercel serves static files via global CDN — fast everywhere
Railway free tier spins down after inactivity — ~30 second cold start on first request
React environment variables must be prefixed with REACT_APP_ and are baked into the bundle at build time
DATABASE_URL is auto-injected by Railway when PostgreSQL service is linked
PORT must use process.env.PORT — Railway assigns it dynamically


## ADR-022: CORS Configuration
Status: Accepted
Date: 2026-03-10
Context: Browser security blocks requests from myapp-tau-tan.vercel.app to the Railway backend unless explicitly allowed.
Decision: Hardcode the list of allowed origins in server.js — localhost:3000 for local development and the Vercel production URL for production.
Consequences:

When the Vercel URL changes, server.js must be updated and redeployed
A more flexible approach would use an ALLOWED_ORIGIN environment variable, but Railway converts URL values to internal references which breaks plain text injection


## ADR-023: AES-256-GCM Encryption for Vault Passwords
Status: Accepted
Date: 2026-03-09
Context: Passwords stored in plain text in the database are a critical security risk.
Decision: Encrypt all vault passwords using AES-256-GCM before storing in PostgreSQL. The encryption key is derived from the master password using PBKDF2 at login time and embedded in the JWT.
Consequences:

Passwords in the database are unreadable without the master password
The encryption key never touches the database — it lives only in the JWT (24h expiry) and in memory during request processing
GCM mode provides authenticated encryption — tampering with ciphertext is detectable
A fresh random IV is generated per encryption operation — encrypting the same password twice produces different ciphertext
Existing plaintext data must be wiped and re-entered when encryption is first enabled


## ADR-024: Extract Utility Functions to utils/ folder
Status: Accepted
Date: 2026-03-17
Context: Encryption and authentication logic was duplicated inline in both routes/auth.js and routes/passwords.js, making it impossible to unit test without starting an Express server.
Decision: Extract all crypto and auth helpers into utils/crypto.js and utils/auth.js.
Consequences:
- Functions can be imported by any route handler
- Functions can be unit tested in isolation
- Single source of truth for PBKDF2 settings and AES-256-GCM implementation
- Routes become thinner and easier to read

---

## ADR-025: GitHub Actions CI/CD Pipeline
Status: Accepted
Date: 2026-03-17
Context: Without automated testing on every push, broken code could be merged to main and auto-deployed to production without anyone noticing.
Decision: Add a GitHub Actions workflow (.github/workflows/ci.yml) that runs npm test on every push and on every pull request.
Consequences:
- Tests run automatically — no manual step required
- Branch protection rule on main blocks merges if CI fails
- Broken code cannot reach main, and therefore cannot reach Railway or Vercel
- CI runs in GitHub's cloud — no local setup needed for contributors

---

## ADR-026: Branch Protection on main
Status: Accepted
Date: 2026-03-17
Context: CI results were informational only — a failing test did not prevent merging to main.
Decision: Enable GitHub branch protection rule requiring the "Run tests" CI job to pass before any PR can be merged to main.
Consequences:
- main is now a protected branch — direct pushes and failing merges are blocked
- Every change to production must go through a PR and pass CI
- Enables safe collaboration — contributors cannot accidentally break production

---

## ADR-027: AI Security Advisor Feature using Groq API
Status: Accepted
Date: 2026-03-17
Context: Adding an AI feature demonstrates LLM integration skills relevant to an engineering manager role. A password manager is a natural fit for a security-focused AI advisor.
Decision: Add a POST /api/ai/advise endpoint on the backend that calls the Groq API (LLaMA 3.3 70B model) with a crafted system prompt and password entry context. The frontend renders a chat-like slide-in panel per entry.
Consequences:
- API key lives on the backend only — never exposed to the browser
- The actual password value is never sent to the AI — only appName, url, username
- System prompt constrains AI to security topics only
- Groq free tier used — no credit card required
- Frontend uses suggestion chips to guide users toward useful questions

---

## ADR-028: Groq over Gemini for LLM Integration
Status: Accepted
Date: 2026-03-17
Context: Google Gemini API free tier returned quota errors (limit: 0) for Hungarian accounts — likely a regional restriction.
Decision: Switch to Groq API which provides genuinely free access to open source LLMs (LLaMA 3.3 70B) with no regional restrictions.
Consequences:
- Model is open source (Meta LLaMA) rather than proprietary
- Groq uses OpenAI-compatible API format (messages array, choices[0].message.content) — industry standard pattern
- Easy to swap to a different provider in future by changing the URL and model name

---

## ADR-029: myapp-backend excluded from myapp git tracking
Status: Accepted
Date: 2026-03-17
Context: myapp-backend/ is a nested git repo inside myapp/ with its own GitHub remote. The parent myapp repo was accidentally tracking backend files including node_modules.
Decision: Add myapp-backend/ to myapp/.gitignore and run git rm -r --cached myapp-backend/ to stop tracking backend files from the frontend repo.
Consequences:
- Each repo is now cleanly independent
- No risk of Windows node_modules binaries being committed via the parent repo
- Each repo deploys independently to its own service (Vercel / Railway)