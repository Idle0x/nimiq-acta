// Simple cache for CoinGecko NIM price
let cachedPrice = 0.0012; // fallback
let lastFetch = 0;

export async function fetchNimUsd(): Promise<number> {
  const now = Date.now();
  if (now - lastFetch < 60_000) return cachedPrice;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd", { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data["nimiq-2"]?.usd) {
        cachedPrice = data["nimiq-2"].usd;
        lastFetch = now;
      }
    }
  } catch (e) {
    console.error("Failed to fetch NIM price", e);
  }
  return cachedPrice;
}
