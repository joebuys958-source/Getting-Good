export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || q.length < 3) {
    return res.status(400).json({ error: "Query too short" });
  }

  try {
    // 🔐 OAuth token
    const tokenRes = await fetch(
      "https://api.ebay.com/identity/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
            ).toString("base64"),
        },
        body:
          "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error("OAuth failed");
    }

    // 📊 Marketplace Insights — SOLD DATA
    const insightsRes = await fetch(
      `https://api.ebay.com/sell/analytics/v1/marketplace_insights/search?q=${encodeURIComponent(
        q
      )}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const data = await insightsRes.json();

    const prices =
      data?.insightResults
        ?.map((r) => r.price?.value)
        .filter(Boolean)
        .map(Number) || [];

    if (!prices.length) {
      return res.json(null);
    }

    prices.sort((a, b) => a - b);

    const count = prices.length;
    const min = prices[0];
    const max = prices[count - 1];
    const average = Math.round(
      prices.reduce((s, v) => s + v, 0) / count
    );
    const median =
      count % 2 === 0
        ? Math.round((prices[count / 2 - 1] + prices[count / 2]) / 2)
        : prices[Math.floor(count / 2)];

    const confidence = Math.min(0.95, 0.45 + count * 0.04);

    res.json({
      source: "market",
      min,
      max,
      average,
      median,
      matches: count,
      confidence,
      explanation: `Based on ${count} sold items (eBay Insights)`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Market insights failed" });
  }
}
