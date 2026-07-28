"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark, Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { sizedImage } from "@/lib/utils";

type Stage = "checking" | "ready" | "invalid" | "done";

/**
 * Where the emailed reset link lands.
 *
 * Supabase turns the link's token into a short-lived session before this page
 * renders, so `updateUser` is authenticated by that session. If someone opens
 * this URL directly — no link, no session — there is nothing to update, and
 * saying so is better than showing a form that cannot work.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // The token exchange can complete either before or after this mounts, so
    // check once and also listen for the recovery event.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setStage(current => (current === "done" ? current : "ready"));
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setStage(current => (current === "checking" ? (data.session ? "ready" : "invalid") : current));
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Please use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(authErrorMessage(updateError, "We couldn't update your password. Request a new link and try again."));
      return;
    }
    setStage("done");
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <BrandMark />
        <div className="auth-form-wrap">
          {stage === "done" ? (
            <>
              <span className="eyebrow plain">All set</span>
              <h1>Your password has been changed.</h1>
              <p>You&apos;re signed in on this device. Any other device will need the new password.</p>
              <Button onClick={() => { router.push("/dashboard"); router.refresh(); }}>Go to your dashboard <ArrowRight size={17} /></Button>
            </>
          ) : stage === "invalid" ? (
            <>
              <span className="eyebrow plain">Link expired</span>
              <h1>This reset link is no longer valid.</h1>
              <p>Reset links can be used once and expire after an hour. Request a fresh one and it will arrive in a moment.</p>
              <Button onClick={() => router.push("/login")}>Back to log in <ArrowRight size={17} /></Button>
            </>
          ) : (
            <>
              <span className="eyebrow plain">Choose a new password</span>
              <h1>Set a new password.</h1>
              <p>Pick something at least {MIN_PASSWORD_LENGTH} characters long that you don&apos;t use anywhere else.</p>
              <form onSubmit={submit}>
                {error && <div className="form-alert" role="alert">{error}</div>}
                <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters`}>
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm new password">
                  <input type={showPassword ? "text" : "password"} required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </Field>
                <Button type="submit" disabled={saving || stage === "checking"}>
                  {saving ? "Saving…" : <>Save new password <ArrowRight size={17} /></>}
                </Button>
              </form>
              <p className="auth-switch"><Link href="/login">Back to log in</Link></p>
            </>
          )}
        </div>
        <small>By continuing, you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</small>
      </section>
      <section className="auth-visual">
        <img src={sizedImage("https://images.unsplash.com/photo-1555244162-803834f70033", 1200)} alt="Elegant food presentation" loading="lazy" decoding="async" />
        <div className="auth-quote">
          <blockquote>“Our website finally feels like the experience we create for our clients.”</blockquote>
          <span>Olivia Ember · Olive &amp; Ember <i>Demo story</i></span>
        </div>
        <div className="auth-floating">
          {stage === "done" ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
          <span><strong>{stage === "done" ? "Password updated" : "Secure reset"}</strong><small>This link works once</small></span>
        </div>
      </section>
    </main>
  );
}
