Architecture Decisions
This document captures the key technology choices made in this project and the reasoning behind each one.

Frontend Framework — React
Decision: Use React as the UI framework.
Why: React lets us break the UI into small, self-contained pieces called components (e.g. SideMenu, AllItems), so each screen can be built and maintained independently without affecting the others — similar to how a well-structured team owns separate parts of a product.

Language — TypeScript
Decision: Use TypeScript instead of plain JavaScript.
Why: TypeScript catches mistakes while you're writing code, before the app even runs — like spell-check but for code logic. It forces every piece of data to have a clearly defined shape, which prevents entire categories of bugs.

Routing — React Router
Decision: Use React Router for navigation between pages.
Why: React Router makes clicking menu items change the visible page without reloading the browser, making the app feel fast and native — like a real application rather than a traditional website.

Styling — Per-component CSS files
Decision: Each component has its own .css file (e.g. SideMenu.css, AllItems.css).
Why: Keeping styles alongside the component they belong to means changes to one screen can't accidentally break the look of another — the same principle as keeping each team's work in separate lanes.

State Management — React useState
Decision: Use React's built-in useState hook for local component state.
Why: useState is React's way of remembering things while the app is running (e.g. "is this password currently visible?"). It's the simplest tool for the job and avoids introducing a heavier state management library before it's needed.

Data — Hardcoded (for now)
Decision: Start with hardcoded dummy data in the frontend before building a backend.
Why: Building the UI first with fake data lets us see, click through, and validate the full experience before investing in databases and APIs — reducing wasted effort if the design needs to change.

Clipboard — navigator.clipboard API
Decision: Use the browser's built-in navigator.clipboard API for copy buttons.
Why: This is a secure, built-in browser feature that writes text to the user's clipboard without any extra libraries — it works on localhost and on https production deployments.

TypeScript interfaces
Decision: Define a TypeScript interface for each data shape (e.g. PasswordEntry).
Why: An interface acts like a mandatory template — TypeScript will immediately warn us if we forget a required field like username or password, catching data structure bugs before they cause runtime errors.

HIBP Pwned Passwords API chosen over Breached Account API because it is free, requires no API key, and checks password exposure rather than email exposure

AES-256 chosen for vault password encryption because it is reversible (passwords need to be retrieved). PBKDF2 chosen for master login password because it is one-way (we only ever need to verify it, never retrieve it).

