export function runTrendRadar(items) {
  const sold = items.filter(i => i.isSold && i.soldDate);
  if (sold.length < 5) return [];

  const byBrand = sold.reduce((acc, i) => {
    acc[i.brand] = acc[i.brand] || [];
    acc[i.brand].push(i);
    return acc;
  }, {});

  return Object.entries(byBrand).map(([brand, arr]) => {
    const avgDays =
      arr.reduce((s, x) => s + (x.sellDays || 0), 0) / arr.length;

    return {
      brand,
      trend:
        avgDays < 10 ? "rising" :
        avgDays > 25 ? "falling" :
        "stable",
      avgSellDays: Math.round(avgDays),
    };
  });
}
