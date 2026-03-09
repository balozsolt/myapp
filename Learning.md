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