# Learning Journal

A personal, plain-English record of concepts encountered while building this project.
Updated as new things are learned. Written for an engineering manager building product intuition.

---

## React & TypeScript basics

### What is a React component?
A component is a function that returns a piece of UI. Think of it like a reusable LEGO brick — you build small pieces (a menu, a table row, a button) and snap them together to make a full screen. Each component owns its own file, styles, and logic.
It handles rendering, state, events, and the component tree.

### What is JSX?
JSX is the HTML-like syntax you write inside React components. It looks like HTML but it's actually JavaScript under the hood. React converts it into real browser elements when the app runs.

### What is TypeScript?
TypeScript is JavaScript with rules. You tell it what shape your data has (e.g. "a password entry always has a name, URL, username, and password"), and it warns you immediately if you break those rules — before the app even runs.
TypeScript catches mistakes before the code runs.

Example:
In JavaScript, you can accidentally treat a number like a string.
In TypeScript, the compiler warns you immediately.

### What is a TypeScript interface?
An interface is like a contract or template for your data. If you define a `PasswordEntry` interface with four required fields, TypeScript will refuse to compile if you try to create a password entry with a field missing. It's the same as a mandatory data schema.

### What is `useState`?
`useState` is React's way of giving a component memory. For example, `const [isVisible, setIsVisible] = useState(false)` creates a variable `isVisible` that starts as `false`, and a function `setIsVisible` to change it. When the value changes, React automatically re-renders the UI to reflect the new state.

### What is `useEffect`?
`useEffect` is React's way of running code *after* the page renders, like fetching data from an API. Without it, the API call would block the page from appearing at all. It's the hook you use whenever you want to "do something when the component loads."

---

## How the app is structured

### What is a "module"?
In TypeScript/JavaScript, a module is any file that uses `import` or `export`. Files without these are treated as global scripts, which can cause conflicts. Every `.tsx` file must have at least one import or export — enforced by the `isolatedModules` TypeScript setting.

### What is routing?
Routing is the system that decides which page to show based on the URL. When a user clicks "All Items", React Router swaps the visible component without reloading the browser — making the app feel fast like a native application.

### What is a service layer?
A service layer is a dedicated file (like `api.ts` or `hibp.ts`) that handles all communication with the outside world — APIs, databases, etc. Components call the service instead of making raw HTTP requests themselves. If the API URL changes, you update it in one place only.

### What is a single source of truth?
When multiple screens need the same data, keeping it in one shared file (like `passwordData.ts`) means you only update it once. Duplicating data in multiple places leads to inconsistencies — a concept engineers call "drift."

---

## Security concepts

### Hashing vs Encryption
Hashing is one-way: you can never get the original value back, only verify that something matches the hash. Encryption is two-way: you can get the original back with the right key. Password managers use both — hashing for login passwords (never need the original), encryption for stored vault passwords (need to retrieve and use them).

### What is PBKDF2?
PBKDF2 (Password-Based Key Derivation Function 2) is a hashing algorithm designed specifically for passwords. It deliberately runs slowly (thousands of iterations) to make brute-force attacks expensive. Used for master login passwords.

### What is AES-256?
AES-256 (Advanced Encryption Standard, 256-bit key) is the gold standard for symmetric encryption — the same algorithm used by governments and banks. "Symmetric" means the same key is used to encrypt and decrypt. Used for storing vault passwords so they can be retrieved later.

### What is k-anonymity?
A privacy technique used by the HIBP Pwned Passwords API. Instead of sending your full password to the API (which would be dangerous), you send only the first 5 characters of its SHA-1 hash. The API returns all matching hashes back, and your app checks locally if the full hash is in the list. Your real password never leaves your device.

### What is SHA-1?
SHA-1 is a hashing algorithm that converts any input into a fixed-length 40-character string. It's a one-way process — you can't reverse it. Used in the HIBP k-anonymity flow to avoid sending real passwords over the network.

---

## Backend & API concepts

### What is a REST API?
A standard way for two programs to talk to each other over HTTP. Each "endpoint" is a URL that does one specific thing: GET fetches data, POST creates something new, PUT updates something, DELETE removes it. This pattern is used by virtually every web service.

### What is Express?
Express is a minimal Node.js framework that makes it easy to define HTTP endpoints. Think of it as the routing layer of the backend — the same concept as React Router but for the server side.

### What is SQLite?
SQLite is a database that stores everything in a single file on your computer (`passwords.db`). Unlike PostgreSQL or MySQL, it needs no installation or running server — it's just a file your app reads and writes to. Perfect for local development.

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests between different origins (domains or ports) by default. When React on `:3000` calls the backend on `:3001`, the browser considers this cross-origin and blocks it unless the backend explicitly says "requests from `:3000` are allowed."

### What is a callback in Node.js?
Because Node.js is asynchronous, many operations (like database queries) don't return a value immediately — instead you pass a function (a "callback") that gets called when the result is ready. For example: `db.get("SELECT...", [], (err, row) => { /* use row here */ })`.

### What is a native module?
Some npm packages (like `better-sqlite3`) contain C++ code that must be compiled specifically for your machine during `npm install`. This requires build tools like Python and Visual Studio. Packages with pre-built binaries (like `sqlite3`) skip this step and work out of the box on Windows.

### What is nodemon?
A development tool that automatically restarts the Node.js server whenever you save a file change. Without it, you'd have to manually stop and restart the server after every code change.

---

## Errors encountered & what they meant

### `TS1208: cannot be compiled under --isolatedModules`
A TypeScript file has no `import` or `export` statement, so TypeScript treats it as a global script. Fix: add `import React from "react"` at the top and `export default` at the bottom of every component file.

### `'rm' is not recognized`
Linux/Mac terminal command that doesn't work on Windows. Use `rmdir /s /q` in Command Prompt or `Remove-Item -Recurse -Force` in PowerShell.

### `gyp ERR! find Python — Could not find any Python installation`
`better-sqlite3` tried to compile native C++ code and couldn't find Python to do it. Fixed by switching to `sqlite3` which ships with pre-built Windows binaries.

### `Cannot find module './routes/passwords'`
Node.js couldn't find the `routes/passwords.js` file because the `routes/` folder hadn't been created yet. Fix: create the folder and file manually in VS Code.

### `'logo' is defined but never used`
A TypeScript/ESLint warning saying an imported variable is never used in the code. Fix: delete the unused import line.

---

## Tools & environment

### What is npm?
Node Package Manager — the tool used to install JavaScript libraries and run project scripts. `npm install` downloads all dependencies listed in `package.json`. `npm start` runs the app.

### What is `package.json`?
The configuration file for a Node.js project. It lists the project name, scripts (like `start` and `dev`), and all dependencies with their version numbers. Think of it as the project's manifest or bill of materials.

### What is VS Code?
The code editor used in this project. Key shortcuts:
- `` Ctrl + ` `` — open the terminal
- `Ctrl + Shift + S` — save all open files
- `Ctrl + Shift + X` — open the extensions panel
- `Ctrl + S` — save current file

### What is `localhost`?
When you run `npm start`, the app runs on your own computer at `localhost` — not on the internet. `localhost:3000` is the React app, `localhost:3001` is the Node backend. Only you can see them during development.

### What is a port?
A port is like a specific "door" on your computer that a program listens on. Two programs can run on the same machine but must use different ports — React uses 3000, the backend uses 3001.

### DB browser - debugging?
DB Browser is a debugging and inspection tool — useful for verifying data looks correct, but not a substitute for the API. Real data changes should always go through the API so validation rules are enforced consistently.

### Postman
Postman is a tool for manually testing REST APIs without needing a UI. It lets you send any HTTP request (GET, POST, PUT, DELETE) and inspect the response — essential for verifying the backend works correctly before building frontend forms.

### JWT logout
JWT logout works by deleting the token from the client — the backend is stateless and has no record of active sessions. The token technically remains valid until expiry, which is why short expiry times (24h or less) and HTTPS matter in production

LEARNING.md additions for this session

## What is Docker?
Docker lets you run software (like a database) inside an isolated container on your machine — without installing it directly on Windows. Think of a container like a lightweight virtual machine that contains everything the software needs to run. You start it with one command, stop it with one command, and it never interferes with anything else on your computer.

## What is docker-compose?
A tool that lets you define and run one or more containers using a single docker-compose.yml config file. Instead of remembering a long docker run command with all its options, you just run docker-compose up -d and it handles everything. The -d flag means "detached" — runs in the background so your terminal stays free.

## What is a connection pool?
SQLite opened one connection to a file. PostgreSQL uses a pool — a set of pre-opened connections (typically 10) kept ready for incoming requests. When a request arrives, it grabs a free connection, uses it, and returns it to the pool. This means multiple requests can hit the database simultaneously without queuing up behind each other.

## PostgreSQL vs SQLite query syntax
SQLite uses ? for query parameters: WHERE id = ?. PostgreSQL uses numbered parameters: WHERE id = $1, $2. The numbers matter because PostgreSQL lets you reuse the same parameter multiple times in one query.

## RETURNING * in PostgreSQL
After an INSERT or UPDATE, PostgreSQL can return the affected row in the same query using RETURNING *. SQLite couldn't do this — it required a separate SELECT query afterwards to fetch what was just created.

## When to run npm install
npm install downloads all packages listed in package.json into node_modules. You need to re-run it whenever package.json changes — for example when a new package is added. You do NOT need to re-run it when you change .js or .ts files. The node_modules folder is never committed to Git because it can be hundreds of megabytes — package.json acts as the recipe to recreate it.

## Controlled forms in React 
In React each input's value is bound to a state variable and updates via onChange. This means React always owns the form data, making it easy to pre-fill fields (like the Edit panel) or reset them programmatically when the panel opens.

## AES-256-GCM — a symmetric encryption algorithm. 
"Symmetric" means the same key encrypts and decrypts. "GCM" (Galois/Counter Mode) adds authentication — it can detect if the ciphertext was tampered with. The stored format is iv:authTag:ciphertext where IV is a random value generated fresh for every encryption operation.

## Why a fresh IV every time?
 Encrypting the same password twice produces different ciphertext each time because of the random IV. This prevents attackers from noticing that two entries share the same password.Why the key is in the JWT and not the DB — storing the encryption key in the same database as the encrypted data would be like leaving the key under the doormat. The JWT carries the key in memory only, derived fresh at every login from the master password.

## Deployment, Infrastructure & DevOps Concepts

---

### The Big Picture — How Everything Connects

```
Your Code (laptop)
      ↓  git push
GitHub (source of truth)
      ↓  auto-deploy trigger
   ┌──┴──┐
Vercel  Railway
(frontend) (backend + DB)
      ↓        ↓
   Browser → API calls
```

Your laptop is only for development. Once code is pushed to GitHub, everything runs in the cloud automatically. You never manually copy files to a server.

---

### Docker

Docker lets you run software inside isolated containers without installing it directly on Windows. Think of a container like a lightweight virtual machine that contains everything the software needs to run. You start it with one command, stop it with one command, and it never interferes with anything else on your computer.

**docker-compose** is a tool that lets you define and run one or more containers using a single `docker-compose.yml` config file. Instead of remembering a long `docker run` command with all its options, you just run `docker-compose up -d` and it handles everything. The `-d` flag means "detached" — runs in the background so your terminal stays free.

**Volumes** are persistent storage attached to containers. Containers themselves are ephemeral — when you destroy one, all data inside is lost. Volumes survive container restarts and laptop reboots. `docker-compose down` stops the container but keeps the volume. `docker-compose down -v` is a deliberate nuclear option that destroys both — only use it when you want to wipe everything (like when we needed to clear plaintext passwords before adding encryption). In production on Railway, the database is a fully hosted service with its own persistent storage — you would have to deliberately delete the Railway PostgreSQL service to lose data.

---

### Environment Variables

Key-value pairs that configure your app differently depending on where it runs. The same code runs in three places — your laptop, Railway, Vercel — and each needs different configuration:

```
Laptop:   API_URL = http://localhost:3001
Vercel:   API_URL = https://myapp-backend-production-e91a.up.railway.app
Railway:  DATABASE_URL = postgresql://postgres:xxx@postgres.railway.internal/railway
```

**The .env file family:**
- `.env` — local defaults, never committed to git (contains secrets)
- `.env.production` — production values, safe to commit if no secrets
- `.env.local` — personal overrides, never committed

**Why React env vars are special:** Node.js reads `process.env` at runtime. React reads it at build time — Webpack replaces `process.env.REACT_APP_API_URL` with the actual value when `npm run build` runs. After that the value is baked into the JS bundle forever. This is why redeploying Vercel is required every time the variable changes — and why Login.tsx was still calling localhost:3001 even after the variable was set correctly in the Vercel dashboard.

**Only `REACT_APP_` prefixed variables work in React.** This is a Create React App security feature — it prevents accidentally exposing server-side secrets to the browser.

---

### CORS (Cross-Origin Resource Sharing)

A browser security mechanism that blocks requests from one domain to another unless the server explicitly allows it. It is NOT about encryption — that is handled by SSL/TLS (the S in HTTPS).

**SSL/TLS vs CORS:**
- SSL/TLS = encryption — makes data unreadable in transit (the locked door)
- CORS = access control — decides which websites can talk to your API (the bouncer checking the guest list)
Both are needed and solve different problems.

**How CORS works in our app:**
```
Browser on myapp-tau-tan.vercel.app
  → sends request to myapp-backend-production-e91a.up.railway.app
  → browser first checks: does the server allow this origin?
  → server responds with Access-Control-Allow-Origin header
  → if origin matches → request goes through
  → if origin doesn't match → browser blocks it (CORS error)
```

Note: CORS is enforced by the browser, not the server. Tools like Postman and curl are not browsers and ignore CORS entirely — this is why API calls work in Postman but fail in the browser.

---

### Vercel (Frontend Hosting)

Takes your React source code, runs `npm run build`, and serves the resulting static files (HTML, CSS, JS) globally via CDN (Content Delivery Network — a network of servers around the world so users get files from the nearest server).

**How deployment works:**
1. You push to GitHub
2. Vercel detects the push via a webhook
3. Vercel clones your repo and runs `npm run build`
4. Environment variables are injected during the build
5. Built files are distributed to the CDN
6. Your URL now serves the new version

**Why the bundle hash matters:** React builds produce files like `main.54b9a70e.js` — the hash changes when content changes. This forces browsers to download the new version instead of using a cached old one.

---

### Railway (Backend Hosting)

Runs your Node.js server as a container in the cloud 24/7, and provides managed PostgreSQL.

**How deployment works:**
1. You push to GitHub
2. Railway detects the push
3. Railway builds a Docker image from your code using Railpack
4. The container starts and runs `npm start`
5. Railway exposes it at your public URL

**Internal vs public URLs:**
- `myapp-backend.railway.internal` — only accessible from inside Railway's network
- `myapp-backend-production-e91a.up.railway.app` — publicly accessible from anywhere

**The port rule:** Railway dynamically assigns a port via `process.env.PORT`. Your app must listen on that port with `const PORT = process.env.PORT || 3001`. Railway's networking then forwards public traffic to that port. Mismatch = 502 Bad Gateway on every request.

**DATABASE_URL:** Railway automatically injects this when you link a PostgreSQL service. It contains host, port, username, password, and database name in one string. Our db.js checks for this first before falling back to individual local variables.

**Free tier cold starts:** Railway's free tier spins down after inactivity and takes ~30 seconds to wake up on the first request. This is normal behaviour on free hosting.

---

### Production Debugging — Why It Takes Time

Production has multiple layers that all need to be correct simultaneously:

```
1. Code is correct locally
2. Code is committed to git
3. Code is pushed to GitHub
4. CI/CD picks up the push
5. Build succeeds
6. Environment variables are set
7. Environment variables are injected at build time
8. Server starts correctly
9. Server listens on the right port
10. CORS allows the right origins
```

If any one of these fails, the app doesn't work. In our deployment session we had issues at steps 6, 7, 9, and 10 — all at the same time. Each fix revealed the next problem underneath. This is completely normal. The difference between a junior and senior developer is pattern recognition — knowing which layer to check first.

**Lessons from our specific bugs:**
- Hardcoded localhost URLs in Login.tsx and Register.tsx bypassed the env variable in api.ts entirely
- The CORS fix in server.js was never pushed to GitHub so Railway kept running old code
- node_modules committed to git caused Railway to deploy Windows binaries on Linux — always add node_modules/ to .gitignore
- Railway's port setting was 3001 but the app listened on 8080 (process.env.PORT) — causing 502 on every request

---

### git rm --cached

Once a file is tracked by git, adding it to .gitignore does not stop tracking it. You need `git rm --cached <file>` to tell git "stop tracking this file" without deleting it from disk. This is what we used to remove node_modules from git tracking after it was accidentally committed.

## CI/CD and GitHub Actions

### What is CI (Continuous Integration)?
CI is the practice of automatically running tests every time code is pushed to a shared repository. The goal is to catch broken code before it reaches the main branch. In our setup, GitHub Actions runs `npm test` on every push and pull request.

### What is CD (Continuous Deployment)?
CD is the automatic deployment of code once it passes CI. In our setup, Vercel and Railway both watch the main branch — when a commit lands there, they deploy automatically. CI and CD together form a pipeline: test → merge → deploy, all without manual steps.

### What is GitHub Actions?
GitHub's built-in CI/CD platform. You define workflows in YAML files inside `.github/workflows/`. Each workflow has triggers (on push, on PR), jobs (groups of steps), and steps (individual commands). Workflows run in GitHub's cloud — no server needed.

### What is branch protection?
A GitHub setting that enforces rules before code can merge to a branch. In our case, the "Run tests" CI job must pass before any PR can merge to main. Without this, CI results are just informational — the merge button works regardless. With branch protection, broken code is physically blocked from reaching production.

### Why CI effectively protects CD too
In our setup, Railway and Vercel don't run tests themselves — they just deploy whatever lands on main. The protection comes from CI blocking bad merges:
```
broken code → CI fails → merge blocked → main unchanged → no deploy triggered
```
This means CI is the real gate for both integration AND deployment.

---

## AI / LLM Integration Concepts

### What is a system prompt?
A system prompt is an instruction given to an LLM before the user's first message. It sets the AI's role, constraints, and tone for the entire conversation. In our app, the system prompt tells the AI it's a security advisor, provides the account context (app name, URL, username), and instructs it to never ask for or reference the actual password. This is a core prompt engineering technique.

### What is prompt engineering?
The practice of designing inputs to an LLM to reliably produce the desired output. Key techniques include: defining a clear role in the system prompt, injecting relevant context, constraining scope ("only answer security questions"), and controlling output format ("keep responses to 3-5 sentences"). This is the same work that AI agent teams do professionally — the scale and complexity differ, but the concepts are identical.

### What is an AI agent?
An AI agent is an LLM with access to tools (APIs, databases, search engines) that it can call to complete a task. Our implementation is a simple single-turn advisor — one question, one answer. A full agent would maintain conversation history, decide which tools to call, and chain multiple LLM calls together to complete complex tasks.

### Why the API key lives on the backend
If the Groq API key were included in the React frontend, it would be visible in the browser's source code to anyone who inspects the page. By routing all AI calls through the backend (`POST /api/ai/advise`), the key stays server-side only. This is the correct pattern for any third-party API key.

### What context do we pass to the AI — and what we don't
We pass: appName, url, username — enough for the AI to give relevant advice.
We never pass: the actual password. Sending vault passwords to a third-party API would be a serious security breach. The system prompt also explicitly instructs the AI never to ask for it.

### OpenAI-compatible API format
Most modern LLM APIs (Groq, OpenAI, many others) use the same request/response format:
- Request: `{ model, messages: [{role: "system", content: "..."}, {role: "user", content: "..."}] }`
- Response: `data.choices[0].message.content`
Learning this format once means you can switch between providers by changing the URL and model name only.

### What is Groq?
Groq is an AI infrastructure company that runs open source models (like Meta's LLaMA) at very high speed using custom hardware. Their free tier provides access to LLaMA 3.3 70B — a capable open source model. The API is OpenAI-compatible, making it easy to integrate.