export function runCapitalEngine(items) {
  if (!Array.isArray(items)) return null;

  const unsold = items.filter(i => !i.isSold);

  const total = unsold.reduce((s, i) => s + (i.purchase || 0), 0);

  const group = (key) =>
    Object.entries(
      unsold.reduce((acc, i) => {
        const k = i[key] || "Unknown";
        acc[k] = (acc[k] || 0) + (i.purchase || 0);
        return acc;
      }, {})
    )
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

  return {
    total,
    byBrand: group("brand"),
    byCategory: group("finalCategory"),
    trend:
      unsold.length >
      items.filter(i => i.isSold).length
        ? "worsening"
        : "improving",
  };
}
