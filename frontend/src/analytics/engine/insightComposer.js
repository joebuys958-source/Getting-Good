export function composeInsights({
  capital,
  deadStock,
  sellSpeed,
  totals,
}) {
  const insights = [];

  /* ---------------- CAPITAL ---------------- */

  if (capital && typeof capital.total === "number") {
    insights.push({
      text: `£${Math.round(capital.total)} is currently tied up in unsold inventory.`,
      confidence: 85,
    });
  }

  /* ---------------- DEAD STOCK ---------------- */

  if (deadStock && typeof deadStock.count === "number") {
    if (deadStock.count > 0) {
      insights.push({
        text: `${deadStock.count} items are at risk of becoming dead stock.`,
        confidence: 80,
      });
    } else {
      insights.push({
        text: "Dead stock levels are currently healthy.",
        confidence: 65,
      });
    }
  }

  /* ---------------- SELL SPEED ---------------- */

  if (sellSpeed && typeof sellSpeed.avg === "number") {
    insights.push({
      text: `Your average sell time is ${sellSpeed.avg} days.`,
      confidence: sellSpeed.confidence ?? 70,
    });
  }

  /* ---------------- MARGIN ---------------- */

  if (
    totals &&
    typeof totals.totalRevenue === "number" &&
    totals.totalRevenue > 0
  ) {
    const margin = Math.round(
      (totals.totalProfit / totals.totalRevenue) * 100
    );

    insights.push({
      text: `Your average profit margin is ${margin}%.`,
      confidence: 75,
    });
  }

  /* ---------------- FALLBACK ---------------- */

  if (insights.length === 0) {
    insights.push({
      text: "Not enough data yet to generate insights.",
      confidence: 40,
    });
  }

  return insights;
}
 