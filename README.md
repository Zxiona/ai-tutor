# PyTutor 🐍

> An AI-assisted Python tutor with gamified mini-games, in-browser code execution, and intelligent feedback.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)](https://supabase.com)
[![Anthropic](https://img.shields.io/badge/AI-Claude-orange)](https://www.anthropic.com)

PyTutor is a final-year Software Engineering project (UWE Bristol, UFCFFF-30-3) that combines bite-sized Python lessons, an in-browser Python runtime, and an AI tutor that gives hints rather than answers. Progress is gamified through XP, levels, daily streaks, and a public leaderboard.

🔗 **Live demo:** [AI-Tutor-Website](https://ai-tutor-omega-gules.vercel.app)

---

## Why this exists

Programming is famously hard to start — the gap between "I want to learn Python" and "I know what to type next" is where most beginners give up. Existing platforms either dump you into long passive videos or punish you with cryptic compiler errors and no help. PyTutor sits in the middle: short focused lessons, instant code execution, and an AI tutor that points you in the right direction without solving the problem for you.

## Features

- **In-browser Python execution** via Pyodide (CPython compiled to WebAssembly) — no installs, no server-side sandboxing, runs at near-native speed.
- **AI tutor** powered by Claude (Anthropic) — gives Socratic hints rather than direct solutions.
- **8 progressive Python lessons** covering basics, functions, loops, lists, strings, and recursion.
- **Two mini-games:**
  - *Output Predictor* — read code, predict what it prints.
  - *Debug the Snippet* — find and fix the bug.
- **Gamification:** XP rewards, level system, daily streaks, top-20 leaderboard.
- **Auto-grading** — student output is normalised and compared to expected output.
- **Authentication** with email confirmation via Supabase Auth.
- **Three deployment environments** — local, preview (per-PR), production.
- **CI pipeline** running lint, typecheck, and unit tests on every push.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Single codebase for UI and API routes; current LTS |
| Styling | Tailwind CSS v4 | Industry standard; zero custom CSS needed |
| UI components | shadcn/ui | Code-owned components — no version lock-in |
| Icons | Lucide | Tree-shakable line icons designed for Tailwind |
| Animation | Motion (formerly Framer Motion) | 120fps Web Animations API engine |
| Code editor | Monaco Editor | The same editor VS Code uses |
| Python runtime | Pyodide 0.29 | CPython on WebAssembly, runs entirely client-side |
| Database & auth | Supabase (Postgres + Auth) | Free tier; row-level security |
| AI | Anthropic Claude (Haiku 4.5) | Stronger Socratic-tutoring behaviour than alternatives tested |
| Deployment | Vercel | Free preview deployments per PR |
| Unit tests | Vitest | Fast; native TypeScript; jsdom |
| E2E tests | Playwright | Cross-browser; works in CI |
| CI | GitHub Actions | Runs on every push to `main` and `dev` |

## Architecture

```
                ┌─────────────────────────────────────┐
                │  Browser (Next.js App Router)       │
                │  ┌───────────────┐  ┌────────────┐  │
                │  │ Monaco Editor │  │  Pyodide   │  │
                │  │ (user input)  │  │  (WASM)    │  │
                │  └───────────────┘  └────────────┘  │
                └────────┬─────────────────┬──────────┘
                         │                 │
                         │ /api/feedback   │ /api/submit
                         │ /api/games/*    │
                         ▼                 ▼
                ┌──────────────────────────────────┐
                │  Next.js API Routes (Edge/Node)  │
                └────────┬─────────────────┬───────┘
                         │                 │
                         ▼                 ▼
                ┌─────────────────┐  ┌─────────────────┐
                │  Anthropic API  │  │  Supabase       │
                │  (Claude)       │  │  (Postgres+Auth)│
                └─────────────────┘  └─────────────────┘
```

User code never leaves the browser — it executes in WebAssembly inside the user's tab. Only the *output* and the user's request for feedback are sent to the server.

## Project structure

```
ai-tutor/
├── app/
│   ├── api/
│   │   ├── feedback/route.ts     # Claude AI feedback endpoint
│   │   ├── submit/route.ts       # Auto-grading + XP + streak logic
│   │   └── games/award/route.ts  # Mini-game XP awards
│   ├── auth/                     # Login, signup, password reset
│   ├── dashboard/                # User stats, level, recent activity
│   ├── lessons/                  # Lessons list and detail pages
│   ├── games/                    # Predict and Debug mini-games
│   ├── leaderboard/              # Top 20 by XP
│   └── layout.tsx                # Root layout with sticky nav
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── code-editor.tsx           # Monaco wrapper
│   └── nav-link.tsx              # Animated active-page indicator
├── lib/
│   ├── pyodide-runner.ts         # Pyodide loader and runPython()
│   ├── xp.ts                     # Level calculation
│   └── supabase/                 # Server and browser clients
├── tests/                        # Playwright E2E tests
├── lib/__tests__/                # Vitest unit tests
└── .github/workflows/ci.yml      # Lint + typecheck + tests
```

## Database schema

```
profiles                   lessons                  attempts
─────────                  ─────────                ─────────
id (uuid, FK auth.users)   id                       id
username                   slug                     user_id (FK)
xp                         title                    lesson_id (FK)
current_streak             difficulty               code
longest_streak             topic                    passed
last_active_date           prompt                   ai_feedback
                           starter_code             created_at
                           expected_output
                           xp_reward

game_challenges
─────────────────
id
game_type (predict|debug)
difficulty
code | broken_code
expected_output
xp_reward
```

Row-level security policies ensure users can only read/write their own attempts and profile, while lessons and challenges are world-readable.

## Running locally

### Prerequisites

- Node.js 20+
- A Supabase project ([sign up free](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Setup

```bash
# Clone and install
git clone https://github.com/your-username/ai-tutor.git
cd ai-tutor
npm install

# Set up environment variables
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
ANTHROPIC_API_KEY=sk-ant-...
```

Run the SQL migration scripts in `db/schema.sql` against your Supabase project (via the SQL Editor in the dashboard) to create the tables and seed the lessons.

### Develop

```bash
npm run dev          # Starts dev server at localhost:3000
npm test             # Runs Vitest unit tests
npx playwright test  # Runs Playwright E2E tests (requires npm run dev in another terminal)
npm run build        # Production build
```

## Deployment

The project deploys to Vercel automatically:

- Pushes to `main` → production.
- Pushes to any other branch → preview deployment with its own URL.

Required environment variables on Vercel: the same three from `.env.local`. Once Supabase Auth is configured, add the production URL to **Auth → URL Configuration** in the Supabase dashboard so confirmation emails redirect correctly.

## Testing strategy

- **Unit tests** (Vitest) cover deterministic logic like XP-to-level conversion. Each test references a requirement ID (e.g. `[REQ-XP-01]`) for traceability back to the requirements specification.
- **End-to-end tests** (Playwright) cover critical user flows: signup, lesson submission, leaderboard view.
- **CI** runs all of the above on every push and PR via GitHub Actions.

## Academic context

This project was developed for **UFCFFF-30-3 Computer Science Project** at the University of the West of England, Bristol (2025/26 academic year). It is assessed as two deliverables: a 6,000-word technical report and a 20-minute video demonstration plus degree-show poster.

The project is supervised by Sami Abuezhayeh, with Steve Battle as module leader.

### Mapping to assessment criteria

- **Deployed application with evidence of a user-base** — Live on Vercel; sign-ups tracked in Supabase profiles table.
- **Different environments for development, testing, and production** — Local (`npm run dev`), Vercel preview (per branch), Vercel production (main).
- **Configuration management** — Conventional Commits on `main`/`dev` branches; CI status checks; environment-specific secrets via Vercel.
- **Thorough testing with traceability** — Each test references a requirement ID; CI enforces tests pass.
- **Analysis of technology options and risks** — Pyodide vs. server-side Piston (chose Pyodide for sandboxing/cost); Anthropic vs. Gemini (chose Claude for tutoring quality); Next.js App Router vs. separate backend (chose monorepo for delivery speed).

## Privacy and data

- User code is executed entirely in the browser via WebAssembly — it is not transmitted to any server.
- The user's *request for AI feedback* sends the code, problem prompt, and program output to Anthropic's API for the duration of one request. Anthropic does not retain this data for training under their consumer terms.
- User accounts store only an email, a derived username, XP totals, and streaks. No personal data beyond what is required for authentication.
- Cookies are limited to authentication session tokens issued by Supabase.

## Licence

MIT — see [LICENSE](LICENSE).

This project was built as part of an undergraduate dissertation. Code is provided for academic and educational reference. Lesson content is original.

## Acknowledgements

- **Pyodide team** for porting CPython to WebAssembly.
- **shadcn** for the component-ownership philosophy that powers the UI layer.
- **Anthropic** for the Claude API and free student credits.
- **Supabase** for the open-source Firebase alternative.
- **Sami Abuezhayeh** (project supervisor) and **Steve Battle** (module leader) for guidance throughout the project.
