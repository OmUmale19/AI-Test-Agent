# AI-Test Automation

A modern, production-ready Full-Stack Next.js SaaS boilerplate equipped with Authentication, Database ORM, Payments integration, and UI component styling.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Neon Postgres](https://neon.tech/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)

---

## 🛠️ Getting Started

### 1. Prerequisites

Ensure you have Node.js (v18+) and npm installed:
```bash
node -v
npm -v
```

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd AI-Test-Automation
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Neon Database
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Database Setup & Migrations

Push schema updates to your Neon Postgres database using Drizzle Kit:

```bash
# Generate migrations
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio to view database records
npm run db:studio
```

### 5. Running Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production build server |
| `npm run lint` | Runs ESLint checks across project files |
| `npm run db:generate` | Generates database migration files |
| `npm run db:push` | Applies schema changes directly to the database |
| `npm run db:studio` | Launches Drizzle Studio GUI for data management |

---

## 📁 Project Structure

```
AI-Test-Automation/
├── app/                  # Next.js App Router pages & API routes
│   ├── layout.tsx       # Root layout configuration
│   └── page.tsx         # Home page component
├── db/                   # Database schemas & client initialization
│   └── schema.ts        # Drizzle ORM database schema definitions
├── lib/                  # Helper utilities and shared modules
├── components/           # Reusable UI components
├── middleware.ts         # Clerk auth middleware configuration
├── drizzle.config.ts     # Drizzle Kit configuration file
├── next.config.ts        # Next.js configuration
├── package.json          # Project metadata & dependencies
└── README.md             # Project documentation
```

---

## 📝 License

This project is licensed under the MIT License.
