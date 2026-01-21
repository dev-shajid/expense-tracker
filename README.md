# Expense Tracker

A modern, mobile‑friendly expense tracking app built with Next.js 16 (App Router), Firebase (Auth + Firestore), and TanStack Query. Track incomes and expenses, manage group budgets, record give/take settlements, organize workspaces, and view real‑time stats. Includes PWA install support and a native‑style bottom navigation on mobile.

## Features

- **Google Sign‑in** via Firebase Auth
- **Organizations**: Personal workspace is auto‑created (one per user). Create, rename, delete non‑personal workspaces
- **Expenses & Income**: Add, edit, delete, and group expenses
- **Groups**: Create budget groups; view group details and transactions
- **Give/Take**: Record lends/borrows with statuses and partial settlements
- **Overview Cards**: Real‑time stats for balance, income, expenses, pending give/take
- **Responsive UI**: Native bottom nav on mobile, dock menu with tooltips on desktop
- **Dark/Light Theme** toggle
- **PWA Install Prompt** for “Add to Home Screen” on supported devices

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript, React
- TanStack Query (React Query)
- Firebase Auth (client) + Firestore (via Firebase Admin SDK in server actions)
- shadcn/ui, Lucide Icons, next‑themes
- date‑fns

## Project Structure

Key folders/files:

- `src/app/(auth)/login` – Login page (Google sign‑in)
- `src/app/(dashboard)` – Dashboard and sections: expenses, groups, give‑take
- `src/components` – UI components (dock menu, dialogs, overview cards, etc.)
- `src/contexts` – `AuthContext`, `OrganizationContext`, QueryProvider
- `src/services` – React Query hooks for expenses, groups, give‑take, organizations, stats
- `src/lib/firebase` – Client (`config.ts`) and Admin (`admin.ts`) setup
- `src/types` – TypeScript models

## Requirements

- Node.js 18+
- pnpm (recommended)
- A Firebase project with:
	- Authentication (Google provider enabled)
	- Cloud Firestore
	- A Service Account (for Admin SDK)

## Environment Variables

Create a `.env.local` in the project root with the following keys.

Client (public) Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Server (Admin SDK) credentials:

```
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
# IMPORTANT: when pasting JSON private key, replace \n with actual newlines or set like below
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"
```

Tip: You can copy values from a downloaded Service Account JSON and map them to the envs above. The private key must preserve newlines (`\n` → real newlines) at runtime; this repo already converts them in `admin.ts`.

## Install & Run

```bash
# install deps
pnpm install

# start dev server
pnpm dev

# open the app
open http://localhost:3000
```

## Build

```bash
pnpm build
pnpm start
```

## Data Model

Collections and fields (see `src/types/index.ts`):

- `organizations`: `{ id, name, currency, ownerId, isPersonal?, createdAt? }`
- `expenses`: `{ id, amount, category, date, notes?, organizationId, type, groupId? }`
- `groups`: `{ id, title, description?, startDate, endDate?, totalAmount, organizationId }`
- `give_takes`: `{ id, personName, amount, type, dueDate?, status, notes?, organizationId, createdAt, settledAmount }`
- Aggregated `stats`: `{ currentBalance, totalIncome, totalExpense, pendingToGive, pendingToTake }`

## Notable Behaviors

- A single **Personal** organization is auto‑created for each user if none exists. It cannot be deleted or renamed
- All mutations (expense, give/take, groups, organizations) **invalidate related queries** so Overview stats stay fresh
- Mobile shows a native‑style bottom nav with labels; desktop shows a magnified dock with tooltips
- PWA install prompt is displayed when supported (`src/components/InstallPrompt.tsx`)

## Development Notes

- This app uses **Server Actions** for Firestore writes via the Admin SDK and **TanStack Query** for reads
- Components that use browser‑only hooks (e.g., `useTheme`, `useSearchParams`) run on the client. Where needed, we use dynamic import (`ssr: false`) and Suspense boundaries
- Next.js `cacheComponents` is disabled in `next.config.ts` to avoid conflicts with dynamic contexts

## Deployment

1. Push the repo to GitHub
2. Create a new project on Vercel and import the repo
3. Add the environment variables from `.env.local` in Vercel’s dashboard
4. Set Firebase Authorized Domains to include your Vercel URLs
5. Deploy – Vercel will run `pnpm build` automatically

## Troubleshooting

- Auth or Firestore errors: verify all Firebase env variables are present and correct
- PWA prompt not showing: ensure `manifest.webmanifest` is served and site is visited over HTTPS
- Build errors about SSR: confirm components using client‑only hooks have `'use client'` and/or are dynamically imported
- Multiple lockfile warning: ensure the project root has a single lockfile and set `turbopack.root` if needed

## License

MIT
