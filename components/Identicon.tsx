"use client";
import { useMemo } from "react";
import { identiconSVG } from "@/lib/identicon";

export default function Identicon({ address, size = 40, ring }: { address: string; size?: number; ring?: string }) {
  const svg = useMemo(() => identiconSVG(address, size), [address, size]);
  return (
    <span
      className="inline-flex flex-none overflow-hidden rounded-full"
      style={{
        width: size, height: size,
        boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${ring}` : "0 0 0 1px var(--line2)",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
