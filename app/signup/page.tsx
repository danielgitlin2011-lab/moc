"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark, Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Your account was created. Please check your email to confirm it, then log in.");
      setLoading(false);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <BrandMark />
        <div className="auth-form-wrap">
          <span className="eyebrow plain">Start your trial</span>
          <h1>Build your catering website in minutes.</h1>
          <p>Create your account, then we&apos;ll walk you through setting up your business.</p>
          <form onSubmit={submit}>
            {error && <div className="form-alert">{error}</div>}
            <Field label="Email address"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Password"><div className="password-field"><input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <Field label="Confirm password"><input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></Field>
            <Button type="submit" disabled={loading}>{loading ? "Creating account…" : <>Create account <ArrowRight size={17} /></>}</Button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
        </div>
        <small>By continuing, you agree to our demo Terms and Privacy Policy.</small>
      </section>
      <section className="auth-visual">
        <img src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85" alt="Elegant catering presentation" />
        <div className="auth-quote"><blockquote>“Our website finally feels like the experience we create for our clients.”</blockquote><span>Olivia Ember · Olive &amp; Ember Catering <i>Demo story</i></span></div>
        <div className="auth-floating"><CheckCircle2 size={20} /><span><strong>Your website is live</strong><small>olive-and-ember.servesite.co</small></span></div>
      </section>
    </main>
  );
}
