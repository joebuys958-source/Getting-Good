export function scoreConfidence({ sampleSize = 0, volatility = 0, freshnessDays = null }) {
  let score = 50;

  // Data depth
  if (sampleSize >= 30) score += 35;
  else if (sampleSize >= 20) score += 30;
  else if (sampleSize >= 10) score += 20;
  else if (sampleSize >= 5) score += 10;

  // Volatility penalty
  if (volatility > 1) score -= 30;
  else if (volatility > 0.5) score -= 15;

  // Freshness decay (new AI feature)
  if (typeof freshnessDays === "number") {
    if (freshnessDays > 90) score -= 15;
    else if (freshnessDays > 45) score -= 8;
  }

  return Math.max(30, Math.min(95, Math.round(score)));
}
