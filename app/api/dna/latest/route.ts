import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await (supabase
      .from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
      .select("id, raw_analysis")
      .eq("user_id", user.id)
      .eq("status", "complete")
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as unknown as {
        data: { id: string; raw_analysis: Record<string, unknown> } | null;
        error: unknown;
      };

    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }

    const raw = data.raw_analysis as {
      niche?: string;
      platform?: string;
    };

    return NextResponse.json({
      id: data.id,
      niche: raw?.niche ?? "",
      platform: raw?.platform ?? "youtube",
    });
  } catch {
    return NextResponse.json(null, { status: 404 });
  }
}
