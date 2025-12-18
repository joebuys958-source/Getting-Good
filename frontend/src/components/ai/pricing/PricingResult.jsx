import { useEffect, useMemo, useState } from "react";
import { getCombinedPricing } from "../../../ai/pricing/pricingAggregator";
import { applyEstimatedPriceToInventory } from "../../../data/inventoryStore";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function isValidNumber(n) {
  return Number.isFinite(Number(n));
}

export default function PricingResult({ method }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const q = name.trim();
    if (q.length < 3) {
      setResult(null);
      return;
    }

    try {
      const pricing = getCombinedPricing({ name: q, brand: brand.trim() }, method);

      // Only accept results that actually contain pricing numbers
      const ok =
        pricing &&
        isValidNumber(pricing.min) &&
        isValidNumber(pricing.max) &&
        (isValidNumber(pricing.median) || isValidNumber(pricing.average));

      setResult(ok ? pricing : null);
    } catch (e) {
      console.error("PricingResult error:", e);
      setResult(null);
    }
  }, [name, brand, method]);

  return (
    <div className="glass" style={{ padding: 26, marginTop: 18 }}>
      <h3 style={{ fontSize: 20 }}>🔍 Item to price</h3>

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

      {name.trim().length < 3 && (
        <EmptyHint text="Type at least 3 characters to see pricing suggestions." />
      )}

      {name.trim().length >= 3 && !result && (
        <EmptyHint text="No matching sold items found (or pricing data invalid)." />
      )}

      {result && <PricingCard result={result} itemName={name.trim()} />}
    </div>
  );
}

/* ================= UI CARD ================= */

function PricingCard({ result, itemName }) {
  const min = Number(result.min);
  const max = Number(result.max);
  const average = Number(result.average);
  const median = isValidNumber(result.median) ? Number(result.median) : average;

  const matches = Number(result.matches || 0);
  const confidence = Number.isFinite(result.confidence) ? result.confidence : 0;
  const avgSellTime = result.avgSellTime ?? null;

  const basePrice = isValidNumber(median) ? median : average;
  const low = Math.round(basePrice * 0.9);
  const high = Math.round(basePrice * 1.1);

  const chartData = useMemo(
    () => [
      { label: "Low", value: min, fill: "#6c757d" },
      { label: "Median", value: median, fill: "#ffd166" },
      { label: "Avg", value: average, fill: "#ff3b6a" },
      { label: "High", value: max, fill: "#06d6a0" },
    ],
    [min, median, average, max]
  );

  return (
    <div className="glass" style={{ padding: 26, marginTop: 18 }}>
      <div style={{ fontSize: 13, opacity: 0.7 }}>💡 Suggested price</div>

      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: "#6aff9a",
          marginTop: 4,
          lineHeight: 1,
        }}
      >
        £{basePrice}
      </div>

      {/* RANGE */}
      <div
        className="glass"
        style={{
          marginTop: 14,
          padding: "12px 16px",
          borderRadius: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>💰 Recommended range</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            £{low} – £{high}
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.55 }}>Based on sold history</div>
      </div>

      {/* STATS */}
      <div style={{ opacity: 0.8, marginTop: 10 }}>
        📦 Based on <strong>{matches}</strong> sold item{matches === 1 ? "" : "s"}
      </div>

      <div style={{ marginTop: 14 }}>
        <PriceRow label="⬇️ Lowest sold" value={min} />
        <PriceRow label="📊 Median sold" value={median} />
        <PriceRow label="⬆️ Highest sold" value={max} />
      </div>

      {/* CHARTS ROW */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        {/* CONFIDENCE CARD */}
        <div
          className="glass"
          style={{
            padding: 14,
            borderRadius: 14,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>
            🎯 Confidence score
          </div>

          <div style={{ fontSize: 34, fontWeight: 900 }}>
            {Math.round(confidence * 100)}%
          </div>

          <div
            style={{
              marginTop: 10,
              height: 12,
              borderRadius: 999,
              background: "rgba(255,255,255,.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round(confidence * 100)}%`,
                background:
                  confidence >= 0.75
                    ? "linear-gradient(90deg,#00ff9d,#00c37a)"
                    : confidence >= 0.5
                    ? "linear-gradient(90deg,#ffd166,#ff9f1c)"
                    : "linear-gradient(90deg,#ff3b6a,#ff005c)",
                boxShadow: "0 0 18px rgba(255,0,90,.25)",
              }}
            />
          </div>

          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 10 }}>
            Based on sold items
          </div>
        </div>

        {/* PRICE SPREAD CHART */}
        <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
            📊 Price spread
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => `£${v}`}
                contentStyle={{
                  background: "#111",
                  borderRadius: 10,
                  border: "none",
                  color: "white",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AVG SELL TIME */}
      <div
        className="glass"
        style={{
          marginTop: 14,
          padding: "12px 16px",
          borderRadius: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>⏱ Average sell time</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {avgSellTime === null ? "—" : `${avgSellTime} days`}
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.55 }}>Based on sold history</div>
      </div>

      {/* APPLY */}
      <button
        onClick={() => {
          const ok = applyEstimatedPriceToInventory(itemName, basePrice);
          alert(
            ok
              ? "✅ Estimated price added to inventory"
              : "⚠️ No matching inventory item found"
          );
        }}
        style={applyBtn}
      >
        ➕ Apply price to inventory
      </button>

      <p style={{ opacity: 0.65, fontSize: 13, marginTop: 10 }}>
        Uses keyword similarity + your sold inventory history. Suggestions only.
      </p>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        opacity: 0.85,
        marginTop: 6,
      }}
    >
      <span>{label}</span>
      <strong>£{value}</strong>
    </div>
  );
}

function EmptyHint({ text }) {
  return (
    <p style={{ opacity: 0.6, marginTop: 16, fontSize: 14 }}>⚠ {text}</p>
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

const applyBtn = {
  marginTop: 14,
  width: "100%",
  padding: "14px 0",
  borderRadius: 999,
  fontWeight: 900,
  background: "linear-gradient(135deg,#00ff9d,#00c37a)",
  color: "#003",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 0 25px rgba(0,255,160,.35)",
};
