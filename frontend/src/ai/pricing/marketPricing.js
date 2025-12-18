export async function getMarketBasedPricing({ name, brand }) {
  const q = [name, brand].filter(Boolean).join(" ");

  const res = await fetch(`/api/ebay/sold?q=${encodeURIComponent(q)}`);
  if (!res.ok) return null;

  return res.json();
}
