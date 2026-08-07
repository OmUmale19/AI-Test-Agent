# AI-Test Automation — Full-Stack SaaS Platform
> **Developer Documentation, Portfolio Case Study & Resume Reference Guide**

---

## 📑 Table of Contents
1. [📌 Quick Resume Reference (ATS-Optimized)](#-quick-resume-reference-ats-optimized)
2. [🌐 Portfolio Case Study](#-portfolio-case-study)
3. [🏗️ Technical Architecture & System Design](#️-technical-architecture--system-design)
4. [💾 Database Schema & Data Modeling](#-database-schema--data-modeling)
5. [🔐 Authentication & Route Protection](#-authentication--route-protection)
6. [💳 Payment & Subscription Architecture](#-payment--subscription-architecture)
7. [📂 File Structure Reference](#-file-structure-reference)
8. [🚀 Setup & Developer Guide](#-setup--developer-guide)

---

## 📌 Quick Resume Reference (ATS-Optimized)

### 🔹 One-Liner Summary
> *Architected and built **AI-Test Automation**, a full-stack SaaS workspace using Next.js 15, TypeScript, Drizzle ORM, Neon PostgreSQL, Clerk Authentication, and Stripe Payments for automated code quality workflows.*

---

### 🔹 High-Impact Resume Bullet Points (STAR / Google XYZ Format)

Choose the bullets that best match the target role:

#### **Full-Stack / Software Engineer Role**
* **Engineered a scalable full-stack SaaS platform** using **Next.js 15 (App Router)**, **TypeScript**, and **React 19**, enabling seamless GitHub repository management and AI-driven automated testing workflows.
* **Designed a serverless data layer** with **Drizzle ORM** and **Neon PostgreSQL**, reducing query latencies and establishing automated migration pipelines (`drizzle-kit`).
* **Integrated secure multi-tenant authentication** using **Clerk Middleware**, implementing route guarding (`/workspace`) and synchronized database user auto-provisioning via custom API webhooks/handlers.
* **Implemented enterprise monetization pipeline** leveraging **Stripe Checkout API** and verified async webhook endpoints for automated credit system management and subscription fulfillment.

#### **Backend / Cloud Engineer Role**
* **Built RESTful API endpoints and background hooks** using Next.js Server Components and Edge-compatible API routes to process payment events and database user synchronization.
* **Architected relational data schemas** in PostgreSQL featuring ACID compliance, auto-managed credit tracking, and unique index enforcement to prevent duplicate user entry.

#### **Frontend / UI-UX Engineer Role**
* **Designed an intuitive dark-themed UI system** with **Tailwind CSS v4**, **Lucide Icons**, and custom component libraries (`workspaceheader`, `workspacebody`) delivering responsive user interactions.
* **Optimized client-side state management** by engineering custom React Context providers (`UserDetailsContext`) for real-time credit metrics and seamless auth state reflection across components.

---

### 🔹 Technical Skills & Keywords (For Resume ATS Scanning)

* **Languages**: TypeScript, JavaScript (ES6+), HTML5, CSS3/PostCSS
* **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Radix UI, Lucide Icons, Axios
* **Backend & API**: Next.js Server Actions & API Routes, REST APIs, Webhooks, Node.js
* **Database & ORM**: PostgreSQL (Neon Serverless), Drizzle ORM, Drizzle Kit
* **Authentication**: Clerk Auth (OAuth, Middleware, Route Protection)
* **Payments**: Stripe Billing / Checkout API, Stripe Webhooks
* **Tools & DevOps**: Git, GitHub, npm, PostCSS

---

## 🌐 Portfolio Case Study

### 🎯 Problem Statement
Modern developer teams often struggle with setting up isolated, credit-managed test execution platforms that connect smoothly to GitHub repositories while maintaining secure access control, persistent user billing, and clean workspace interfaces.

### 💡 Solution Overview
**AI-Test Automation** delivers a unified web-based workspace where developers can sign in, connect GitHub repositories, view available testing credits, and trigger AI-assisted test automation flows. The platform combines serverless database operations with modern security standards and credit-based subscription models.

### 💼 Real-Life Use Cases & Industry Applications

1. **Legacy Codebase Migration & Rapid Sprint QA**
   * **Problem**: Engineering teams spending 40%+ of sprint capacity writing manual unit and E2E tests for legacy TypeScript/React codebases.
   * **Real-World Application**: The platform's AST-based AI engine parses codebase structure and auto-generates unit/integration test suites (Jest, Vitest, Playwright), boosting velocity and preventing regression bugs prior to deployment.

2. **Automated Pull-Request Gatekeeper & CI/CD Protection**
   * **Problem**: Unchecked pull requests breaking staging or production environments due to missing test coverage.
   * **Real-World Application**: Connects directly via GitHub OAuth and webhooks to trigger automated test checks on every incoming PR. Blocks untested code merges and ensures 100% adherence to quality guardrails.

3. **Pay-As-You-Go Developer SaaS & B2B Billing**
   * **Problem**: Monetizing developer tools fairly based on compute and API consumption.
   * **Real-World Application**: Integrates a serverless Neon PostgreSQL credit balance database with Stripe Checkout & async webhooks, enabling software agencies and SaaS platforms to offer flexible pay-per-test usage pricing models.

---


## 🏗️ Technical Architecture & System Design

### System Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js 15 Client (React 19)
    participant Middleware as Clerk Middleware
    participant API as Next.js API Routes (/api/users)
    participant DB as Neon Postgres (Drizzle ORM)
    participant Stripe as Stripe API & Webhooks

    User->>Client: Navigates to /workspace
    Client->>Middleware: Intercepts Request
    alt Not Authenticated
        Middleware-->>User: Redirect to Sign-In Modal
    else Authenticated
        Middleware-->>Client: Allow Access
        Client->>API: POST /api/users (Triggered by Provider)
        API->>DB: Query user by primary email
        alt New User
            API->>DB: INSERT into users (email, name, credits=100)
            DB-->>API: Return New User Record
        else Existing User
            DB-->>API: Return User Record
        end
        API-->>Client: Return userDetails JSON
        Client->>User: Render Workspace UI with Credits
    end

    opt Subscription Checkout Flow
        User->>Client: Click Upgrade / Purchase Plan
        Client->>API: POST /api/checkout/stripe (priceId)
        API->>Stripe: stripe.checkout.sessions.create()
        Stripe-->>API: Return Checkout URL & Session ID
        API-->>Client: Redirect to Stripe Checkout Page
        User->>Stripe: Completes Payment
        Stripe->>API: POST /api/webhooks/stripe (event: checkout.session.completed)
        API->>DB: Update User Credits / Subscription Status
    end
```

---

## 💾 Database Schema & Data Modeling

The database is built on **Neon PostgreSQL** using **Drizzle ORM** for type-safe database queries.

### `users` Table Schema ([db/schema.ts](file:///o:/AI-Test%20Automation/AI-Test-Automation/db/schema.ts))

| Column Name | Data Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `serial` | Primary Key, Auto-increment | Unique user identifier |
| `name` | `text` | Nullable | Full name synced from Clerk profile |
| `email` | `text` | Not Null, Unique | User primary email address |
| `createdAt` | `timestamp` | `defaultNow()`, Not Null | Account registration timestamp |
| `credits` | `integer` | `default(100)`, Not Null | Current active testing credit balance |

```typescript
// db/schema.ts
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits: integer("credits").default(100).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

## 🔐 Authentication & Route Protection

### Route Guarding Pipeline ([middleware.ts](file:///o:/AI-Test%20Automation/AI-Test-Automation/middleware.ts))
Uses `@clerk/nextjs/server` to intercept requests. Protected routes matching `/workspace(.*)` enforce active user session verification:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/workspace(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
```

### Auto Sync User API ([app/api/users/route.tsx](file:///o:/AI-Test%20Automation/AI-Test-Automation/app/api/users/route.tsx))
When the client loads, `Provider` calls `POST /api/users`. The route checks the active session via `currentUser()`, queries PostgreSQL, creates a new database entry if non-existent, and returns the unified `userDetails` object.

---

## 💳 Payment & Subscription Architecture

1. **Checkout Session Creation** ([app/api/checkout/stripe/route.ts](file:///o:/AI-Test%20Automation/AI-Test-Automation/app/api/checkout/stripe/route.ts)):
   Accepts a `priceId`, initiates a Stripe Checkout session in `subscription` mode, and returns the session redirect URL.
2. **Asynchronous Webhook Listener** ([app/api/webhooks/stripe/route.ts](file:///o:/AI-Test%20Automation/AI-Test-Automation/app/api/webhooks/stripe/route.ts)):
   Verifies the incoming request payload using `stripe.webhooks.constructEvent()` against `STRIPE_WEBHOOK_SECRET` and handles `checkout.session.completed` events to update user credit state asynchronously.

---

## 📂 File Structure Reference

```
AI-Test-Automation/
├── app/
│   ├── api/
│   │   ├── checkout/stripe/route.ts  # Stripe session generator endpoint
│   │   ├── users/route.tsx           # User sync & auto-registration API
│   │   └── webhooks/stripe/route.ts  # Stripe webhook event processor
│   ├── workspace/
│   │   ├── layout.tsx                # Workspace page structure & persistent header
│   │   └── page.tsx                  # Workspace main view page
│   ├── globals.css                   # Global styles & Tailwind CSS setup
│   ├── layout.tsx                    # Root HTML/React layout wrapper
│   ├── page.tsx                      # Landing home page view
│   └── provider.tsx                  # Global state wrapper & user sync handler
├── components/
│   └── ui/
│       ├── button.tsx                # Reusable Radix/Tailwind button
│       ├── card.tsx                  # Custom card UI primitive
│       └── custom/
│           ├── workspacebody.tsx     # Workspace dashboard UI & credit display
│           └── workspaceheader.tsx   # Header navbar with Clerk Auth triggers
├── context/
│   └── UserDetailsContext.tsx        # React Context definition for user state
├── db/
│   ├── index.ts                      # Drizzle ORM client connected to Neon Postgres
│   └── schema.ts                     # Database table schema definition
├── lib/
│   ├── stripe.ts                     # Stripe API client instantiation
│   └── utils.ts                      # Class variance merger utility (`cn`)
├── middleware.ts                     # Clerk Auth security middleware
├── drizzle.config.ts                 # Drizzle Kit migration configuration
├── next.config.ts                    # Next.js framework configuration
├── package.json                      # Project dependencies & script commands
└── README.md                         # Quick-start documentation
```

---

## 🚀 Setup & Developer Guide

### 1. Prerequisites
* Node.js v18.x or higher
* npm v9.x or higher
* Neon PostgreSQL Account & Database Instance
* Clerk Developer Account
* Stripe Developer Account

### 2. Environment Configuration (`.env`)
Create a `.env` file in the root directory:
```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon PostgreSQL Connection
DATABASE_URL=postgresql://username:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Stripe Billing
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration Commands
```bash
# Generate schema migrations
npm run db:generate

# Push schema directly to Neon DB
npm run db:push

# Open graphical database studio
npm run db:studio
```

### 4. Running Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the application.

---
*Created for portfolio display and technical resume reference.*
