# 💰 Daily Expense Tracker - Modern Financial Management

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A robust, enterprise-ready Daily Expense Tracker built with **Next.js 16**, **TypeScript**, and **Firebase**. This Progressive Web App (PWA) is designed to help users and organizations effortlessly monitor their finances, manage group expenses, and track personal debts with real-time synchronization.

---

## ✨ Key Features

- **📊 Comprehensive Dashboard**: Real-time overview of income, expenses, and current balances with interactive charts.
- **👥 Group Expense Splitting**: Create groups, invite members, and split bills seamlessly.
- **💸 Give & Take Management**: Track debts and credits with detailed logs of who owes whom.
- **🏢 Organization-Based Architecture**: Supports multi-tenancy models for managing different financial contexts (e.g., Personal vs. Business).
- **📱 PWA Ready**: Installable on mobile and desktop for a native-like experience with offline capabilities.
- **⚡ Real-time Updates**: Powered by TanStack Query and Firebase for instant data reflection across devices.
- **🎨 Modern UI/UX**: Built with Shaden UI, Radix UI, and Motion (Framer Motion) for beautiful, fluid transitions and dark mode support.

---

## 🛠️ Built With

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod Validation](https://zod.dev/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

---

## 📂 Project Structure

```bash
src/
├── app/                 # Next.js App Router (Layouts, Pages, Server Actions)
│   ├── (auth)/          # Authentication routes (Login, Signup)
│   ├── (dashboard)/     # Main application features (Expenses, Groups, etc.)
│   ├── actions/         # Server-side logic for database operations
│   └── api/             # API endpoints
├── components/          # Reusable UI components (shadcn/ui + custom)
├── contexts/            # React Contexts (Auth, Organization, Theme)
├── lib/                 # Shared utilities, Firebase config, and Query Client
├── services/            # Custom hooks and TanStack Query integration
├── types/               # TypeScript interfaces and type definitions
└── routes.ts            # Application route configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dev-shajid/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📐 Architecture & Logic

The project follows a modern, type-safe architecture:

- **Server-Side Operations**: Utilizes Next.js Server Actions for all write operations to the database, ensuring security and performance.
- **Client-Side State**: TanStack Query is used as the caching layer, handling data synchronization and invalidation after mutations to keep the UI up-to-date without manual refreshes.
- **Custom Security Middleware**: Implements a sophisticated proxy layer for authentication using cookies and Next.js middleware patterns to protect private routes while optimizing performance for prefetched assets and PWA components.
- **Modular Services**: Business logic is encapsulated in `src/services/`, making the application easy to test and maintain.
- **Responsive Design**: Mobile-first approach using Tailwind CSS, ensuring accessibility and ease of use across all screen sizes.

---

## 👤 Author

**Mohammed Sajidul Islam**
- GitHub: [@dev-shajid](https://github.com/dev-shajid)
- LinkedIn: [dev-shajid](https://www.linkedin.com/in/dev-shajid/)

---

> [!TIP]
> This tracker was built for performance and scalability, leveraging Next.js 16's latest features like Server Components and optimized rendering.
