"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "./app-provider";
import { Button, Field } from "./ui";
import { uid } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  eventDate: z.string().min(1, "Choose an event date"),
  eventTime: z.string().optional(),
  eventLocation: z.string().min(2, "Enter an event location"),
  eventType: z.string().min(1, "Choose an event type"),
  guestCount: z.coerce.number().min(2, "Enter at least 2 guests"),
  budget: z.string().min(1, "Choose an estimated budget"),
  serviceStyle: z.string().optional(),
  preferredMenu: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  details: z.string().min(10, "Share a little more about your event"),
  preferredContact: z.string().min(1),
  hearAboutUs: z.string().optional(),
});

const serviceStyles = ["Plated dinner", "Family style", "Buffet", "Passed canapés", "Drop-off catering", "Not sure yet"];
const referralSources = ["Instagram", "Google search", "Referral from a friend", "Worked with you before", "Wedding planner", "Other"];

type QuoteFormData = z.infer<typeof schema>;
type QuoteFormInput = z.input<typeof schema>;

export function QuoteRequestForm({ compact = false }: { compact?: boolean }) {
  const { setState } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<QuoteFormInput, unknown, QuoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredContact: "Email" },
  });

  const onSubmit = async (values: QuoteFormData) => {
    await new Promise(resolve => window.setTimeout(resolve, 450));
    setState(current => ({
      ...current,
      leads: [{
        id: uid("lead"),
        customerName: values.customerName,
        email: values.email,
        phone: values.phone,
        eventDate: values.eventDate,
        eventTime: values.eventTime || "Not specified",
        eventLocation: values.eventLocation,
        eventType: values.eventType,
        guestCount: values.guestCount,
        budget: values.budget,
        serviceStyle: values.serviceStyle || "Open to recommendations",
        preferredMenu: values.preferredMenu || "Open to recommendations",
        dietaryRequirements: values.dietaryRequirements || "None shared",
        details: values.details,
        preferredContact: values.preferredContact,
        hearAboutUs: values.hearAboutUs || "Not shared",
        receivedAt: new Date().toISOString().slice(0, 10),
        status: "New",
        notes: [],
      }, ...current.leads],
    }));
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
        <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>Send another request</Button>
      </div>
    );
  }

  return (
    <form className={`quote-form ${compact ? "compact" : ""}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <Field label="Your name"><input {...register("customerName")} aria-invalid={!!errors.customerName} placeholder="Full name" /><FormError message={errors.customerName?.message} /></Field>
        <Field label="Email"><input type="email" {...register("email")} aria-invalid={!!errors.email} placeholder="you@example.com" /><FormError message={errors.email?.message} /></Field>
        <Field label="Phone"><input {...register("phone")} aria-invalid={!!errors.phone} placeholder="(305) 555-0123" /><FormError message={errors.phone?.message} /></Field>
        <Field label="Event date"><input type="date" {...register("eventDate")} aria-invalid={!!errors.eventDate} /><FormError message={errors.eventDate?.message} /></Field>
        <Field label="Start time" hint="Optional"><input type="time" {...register("eventTime")} /></Field>
        <Field label="Event type"><select {...register("eventType")} aria-invalid={!!errors.eventType}><option value="">Select event</option>{["Wedding", "Birthday", "Corporate event", "Shabbat dinner", "Private dinner", "Holiday event", "Other"].map(value => <option key={value}>{value}</option>)}</select><FormError message={errors.eventType?.message} /></Field>
        <Field label="Number of guests"><input type="number" {...register("guestCount")} aria-invalid={!!errors.guestCount} placeholder="50" /><FormError message={errors.guestCount?.message} /></Field>
        <Field label="Event location"><input {...register("eventLocation")} aria-invalid={!!errors.eventLocation} placeholder="Venue or neighborhood" /><FormError message={errors.eventLocation?.message} /></Field>
        <Field label="Estimated budget"><select {...register("budget")} aria-invalid={!!errors.budget}><option value="">Select range</option>{["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$20,000", "$20,000+"].map(value => <option key={value}>{value}</option>)}</select><FormError message={errors.budget?.message} /></Field>
        <Field label="Service style"><select {...register("serviceStyle")}><option value="">Not sure yet</option>{serviceStyles.map(value => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Preferred menu"><input {...register("preferredMenu")} placeholder="A package, dish, or style" /></Field>
        <Field label="Dietary requirements"><input {...register("dietaryRequirements")} placeholder="Kosher, vegan, allergies…" /></Field>
        <Field label="How did you hear about us?"><select {...register("hearAboutUs")}><option value="">Prefer not to say</option>{referralSources.map(value => <option key={value}>{value}</option>)}</select></Field>
      </div>
      <Field label="Tell us about your event"><textarea {...register("details")} aria-invalid={!!errors.details} rows={4} placeholder="What are you planning, and what would make it feel special?" /><FormError message={errors.details?.message} /></Field>
      <fieldset className="contact-method"><legend>Preferred contact method</legend>{["Email", "Phone", "WhatsApp"].map(value => <label key={value}><input type="radio" value={value} {...register("preferredContact")} /> <span>{value}</span></label>)}</fieldset>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={18} /> : <Send size={17} />} Send event request</Button>
      <small className="form-privacy">By submitting, you agree to be contacted about this event. No spam, ever.</small>
    </form>
  );
}

function FormError({ message }: { message?: string }) {
  return message ? <em className="form-error">{message}</em> : null;
}
