# MyApp — Password Manager

A personal password manager web application built with React, TypeScript, Node.js, and SQLite.
Passwords are checked against the Have I Been Pwned database to detect breaches in real time.

---

## What this app does

- View all saved passwords in a table with show/hide and copy features
- Breach detection badge per password (via HIBP Pwned Passwords API)
- Security Dashboard with a score meter and per-password status visualization
- Passwords stored in a local SQLite database via a REST API backend
- Help page (placeholder, coming soon)

---

## Project structure

```
C:\Users\Zsolti\
├── myapp\                          React frontend (runs on :3000)
│   └── src\
│       ├── components\
│       │   └── SideMenu\           Navigation sidebar
│       ├── data\
│       │   └── passwordData.ts     Legacy hardcoded data (to be removed in Phase II)
│       ├── pages\
│       │   ├── AllItems\           Password table view with breach badges
│       │   ├── SecurityDashboard\  Score meter and breach visualization
│       │   └── Help\               Help page (placeholder)
│       ├── services\
│       │   ├── api.ts              All HTTP calls to the backend
│       │   └── hibp.ts             Have I Been Pwned API integration
│       ├── App.tsx                 Root component and routing
│       └── index.tsx               App entry point
│
└── myapp-backend\                  Node.js backend (runs on :3001)
    ├── routes\
    │   └── passwords.js            REST API endpoints
    ├── server.js                   Express server entry point
    ├── db.js                       SQLite connection and table setup
    ├── passwords.db                SQLite database file (auto-created)
    └── package.json
```

---

## Requirements

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

---

## How to run the app

You need **two terminals open at the same time** — one for the frontend, one for the backend.

### Terminal 1 — Start the backend
```cmd
cd C:\Users\Zsolti\myapp-backend
npm start
```
Backend runs at `http://localhost:3001`
Health check: `http://localhost:3001/health`

### Terminal 2 — Start the frontend
```cmd
cd C:\Users\Zsolti\myapp
npm start
```
App opens automatically at `http://localhost:3000`

---

## API endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/passwords` | Fetch all passwords |
| POST | `/api/passwords` | Add a new password |
| PUT | `/api/passwords/:id` | Update a password |
| DELETE | `/api/passwords/:id` | Delete a password |
| GET | `/health` | Check if the server is running |

---

## Roadmap

- [x] Phase I — Frontend with hardcoded data
- [x] Phase I — HIBP breach detection
- [x] Phase I — REST API backend with SQLite
- [ ] Phase II — AES-256 encryption for stored passwords
- [ ] Phase II — PBKDF2 master password hashing
- [ ] Phase III — Add / Edit / Delete UI for passwords