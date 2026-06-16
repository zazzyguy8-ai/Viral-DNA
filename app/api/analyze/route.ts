import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeViralDNA } from "@/lib/anthropic/viral-dna-analyzer";

export async function POST(request: Request) {
  // Step 1 — auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2 — parse body
  let body: Record<string, string>;
  try {
    body = await request.json() as Record<string, string>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { platform, handle, profileUrl, niche, contentDescription, bestPosts, postingFrequency } = body;

  if (!platform || !handle || !niche) {
    return NextResponse.json({ error: "platform, handle, and niche are required" }, { status: 400 });
  }

  // Step 3 — insert pending record
  const { data: dnaRecord, error: insertError } = await (supabase
    .from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
    .insert({ user_id: user.id, status: "processing", version: 1 })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (insertError || !dnaRecord) {
    console.error("Insert error:", insertError);
    return NextResponse.json({ error: `DB error: ${insertError?.message ?? "unknown"}` }, { status: 500 });
  }

  const dnaId = (dnaRecord as { id: string }).id;

  // Step 4 — run Claude
  let result;
  try {
    result = await analyzeViralDNA({
      platform,
      handle,
      profileUrl: profileUrl ?? undefined,
      niche,
      contentDescription: contentDescription ?? "",
      bestPosts: bestPosts ?? "",
      postingFrequency: postingFrequency ?? "unknown",
    });
  } catch (err) {
    console.error("Claude error:", err);
    await (supabase.from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .update({ status: "failed" })
      .eq("id", dnaId);
    return NextResponse.json({ error: "AI analysis failed — please try again" }, { status: 500 });
  }

  // Step 5 — save results
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
    .eq("id", dnaId) as unknown as { error: { message: string } | null };

  if (updateError) {
    console.error("Update error:", updateError);
    await (supabase.from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .update({ status: "failed" })
      .eq("id", dnaId);
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }

  // Step 6 — save pillars and patterns (non-blocking — don't fail on these)
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
    ).then(() => null).catch((err: unknown) => console.error("Pillar save error:", err));
  }

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
    ).then(() => null).catch((err: unknown) => console.error("Pattern save error:", err));
  }

  return NextResponse.json({ id: dnaId, result });
}
