import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeViralDNA, type ViralDNAInput } from "@/lib/anthropic/viral-dna-analyzer";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as ViralDNAInput;
    const { platform, handle, niche, contentDescription, bestPosts, postingFrequency } = body;

    if (!platform || !handle || !niche) {
      return NextResponse.json({ error: "platform, handle, and niche are required" }, { status: 400 });
    }

    // Create a pending DNA profile record
    const { data: dnaRecord, error: insertError } = await (supabase
      .from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .insert({ user_id: user.id, status: "processing", version: 1 })
      .select("id")
      .single() as unknown as { data: { id: string } | null; error: unknown };

    if (insertError || !dnaRecord) {
      return NextResponse.json({ error: "Failed to create analysis record" }, { status: 500 });
    }

    // Run Claude analysis
    const result = await analyzeViralDNA({
      platform,
      handle,
      niche,
      contentDescription: contentDescription ?? "",
      bestPosts: bestPosts ?? "",
      postingFrequency: postingFrequency ?? "unknown",
    });

    // Save full results to Supabase
    const { error: updateError } = await (supabase
      .from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .update({
        overall_score: result.overall_score,
        growth_score: result.growth_score,
        consistency_score: result.consistency_score,
        branding_score: result.branding_score,
        audience_clarity_score: result.audience_clarity_score,
        audience_type: result.audience_type,
        content_style: result.content_style,
        creator_positioning: result.creator_positioning,
        analysis_summary: result.analysis_summary,
        raw_analysis: { ...result, platform, niche, handle } as unknown as Record<string, unknown>,
        status: "complete",
      })
      .eq("id", (dnaRecord as { id: string }).id) as unknown as { error: unknown };

    if (updateError) {
      await (supabase.from("viral_dna_profiles") as ReturnType<typeof supabase.from>).update({ status: "failed" }).eq("id", (dnaRecord as { id: string }).id);
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    const dnaId = (dnaRecord as { id: string }).id;

    // Save content pillars
    if (result.content_pillars?.length) {
      await (supabase.from("content_pillars") as ReturnType<typeof supabase.from>).insert(
        result.content_pillars.map((p) => ({
          viral_dna_id: dnaId,
          name: p.name,
          strength: p.strength,
          description: p.description,
          examples: p.examples,
          score: p.score,
          rank: p.rank,
        }))
      );
    }

    // Save viral patterns
    if (result.viral_patterns?.length) {
      await (supabase.from("viral_patterns") as ReturnType<typeof supabase.from>).insert(
        result.viral_patterns.map((p) => ({
          viral_dna_id: dnaId,
          type: p.type,
          pattern: p.pattern,
          performance: p.performance,
          examples: p.examples,
          frequency: p.frequency,
        }))
      );
    }

    return NextResponse.json({ id: dnaId, result });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
