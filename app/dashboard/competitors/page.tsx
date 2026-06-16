"use client";

import { useState, useEffect } from "react";
import { Users2, Plus, ShieldAlert } from "lucide-react";
import { AddCompetitorForm } from "@/components/competitors/AddCompetitorForm";
import { CompetitorCard } from "@/components/competitors/CompetitorCard";
import type { CompetitorAnalysis } from "@/lib/anthropic/competitor-analyzer";

interface SavedCompetitor {
  id: string;
  handle: string;
  platform: string;
  analysis: CompetitorAnalysis;
  analyzedAt: string;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<SavedCompetitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompetitors() {
      try {
        const res = await fetch("/api/competitors/list");
        if (res.ok) {
          const data = await res.json() as SavedCompetitor[];
          setCompetitors(data);
          if (data.length === 0) setShowForm(true);
        }
      } catch {
        setShowForm(true);
      } finally {
        setLoading(false);
      }
    }
    loadCompetitors();
  }, []);

  function handleNewCompetitor(handle: string, platform: string, analysis: CompetitorAnalysis) {
    const newEntry: SavedCompetitor = {
      id: crypto.randomUUID(),
      handle,
      platform,
      analysis,
      analyzedAt: new Date().toISOString(),
    };
    setCompetitors((prev) => [newEntry, ...prev]);
    setShowForm(false);
  }

  const highThreats = competitors.filter((c) => c.analysis.threat_level === "high").length;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Competitor DNA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Spy on any creator's strategy. Find their gaps. Steal their audience.
          </p>
        </div>
        {competitors.length > 0 && (
          <button
            onClick={() => setShowForm((x) => !x)}
            className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-lg px-3 py-2 hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Competitor
          </button>
        )}
      </div>

      {/* Summary chips */}
      {competitors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground font-medium">
            {competitors.length} competitor{competitors.length !== 1 ? "s" : ""} tracked
          </span>
          {highThreats > 0 && (
            <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-400/10 border border-red-400/20 text-red-400 font-medium">
              <ShieldAlert className="h-3 w-3" />
              {highThreats} high threat{highThreats !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add form — shown if toggled or no competitors yet */}
        {(showForm || competitors.length === 0) && (
          <div className="lg:col-span-1">
            <div className="surface rounded-xl p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Add Competitor
                </p>
              </div>
              <AddCompetitorForm onResult={handleNewCompetitor} />
            </div>
          </div>
        )}

        {/* Competitor list */}
        <div className={`space-y-4 ${showForm || competitors.length === 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : competitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-4 glow-primary">
                <Users2 className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No competitors yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a competitor to get a full intelligence report</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {competitors.map((c) => (
                <CompetitorCard
                  key={c.id}
                  handle={c.handle}
                  platform={c.platform}
                  analysis={c.analysis}
                  analyzedAt={c.analyzedAt}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
