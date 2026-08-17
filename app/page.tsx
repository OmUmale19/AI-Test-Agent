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
} from "lucide-react";
import AnimatedBackground from "@/components/ui/custom/animated-background";

export default function Home() {
  return (
    <main className="relative h-screen w-screen max-h-screen overflow-hidden bg-[#09090b] text-[#fafafa] flex flex-col justify-between p-3 md:p-6 selection:bg-sky-500 selection:text-black">
      {/* Interactive Canvas Background Animation covering full screen and gaps */}
      <AnimatedBackground />

      {/* Ambient Radial Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Main Container - Non-Scrollable 100vh Viewport Layout */}
      <div className="relative z-10 max-w-6xl w-full mx-auto h-full flex flex-col justify-between overflow-hidden">

        {/* Top Header Badge Row */}
        <div className="flex justify-between items-center py-1 px-1 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Test Engine v1.0 • Active
            </span>
          </div>

          <SignedIn>
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1 backdrop-blur-md">
              <span className="text-xs text-zinc-400 font-medium">Logged in</span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "!w-6 !h-6",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>

        {/* Outer Frame Container (Matching Wireframe Border, Translucent for Animation to pass through) */}
        <div className="flex-1 my-2 border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl shadow-black/80 flex flex-col justify-center overflow-hidden min-h-0">

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch h-full min-h-0">

            {/* LEFT COLUMN: Logo Box + Signin/Signup Buttons */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3 min-h-0 h-full">

              {/* LARGE LOGO CARD (Matching Wireframe Left Box) */}
              <div className="relative flex-1 group border border-zinc-800/70 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.12)] overflow-hidden min-h-0">

                {/* Background Grid Pattern inside Logo Card */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Card Top Label */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-sky-400 uppercase font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-400" />
                    AI PLATFORM
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-700/50 px-2 py-0.5 rounded-md">
                    SaaS Workspace
                  </span>
                </div>

                {/* CENTER LOGO DISPLAY */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-2">
                  <div className="p-3 md:p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-xl group-hover:scale-105 group-hover:border-sky-500/40 transition-all duration-300">
                    <Image
                      src="/logo.svg"
                      alt="AI Test Automation Logo"
                      width={280}
                      height={70}
                      priority
                      className="w-56 md:w-64 h-auto object-contain filter drop-shadow-[0_0_12px_rgba(250,204,21,0.25)]"
                    />
                  </div>
                  <p className="mt-3 text-xs md:text-sm text-zinc-400 max-w-xs leading-relaxed">
                    Automated code quality &amp; AI-driven test synthesis for modern developer teams.
                  </p>
                </div>

                {/* Card Bottom Features */}
                <div className="relative z-10 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[11px] md:text-xs text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Next.js 15
                  </span>
                  <span className="flex items-center gap-1 text-sky-400 font-mono">
                    <ShieldCheck className="w-3 h-3" /> Clerk Auth
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Zap className="w-3 h-3" /> Neon DB
                  </span>
                </div>
              </div>

              {/* BUTTONS ROW: Signin & Signup (Matching Wireframe Bottom Left Buttons) */}
              <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full py-3 md:py-3.5 px-4 rounded-xl font-semibold text-sm bg-sky-400 hover:bg-sky-300 text-black transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Signin</span>
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="w-full py-3 md:py-3.5 px-4 rounded-xl font-semibold text-sm border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-100 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Signup</span>
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/workspace" className="col-span-2">
                    <button className="w-full py-3 md:py-3.5 px-4 rounded-xl font-bold text-sm bg-linear-to-r from-emerald-400 via-sky-400 to-indigo-500 text-black hover:opacity-95 transition-all duration-200 shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </SignedIn>
              </div>

            </div>

            {/* RIGHT COLUMN: 3 STACKED CARDS WITH CLEAN HEADING AND CONTENT */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3 min-h-0 h-full">

              {/* CARD 1 */}
              <div className="flex-1 group relative border border-zinc-800/70 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3.5 md:p-4 transition-all duration-300 hover:border-sky-500/40 shadow-lg flex flex-col justify-center min-h-0">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:bg-sky-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm md:text-base font-bold text-zinc-100 group-hover:text-sky-400 transition-colors truncate">
                        Automated Test Generation
                      </h3>
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800 flex-shrink-0">
                        Legacy &amp; New Code
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-zinc-300 mt-1.5 leading-snug">
                      Eliminates 80%+ of manual test writing time by automatically parsing code AST to generate Jest, Vitest, and Playwright test suites.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="flex-1 group relative border border-zinc-800/70 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3.5 md:p-4 transition-all duration-300 hover:border-amber-500/40 shadow-lg flex flex-col justify-center min-h-0">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm md:text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                        PR Quality Gatekeeper
                      </h3>
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 flex-shrink-0">
                        CI/CD Automation
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-zinc-300 mt-1.5 leading-snug">
                      Automatically runs test checks on incoming GitHub PRs, blocking untested or breaking API changes from ever merging into production.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="flex-1 group relative border border-zinc-800/70 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3.5 md:p-4 transition-all duration-300 hover:border-emerald-500/40 shadow-lg flex flex-col justify-center min-h-0">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm md:text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                        Pay-As-You-Go Developer SaaS
                      </h3>
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex-shrink-0">
                        Usage Monetization
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-zinc-300 mt-1.5 leading-snug">
                      Provides transparent usage credit tracking with Neon Postgres &amp; Stripe Checkout, giving dev teams 100 onboarding credits &amp; flexible top-ups.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer info bar */}
        <footer className="py-1 text-center text-[11px] md:text-xs text-zinc-400 flex flex-row items-center justify-between gap-2 px-2 flex-shrink-0">
          <p className="truncate">© 2026 AI Test Automation Platform. Built with Next.js 15 &amp; React 19.</p>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/workspace" className="hover:text-zinc-200 transition-colors">
              Workspace
            </Link>
            <Link href="/pricing" className="hover:text-zinc-200 transition-colors">
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
