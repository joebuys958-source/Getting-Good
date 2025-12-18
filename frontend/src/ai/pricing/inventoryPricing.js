import { loadInventory } from "../../data/inventoryStore";

/* ================= HELPERS ================= */

function toNumber(v) {
  // Handles: 55, "55", "£55", " 55 ", null
  if (v === null || v === undefined) return null;
  const cleaned = String(v).replace(/[£,$]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalize(text = "") {
  return String(text).toLowerCase().trim();
}

function normalizeStatus(s) {
  // Handles: "Sold", "✅ Sold", "sold", " SOLD "
  const t = normalize(s);
  if (!t) return "";
  // remove emojis / symbols
  const stripped = t.replace(/[^\w\s]/g, "").trim(); // "✅ Sold" -> "sold"
  return stripped;
}

function tokenize(text = "") {
  return normalize(text)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => (w.endsWith("s") ? w.slice(0, -1) : w)); // light singular
}

function similarityScore(itemName, queryName) {
  const a = tokenize(itemName);
  const b = tokenize(queryName);

  if (!a.length || !b.length) return 0;

  const setA = new Set(a);
  let hits = 0;

  for (const w of b) {
    if (setA.has(w)) hits++;
  }

  // reward if query is mostly contained in the item tokens
  const ratio = hits / Math.max(b.length, 1);

  // small boost for substring match ("quarter zip" inside longer name)
  const subBoost = normalize(itemName).includes(normalize(queryName)) ? 0.15 : 0;

  return Math.min(1, ratio + subBoost);
}

function calculateAvgSellTime(items) {
  const days = items
    .map(i => {
      if (!i.purchaseDate || !i.soldDate) return null;
      const bought = new Date(i.purchaseDate);
      const sold = new Date(i.soldDate);
      if (Number.isNaN(bought.getTime()) || Number.isNaN(sold.getTime())) return null;
      const d = (sold - bought) / (1000 * 60 * 60 * 24);
      return Number.isFinite(d) && d >= 0 ? d : null;
    })
    .filter(d => Number.isFinite(d));

  if (!days.length) return null;
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
}

/* ================= MAIN ENGINE ================= */

export function getInventoryBasedPricing({ name, brand }) {
  try {
    const inventory = loadInventory();
    if (!Array.isArray(inventory)) return null;

    const queryName = normalize(name);
    const queryBrand = normalize(brand);

    if (!queryName || queryName.length < 3) return null;

    // ✅ SOLD ITEMS ONLY (robust)
    const soldItems = inventory.filter(i => {
      if (!i) return false;

      const status = normalizeStatus(i.status);
      const soldPrice = toNumber(i.soldPrice ?? i.sold_price ?? i.soldprice);

      return status === "sold" && soldPrice !== null;
    });

    // If nothing is sold, return null (PricingResult should show "no matches")
    if (!soldItems.length) return null;

    // ✅ MATCHING
    const matched = soldItems
      .map(item => {
        const score = similarityScore(item.name, queryName);

        const itemBrand = normalize(item.brand);
        const brandBoost =
          queryBrand && itemBrand && itemBrand === queryBrand ? 0.35 : 0;

        return { ...item, _score: score + brandBoost };
      })
      // less strict so you actually get results
      .filter(i => (i._score ?? 0) >= 0.20)
      .sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

    if (!matched.length) return null;

    // ✅ PRICES
    const prices = matched
      .map(i => toNumber(i.soldPrice ?? i.sold_price ?? i.soldprice))
      .filter(v => v !== null)
      .sort((a, b) => a - b);

    if (!prices.length) return null;

    const min = prices[0];
    const max = prices[prices.length - 1];
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    const mid = Math.floor(prices.length / 2);
    const median =
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid];

    // ✅ CONFIDENCE (never NaN)
    let confidence = 0.25;
    if (matched.length >= 2) confidence += 0.20;
    if (matched.length >= 5) confidence += 0.20;

    const spread = max - min;
    if (average > 0 && spread < average * 0.25) confidence += 0.15;
    if (queryBrand) confidence += 0.10;

    confidence = Math.min(0.95, Math.max(0.05, confidence));

    // ✅ SELL TIME
    const avgSellTime = calculateAvgSellTime(matched);

    // ✅ Always return real numbers so UI cannot show NaN
    return {
      min,
      max,
      average,
      median,
      matches: matched.length,
      confidence,
      avgSellTime,
      source: "inventory",
    };
  } catch (err) {
    console.error("Inventory pricing error:", err);
    return null;
  }
}
