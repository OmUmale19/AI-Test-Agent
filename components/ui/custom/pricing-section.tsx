"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  popular?: boolean;
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  features: string[];
  buttonText: string;
  accentColor: "sky" | "amber" | "emerald";
}

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Starter",
    badge: "Free Forever",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Ideal for individual developers exploring AI test generation for personal projects.",
    features: [
      "100 Free Test Credits / Month",
      "Connect up to 2 GitHub Repos",
      "Jest & Vitest Unit Test Generation",
      "Basic Code Quality Analysis",
      "Community Support",
    ],
    buttonText: "Get Started Free",
    accentColor: "sky",
  },
  {
    id: "pro",
    name: "Pro Developer",
    badge: "Most Popular",
    popular: true,
    priceMonthly: 19,
    priceAnnual: 15,
    description: "Designed for active developers and small teams needing continuous automated QA.",
    priceIdMonthly: "price_pro_monthly",
    priceIdAnnual: "price_pro_annual",
    features: [
      "1,000 Test Credits / Month",
      "Unlimited GitHub Repositories",
      "Jest, Vitest, Playwright & Cypress",
      "Automated GitHub PR Webhooks",
      "Fast Queue Priority Processing",
      "Email & Discord Support",
    ],
    buttonText: "Upgrade to Pro",
    accentColor: "amber",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Scale & Power",
    priceMonthly: 49,
    priceAnnual: 39,
    description: "For engineering teams requiring custom AST pipelines, unlimited webhooks, and SLAs.",
    priceIdMonthly: "price_enterprise_monthly",
    priceIdAnnual: "price_enterprise_annual",
    features: [
      "5,000 Test Credits / Month",
      "Unlimited GitHub Repositories",
      "Custom AST Test Pipelines",
      "Team Seats & Access Control",
      "Unlimited CI/CD PR Protection",
      "24/7 Priority Support & SLA",
    ],
    buttonText: "Get Enterprise",
    accentColor: "emerald",
  },
];

const FAQS = [
  {
    q: "How do test generation credits work?",
    a: "Each credit allows you to parse a file's AST and generate a complete test suite (Jest, Vitest, or Playwright). Free tier users receive 100 credits monthly automatically.",
  },
  {
    q: "Can I connect private GitHub repositories?",
    a: "Yes! All paid plans (Pro and Enterprise) support unlimited private and public GitHub repositories with read:user and repo scope authorization.",
  },
  {
    q: "How does the GitHub PR webhook gatekeeper work?",
    a: "When a developer opens a Pull Request on your connected repository, our webhook automatically runs test suite synthesis and posts coverage pass/fail status to block broken merges.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel anytime?",
    a: "Absolutely! You can change your plan or cancel your subscription at any time directly through your account dashboard via Stripe Billing.",
  },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCheckout = async (plan: PricingPlan) => {
    if (plan.priceMonthly === 0) {
      window.location.href = "/workspace";
      return;
    }

    const priceId = billingCycle === "annual" ? plan.priceIdAnnual : plan.priceIdMonthly;
    setLoadingPlan(plan.id);

    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceId || plan.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback demo redirect to workspace if Stripe keys are test placeholders
        window.location.href = "/workspace?upgraded=true";
      }
    } catch (err) {
      console.error("Checkout error:", err);
      window.location.href = "/workspace";
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="relative py-16 px-4 md:px-8 max-w-6xl mx-auto text-zinc-100">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Transparent Pricing
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Simple, Credit-Based Plans
        </h2>
        <p className="mt-4 text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Scale your test automation effortlessly. Upgrade whenever your engineering team needs higher volume or advanced CI/CD webhooks.
        </p>

        {/* Monthly / Annual Toggle Switch */}
        <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-zinc-800 text-zinc-100 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-sky-500 text-black font-semibold shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold bg-amber-400 text-black">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-16">
        {PLANS.map((plan) => {
          const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative group rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                plan.popular
                  ? "bg-zinc-900/90 border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.15)] md:-translate-y-2"
                  : "bg-zinc-950/60 border border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/40 shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  {plan.badge}
                </div>
              )}

              <div>
                {!plan.popular && plan.badge && (
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold text-zinc-100 mt-3">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-2 min-h-[2.5rem] leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mt-6 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black text-zinc-100">${price}</span>
                  <span className="text-xs text-zinc-400 font-medium">/ month</span>
                  {billingCycle === "annual" && price > 0 && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-mono font-semibold">
                      (Billed annually)
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 border-t border-zinc-800/80 pt-6">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <SignedIn>
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                    }`}
                  >
                    <span>{isLoading ? "Processing..." : plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                        plan.popular
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                      }`}
                    >
                      <span>Sign In to Upgrade</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Accordion Section */}
      <div className="relative z-10 max-w-3xl mx-auto mt-16 border-t border-zinc-800/80 pt-12">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-zinc-800/90 bg-zinc-900/40 rounded-2xl p-4 px-6 transition-all hover:border-zinc-700"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-sm md:text-base text-zinc-200 hover:text-sky-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-sky-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-xs md:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
