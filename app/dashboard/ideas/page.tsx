"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, RefreshCw, Filter } from "lucide-react";
import { IdeaGeneratorForm } from "@/components/ideas/IdeaGeneratorForm";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import type { ContentIdea, IdeaGeneratorResult } from "@/lib/anthropic/idea-generator";

const FORMAT_FILTERS = [
  { id: "all", label: "All" },
  { id: "short-video", label: "Short Video" },
  { id: "long-video", label: "Long Video" },
  { id: "carousel", label: "Carousel" },
  { id: "thread", label: "Thread" },
  { id: "story", label: "Story" },
  { id: "live", label: "Live" },
];

interface DnaContext {
  id: string;
  niche: string;
  platform: string;
}

export default function IdeasPage() {
  const [result, setResult] = useState<IdeaGeneratorResult | null>(null);
  const [filter, setFilter] = useState("all");
  const [dnaContext, setDnaContext] = useState<DnaContext | null>(null);

  useEffect(() => {
    async function loadDNAContext() {
      try {
        const res = await fetch("/api/dna/latest");
        if (res.ok) {
          const data = await res.json() as DnaContext;
          setDnaContext(data);
        }
      } catch {
        // no DNA profile yet
      }
    }
    loadDNAContext();
  }, []);

  const filteredIdeas: ContentIdea[] =
    result?.ideas.filter((idea) => filter === "all" || idea.format === filter) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-5xl space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Idea Engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Claude generates viral content ideas tailored to your niche and patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — form */}
        <div className="lg:col-span-1">
          <div className="surface rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Generator</p>
            </div>
            <IdeaGeneratorForm
              defaultNiche={dnaContext?.niche}
              defaultPlatform={dnaContext?.platform}
              viralDnaId={dnaContext?.id ?? undefined}
              onResult={setResult}
            />
          </div>
        </div>

        {/* Right — results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground">{result.generation_context}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.ideas.length} ideas generated
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-2 flex-shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              {/* Format filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {FORMAT_FILTERS.map(({ id, label }) => {
                  const matchCount =
                    id === "all"
                      ? result.ideas.length
                      : result.ideas.filter((i) => i.format === id).length;
                  if (matchCount === 0 && id !== "all") return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setFilter(id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                        filter === id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {label}
                      {id !== "all" && (
                        <span className="opacity-50 ml-1">({matchCount})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredIdeas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} index={i} />
                ))}
              </div>

              {filteredIdeas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No ideas match this filter.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-4 glow-primary">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Your ideas will appear here</p>
              <p className="text-xs text-muted-foreground mt-1">Fill in the form and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
