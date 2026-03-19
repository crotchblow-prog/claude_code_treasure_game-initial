# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:3000 (auto-opens browser)
npm run build     # Build for production (output: build/)
```

No lint or test commands are configured.

## Architecture

This is a React 18 + TypeScript single-page app built with Vite. The entire game logic lives in [src/App.tsx](src/App.tsx).

**Game logic (`src/App.tsx`):**
- 5 `Box` objects (`{ id, isOpen, hasTreasure }`) stored in state
- `initializeGame()` randomly assigns **1 or 2 treasures** (50/50) across the 5 boxes — outcomes: 1 treasure → -$100 (Lose), 2 treasures → +$50 (Win)
- `openBox(id)` reveals a box, plays audio, updates score (+$100 treasure / -$50 skeleton); game ends only when **all 5 boxes are opened** (no early termination)
- When `gameEnded` triggers and a user is logged in, `saveGameResult(score)` is called once via a ref guard

**Auth system (`src/context/AuthContext.tsx`, `src/components/AuthPage.tsx`):**
- `AuthProvider` wraps the app; session persisted in `localStorage` under key `treasure_session`
- Passwords are SHA-256 hashed client-side via `crypto.subtle` before storage
- `useAuth()` exposes `currentUser`, `userStats`, `register`, `login`, `logout`, `saveGameResult`, `refreshStats`
- `AuthPage` is a modal (overlay) with login/register tabs

**Database (`src/db/database.ts`):**
- Uses [sql.js](https://sql.js.org/) (SQLite compiled to WASM) — requires `public/sql-wasm.wasm` to be served at root
- DB is serialized to base64 and persisted in `localStorage` under key `treasure_db`
- `users` table: `id, username, password_hash, total_score, games_played, best_score`
- Key exports: `initDb()` (called in `src/main.tsx` before rendering), `runQuery()`, `getRows<T>()`, `saveDb()`

**Animations:** Framer Motion (`motion/react`) drives the 3D flip on chest open and the emoji/score reveal animations.

**UI components:** `src/components/ui/` contains 40+ Radix UI wrappers (shadcn/ui pattern). Only `Button` is used by the game currently — the rest are available for future features.

**Path alias:** `@/` resolves to `src/` (configured in `vite.config.ts`).

**Assets:**
- `src/assets/` — chest images (`treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`)
- `src/audios/` — `chest_open.mp3` (treasure) and `chest_open_with_evil_laugh.mp3` (skeleton), played via `new Audio(...).play()` in `openBox`
- `src/results/key_hover.png` — cursor hover asset (not yet used)

**Styling:** Tailwind CSS with amber/orange color palette. Global styles split between `src/index.css` (Tailwind base + utilities) and `src/styles/globals.css`.
