import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyReport } from "@/lib/anthropic/report-generator";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
      .upsert({ id: user.id, full_name: user.user_metadata?.full_name ?? null }, { onConflict: "id" });

    // Get latest DNA profile
    const { data: dnaRows } = await (supabase
      .from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .select("overall_score, raw_analysis")
      .eq("user_id", user.id)
      .eq("status", "complete")
      .order("generated_at", { ascending: false })
      .limit(1) as unknown as {
        data: Array<{ overall_score: number | null; raw_analysis: Record<string, unknown> | null }> | null;
      };

    const latestDna = dnaRows?.[0] ?? null;
    const raw = latestDna?.raw_analysis as Record<string, unknown> | null;

    // Count ideas generated
    const { count: ideasCount } = await (supabase
      .from("content_ideas") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id) as unknown as { count: number | null };

    // Count competitors
    const { count: competitorCount } = await (supabase
      .from("competitors") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id) as unknown as { count: number | null };

    // Get top viral patterns
    const { data: patterns } = await (supabase
      .from("viral_patterns") as ReturnType<typeof supabase.from>)
      .select("pattern")
      .eq("performance", "high")
      .limit(5) as unknown as { data: Array<{ pattern: string }> | null };

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const report = await generateWeeklyReport({
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
      dnaScore: latestDna?.overall_score ?? null,
      niche: raw?.niche as string | undefined,
      platform: raw?.platform as string | undefined,
      contentStyle: raw?.content_style as string | undefined,
      ideasGeneratedCount: ideasCount ?? 0,
      competitorsTracked: competitorCount ?? 0,
      topViralPatterns: patterns?.map((p) => p.pattern) ?? [],
    });

    // Save report
    await (supabase.from("weekly_reports") as ReturnType<typeof supabase.from>).insert({
      user_id: user.id,
      week_start: weekStart.toISOString().split("T")[0],
      week_end: weekEnd.toISOString().split("T")[0],
      wins: report.wins,
      losses: report.losses,
      growth_opportunities: report.growth_opportunities,
      recommended_actions: report.recommended_actions.map((a) => a.action),
      report_data: report as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ report, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
