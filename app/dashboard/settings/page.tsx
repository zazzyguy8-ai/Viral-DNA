import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile — may be null before Supabase is configured
  const profileRes = await supabase
    .from("profiles")
    .select("full_name, username, plan")
    .eq("id", user!.id)
    .single();
  const profile = profileRes.data as { full_name: string | null; username: string | null; plan: string | null } | null;

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
            <span className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-primary/10 text-primary">
              {profile?.plan ?? "free"}
            </span>
          </div>
        </div>
      </div>

      <div className="surface rounded-xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Upgrade</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Unlock unlimited analyses, PDF export, and competitor DNA.
        </p>
        <button className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold opacity-50 cursor-not-allowed">
          Upgrade to Pro — $29/mo (coming soon)
        </button>
      </div>
    </div>
  );
}
