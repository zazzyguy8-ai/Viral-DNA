import Link from "next/link";
import { Dna, ArrowRight, Zap, BarChart3, Lightbulb, Users2 } from "lucide-react";

const FEATURES = [
  {
    icon: Dna,
    title: "Viral DNA™ Engine",
    description:
      "AI analyzes your content history and identifies the hidden patterns behind your best-performing posts.",
  },
  {
    icon: Lightbulb,
    title: "DNA-Powered Idea Engine",
    description:
      "Generate video ideas, hooks, and CTAs that are personalized to your unique growth patterns.",
  },
  {
    icon: Users2,
    title: "Competitor DNA",
    description:
      "Compare your DNA profile against competitors. Find content gaps and opportunities they're missing.",
  },
  {
    icon: BarChart3,
    title: "Weekly Growth Reports",
    description:
      "Get an AI-generated report every Monday with wins, losses, and 3 recommended actions.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 h-16 border-b border-border max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
            <Dna className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">Viral DNA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
          <Zap className="h-3 w-3" />
          AI Growth Operating System for Creators
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Discover your{" "}
          <span className="gradient-text">Viral DNA™</span>
          <br />
          and grow faster
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Viral DNA analyzes your content history across YouTube, TikTok, Instagram, and X to reveal
          the hidden patterns behind your best-performing content.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            Analyze your DNA free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in →
          </Link>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="surface rounded-xl p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">© 2026 Viral DNA · Built for creators</p>
      </footer>
    </div>
  );
}
