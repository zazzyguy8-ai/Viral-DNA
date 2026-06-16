"use client";

import { useState } from "react";
import { Play, Music2, Camera, Share2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IdeaGeneratorResult } from "@/lib/anthropic/idea-generator";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "x", label: "X / Twitter", icon: Share2 },
];

const COUNT_OPTIONS = [5, 10, 15, 20];

interface Props {
  defaultNiche?: string;
  defaultPlatform?: string;
  viralDnaId?: string;
  onResult: (result: IdeaGeneratorResult) => void;
}

export function IdeaGeneratorForm({ defaultNiche, defaultPlatform, viralDnaId, onResult }: Props) {
  const [platform, setPlatform] = useState(defaultPlatform ?? "youtube");
  const [niche, setNiche] = useState(defaultNiche ?? "");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          niche,
          viral_dna_id: viralDnaId ?? null,
          count,
        }),
      });

      const data = await res.json() as IdeaGeneratorResult & { error?: string };

      if (!res.ok || !data.ideas) {
        setError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      onResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-5">
      {/* Platform */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all text-xs font-medium ${
                platform === id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Niche */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Your Niche</Label>
        <Input
          placeholder="e.g. Personal finance for millennials, Fitness for busy moms..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          required
          className="bg-secondary border-border"
        />
      </div>

      {/* Count */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ideas to Generate</Label>
        <div className="flex gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                count === n
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {viralDnaId && (
        <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          Ideas will be personalized using your Viral DNA profile.
        </p>
      )}

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !niche}
        className="w-full gradient-primary text-white font-semibold h-11 gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating ideas...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate {count} Ideas
          </>
        )}
      </Button>
    </form>
  );
}
