"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Zap, Video, AlignLeft, Layers, MessageSquare, Circle, Radio } from "lucide-react";
import type { ContentIdea } from "@/lib/anthropic/idea-generator";

const FORMAT_CONFIG: Record<
  ContentIdea["format"],
  { label: string; icon: typeof Video; color: string; bg: string }
> = {
  "short-video": { label: "Short Video", icon: Video, color: "text-pink-400", bg: "bg-pink-400/10" },
  "long-video": { label: "Long Video", icon: Video, color: "text-purple-400", bg: "bg-purple-400/10" },
  carousel: { label: "Carousel", icon: Layers, color: "text-blue-400", bg: "bg-blue-400/10" },
  thread: { label: "Thread", icon: AlignLeft, color: "text-amber-400", bg: "bg-amber-400/10" },
  story: { label: "Story", icon: Circle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  live: { label: "Live", icon: Radio, color: "text-red-400", bg: "bg-red-400/10" },
};

function ViralityBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-emerald-400" : score >= 55 ? "bg-primary" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${color.replace("bg-", "text-")}`}>
        {score}
      </span>
    </div>
  );
}

interface Props {
  idea: ContentIdea;
  index: number;
}

export function IdeaCard({ idea, index }: Props) {
  const [copied, setCopied] = useState(false);
  const fmt = FORMAT_CONFIG[idea.format] ?? FORMAT_CONFIG["short-video"];
  const FmtIcon = fmt.icon;

  function copyIdea() {
    const text = `Title: ${idea.title}\n\nHook: ${idea.hook}\n\nAngle: ${idea.angle}\n\nCTA: ${idea.cta}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.055, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="surface rounded-xl p-5 flex flex-col gap-3 hover:border-primary/30 border border-border transition-colors group cursor-default"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${fmt.bg} ${fmt.color}`}>
            <FmtIcon className="h-3 w-3" />
            {fmt.label}
          </span>
        </div>
        <motion.button
          onClick={copyIdea}
          whileTap={{ scale: 0.88 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
          title="Copy idea"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </motion.button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug">{idea.title}</h3>

      {/* Hook */}
      <div className="rounded-lg bg-secondary px-3 py-2">
        <p className="text-xs text-muted-foreground mb-0.5 font-semibold uppercase tracking-widest">Hook</p>
        <p className="text-xs text-foreground italic">&ldquo;{idea.hook}&rdquo;</p>
      </div>

      {/* Why it works */}
      <p className="text-xs text-muted-foreground leading-relaxed">{idea.why_it_works}</p>

      {/* Virality + CTA */}
      <div className="space-y-2 pt-1 border-t border-border">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Virality</span>
        </div>
        <ViralityBar score={idea.estimated_virality} />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">CTA:</span> {idea.cta}
        </p>
      </div>
    </motion.div>
  );
}
