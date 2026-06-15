import { Dna } from "lucide-react";

export default function ViralDnaPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Viral DNA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze your content and discover the patterns behind your growth.
        </p>
      </div>

      {/* Coming soon */}
      <div className="surface rounded-xl p-12 flex flex-col items-center text-center gap-4">
        <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center glow-primary">
          <Dna className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-lg font-semibold">Viral DNA Engine</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Enter your YouTube channel, TikTok, Instagram, or X handle to analyze your Viral DNA.
        </p>
        <div className="w-full max-w-sm h-10 rounded-lg bg-primary/10 border border-primary/20 animate-pulse" />
        <p className="text-xs text-muted-foreground">Building Phase 1 — coming next</p>
      </div>
    </div>
  );
}
