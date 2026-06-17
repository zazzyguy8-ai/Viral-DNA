"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Sparkles, AlertCircle, CheckCircle2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubeIcon, TikTokIcon, InstagramIcon, XIcon } from "@/components/ui/BrandIcons";
import type { ViralDNAResult } from "@/lib/anthropic/viral-dna-analyzer";
import { UpgradeModal } from "@/components/ui/UpgradeModal";

const PLATFORM_CONFIG = {
  youtube: { label: "YouTube", Icon: YouTubeIcon, color: "text-red-500" },
  tiktok: { label: "TikTok", Icon: TikTokIcon, color: "text-foreground" },
  instagram: { label: "Instagram", Icon: InstagramIcon, color: "" },
  x: { label: "X / Twitter", Icon: XIcon, color: "text-foreground" },
} as const;

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

const STEPS = [
  "Scanning your creator profile...",
  "Detecting content patterns...",
  "Calculating Viral DNA scores...",
  "Identifying growth opportunities...",
  "Generating your DNA report...",
];

interface Props {
  onResult: (result: ViralDNAResult) => void;
}

export function AnalysisForm({ onResult }: Props) {
  const [profileUrl, setProfileUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [bestPosts, setBestPosts] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeData, setUpgradeData] = useState({ used: 0, limit: 2 });

  const parsed = parsePlatformUrl(profileUrl);
  const platformConfig = parsed ? PLATFORM_CONFIG[parsed.platform as keyof typeof PLATFORM_CONFIG] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parsed) {
      setError("Paste a valid profile URL — e.g. instagram.com/yourhandle");
      return;
    }
    setLoading(true);
    setStep(0);

    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 4500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: parsed.platform,
          handle: parsed.handle,
          profileUrl,
          niche,
          contentDescription,
          bestPosts,
          postingFrequency,
        }),
      });

      const data = await res.json() as { result?: ViralDNAResult; error?: string; used?: number; limit?: number };
      clearInterval(interval);

      if (res.status === 402) {
        setUpgradeData({ used: data.used ?? 2, limit: data.limit ?? 2 });
        setUpgradeOpen(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.result) {
        setError(data.error ?? "Analysis failed. Please try again.");
        setLoading(false);
        return;
      }
      onResult(data.result);
    } catch {
      clearInterval(interval);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-6"
      >
        <div className="relative">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center glow-primary">
            <Dna className="h-10 w-10 text-white animate-pulse" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full gradient-primary opacity-20"
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center space-y-1"
          >
            <p className="text-lg font-semibold gradient-text">{STEPS[step]}</p>
            <p className="text-sm text-muted-foreground">Claude is analyzing your Viral DNA</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i <= step ? 32 : 6, opacity: i <= step ? 1 : 0.3 }}
              transition={{ duration: 0.4 }}
              className="h-1.5 rounded-full bg-primary"
              style={{ width: 6 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-xl"
    >
      {/* Profile URL */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Your Profile URL
        </Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="https://www.instagram.com/yourhandle"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            required
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <AnimatePresence>
          {profileUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {parsed && platformConfig ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <platformConfig.Icon size={16} className={platformConfig.color} />
                  <span className="text-xs text-emerald-400 font-medium">
                    {platformConfig.label} · @{parsed.handle}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-400">
                    Paste a full URL — e.g. instagram.com/handle or tiktok.com/@handle
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!profileUrl && (
          <div className="flex items-center gap-3 pt-1">
            <YouTubeIcon size={15} />
            <TikTokIcon size={14} className="text-foreground" />
            <InstagramIcon size={15} />
            <XIcon size={14} className="text-foreground" />
            <span className="text-xs text-muted-foreground">YouTube · TikTok · Instagram · X</span>
          </div>
        )}
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
          Describe Your Content{" "}
          <span className="text-muted-foreground/50 normal-case font-normal">(optional — improves accuracy)</span>
        </Label>
        <textarea
          placeholder="What topics do you cover? Your style? Who is your audience?"
          value={contentDescription}
          onChange={(e) => setContentDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Best posts */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Best Performing Content{" "}
          <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
        </Label>
        <textarea
          placeholder="List your top 3-5 posts and why they performed well..."
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
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-2"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        disabled={loading || !niche || !parsed}
        className="w-full gradient-primary text-white font-semibold h-11 gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Analyze My Viral DNA
      </Button>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        used={upgradeData.used}
        limit={upgradeData.limit}
      />
    </motion.form>
  );
}
