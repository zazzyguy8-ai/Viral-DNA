import { TrendingUp, Minus, TrendingDown } from "lucide-react";

interface Pillar {
  name: string;
  strength: "strong" | "medium" | "weak";
  description: string;
  examples: string[];
  score: number;
  rank: number;
}

interface Props {
  pillars: Pillar[];
}

const STRENGTH_CONFIG = {
  strong: {
    label: "Strong",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    bar: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    icon: Minus,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    bar: "bg-amber-400",
  },
  weak: {
    label: "Weak",
    icon: TrendingDown,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    bar: "bg-red-400",
  },
};

export function ContentPillarGrid({ pillars }: Props) {
  const sorted = [...pillars].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-3">
      {sorted.map((pillar) => {
        const cfg = STRENGTH_CONFIG[pillar.strength];
        const Icon = cfg.icon;

        return (
          <div key={pillar.name} className={`surface rounded-xl p-4 border ${cfg.border}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">#{pillar.rank}</span>
                <h3 className="text-sm font-semibold">{pillar.name}</h3>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                <Icon className="h-3 w-3" />
                {cfg.label}
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Pillar Score</span>
                <span className={cfg.color}>{pillar.score}/100</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cfg.bar} transition-all duration-1000`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{pillar.description}</p>

            {pillar.examples?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pillar.examples.map((ex, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                    {ex}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
