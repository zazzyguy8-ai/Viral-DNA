import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContentIdeas, type IdeaGeneratorInput } from "@/lib/anthropic/idea-generator";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as IdeaGeneratorInput & { viral_dna_id?: string };
    const { platform, niche, contentStyle, audienceType, viral_dna_id, count } = body;

    if (!platform || !niche) {
      return NextResponse.json({ error: "platform and niche are required" }, { status: 400 });
    }

    let viralPatterns: string[] = [];
    if (viral_dna_id) {
      const { data: patterns } = await (supabase
        .from("viral_patterns") as ReturnType<typeof supabase.from>)
        .select("pattern")
        .eq("viral_dna_id", viral_dna_id)
        .eq("performance", "high") as unknown as { data: { pattern: string }[] | null };

      if (patterns) {
        viralPatterns = patterns.map((p) => p.pattern);
      }
    }

    const result = await generateContentIdeas({
      platform,
      niche,
      contentStyle,
      audienceType,
      viralPatterns,
      count: count ?? 10,
    });

    // Persist ideas to Supabase
    if (result.ideas.length) {
      await (supabase.from("content_ideas") as ReturnType<typeof supabase.from>).insert(
        result.ideas.map((idea) => ({
          user_id: user.id,
          viral_dna_id: viral_dna_id ?? null,
          title: idea.title,
          hook: idea.hook,
          format: idea.format,
          angle: idea.angle,
          estimated_virality: idea.estimated_virality,
          why_it_works: idea.why_it_works,
          cta: idea.cta,
          platform,
          status: "saved",
        }))
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Idea generation error:", err);
    return NextResponse.json({ error: "Idea generation failed" }, { status: 500 });
  }
}
