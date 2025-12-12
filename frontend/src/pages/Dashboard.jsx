export default function Dashboard() {
  return (
    <div style={{ padding: 36 }}>
      <h1>Dashboard</h1>

      {/* TOP METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        <Metric emoji="📦" title="Active Listings" value="6" />
        <Metric emoji="✅" title="Sold Items" value="25" />
        <Metric emoji="💰" title="Gross Profit" value="£542" />
        <Metric emoji="💳" title="Total Sales" value="£981" />
        <Metric emoji="🧮" title="Total Items" value="33" />
        <Metric emoji="💸" title="Expenses" value="£0" />
      </div>

      {/* PERFORMANCE + ALERTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 32,
        }}
      >
        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">📈</span> Performance Insights
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 18,
            }}
          >
            <Insight label="Conversion Rate" value="75.8%" />
            <Insight label="Avg. Days to Sell" value="9" />
            <Insight label="Profit Margin" value="55.2%" />
            <Insight label="Items at Risk" value="0" />
          </div>

          {/* PROFIT TREND */}
          <div style={{ marginTop: 24 }}>
            <div className="muted">📊 Profit Margin Trend</div>
            <div
              style={{
                height: 12,
                marginTop: 8,
                borderRadius: 999,
                background: "rgba(255,255,255,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "55%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #ffd6a5, #ffb703)",
                  boxShadow:
                    "0 0 18px rgba(255,183,3,0.75)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">🚨</span> Alerts & Notifications
          </div>
          <p>🎯 <b>1 goal</b> due within 2 weeks</p>
          <p style={{ marginTop: 10, opacity: 0.8 }}>
            📦 No dead stock detected
          </p>
        </div>
      </div>

      {/* ACTIVITY + ACTIONS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 32,
        }}
      >
        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">🕒</span> Recent Activity
          </div>

          <Activity text='Listed "Black TNF 700"' value="£24" />
          <Activity text='Sold "Navy Ralph Lauren Zip"' value="£35" sold />
          <Activity text='Sold "Beige Cable Knit"' value="£32" sold />
        </div>

        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">⚡</span> Quick Actions
          </div>

          <Action label="📦 Add Item" />
          <Action label="💸 Log Expense" />
          <Action label="📊 Analytics" />
          <Action label="🎯 Set Goal" />
        </div>
      </div>

      {/* BOTTOM */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 32,
        }}
      >
        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">📆</span> 7-Day Profit
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 130,
              marginTop: 18,
            }}
          >
            {[12, 22, 8, 30, 18, 25, 10].map((v, i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: v * 3,
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, #ffb703, #ff9f1c)",
                  boxShadow:
                    "0 10px 22px rgba(255,159,28,0.55)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: 26 }}>
          <div className="section-title">
            <span className="emoji">🎯</span> Goal Review
          </div>
          <p>Monthly Profit Goal</p>
          <p style={{ marginTop: 10, opacity: 0.85 }}>
            £540 / £1,000
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- small components ---------- */

function Metric({ emoji, title, value }) {
  const numericValue = Number(
    String(value).replace(/[£,]/g, "")
  );
  const prefix = String(value).includes("£") ? "£" : "";

  return (
    <div className="glass" style={{ padding: 24 }}>
      <div className="section-title">
        <span className="emoji">{emoji}</span> {title}
      </div>

      <div className="metric-value">
        {prefix}
        <CountUp value={numericValue} />
      </div>
    </div>
  );
}


function Insight({ label, value }) {
  return (
    <div className="glass" style={{ padding: 18 }}>
      <div className="muted">{label}</div>
      <div style={{ fontSize: 22, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Activity({ text, value }) {
  return (
    <div
      className="glass"
      style={{
        padding: 16,
        marginBottom: 14,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{text}</span>
      <span>{value}</span>
    </div>
  );
}

function Action({ label }) {
  return (
    <div className="glass action" style={{ padding: 16, marginBottom: 14 }}>
      {label}
    </div>
  );
}
import { useEffect, useState } from "react";

function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (start === end) return;

    const increment = end / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(counter);
        setDisplay(end);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <>{display}</>;
}
