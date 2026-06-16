import { createClient } from "@/lib/supabase/server";
import { getUserPlan, getViralDnaCount } from "@/lib/usage";
import { SettingsUpgradeSection } from "@/components/settings/SettingsUpgradeSection";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profileRes = await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
    .select("full_name, username, plan")
    .eq("id", user!.id)
    .single() as unknown as { data: { full_name: string | null; username: string | null; plan: string | null } | null };
  const profile = profileRes.data;

  const plan = await getUserPlan(supabase, user!.id);
  const used = await getViralDnaCount(supabase, user!.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="surface rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{profile?.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${plan === "pro" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
              {plan}
            </span>
          </div>
        </div>
      </div>

      <SettingsUpgradeSection plan={plan} used={used} limit={2} />
    </div>
  );
}
