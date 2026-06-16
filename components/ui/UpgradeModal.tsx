"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  used: number;
  limit: number;
}

export function UpgradeModal({ open, onClose, used, limit }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md surface-elevated rounded-2xl p-6 z-10"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-1">
              You&apos;ve used {used}/{limit} free analyses
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Upgrade to Viral DNA Pro for unlimited analyses, competitor tracking, and AI content ideas.
            </p>

            <ul className="space-y-2 mb-5">
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
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
            >
              {loading ? "Redirecting..." : "Upgrade to Pro — $7.99/month"}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-2.5">
              Cancel anytime. No hidden fees.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
