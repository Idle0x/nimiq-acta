import { sha256 } from "@noble/hashes/sha2.js";

/**
 * Deterministic avatar derived from a Nimiq address.
 * No uploads, no storage — the same address always renders the same seal,
 * on every device, for everyone. Sybil-hostile by construction.
 */
export function identiconSVG(address: string, size = 40): string {
  const hash = sha256(new TextEncoder().encode(address.toUpperCase().normalize("NFC")));
  const hue = hash[0] % 360;
  const fg = `hsl(${hue} 40% 64%)`;
  const fg2 = `hsl(${(hue + 42) % 360} 45% 52%)`;
  const bg = `hsl(${hue} 32% 13%)`;
  const cell = 10;
  let rects = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const byte = hash[1 + y * 3 + x];
      if (byte % 2 === 0) continue;
      const fill = byte % 5 === 0 ? fg2 : fg;
      const mx = 4 - x;
      rects += `<rect x='${x * cell}' y='${y * cell}' width='${cell}' height='${cell}' fill='${fill}'/>`;
      if (mx !== x) rects += `<rect x='${mx * cell}' y='${y * cell}' width='${cell}' height='${cell}' fill='${fill}'/>`;
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='${size}' height='${size}'><rect width='50' height='50' fill='${bg}'/>${rects}</svg>`;
}

export const identiconDataURI = (address: string, size = 40) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(identiconSVG(address, size))}`;
