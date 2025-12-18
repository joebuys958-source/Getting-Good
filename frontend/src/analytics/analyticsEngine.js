import { loadInventory } from "../data/inventoryStore";
import { computeItems, computeTotals } from "./compute";

/* ===================== HELPERS ===================== */

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(d1) || isNaN(d2)) return null;
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

const groupBy = (arr, fn) =>
  arr.reduce((acc, item) => {
    const key = fn(item) || "Unknown";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

const avg = (arr, fn) =>
  arr.length ? arr.reduce((s, x) => s + fn(x), 0) / arr.length : null;

/* ===================== DEAD STOCK ENGINE ===================== */

function buildDeadStock(items) {
  const now = new Date();

  const unsold = items.filter(i => !i.isSold);

  const deadItems = unsold
    .map(i => {
      const daysHeld = i.purchaseDate
        ? daysBetween(i.purchaseDate, now)
        : null;

      if (!daysHeld || daysHeld < 30) return null;

      let reason = "Low buyer demand relative to similar listings";
      let action = "Reduce price by 10–15% and refresh listing photos";

      if (daysHeld > 90) {
        reason = "Very slow-moving inventory with prolonged exposure";
        action = "Aggressive price drop or bundle with another item";
      } else if (i.estimatedSale && i.estimatedSale > i.purchase * 2) {
        reason = "Likely overpriced versus market median";
        action = "Align price closer to current market average";
      } else if (!i.brand) {
        reason = "Low brand recognition";
        action = "Improve title keywords and category accuracy";
      }

      return {
        id: i.id,
        name: i.name,
        brand: i.brand || "Unknown",
        purchase: i.purchase || 0,
        daysHeld,
        confidence: Math.min(95, 55 + daysHeld / 2),
        reason,
        action,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.daysHeld - a.daysHeld);

  return {
    count: deadItems.length,
    items: deadItems,
  };
}

/* ===================== CAPITAL LOCK-UP ===================== */

function buildCapitalLockup(items) {
  const unsold = items.filter(i => !i.isSold);

  const total = unsold.reduce((s, i) => s + (i.purchase || 0), 0);

  const byBrand = Object.entries(
    groupBy(unsold, i => i.brand)
  ).map(([key, arr]) => ({
    key,
    value: arr.reduce((s, i) => s + (i.purchase || 0), 0),
  }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 6);

  return { total, byBrand };
}

/* ===================== SELL SPEED ===================== */

function buildSellSpeed(items) {
  const sold = items.filter(i => i.isSold);

  const soldWithDays = sold
    .map(i => ({
      ...i,
      sellDays:
        i.purchaseDate && i.soldDate
          ? daysBetween(i.purchaseDate, i.soldDate)
          : null,
    }))
    .filter(i => i.sellDays !== null);

  return {
    avg: soldWithDays.length
      ? Math.round(avg(soldWithDays, i => i.sellDays))
      : null,
    sampleSize: soldWithDays.length,
  };
}

/* ===================== SELL-TIME HEATMAP ===================== */
/* 7 columns (Mon–Sun) × week buckets */

function buildHeatmap(items) {
  const sold = items.filter(i => i.isSold && i.soldDate);

  const rows = Array.from({ length: 6 }, () =>
    Array.from({ length: 7 }, () => 0)
  );

  sold.forEach(i => {
    const soldDate = new Date(i.soldDate);
    const weekday = soldDate.getDay(); // 0–6
    const weeksHeld = Math.min(
      5,
      Math.floor((daysBetween(i.purchaseDate, i.soldDate) || 0) / 7)
    );

    rows[weeksHeld][weekday] += 1;
  });

  return rows;
}

/* ===================== MONTH-AWARE DEMAND RADAR ===================== */

function buildDemandRadar(items) {
  const month = new Date().getMonth(); // 0–11

  const seasonalSignals = [
    { months: [11, 0, 1], title: "Winter Outerwear", why: "Cold weather demand" },
    { months: [10, 11, 0], title: "Hoodies & Knitwear", why: "Layering season" },
    { months: [4, 5, 6], title: "Festival Fashion", why: "Summer events" },
    { months: [7, 8], title: "Back to School", why: "Seasonal buying" },
    { months: [2, 3], title: "Spring Refresh", why: "Wardrobe turnover" },
  ];

  return seasonalSignals
    .filter(s => s.months.includes(month))
    .map((s, idx) => ({
      id: idx,
      title: s.title,
      why: s.why,
      window: "Current",
      demandScore: 70 + idx * 5,
    }));
}

/* ===================== LISTING QUALITY ===================== */

function buildListingQuality(items) {
  return items
    .filter(i => i.status === "Bought")
    .map(i => {
      let score = 60;
      if (i.name?.length > 20) score += 10;
      if (i.brand) score += 10;
      if (i.notes?.length > 60) score += 10;

      return {
        id: i.id,
        name: i.name,
        score: Math.min(100, score),
        suggestion:
          score < 80
            ? "Improve title clarity and add more descriptive keywords"
            : "Listing fundamentals are strong",
      };
    });
}

/* ===================== EXECUTIVE INSIGHTS ===================== */

function buildInsights({ deadStock, lockup, sellSpeed, demand }) {
  const insights = [];

  if (deadStock.count > 0) {
    insights.push({
      title: "Dead Stock Risk",
      text: `${deadStock.count} items are held over 30 days and tying up capital.`,
      confidence: 85,
    });
  }

  if (lockup.total > 0) {
    insights.push({
      title: "Capital Efficiency",
      text: `£${Math.round(lockup.total)} is locked in unsold inventory.`,
      confidence: 88,
    });
  }

  if (sellSpeed.avg) {
    insights.push({
      title: "Sell Velocity",
      text: `Your average sell time is ${sellSpeed.avg} days.`,
      confidence: 75,
    });
  }

  if (demand[0]) {
    insights.push({
      title: "Market Opportunity",
      text: `${demand[0].title} is trending this month.`,
      confidence: 80,
    });
  }

  return insights;
}

/* ===================== MAIN EXPORT ===================== */

export function runAIAnalytics() {
  const raw = loadInventory();
  if (!Array.isArray(raw)) return null;

  const items = computeItems(raw);
  const totals = computeTotals(raw);

  const deadStock = buildDeadStock(items);
  const lockup = buildCapitalLockup(items);
  const sellSpeed = buildSellSpeed(items);
  const heatmap = buildHeatmap(items);
  const demand = buildDemandRadar(items);
  const listingQuality = buildListingQuality(items);
  const insights = buildInsights({ deadStock, lockup, sellSpeed, demand });

  return {
    totals,
    deadStock,
    lockup,
    sellSpeed,
    heatmap,
    demand,
    listingQuality,
    insights,
  };
}
