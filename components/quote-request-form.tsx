"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Field } from "./ui";
import { leadSchema, today, type LeadInput, type LeadValues } from "@/lib/lead-schema";

// The same schema the API route enforces, so the form can point at a bad field
// before the request is made — and the server still decides.
const schema = leadSchema;

const serviceStyles = ["Plated dinner", "Family style", "Buffet", "Passed canapés", "Drop-off catering", "Not sure yet"];
const referralSources = ["Instagram", "Google search", "Referral from a friend", "Worked with you before", "Wedding planner", "Other"];

type QuoteFormData = LeadValues;
type QuoteFormInput = LeadInput;

/** Where the visitor came from, for the caterer's own reporting. */
function captureSource() {
  if (typeof window === "undefined") return { source: "", referrer: "" };
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source") || params.get("ref") || "";
  const campaign = params.get("utm_campaign");
  return {
    source: [source, campaign].filter(Boolean).join(" · ").slice(0, 200),
    referrer: (document.referrer || "").slice(0, 300),
  };
}

export function QuoteRequestForm({ businessId, compact = false }: { businessId: string; compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const openedAt = useRef(0);
  const attribution = useRef({ source: "", referrer: "" });
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
    attribution.current = captureSource();
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting, submitCount }, reset } = useForm<QuoteFormInput, unknown, QuoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredContact: "Email" },
  });

  const errorList = Object.entries(errors)
    .map(([field, error]) => ({ field, message: (error as { message?: string })?.message }))
    .filter((entry): entry is { field: string; message: string } => Boolean(entry.message));
  const errorCount = errorList.length;

  // Move the reader to the summary whenever a submit attempt fails validation.
  useEffect(() => {
    if (submitCount > 0 && errorCount > 0) errorSummaryRef.current?.focus();
  }, [submitCount, errorCount]);

  const onSubmit = async (values: QuoteFormData, event?: React.BaseSyntheticEvent) => {
    setSubmitError("");

    // The honeypot and the elapsed time are reported rather than acted on: the
    // decision belongs to the server, where a bot cannot skip it by not
    // running this code. The insert itself goes through /api/leads, because
    // the anon key can no longer write to the table directly.
    const honeypot = (event?.target as HTMLFormElement | undefined)?.elements.namedItem("company") as HTMLInputElement | null;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          honeypot: honeypot?.value ?? "",
          elapsedMs: Date.now() - openedAt.current,
          lead: { ...values, source: attribution.current.source, referrer: attribution.current.referrer },
        }),
      });

      if (!response.ok) {
        const message = response.status === 429
          ? "We've received a lot of requests just now. Please try again in a few minutes."
          : "Something went wrong sending your request. Please try again or contact us directly.";
        setSubmitError(message);
        return;
      }
    } catch {
      setSubmitError("We couldn't reach the server. Please check your connection and try again.");
      return;
    }

    reset();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="quote-success" role="status">
        <CheckCircle2 size={42} />
        <span>Request received</span>
        <h3>Thank you for thinking of us.</h3>
        <p>We’ve saved your event details and will be in touch within one business day.</p>
        <Button type="button" variant="secondary" onClick={() => { openedAt.current = Date.now(); setSubmitted(false); }}>Send another request</Button>
      </div>
    );
  }

  return (
    <form className={`quote-form ${compact ? "compact" : ""}`} onSubmit={event => { void handleSubmit(onSubmit)(event); }} noValidate>
      {submitError && <div className="form-alert" role="alert">{submitError}</div>}
      {errorCount > 0 && submitCount > 0 && (
        <div className="form-alert" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          Please check {errorCount} field{errorCount === 1 ? "" : "s"} before sending:
          <ul>{errorList.map(entry => <li key={entry.field}>{entry.message}</li>)}</ul>
        </div>
      )}
      <p className="form-honeypot" aria-hidden="true">
        <label htmlFor="company">Company (leave this field empty)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </p>
      <div className="form-grid">
        <Field label="Your name"><input {...register("customerName")} aria-invalid={!!errors.customerName} autoComplete="name" placeholder="Full name" /><FormError message={errors.customerName?.message} /></Field>
        <Field label="Email"><input type="email" {...register("email")} aria-invalid={!!errors.email} autoComplete="email" placeholder="you@example.com" /><FormError message={errors.email?.message} /></Field>
        <Field label="Phone"><input type="tel" {...register("phone")} aria-invalid={!!errors.phone} autoComplete="tel" placeholder="(305) 555-0123" /><FormError message={errors.phone?.message} /></Field>
        <Field label="Event date"><input type="date" min={today()} {...register("eventDate")} aria-invalid={!!errors.eventDate} /><FormError message={errors.eventDate?.message} /></Field>
        <Field label="Start time" hint="Optional"><input type="time" {...register("eventTime")} /></Field>
        <Field label="Event type"><select {...register("eventType")} aria-invalid={!!errors.eventType}><option value="">Select event</option>{["Wedding", "Birthday", "Corporate event", "Shabbat dinner", "Private dinner", "Holiday event", "Other"].map(value => <option key={value}>{value}</option>)}</select><FormError message={errors.eventType?.message} /></Field>
        <Field label="Number of guests"><input type="number" min={2} {...register("guestCount")} aria-invalid={!!errors.guestCount} placeholder="50" /><FormError message={errors.guestCount?.message} /></Field>
        <Field label="Event location"><input {...register("eventLocation")} aria-invalid={!!errors.eventLocation} placeholder="Venue or neighborhood" /><FormError message={errors.eventLocation?.message} /></Field>
        <Field label="Estimated budget"><select {...register("budget")} aria-invalid={!!errors.budget}><option value="">Select range</option>{["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$20,000", "$20,000+"].map(value => <option key={value}>{value}</option>)}</select><FormError message={errors.budget?.message} /></Field>
        <Field label="Service style"><select {...register("serviceStyle")}><option value="">Not sure yet</option>{serviceStyles.map(value => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Preferred menu"><input {...register("preferredMenu")} placeholder="A package, dish, or style" /></Field>
        <Field label="Dietary requirements"><input {...register("dietaryRequirements")} placeholder="Kosher, vegan, allergies…" /></Field>
        <Field label="How did you hear about us?"><select {...register("hearAboutUs")}><option value="">Prefer not to say</option>{referralSources.map(value => <option key={value}>{value}</option>)}</select></Field>
      </div>
      <Field label="Tell us about your event"><textarea {...register("details")} aria-invalid={!!errors.details} rows={4} placeholder="What are you planning, and what would make it feel special?" /><FormError message={errors.details?.message} /></Field>
      <fieldset className="contact-method"><legend>Preferred contact method</legend>{["Email", "Phone", "WhatsApp"].map(value => <label key={value}><input type="radio" value={value} {...register("preferredContact")} /> <span>{value}</span></label>)}</fieldset>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={18} /> : <Send size={17} />} {isSubmitting ? "Sending…" : "Send event request"}</Button>
      <small className="form-privacy">By submitting, you agree to be contacted about this event. No spam, ever.</small>
    </form>
  );
}

function FormError({ message }: { message?: string }) {
  return message ? <em className="form-error" role="alert">{message}</em> : null;
}
