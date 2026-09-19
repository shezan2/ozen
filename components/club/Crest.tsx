import Image from "next/image";
import { club } from "@/lib/site";

interface CrestProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function Crest({ size = 40, className = "", priority = false }: CrestProps) {
  return (
    <Image
      src="/crest.png"
      alt={`${club.fullName} crest`}
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
