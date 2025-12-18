export function runHeatmapEngine(items) {
  if (!Array.isArray(items)) return [];

  const sold = items.filter(
    i => i.isSold && i.purchaseDate && i.soldDate
  );

  const grid = Array.from({ length: 7 }, () =>
    Array.from({ length: 8 }, () => 0)
  );

  sold.forEach(i => {
    const soldDate = new Date(i.soldDate);
    const day = soldDate.getDay();

    const weeks =
      Math.floor(
        (soldDate - new Date(i.purchaseDate)) /
          (1000 * 60 * 60 * 24 * 7)
      ) || 0;

    if (grid[day] && grid[day][weeks] !== undefined) {
      grid[day][weeks]++;
    }
  });

  return grid;
}
