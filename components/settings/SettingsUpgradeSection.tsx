"use client";

import { useState } from "react";
import { CheckCircle2, Zap } from "lucide-react";

interface Props {
  plan: "free" | "pro";
  used: number;
  limit: number;
}

export function SettingsUpgradeSection({ plan, used, limit }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  if (plan === "pro") {
    return (
      <div className="surface rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Viral DNA Pro</h2>
          <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary text-white ml-auto">Active</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You have unlimited analyses and access to all features.
        </p>
        <button
          onClick={handleManage}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-60"
        >
          {loading ? "Loading..." : "Manage subscription"}
        </button>
      </div>
    );
  }

  return (
    <div className="surface rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Upgrade to Pro</h2>
      </div>

      <div className="mt-3 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Free analyses used</span>
          <span className="font-medium text-foreground">{used} / {limit}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all"
            style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 mb-5">
        {[
          "Unlimited Viral DNA analyses",
          "Competitor tracking & benchmarking",
          "AI content idea generator",
          "Virality pattern reports",
        ].map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro — $7.99/month"}
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">Cancel anytime.</p>
    </div>
  );
}
