import { useEffect, useState } from "react";
import { getMarketBasedPricing } from "../../../ai/pricing/marketPricing";

export default function MarketPricingResult() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function run() {
      if (name.trim().length < 3) {
        setResult(null);
        return;
      }

      setLoading(true);

      try {
        const pricing = await getMarketBasedPricing({ name, brand });
        if (active) setResult(pricing);
      } catch (e) {
        console.error(e);
        if (active) setResult(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [name, brand]);

  return (
    <div className="glass" style={{ padding: 26, marginTop: 18 }}>
      <h3 style={{ fontSize: 20 }}>🌍 Market pricing (eBay)</h3>

      <input
        placeholder="Item name (e.g. Quarter Zip)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />

      <input
        placeholder="Brand (optional)"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        style={input}
      />

      {loading && (
        <p style={{ opacity: 0.6, marginTop: 14 }}>
          ⏳ Fetching sold eBay listings…
        </p>
      )}

      {!loading && name.length >= 3 && !result && (
        <p style={{ opacity: 0.6, marginTop: 14 }}>
          ⚠ No sold eBay listings found
        </p>
      )}

      {result && <MarketPricingCard result={result} />}
    </div>
  );
}

/* ================= RESULT CARD ================= */

function MarketPricingCard({ result }) {
  const { median, min, max, confidence, matches, explanation } = result;

  const low = Math.round(median * 0.9);
  const high = Math.round(median * 1.1);

  return (
    <div className="glass" style={{ marginTop: 20, padding: 20 }}>
      <div style={{ fontSize: 12, opacity: 0.65 }}>
        💡 Suggested list price
      </div>

      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: "#6aff9a",
          marginTop: 4,
        }}
      >
        £{median}
      </div>

      <div
        className="glass"
        style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 14,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          💰 Recommended range
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          £{low} – £{high}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
        📦 {explanation}
      </div>

      <div style={{ marginTop: 10, fontSize: 13 }}>
        🎯 Confidence:{" "}
        <strong>{Math.round(confidence * 100)}%</strong>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const input = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  background: "rgba(0,0,0,.25)",
  color: "white",
  border: "none",
  marginTop: 12,
};
