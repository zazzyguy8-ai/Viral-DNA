"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubeIcon, TikTokIcon, InstagramIcon, XIcon } from "@/components/ui/BrandIcons";
import type { CompetitorAnalysis } from "@/lib/anthropic/competitor-analyzer";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", Icon: YouTubeIcon, activeClass: "border-red-500/50 bg-red-500/10" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, activeClass: "border-primary/50 bg-primary/10" },
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, activeClass: "border-pink-500/50 bg-pink-500/10" },
  { id: "x", label: "X", Icon: XIcon, activeClass: "border-primary/50 bg-primary/10" },
];

function parsePlatformUrl(url: string): { platform: string; handle: string } | null {
  const raw = url.trim();
  const matchers: { regex: RegExp; platform: string }[] = [
    { regex: /(?:youtube\.com\/(?:@|c\/|channel\/|user\/)?|youtu\.be\/)([a-zA-Z0-9_@.-]+)/i, platform: "youtube" },
    { regex: /tiktok\.com\/?@?([a-zA-Z0-9_.]+)/i, platform: "tiktok" },
    { regex: /instagram\.com\/([a-zA-Z0-9_.]+)\/?/i, platform: "instagram" },
    { regex: /(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/?/i, platform: "x" },
  ];
  for (const { regex, platform } of matchers) {
    const match = raw.match(regex);
    if (match?.[1]) return { platform, handle: match[1].replace(/^@/, "") };
  }
  return null;
}

interface Props {
  onResult: (handle: string, platform: string, analysis: CompetitorAnalysis) => void;
}

export function AddCompetitorForm({ onResult }: Props) {
  const [mode, setMode] = useState<"url" | "manual">("url");
  const [profileUrl, setProfileUrl] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlParsed = mode === "url" ? parsePlatformUrl(profileUrl) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let resolvedPlatform = platform;
    let resolvedHandle = handle.replace("@", "");

    if (mode === "url") {
      if (!urlParsed) {
        setError("Paste a valid profile URL — e.g. instagram.com/handle");
        return;
      }
      resolvedPlatform = urlParsed.platform;
      resolvedHandle = urlParsed.handle;
    }

    if (!niche) {
      setError("Niche is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: resolvedPlatform, handle: resolvedHandle, niche, description }),
      });
      const data = await res.json() as { analysis?: CompetitorAnalysis; error?: string };
      if (!res.ok || !data.analysis) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      onResult(resolvedHandle, resolvedPlatform, data.analysis);
      setProfileUrl("");
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
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Mode toggle */}
      <div className="flex rounded-lg bg-secondary border border-border p-0.5 gap-0.5">
        {(["url", "manual"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
              mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {m === "url" ? "Paste URL" : "Enter Handle"}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Competitor URL</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://www.instagram.com/competitor"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          {urlParsed && (
            <p className="text-xs text-emerald-400 pl-1">
              Detected: {urlParsed.platform} · @{urlParsed.handle}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {PLATFORMS.map(({ id, label, Icon, activeClass }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlatform(id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all text-xs font-medium ${
                    platform === id ? `${activeClass} text-foreground` : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Handle</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input
                placeholder="theirhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required={mode === "manual"}
                className="pl-7 bg-secondary border-border"
              />
            </div>
          </div>
        </>
      )}

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

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Extra Context <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
        </Label>
        <textarea
          placeholder="What do you know about them? Recent viral posts, their style..."
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
        disabled={loading || !niche}
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
    </motion.form>
  );
}
