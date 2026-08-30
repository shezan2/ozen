"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { disclaimers } from "@/lib/content";
import { Button } from "@/components/ui/Button";

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

type Values = {
  name: string;
  contact: string;
  currentWeight: string;
  goal: string;
  hours: string;
  tried: string;
  consent: boolean;
};

const EMPTY: Values = {
  name: "",
  contact: "",
  currentWeight: "",
  goal: "",
  hours: "3",
  tried: "",
  consent: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-mute outline-none focus:border-ink";

export default function EnquiryForm() {
  const ids = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "handoff" | "error">("idle");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Values, string>> = {};
    if (!values.name.trim()) next.name = "Tell me what to call you.";
    if (!values.contact.trim()) next.contact = "An email or a phone number, whichever you prefer.";
    if (!values.consent) next.consent = "Please agree before sending.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function summary(): string {
    return [
      `Enquiry from ${values.name}`,
      `Contact: ${values.contact}`,
      values.currentWeight ? `Weight now: ${values.currentWeight}kg` : null,
      values.goal ? `Goal: ${values.goal}` : null,
      values.hours ? `Hours a week available: ${values.hours}` : null,
      values.tried ? `Tried before: ${values.tried}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    // With no form endpoint configured the enquiry is handed to WhatsApp with
    // everything prefilled, rather than pretending to have been sent.
    if (!ENDPOINT) {
      setStatus("handoff");
      window.open(whatsAppLink(summary()), "_blank", "noopener,noreferrer");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, source: siteConfig.domain }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-line bg-surface-off p-8 sm:p-10">
        <h3 className="display text-2xl">Got it.</h3>
        <p className="mt-3 text-base leading-relaxed text-ink-mute">
          Your enquiry is in. You will get a reply from {siteConfig.coach.name} — usually a couple of
          questions before anything else.
        </p>
        <a
          href={whatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block font-semibold text-lime-deep underline underline-offset-4"
        >
          Or start the conversation on WhatsApp now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${ids}-name`} className="text-sm font-semibold text-ink">
            Your name <span className="text-lime-deep">*</span>
          </label>
          <input
            id={`${ids}-name`}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${ids}-name-error` : undefined}
            className={inputClass}
          />
          {errors.name ? (
            <p id={`${ids}-name-error`} className="mt-2 text-sm text-gold-deep">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${ids}-contact`} className="text-sm font-semibold text-ink">
            Email or phone <span className="text-lime-deep">*</span>
          </label>
          <input
            id={`${ids}-contact`}
            name="contact"
            autoComplete="email"
            value={values.contact}
            onChange={(e) => set("contact", e.target.value)}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? `${ids}-contact-error` : undefined}
            className={inputClass}
          />
          {errors.contact ? (
            <p id={`${ids}-contact-error`} className="mt-2 text-sm text-gold-deep">
              {errors.contact}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${ids}-weight`} className="text-sm font-semibold text-ink">
            Weight now (kg)
          </label>
          <input
            id={`${ids}-weight`}
            name="currentWeight"
            type="number"
            inputMode="decimal"
            min={35}
            max={250}
            step={0.5}
            value={values.currentWeight}
            onChange={(e) => set("currentWeight", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${ids}-hours`} className="text-sm font-semibold text-ink">
            Hours a week you actually have
          </label>
          <input
            id={`${ids}-hours`}
            name="hours"
            type="number"
            inputMode="decimal"
            min={0}
            max={20}
            step={0.5}
            value={values.hours}
            onChange={(e) => set("hours", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${ids}-goal`} className="text-sm font-semibold text-ink">
          What you want out of it
        </label>
        <input
          id={`${ids}-goal`}
          name="goal"
          value={values.goal}
          onChange={(e) => set("goal", e.target.value)}
          placeholder="Down to 80kg, and able to keep up with a five-year-old"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${ids}-tried`} className="text-sm font-semibold text-ink">
          What you have tried before
        </label>
        <p className="mt-1 text-sm text-ink-mute">
          The useful part. Whatever did not stick tells us more than what you weigh.
        </p>
        <textarea
          id={`${ids}-tried`}
          name="tried"
          rows={4}
          value={values.tried}
          onChange={(e) => set("tried", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${ids}-consent`} className="flex items-start gap-3 text-sm text-ink-mute">
          <input
            id={`${ids}-consent`}
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${ids}-consent-error` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-lime-deep"
          />
          <span>
            I agree that {siteConfig.brand} may use these details to reply to my enquiry, as set out
            in the{" "}
            <Link href="/privacy-policy" className="font-semibold text-lime-deep underline underline-offset-2">
              privacy policy
            </Link>
            . <span className="text-lime-deep">*</span>
          </span>
        </label>
        {errors.consent ? (
          <p id={`${ids}-consent-error`} className="mt-2 text-sm text-gold-deep">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-ink-mute">{disclaimers.preParticipation}</p>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </Button>
        <a
          href={whatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-ink underline underline-offset-4"
        >
          Or just message {siteConfig.contact.whatsappKeyword} on WhatsApp
        </a>
      </div>

      <div aria-live="polite" className="min-h-6">
        {status === "handoff" ? (
          <p className="text-sm text-ink-mute">
            WhatsApp should have opened with your details filled in — send the message there and it
            reaches {siteConfig.coach.name} directly.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-gold-deep">
            That did not go through. Try again, or message {siteConfig.contact.whatsappKeyword} on
            WhatsApp instead.
          </p>
        ) : null}
      </div>
    </form>
  );
}
