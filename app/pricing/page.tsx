import React from "react";
import Workspaceheader from "@/components/ui/custom/workspaceheader";
import PricingSection from "@/components/ui/custom/pricing-section";
import AnimatedBackground from "@/components/ui/custom/animated-background";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-sky-500 selection:text-black">
      {/* Background Canvas Animation */}
      <AnimatedBackground />

      <div className="relative z-10">
        <Workspaceheader />
        <main className="py-6">
          <PricingSection />
        </main>
      </div>

      {/* Footer info bar */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-400 border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex flex-row items-center justify-between gap-2 px-6">
        <p>© 2026 AI Test Automation Platform. Built with Next.js 15 & React 19.</p>
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="hover:text-zinc-200 transition-colors">
            Workspace
          </Link>
          <Link href="/pricing" className="hover:text-zinc-200 transition-colors">
            Pricing
          </Link>
          <Link
            href="https://github.com/OmUmale19/AI-Testing-Automation-Agent"
            target="_blank"
            className="hover:text-zinc-200 transition-colors"
          >
            GitHub Repository
          </Link>
        </div>
      </footer>
    </div>
  );
}
