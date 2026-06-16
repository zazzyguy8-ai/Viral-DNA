"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus,
  Zap, Target, Lightbulb, ShieldAlert, ArrowUpRight
} from "lucide-react";
import type { CompetitorAnalysis } from "@/lib/anthropic/competitor-analyzer";

const THREAT_CONFIG = {
  high: { label: "High Threat", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  medium: { label: "Medium Threat", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  low: { label: "Low Threat", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

const VELOCITY_CONFIG = {
  fast: { icon: TrendingUp, color: "text-emerald-400", label: "Fast Growth" },
  medium: { icon: Minus, color: "text-amber-400", label: "Steady Growth" },
  slow: { icon: TrendingDown, color: "text-red-400", label: "Slow Growth" },
};

interface Props {
  handle: string;
  platform: string;
  analysis: CompetitorAnalysis;
  analyzedAt: string;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "green" | "red" | "amber" | "purple" | "default" }) {
  const colors = {
    green: "bg-emerald-400/10 text-emerald-400",
    red: "bg-red-400/10 text-red-400",
    amber: "bg-amber-400/10 text-amber-400",
    purple: "bg-primary/10 text-primary",
    default: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

export function CompetitorCard({ handle, platform, analysis, analyzedAt }: Props) {
  const [expanded, setExpanded] = useState(false);
  const threat = THREAT_CONFIG[analysis.threat_level];
  const velocity = VELOCITY_CONFIG[analysis.growth_velocity];
  const VelocityIcon = velocity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`surface rounded-xl border ${threat.border} overflow-hidden`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-foreground">{analysis.display_name}</h3>
              <span className="text-xs text-muted-foreground">@{handle}</span>
              <span className="text-xs text-muted-foreground capitalize">· {platform}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${threat.bg} ${threat.color}`}>
                <ShieldAlert className="h-3 w-3" />
                {threat.label}
              </span>
              <span className={`flex items-center gap-1 text-xs ${velocity.color}`}>
                <VelocityIcon className="h-3 w-3" />
                {velocity.label}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{formatFollowers(analysis.estimated_followers)} followers
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpanded((x) => !x)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Key insight */}
        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
          <p className="text-xs text-foreground italic">&ldquo;{analysis.key_insight}&rdquo;</p>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-5 space-y-5">
          {/* Strengths + Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Their Strengths</p>
              </div>
              <div className="space-y-1.5">
                {analysis.strengths.map((s, i) => (
                  <p key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-emerald-400 flex-shrink-0">+</span>
                    {s}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Their Weaknesses</p>
              </div>
              <div className="space-y-1.5">
                {analysis.weaknesses.map((w, i) => (
                  <p key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-red-400 flex-shrink-0">−</span>
                    {w}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Content gaps */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content Gaps You Can Fill</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.content_gaps.map((g, i) => (
                <Chip key={i} variant="purple">{g}</Chip>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Opportunities</p>
            </div>
            <div className="space-y-1.5">
              {analysis.opportunities.map((o, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <ArrowUpRight className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  {o}
                </p>
              ))}
            </div>
          </div>

          {/* Steal-worthy */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Steal-Worthy Tactics</p>
            </div>
            <div className="space-y-1.5">
              {analysis.steal_worthy.map((s, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <Zap className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {s}
                </p>
              ))}
            </div>
          </div>

          {/* Viral hooks */}
          {analysis.viral_hooks?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Their Hook Patterns</p>
              <div className="space-y-1.5">
                {analysis.viral_hooks.map((h, i) => (
                  <div key={i} className="rounded-lg bg-secondary px-3 py-2">
                    <p className="text-xs text-muted-foreground italic">&ldquo;{h}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Analyzed {new Date(analyzedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      )}
    </motion.div>
  );
}
