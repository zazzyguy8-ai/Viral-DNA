import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeCompetitor, type CompetitorInput } from "@/lib/anthropic/competitor-analyzer";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
      .upsert({ id: user.id, full_name: user.user_metadata?.full_name ?? null }, { onConflict: "id" });

    const body = await request.json() as CompetitorInput;
    const { platform, handle, niche, description } = body;

    if (!platform || !handle || !niche) {
      return NextResponse.json({ error: "platform, handle, and niche are required" }, { status: 400 });
    }

    const cleanHandle = handle.replace("@", "");

    // Check if competitor already exists
    const { data: existing } = await (supabase
      .from("competitors") as ReturnType<typeof supabase.from>)
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("handle", cleanHandle)
      .maybeSingle() as unknown as { data: { id: string } | null };

    let competitorId: string;

    if (existing) {
      competitorId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await (supabase
        .from("competitors") as ReturnType<typeof supabase.from>)
        .insert({ user_id: user.id, platform, handle: cleanHandle, display_name: null })
        .select("id")
        .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

      if (insertError || !inserted) {
        const msg = (insertError as { message?: string } | null)?.message ?? "unknown";
        console.error("Competitor insert error:", msg);
        return NextResponse.json({ error: `Failed to save competitor: ${msg}` }, { status: 500 });
      }
      competitorId = inserted.id;
    }

    const competitor = { id: competitorId };

    const analysis = await analyzeCompetitor({ platform, handle, niche, description });

    // Update display_name on competitor record
    await (supabase.from("competitors") as ReturnType<typeof supabase.from>)
      .update({ display_name: analysis.display_name, follower_count: analysis.estimated_followers })
      .eq("id", competitor.id);

    // Save analysis
    await (supabase.from("competitor_analyses") as ReturnType<typeof supabase.from>).insert({
      user_id: user.id,
      competitor_id: competitor.id,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      content_gaps: analysis.content_gaps,
      opportunities: analysis.opportunities,
      comparison_data: analysis as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ competitor_id: competitor.id, analysis });
  } catch (err) {
    console.error("Competitor analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
