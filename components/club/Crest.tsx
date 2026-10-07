import Image from "next/image";
import { club } from "@/lib/site";

interface CrestProps {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Set where the club name is printed alongside, so it isn't announced twice. */
  decorative?: boolean;
}

export default function Crest({ size = 40, className = "", priority = false, decorative = false }: CrestProps) {
  return (
    <Image
      src="/crest.png"
      alt={decorative ? "" : `${club.fullName} crest`}
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
