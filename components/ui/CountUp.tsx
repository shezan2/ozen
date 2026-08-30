type CountUpProps = {
  /** The real figure. This is what renders on the server. */
  to: number;
  from: number;
  className?: string;
};

/**
 * Counts a real client figure into place when it scrolls in.
 *
 * The final value is what the server renders, so crawlers and screen readers
 * always get the true number — `ScrollAnimator` reads it off the node before
 * animating, and skips the animation entirely under `prefers-reduced-motion`.
 */
export default function CountUp({ to, from, className }: CountUpProps) {
  return (
    <span className={className} data-animate="count" data-count-from={from}>
      {to}
    </span>
  );
}
