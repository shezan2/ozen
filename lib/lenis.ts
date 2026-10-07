import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}

/** Smooth-scrolls to a target through Lenis when it's running, natively otherwise. */
export function scrollToTarget(target: HTMLElement | number) {
  if (instance) {
    instance.scrollTo(target, { duration: 1.4 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else target.scrollIntoView({ behavior: "smooth" });
}
