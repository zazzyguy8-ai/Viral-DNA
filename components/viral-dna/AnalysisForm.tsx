"use client";

import { useState } from "react";
import { Dna, Play, Music2, Camera, Share2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ViralDNAResult } from "@/lib/anthropic/viral-dna-analyzer";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: Play, color: "text-red-400" },
  { id: "tiktok", label: "TikTok", icon: Music2, color: "text-pink-400" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "text-purple-400" },
  { id: "x", label: "X / Twitter", icon: Share2, color: "text-sky-400" },
];

interface Props {
  onResult: (result: ViralDNAResult) => void;
}

export function AnalysisForm({ onResult }: Props) {
  const [platform, setPlatform] = useState("youtube");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [bestPosts, setBestPosts] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const STEPS = [
    "Scanning your creator profile...",
    "Detecting content patterns...",
    "Calculating Viral DNA scores...",
    "Identifying growth opportunities...",
    "Generating your DNA report...",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(0);

    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2200);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, niche, contentDescription, bestPosts, postingFrequency }),
      });

      const data = await res.json() as { result?: ViralDNAResult; error?: string };

      if (!res.ok || !data.result) {
        setError(data.error ?? "Analysis failed. Please try again.");
        setLoading(false);
        clearInterval(interval);
        return;
      }

      clearInterval(interval);
      onResult(data.result);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      clearInterval(interval);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center glow-primary">
            <Dna className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold gradient-text">{STEPS[step]}</p>
          <p className="text-sm text-muted-foreground">Claude is analyzing your Viral DNA</p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "w-8 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Platform selector */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-xs font-medium ${
                platform === id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon className={`h-5 w-5 ${platform === id ? color : ""}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Handle */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Your Handle</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input
            placeholder="yourhandle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
            className="pl-7 bg-secondary border-border"
          />
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

      {/* Content description */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Describe Your Content <span className="text-muted-foreground/50 normal-case">(optional but improves accuracy)</span>
        </Label>
        <textarea
          placeholder="What topics do you cover? What's your content style? Who is your audience?"
          value={contentDescription}
          onChange={(e) => setContentDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Best posts */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Your Best Performing Content <span className="text-muted-foreground/50 normal-case">(optional)</span>
        </Label>
        <textarea
          placeholder="List your top 3-5 videos/posts and why they performed well..."
          value={bestPosts}
          onChange={(e) => setBestPosts(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Posting frequency */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Posting Frequency</Label>
        <Input
          placeholder="e.g. 3x per week, daily, once a week..."
          value={postingFrequency}
          onChange={(e) => setPostingFrequency(e.target.value)}
          className="bg-secondary border-border"
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
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analyze My Viral DNA
          </>
        )}
      </Button>
    </form>
  );
}
