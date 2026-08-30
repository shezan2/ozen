/**
 * Split point for Framer Motion's DOM animation features.
 *
 * Re-exported from its own module so the dynamic import below resolves to a
 * chunk containing only the feature bundle. Paired with `LazyMotion` and the
 * lightweight `m` components, this keeps the animation runtime off the critical
 * path — it loads after hydration instead of blocking it.
 */
import { domAnimation } from "motion/react";

export default domAnimation;
