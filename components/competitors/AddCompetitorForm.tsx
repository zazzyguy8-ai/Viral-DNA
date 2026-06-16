"use client";

import { useState } from "react";
import { Play, Music2, Camera, Share2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompetitorAnalysis } from "@/lib/anthropic/competitor-analyzer";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "x", label: "X / Twitter", icon: Share2 },
];

interface Props {
  onResult: (handle: string, platform: string, analysis: CompetitorAnalysis) => void;
}

export function AddCompetitorForm({ onResult }: Props) {
  const [platform, setPlatform] = useState("youtube");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.replace("@", ""), niche, description }),
      });

      const data = await res.json() as { analysis?: CompetitorAnalysis; error?: string };

      if (!res.ok || !data.analysis) {
        setError(data.error ?? "Analysis failed. Try again.");
        return;
      }

      onResult(handle.replace("@", ""), platform, data.analysis);
      setHandle("");
      setNiche("");
      setDescription("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {PLATFORMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all text-xs font-medium ${
                platform === id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Handle */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Competitor Handle</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input
            placeholder="theirhandle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
            className="pl-7 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Niche */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Their Niche</Label>
        <Input
          placeholder="e.g. Finance for Gen Z, Travel content..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          required
          className="bg-secondary border-border"
        />
      </div>

      {/* Optional description */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Extra Context <span className="text-muted-foreground/50 normal-case">(optional)</span>
        </Label>
        <textarea
          placeholder="What do you know about them? Their style, audience, recent viral posts..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !handle || !niche}
        className="w-full gradient-primary text-white font-semibold h-11 gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing competitor...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add & Analyze
          </>
        )}
      </Button>
    </form>
  );
}
