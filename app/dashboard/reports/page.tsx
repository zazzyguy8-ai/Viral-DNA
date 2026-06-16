"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Loader2, TrendingUp, TrendingDown, Target,
  Zap, Calendar, Star, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WeeklyReport } from "@/lib/anthropic/report-generator";

interface SavedReport {
  id: string;
  week_start: string;
  week_end: string;
  report_data: WeeklyReport;
  generated_at: string;
}

const PRIORITY_CONFIG = {
  high: { color: "text-red-400", bg: "bg-red-400/10", dot: "bg-red-400" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
};

function formatWeek(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function ReportView({ report, weekStart, weekEnd }: { report: WeeklyReport; weekStart: string; weekEnd: string }) {
  return (
    <div className="space-y-6">
      {/* Week label */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{formatWeek(weekStart, weekEnd)}</p>
      </div>

      {/* Assessment */}
      <div className="surface-elevated rounded-xl p-5 border border-primary/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">This Week&apos;s Assessment</p>
        <p className="text-sm text-foreground leading-relaxed">{report.overall_assessment}</p>
      </div>

      {/* Weekly focus */}
      <div className="rounded-xl bg-primary/10 border border-primary/25 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Weekly Focus</p>
        </div>
        <p className="text-sm font-semibold text-foreground">{report.weekly_focus}</p>
      </div>

      {/* Wins + Losses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="surface rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Wins</p>
          </div>
          <ul className="space-y-2">
            {report.wins.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Losses</p>
          </div>
          <ul className="space-y-2">
            {report.losses.map((l, i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended actions */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Action Plan</p>
        </div>
        <div className="space-y-2">
          {report.recommended_actions.map((action, i) => {
            const cfg = PRIORITY_CONFIG[action.priority];
            return (
              <div key={i} className="surface rounded-xl p-4 flex gap-3">
                <div className={`w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{action.action}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {action.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.impact}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth opportunities */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Target className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Growth Opportunities</p>
        </div>
        <div className="space-y-2">
          {report.growth_opportunities.map((opp, i) => (
            <div key={i} className="surface rounded-xl px-4 py-3 text-xs text-foreground flex gap-2">
              <span className="text-amber-400 flex-shrink-0">→</span>
              {opp}
            </div>
          ))}
        </div>
      </div>

      {/* Content plan */}
      {report.content_plan?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content Plan</p>
          </div>
          <div className="space-y-2">
            {report.content_plan.map((item, i) => (
              <div key={i} className="surface rounded-xl p-3 flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-20 flex-shrink-0">{item.day}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0 capitalize">
                  {item.format}
                </span>
                <span className="text-xs text-foreground truncate">{item.topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mindset note */}
      <div className="rounded-xl bg-secondary border border-border p-4">
        <p className="text-xs text-muted-foreground italic leading-relaxed">&ldquo;{report.mindset_note}&rdquo;</p>
      </div>
    </div>
  );
}

function PastReportRow({
  report,
  active,
  onSelect,
}: {
  report: SavedReport;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl px-4 py-3 border transition-all flex items-center justify-between gap-3 ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "surface border-border hover:border-primary/30 text-muted-foreground"
      }`}
    >
      <div>
        <p className="text-xs font-semibold">{formatWeek(report.week_start, report.week_end)}</p>
        <p className="text-xs opacity-60 mt-0.5">
          Generated {new Date(report.generated_at).toLocaleDateString()}
        </p>
      </div>
      {active ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports/list");
        if (res.ok) {
          const data = await res.json() as SavedReport[];
          setReports(data);
          if (data.length > 0) setActiveId(data[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", { method: "POST" });
      const data = await res.json() as { report?: WeeklyReport; weekStart?: string; weekEnd?: string; error?: string };

      if (!res.ok || !data.report) {
        setError(data.error ?? "Generation failed. Try again.");
        return;
      }

      const newReport: SavedReport = {
        id: crypto.randomUUID(),
        week_start: (data.weekStart ?? "").split("T")[0],
        week_end: (data.weekEnd ?? "").split("T")[0],
        report_data: data.report,
        generated_at: new Date().toISOString(),
      };
      setReports((prev) => [newReport, ...prev]);
      setActiveId(newReport.id);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  const activeReport = reports.find((r) => r.id === activeId);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Weekly Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered growth reports with wins, losses, and a prioritized action plan.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="gradient-primary text-white font-semibold gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate This Week
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-4 glow-primary">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No reports yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Generate This Week&quot; to get your first AI-powered growth report
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Past reports sidebar */}
          {reports.length > 1 && (
            <div className="lg:col-span-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Past Reports</p>
              {reports.map((r) => (
                <PastReportRow
                  key={r.id}
                  report={r}
                  active={r.id === activeId}
                  onSelect={() => setActiveId(r.id)}
                />
              ))}
            </div>
          )}

          {/* Active report */}
          <div className={reports.length > 1 ? "lg:col-span-3" : "lg:col-span-4"}>
            {activeReport && (
              <ReportView
                report={activeReport.report_data}
                weekStart={activeReport.week_start}
                weekEnd={activeReport.week_end}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
