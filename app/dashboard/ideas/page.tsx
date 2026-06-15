import { Lightbulb } from "lucide-react";

export default function IdeasPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Idea Engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated ideas personalized to your Viral DNA profile.
        </p>
      </div>
      <div className="surface rounded-xl p-12 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Lightbulb className="h-7 w-7 text-yellow-400" />
        </div>
        <h2 className="text-lg font-semibold">Ideas based on your DNA</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Complete a Viral DNA analysis first, then generate unlimited personalized ideas here.
        </p>
        <p className="text-xs text-muted-foreground">Building Phase 2</p>
      </div>
    </div>
  );
}
