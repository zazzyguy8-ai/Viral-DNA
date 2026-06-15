import { Users2 } from "lucide-react";

export default function CompetitorsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Competitor DNA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare your DNA against competitors and find growth opportunities.
        </p>
      </div>
      <div className="surface rounded-xl p-12 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Users2 className="h-7 w-7 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold">Competitor analysis</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add competitors to compare strengths, weaknesses, and content gaps side by side.
        </p>
        <p className="text-xs text-muted-foreground">Building Phase 3</p>
      </div>
    </div>
  );
}
