import { loadInventory } from "../data/inventoryStore";

/* ===================== HELPERS ===================== */

const daysBetween = (a, b) =>
  Math.floor((new Date(b) - new Date(a)) / 86400000);

const now = new Date();

/* ===================== ENGINES ===================== */

export function runAIAnalytics() {
  const raw = loadInventory();
  if (!Array.isArray(raw)) return null;

  const sold = raw.filter(i => i.status === "Sold" && i.soldDate);
  const unsold = raw.filter(i => i.status !== "Sold");

  /* ---------- DEAD STOCK ---------- */
  const deadItems = unsold
    .map(i => {
      const daysHeld = daysBetween(i.purchaseDate, now);
      if (daysHeld < 30) return null;

      return {
        id: i.id,
        name: i.name,
        brand: i.brand,
        purchase: i.purchasePrice,
        daysHeld,
        confidence: Math.min(95, 40 + daysHeld),
        reason: "Low relative demand and prolonged time listed.",
        action: "Refresh listing and test a 10–15% price reduction.",
      };
    })
    .filter(Boolean);

  /* ---------- CAPITAL LOCK ---------- */
  const byBrand = {};
  unsold.forEach(i => {
    if (!i.brand) return;
    byBrand[i.brand] = (byBrand[i.brand] || 0) + (i.purchasePrice || 0);
  });

  const lockupTotal = Object.values(byBrand).reduce((a, b) => a + b, 0);

  /* ---------- SELL SPEED ---------- */
  const sellDays = sold.map(i =>
    daysBetween(i.purchaseDate, i.soldDate)
  );

  /* ---------- HEATMAP ---------- */
  const heatmap = Array.from({ length: 7 }, () =>
    Array.from({ length: 8 }, () => 0)
  );

  sold.forEach(i => {
    const d = daysBetween(i.purchaseDate, i.soldDate);
    const week = Math.min(7, Math.floor(d / 7));
    const day = new Date(i.soldDate).getDay();
    heatmap[day][week]++;
  });

  /* ---------- DEMAND RADAR ---------- */
  const month = now.getMonth(); // 0–11

  const seasonal = [
    { key: "Jackets", months: [10,11,0,1], trend: "up" },
    { key: "Jumpers", months: [9,10,11,0], trend: "up" },
    { key: "Shorts", months: [4,5,6], trend: "down" },
    { key: "T-Shirts", months: [3,4,5,6], trend: "flat" },
  ];

  const demand = seasonal
    .filter(s => s.months.includes(month))
    .map(s => ({
      title: s.key,
      demandScore: 70,
      trend: s.trend,
      why: "Seasonal buying behaviour",
      window: "Current",
    }));

  /* ---------- LISTING QUALITY ---------- */
  const listingQuality = unsold.map(i => ({
    id: i.id,
    name: i.name,
    score: 70,
    suggestion:
      "Improve photos, expand description, and add fit/material keywords.",
  }));

  /* ---------- EXEC SUMMARY ---------- */
  const insights = [
    {
      title: "Cash Flow",
      text:
        lockupTotal > 0
          ? "Capital is tied up in unsold inventory."
          : "Inventory turnover is healthy.",
      confidence: 82,
    },
  ];

  return {
    deadStock: { items: deadItems, count: deadItems.length },
    lockup: { total: lockupTotal, byBrand: Object.entries(byBrand).map(([k,v]) => ({ key:k, value:v })) },
    sellSpeed: { avg: sellDays.length ? Math.round(sellDays.reduce((a,b)=>a+b,0)/sellDays.length) : null },
    heatmap,
    demand,
    listingQuality,
    insights,
  };
}
