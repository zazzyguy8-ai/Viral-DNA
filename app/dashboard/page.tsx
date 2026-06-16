import { createClient } from "@/lib/supabase/server";
import { Dna, Lightbulb, Users2, BarChart3, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/ui/PageWrapper";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/viral-dna",
    icon: Dna,
    label: "Analyze your Viral DNA",
    description: "Discover what makes your content succeed",
    cta: "Run analysis",
  },
  {
    href: "/dashboard/ideas",
    icon: Lightbulb,
    label: "Generate content ideas",
    description: "Ideas personalized to your DNA profile",
    cta: "Get ideas",
  },
  {
    href: "/dashboard/competitors",
    icon: Users2,
    label: "Add a competitor",
    description: "See how you compare and find gaps",
    cta: "Add competitor",
  },
  {
    href: "/dashboard/reports",
    icon: BarChart3,
    label: "View weekly report",
    description: "Track your growth with AI-powered insights",
    cta: "See report",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName: string =
    ((user?.user_metadata?.full_name as string | undefined)?.split(" ")[0]) ?? "Creator";

  const dnaRes = await supabase
    .from("viral_dna_profiles")
    .select("overall_score, status")
    .eq("user_id", user!.id)
    .eq("status", "complete")
    .order("generated_at", { ascending: false })
    .limit(1);

  const latestDna = (dnaRes.data as Array<{ overall_score: number | null; status: string }> | null)?.[0];

  return (
    <PageWrapper>
    <div className="max-w-4xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI Growth Operating System is ready.
        </p>
      </div>

      {/* DNA Score banner — shown if analysis exists */}
      {latestDna && (
        <div className="surface rounded-xl p-5 flex items-center justify-between glow-primary">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
              <Dna className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                Viral DNA Score
              </p>
              <p className="text-3xl font-bold gradient-text">{latestDna.overall_score}</p>
            </div>
          </div>
          <Link
            href="/dashboard/viral-dna"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View full report <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Quick actions grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, description, cta }) => (
            <Link
              key={href}
              href={href}
              className="surface-elevated rounded-xl p-5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 transform" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* No DNA yet — onboarding nudge */}
      {!latestDna && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
          <TrendingUp className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Run your first Viral DNA analysis</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect a platform and discover your hidden growth patterns in under 60 seconds.
            </p>
          </div>
          <Link
            href="/dashboard/viral-dna"
            className="shrink-0 px-4 py-2 rounded-lg gradient-primary text-white text-xs font-semibold transition-opacity hover:opacity-90"
          >
            Start now
          </Link>
        </div>
      )}
    </div>
    </PageWrapper>
  );
}
