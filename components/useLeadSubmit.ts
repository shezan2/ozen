"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export type SubmitState = "idle" | "sending" | "sent" | "error";

/**
 * Shared lead submission: posts to NEXT_PUBLIC_FORM_ENDPOINT when configured
 * (e.g. a Formspree URL); otherwise simulates a successful send so the
 * experience is complete in demo mode.
 */
export function useLeadSubmit() {
  const [state, setState] = useState<SubmitState>("idle");

  async function submit(payload: Record<string, unknown>) {
    setState("sending");
    try {
      if (site.formEndpoint) {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setState("sent");
      return true;
    } catch {
      setState("error");
      return false;
    }
  }

  return { state, submit, reset: () => setState("idle") };
}

export const inputCls =
  "w-full rounded-lg border border-line bg-canvas-raised px-4 py-3.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-iris/60 focus:bg-surface";

export const labelCls = "mb-2 block text-[0.65rem] uppercase tracking-[0.22em] text-ink-dim";
