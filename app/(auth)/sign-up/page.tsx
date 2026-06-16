"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled in Supabase, session is created immediately
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setDone(true);
  }

  async function handleResend() {
    setResending(true);
    setResent(false);
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setResending(false);
    setResent(true);
  }

  if (done) {
    return (
      <div>
        <div className="mb-8 text-center">
          <img src="/viral-dna-icon.svg" alt="Viral DNA" className="h-14 w-14 mx-auto mb-3 rounded-2xl" />
          <span className="text-2xl font-bold tracking-tight gradient-text">Viral DNA</span>
        </div>
        <div className="surface rounded-xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6 text-[#6D28D9]" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">Check your email</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Confirmation link sent to <span className="text-foreground font-medium">{email}</span>.<br />
              Check spam if you don&apos;t see it.
            </p>
          </div>
          <div className="pt-1">
            {resent ? (
              <p className="text-xs text-[#6D28D9] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Email resent!
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {resending ? "Sending…" : "Didn't get it? Resend email"}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Already confirmed?{" "}
            <Link href="/sign-in" className="text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <img src="/viral-dna-icon.svg" alt="Viral DNA" className="h-14 w-14 mx-auto mb-3 rounded-2xl" />
        <span className="text-2xl font-bold tracking-tight gradient-text">Viral DNA</span>
        <p className="mt-2 text-sm text-muted-foreground">Discover your Viral DNA — free</p>
      </div>

      <div className="surface rounded-xl p-6 space-y-5">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wide">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wide">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-secondary border-border"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create free account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
