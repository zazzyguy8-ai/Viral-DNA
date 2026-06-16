import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<"free" | "pro"> {
  const { data } = await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
    .select("plan")
    .eq("id", userId)
    .single() as unknown as { data: { plan: string } | null };
  return (data?.plan === "pro" || data?.plan === "agency") ? "pro" : "free";
}

export async function getViralDnaCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await (supabase.from("viral_dna_profiles") as ReturnType<typeof supabase.from>)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["complete", "processing"]) as unknown as { count: number | null };
  return count ?? 0;
}

export async function canRunAnalysis(supabase: SupabaseClient, userId: string): Promise<{ allowed: boolean; plan: string; used: number; limit: number }> {
  const plan = await getUserPlan(supabase, userId);
  if (plan === "pro") return { allowed: true, plan, used: 0, limit: Infinity };
  const used = await getViralDnaCount(supabase, userId);
  return { allowed: used < 2, plan, used, limit: 2 };
}
