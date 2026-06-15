import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Weekly Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered weekly growth reports with wins, losses, and action items.
        </p>
      </div>
      <div className="surface rounded-xl p-12 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
          <BarChart3 className="h-7 w-7 text-green-400" />
        </div>
        <h2 className="text-lg font-semibold">Weekly growth reports</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Auto-generated every Monday with PDF export and shareable public links.
        </p>
        <p className="text-xs text-muted-foreground">Building Phase 4</p>
      </div>
    </div>
  );
}
