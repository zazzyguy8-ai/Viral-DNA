"use client";

import { useState } from "react";
import { Dna, RefreshCw, Users, Lightbulb, Target } from "lucide-react";
import { AnalysisForm } from "@/components/viral-dna/AnalysisForm";
import { DNAScoreRing } from "@/components/viral-dna/DNAScoreRing";
import { DNARadarChart } from "@/components/viral-dna/DNARadarChart";
import { ContentPillarGrid } from "@/components/viral-dna/ContentPillarGrid";
import { ViralPatternList } from "@/components/viral-dna/ViralPatternList";
import type { ViralDNAResult } from "@/lib/anthropic/viral-dna-analyzer";

export default function ViralDnaPage() {
  const [result, setResult] = useState<ViralDNAResult | null>(null);

  if (!result) {
    return (
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Viral DNA Analysis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about your content and Claude will identify your hidden growth patterns.
          </p>
        </div>
        <div className="surface rounded-xl p-6">
          <AnalysisForm onResult={setResult} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Your Viral DNA Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">{result.creator_positioning}</p>
        </div>
        <button
          onClick={() => setResult(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-analyze
        </button>
      </div>

      {/* Summary banner */}
      <div className="surface-elevated rounded-xl p-5 border border-primary/20">
        <p className="text-sm text-foreground leading-relaxed">{result.analysis_summary}</p>
      </div>

      {/* Scores — main ring + radar */}
      <div className="surface rounded-xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">DNA Scores</p>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <DNAScoreRing
            score={result.overall_score}
            size={160}
            strokeWidth={12}
            label="Viral DNA Score"
            sublabel="Overall"
          />
          <div className="flex-1 w-full">
            <DNARadarChart
              growth={result.growth_score}
              consistency={result.consistency_score}
              branding={result.branding_score}
              audienceClarity={result.audience_clarity_score}
              overall={result.overall_score}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col">
            {[
              { label: "Growth", score: result.growth_score },
              { label: "Consistency", score: result.consistency_score },
              { label: "Branding", score: result.branding_score },
              { label: "Audience", score: result.audience_clarity_score },
            ].map(({ label, score }) => (
              <DNAScoreRing key={label} score={score} size={80} strokeWidth={7} label={label} />
            ))}
          </div>
        </div>
      </div>

      {/* Audience + Style cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Audience Type</p>
          </div>
          <p className="text-sm text-foreground">{result.audience_type}</p>
        </div>
        <div className="surface rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content Style</p>
          </div>
          <p className="text-sm text-foreground">{result.content_style}</p>
        </div>
        <div className="surface rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Positioning</p>
          </div>
          <p className="text-sm font-semibold gradient-text">{result.creator_positioning}</p>
        </div>
      </div>

      {/* Content Pillars */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Dna className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content Pillars</p>
        </div>
        <ContentPillarGrid pillars={result.content_pillars} />
      </div>

      {/* Viral Patterns */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Viral Patterns Detected</p>
        </div>
        <ViralPatternList patterns={result.viral_patterns} />
      </div>
    </div>
  );
}
