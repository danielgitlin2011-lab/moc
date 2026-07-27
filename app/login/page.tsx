"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark, Button, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/dashboard"), 500);
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
            <Field label="Email address"><input type="email" required defaultValue="olivia@oliveandember.com" /></Field>
            <Field label="Password"><div className="password-field"><input type={showPassword ? "text" : "password"} required defaultValue="servesite" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <div className="form-row"><label><input type="checkbox" defaultChecked /> Remember me</label><button type="button" onClick={() => window.alert("Demo: password reset instructions would be sent by email.")}>Forgot password?</button></div>
            <Button type="submit" disabled={loading}>{loading ? "Opening workspace…" : <>Log in <ArrowRight size={17} /></>}</Button>
          </form>
          <p className="auth-switch">New to ServeSite? <Link href="/onboarding">Start your free trial</Link></p>
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
