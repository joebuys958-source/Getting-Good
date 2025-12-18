export function runSellSpeedEngine(items) {
  if (!Array.isArray(items)) return { avg: null };

  const sold = items.filter(
    i => i.isSold && i.purchaseDate && i.soldDate
  );

  if (!sold.length) return { avg: null };

  const daysBetween = (a, b) =>
    Math.floor((b - a) / (1000 * 60 * 60 * 24));

  const avg =
    sold.reduce(
      (s, i) =>
        s +
        daysBetween(
          new Date(i.purchaseDate),
          new Date(i.soldDate)
        ),
      0
    ) / sold.length;

  return {
    avg: Math.round(avg),
    confidence: Math.min(95, sold.length * 10),
  };
}
