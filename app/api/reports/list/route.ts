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
      .from("weekly_reports") as ReturnType<typeof supabase.from>)
      .select("id, week_start, week_end, report_data, generated_at")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(10) as unknown as {
        data: Array<{
          id: string;
          week_start: string;
          week_end: string;
          report_data: Record<string, unknown>;
          generated_at: string;
        }> | null;
      };

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
