"use client";

import { useState } from "react";
import { inputCls, labelCls, useLeadSubmit } from "@/components/useLeadSubmit";
import { formatDateLong, toIsoDate } from "@/lib/booking";

interface BookingFormProps {
  date: Date;
  slot: string;
  onBack: () => void;
  onDone: (name: string) => void;
}

export default function BookingForm({ date, slot, onBack, onDone }: BookingFormProps) {
  const { state, submit } = useLeadSubmit();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [details, setDetails] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit({
      type: "booking",
      date: toIsoDate(date),
      slot,
      name,
      email,
      company,
      details,
    });
    if (ok) onDone(name);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-ink-dim transition-colors hover:text-ink"
        >
          ← Change time
        </button>
        <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink">
          {formatDateLong(date)}
        </h3>
        <p className="mt-1 font-mono text-sm text-iris">{slot} · 30 minutes</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="bk-name" className={labelCls}>
            Name *
          </label>
          <input
            id="bk-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="bk-email" className={labelCls}>
            Email *
          </label>
          <input
            id="bk-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bk-company" className={labelCls}>
          Company
        </label>
        <input
          id="bk-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Your business (optional)"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="bk-details" className={labelCls}>
          What do you need?
        </label>
        <textarea
          id="bk-details"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Tell us about your business and what your website should do…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong sending your booking — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-2 rounded-lg bg-iris px-8 py-4 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-canvas transition-all duration-300 hover:bg-iris-bright disabled:opacity-60"
      >
        {state === "sending" ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
