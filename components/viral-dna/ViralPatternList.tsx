import { Zap, Minus, AlertCircle } from "lucide-react";

interface Pattern {
  type: string;
  pattern: string;
  performance: "high" | "medium" | "low";
  examples: string[];
  frequency: number;
}

interface Props {
  patterns: Pattern[];
}

const PERF_CONFIG = {
  high: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "High" },
  medium: { icon: Minus, color: "text-amber-400", bg: "bg-amber-400/10", label: "Medium" },
  low: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Low" },
};

const TYPE_LABELS: Record<string, string> = {
  topic: "Topic",
  hook: "Hook",
  format: "Format",
  cta: "CTA",
  length: "Length",
  timing: "Timing",
};

export function ViralPatternList({ patterns }: Props) {
  const sorted = [...patterns].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.performance] - order[b.performance];
  });

  return (
    <div className="space-y-2">
      {sorted.map((pattern, i) => {
        const cfg = PERF_CONFIG[pattern.performance];
        const Icon = cfg.icon;

        return (
          <div key={i} className="surface rounded-xl p-4 flex gap-4">
            <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {TYPE_LABELS[pattern.type] ?? pattern.type}
                </span>
                <span className={`text-xs font-semibold ${cfg.color}`}>
                  {cfg.label} performance
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ~{pattern.frequency}x/mo
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{pattern.pattern}</p>
              {pattern.examples?.length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  e.g. {pattern.examples[0]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
