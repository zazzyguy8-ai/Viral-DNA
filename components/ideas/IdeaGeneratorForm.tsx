"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubeIcon, TikTokIcon, InstagramIcon, XIcon } from "@/components/ui/BrandIcons";
import type { IdeaGeneratorResult } from "@/lib/anthropic/idea-generator";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", Icon: YouTubeIcon, activeClass: "border-red-500/50 bg-red-500/10" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, activeClass: "border-primary/50 bg-primary/10" },
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, activeClass: "border-pink-500/50 bg-pink-500/10" },
  { id: "x", label: "X", Icon: XIcon, activeClass: "border-primary/50 bg-primary/10" },
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
        body: JSON.stringify({ platform, niche, viral_dna_id: viralDnaId ?? null, count }),
      });
      const data = await res.json() as IdeaGeneratorResult & { error?: string };
      if (!res.ok || !data.ideas) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      onResult(data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleGenerate}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Platform */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map(({ id, label, Icon, activeClass }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all text-xs font-medium ${
                platform === id
                  ? `${activeClass} text-foreground`
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon size={18} className={platform === id ? "" : "opacity-60"} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Niche */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Your Niche</Label>
        <Input
          placeholder="e.g. Personal finance for millennials..."
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
    </motion.form>
  );
}
