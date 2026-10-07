import { ViewTransition } from "react";

/** Remounts per route, so each page exits and enters as its own view transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
