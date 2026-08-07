import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  Sparkles,
  GitBranch,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Terminal,
  Code2,
  Boxes,
} from "lucide-react";
import AnimatedBackground from "@/components/ui/custom/animated-background";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between overflow-x-hidden selection:bg-sky-500 selection:text-black">
      {/* Cool Interactive Background Animation */}
      <AnimatedBackground />

      {/* Ambient Radial Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Main Container matching Wireframe Layout */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 md:py-14 flex-1 flex flex-col justify-center">
        
        {/* Top Header Badge */}
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Test Engine v1.0 • Active
            </span>
          </div>

          <SignedIn>
            <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="text-xs text-zinc-400 font-medium">Logged in</span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "!w-7 !h-7",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>

        {/* Outer Frame Container (Matching Wireframe Border) */}
        <div className="border border-zinc-800/90 bg-zinc-950/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/80 hover:border-zinc-700/80 transition-all duration-500">
          
          {/* 2-Column Grid Layout: Left (Logo & Auth Buttons), Right (3 Stacked Feature Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: Logo Box + Signin/Signup Row */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              {/* LARGE LOGO CARD (Matching Wireframe Left Box) */}
              <div className="relative flex-1 group border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] overflow-hidden min-h-[300px]">
                
                {/* Background Grid Pattern within Card */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Card Header & Status */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-sky-400 uppercase font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-400" />
                    AI Platform
                  </span>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 rounded-md">
                    SaaS Workspace
                  </span>
                </div>

                {/* CENTER LOGO DISPLAY */}
                <div className="relative z-10 my-6 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-xl group-hover:scale-105 group-hover:border-sky-500/50 transition-all duration-300">
                    <Image
                      src="/logo.svg"
                      alt="AI Test Automation Logo"
                      width={280}
                      height={70}
                      priority
                      className="w-64 md:w-72 h-auto object-contain filter drop-shadow-[0_0_12px_rgba(250,204,21,0.25)]"
                    />
                  </div>
                  <p className="mt-4 text-sm text-zinc-400 max-w-sm">
                    Automated code quality &amp; AI-driven test synthesis for modern developer teams.
                  </p>
                </div>

                {/* Card Footer Features */}
                <div className="relative z-10 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Next.js 15
                  </span>
                  <span className="flex items-center gap-1 text-sky-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> Clerk Auth
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Zap className="w-3.5 h-3.5" /> Neon DB
                  </span>
                </div>
              </div>

              {/* BUTTONS ROW: Signin & Signup (Matching Wireframe Bottom Left Buttons) */}
              <div className="grid grid-cols-2 gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full py-4 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-400 to-sky-500 text-black hover:from-sky-300 hover:to-sky-400 transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Signin</span>
                    </button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal">
                    <button className="w-full py-4 px-6 rounded-xl font-semibold text-sm border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 hover:border-zinc-500 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Signup</span>
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/workspace" className="col-span-2">
                    <button className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 text-black hover:opacity-95 transition-all duration-200 shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </SignedIn>
              </div>

            </div>

            {/* RIGHT COLUMN: 3 STACKED FEATURE CARDS (Matching Wireframe Right Side) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              
              {/* FEATURE CARD 1 */}
              <div className="group relative border border-zinc-800/90 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-sky-500/40 hover:translate-x-1 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-sky-400 transition-colors">
                        Autonomous AI Test Synthesis
                      </h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        Feature 01
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Generates complete unit, integration, and E2E test suites automatically by parsing codebase AST and repository structures.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">TypeScript</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Jest / Vitest</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Playwright</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURE CARD 2 */}
              <div className="group relative border border-zinc-800/90 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-amber-500/40 hover:translate-x-1 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                        GitHub Repository Integration
                      </h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Feature 02
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Connect your GitHub repositories in one click with automated pull-request status checks and CI webhook triggers.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">One-Click Connect</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">PR Webhooks</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">CI/CD Guard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURE CARD 3 */}
              <div className="group relative border border-zinc-800/90 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-emerald-500/40 hover:translate-x-1 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        Credit Engine &amp; Stripe Billing
                      </h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Feature 03
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Serverless database schema powered by Neon PostgreSQL and Drizzle ORM, with 100 free onboarding credits &amp; Stripe billing.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Neon Postgres</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Drizzle ORM</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Stripe Webhooks</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer info bar */}
        <footer className="mt-8 text-center text-xs text-zinc-400 flex flex-col md:flex-row items-center justify-between gap-3 px-4">
          <p>© 2026 AI Test Automation Platform. Built with Next.js 15 &amp; React 19.</p>
          <div className="flex items-center gap-6">
            <Link href="/workspace" className="hover:text-zinc-200 transition-colors">
              Workspace
            </Link>
            <Link href="#pricing" className="hover:text-zinc-200 transition-colors">
              Pricing
            </Link>
            <Link href="https://github.com/OmUmale19/AI-Testing-Automation-Agent" target="_blank" className="hover:text-zinc-200 transition-colors">
              GitHub Repository
            </Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
