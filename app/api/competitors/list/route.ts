import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RawRow {
  id: string;
  handle: string;
  platform: string;
  competitor_analyses: Array<{
    comparison_data: Record<string, unknown>;
    generated_at: string;
  }>;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await (supabase
      .from("competitors") as ReturnType<typeof supabase.from>)
      .select("id, handle, platform, competitor_analyses(comparison_data, generated_at)")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false }) as unknown as { data: RawRow[] | null };

    if (!data) return NextResponse.json([]);

    const result = data
      .filter((c) => c.competitor_analyses?.length > 0)
      .map((c) => {
        const latest = c.competitor_analyses[c.competitor_analyses.length - 1];
        return {
          id: c.id,
          handle: c.handle,
          platform: c.platform,
          analysis: latest.comparison_data,
          analyzedAt: latest.generated_at,
        };
      });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
