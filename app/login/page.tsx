"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandMark, Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { sizedImage } from "@/lib/utils";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <BrandMark />
        <div className="auth-form-wrap">
          <span className="eyebrow plain">Welcome back</span>
          <h1>Continue building your business.</h1>
          <p>Log in to update your site, manage menus, and respond to new event inquiries.</p>
          <form onSubmit={submit}>
            {error && <div className="form-alert">{error}</div>}
            <Field label="Email address"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Password"><div className="password-field"><input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <div className="form-row"><label><input type="checkbox" defaultChecked /> Remember me</label><button type="button" onClick={() => window.alert("Password reset is not available yet — contact support.")}>Forgot password?</button></div>
            <Button type="submit" disabled={loading}>{loading ? "Signing in…" : <>Log in <ArrowRight size={17} /></>}</Button>
          </form>
          <p className="auth-switch">New to ServeSite? <Link href="/signup">Start your free trial</Link></p>
        </div>
        <small>By continuing, you agree to our demo Terms and Privacy Policy.</small>
      </section>
      <section className="auth-visual">
        <img src={sizedImage("https://images.unsplash.com/photo-1555244162-803834f70033", 1200)} alt="Elegant catering presentation" loading="lazy" decoding="async" />
        <div className="auth-quote"><blockquote>“Our website finally feels like the experience we create for our clients.”</blockquote><span>Olivia Ember · Olive &amp; Ember Catering <i>Demo story</i></span></div>
        <div className="auth-floating"><CheckCircle2 size={20} /><span><strong>Your website is live</strong><small>olive-and-ember.servesite.co</small></span></div>
      </section>
    </main>
  );
}
