import { useMemo, useState } from "react";
import { runAIAnalytics } from "../../analytics/analyticsEngine";
import { useNavigate } from "react-router-dom";

/* ===================== MAIN ===================== */

export default function AIInsights() {
  const analytics = useMemo(() => {
    try {
      return runAIAnalytics() || {};
    } catch (e) {
      console.error("AI ANALYTICS ERROR", e);
      return {};
    }
  }, []);

  const {
    lockup = {},
    deadStock = { items: [], count: 0 },
    sellSpeed = {},
    performance = {},
    heatmap = [],
    insights = [],
    demand = [],
    listingQuality = [],
  } = analytics;

  const [selectedDeadId, setSelectedDeadId] = useState("");
  const [selectedQualityId, setSelectedQualityId] = useState("");
  const [heatFocus, setHeatFocus] = useState(null);

  /* ---------- SAFE LOOKUPS ---------- */

  const deadItems = Array.isArray(deadStock.items) ? deadStock.items : [];
  const selectedDead = deadItems.find(
  (i) => String(i.id ?? i.name) === selectedDeadId
);


  const qualityItems = Array.isArray(listingQuality) ? listingQuality : [];
  const selectedQuality = qualityItems.find(
  (i) => String(i.id ?? i.name) === selectedQualityId
);

  /* ===================== RENDER ===================== */

  return (
    <div style={page}>
      {/* ================= HEADER ================= */}
      <header style={header}>
        <h1 style={title}>🧠 AI Analytics</h1>
        <p style={subtitle}>
          Read-only intelligence powered by real inventory behaviour.
        </p>
      </header>

      {/* ================= KPI GRID ================= */}
      <section style={grid4}>
        <KPI emoji="⏱" label="Avg Sell Time" value={sellSpeed.avg ? `${sellSpeed.avg}d` : "—"} tone="blue" />
        <KPI emoji="💸" label="Capital Locked" value={`£${Math.round(lockup.total || 0)}`} tone="purple" />
        <KPI emoji="📦" label="Dead Stock" value={deadStock.count || 0} tone="red" />
        <KPI emoji="📈" label="Avg Margin" value={`${Math.round(performance.avgMargin || 0)}%`} tone="green" />
      </section>

      {/* ================= HEATMAP + BRIEFING ================= */}
      <section style={twoCol}>
        <Card title="🗓 Sell-Time Heatmap (click a cell)" tone="blue">
          {heatmap.length ? (
            <Heatmap data={heatmap} onSelect={setHeatFocus} />
          ) : (
            <Muted>Not enough sold data yet.</Muted>
          )}
        </Card>

        <Card title="🧠 Executive AI Briefing" tone="green">
          <BriefBlock label="Risk">
            {deadStock.count > 0
              ? `${deadStock.count} items are at risk of becoming dead stock.`
              : "Dead stock currently under control."}
          </BriefBlock>

          <BriefBlock label="Opportunity">
            {demand[0]
              ? `${demand[0].title} demand is active this month.`
              : "No strong seasonal demand signals detected."}
          </BriefBlock>

          <BriefAction>
            👉 Reprice or refresh 1–2 slow-moving items today.
          </BriefAction>
        </Card>
      </section>

      {/* ================= DEMAND RADAR ================= */}
      <Card title="📡 Market Demand Radar (Month-Aware)" tone="blue">
        {demand.length === 0 ? (
          <Muted>No active demand signals.</Muted>
        ) : (
          demand.slice(0, 5).map((d, i) => <DemandRow key={i} d={d} />)
        )}
      </Card>

      {/* ================= DEAD STOCK ================= */}
      <Card title="🧠 Dead Stock Assistant" tone="red">
        {deadItems.length === 0 ? (
          <Muted>No dead stock detected.</Muted>
        ) : (
          <>
            <select
              style={select}
              value={selectedDeadId}
              onChange={(e) => setSelectedDeadId(e.target.value)}
            >
              <option value="">Select item…</option>
              {deadItems.map((i) => (
  <option key={i.id ?? i.name} value={String(i.id ?? i.name)}>
    {i.name} ({i.daysHeld} days)
  </option>
))}

            </select>

            {selectedDead && (
              <div style={{ marginTop: 14 }}>
                <Row>
                 <div>
  <strong>{selectedDead.name}</strong>
  <div style={{ fontSize: 12, opacity: 0.6 }}>
    {selectedDead.brand || "Unbranded"} • {selectedDead.finalCategory || "No category"}
  </div>
</div>

                  <Badge>{selectedDead.confidence || 65}%</Badge>
                </Row>

                <StatGrid>
                  <MiniStat label="Held" value={`${selectedDead.daysHeld}d`} />
                  <MiniStat label="Capital" value={`£${selectedDead.purchase}`} />
                  <MiniStat label="Brand" value={selectedDead.brand || "—"} />
                </StatGrid>

               <InfoBlock title="Why it’s stuck">
  {selectedDead.reason ??
    `Held for ${selectedDead.daysHeld} days with no sale. Likely price resistance or weak demand in this category.`}
</InfoBlock>

<ActionBlock>
  <div style={{ marginBottom: 8 }}>
    {selectedDead.action ||
      "Refresh photos, improve keywords, and test a 10–15% price reduction."}
  </div>

  <button
    style={fixBtn}
    onClick={() =>
      navigate(`/inventory`, { state: { focusId: selectedDead.id } })
    }
  >
    🔧 Fix this listing
  </button>
</ActionBlock>



                <ActionBlock>
                  {selectedDead.action ||
                    "Refresh photos, improve keywords, test a 10–15% price drop."}
                </ActionBlock>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ================= LISTING QUALITY ================= */}
      <Card title="📝 Listing Quality (Pre-Listing AI)" tone="orange">
        <select
          style={select}
          value={selectedQualityId}
          onChange={(e) => setSelectedQualityId(e.target.value)}
        >
          <option value="">Select item…</option>
         {qualityItems.map((q) => (
  <option key={q.id ?? q.name} value={String(q.id ?? q.name)}>
    {q.name}
  </option>
))}

        </select>

        {selectedQuality && (
  <div style={{ marginTop: 12 }}>
    <strong>AI Score: {selectedQuality.score ?? 72}/100</strong>

    <p style={{ opacity: 0.7, fontSize: 13 }}>
  Analysis is based on your actual item data (name, brand, category, pricing, time held).
  Image & description AI will activate once uploads are enabled.
</p>


    <ul style={{ marginTop: 8, opacity: 0.85 }}>
  {!selectedQuality.brand && (
    <li>⚠️ Brand not specified — branded items sell faster.</li>
  )}

  {selectedQuality.daysHeld > 14 && (
    <li>⏱ Held {selectedQuality.daysHeld} days — consider repricing.</li>
  )}

  {!selectedQuality.finalCategory && (
    <li>📂 Missing final category — limits search visibility.</li>
  )}

  {selectedQuality.estimatedSale &&
    selectedQuality.purchase &&
    selectedQuality.estimatedSale / selectedQuality.purchase < 1.3 && (
      <li>💸 Low margin — consider higher price or better positioning.</li>
    )}

  <li>📷 Photo analysis will activate once images are uploaded.</li>
</ul>

  </div>
)}
<button
  style={fixBtn}
  onClick={() =>
    navigate(`/inventory`, { state: { focusId: selectedQuality.id } })
  }
>
  🔧 Improve this listing
</button>

      </Card>

      {/* ================= HEATMAP MODAL ================= */}
      {heatFocus && (
        <div style={modalOverlay} onClick={() => setHeatFocus(null)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>🗓 Heatmap Details</h3>
            <p>Sold count: <b>{heatFocus.value}</b></p>
            <button style={modalBtn} onClick={() => setHeatFocus(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

const KPI = ({ emoji, label, value, tone }) => (
  <div style={{ ...card, ...toneBox(tone) }}>
    <div style={{ fontSize: 22 }}>{emoji}</div>
    <div style={{ opacity: 0.7 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
  </div>
);

const Card = ({ title, children, tone }) => (
  <div style={{ ...card, ...toneBox(tone) }}>
    <h3 style={{ marginBottom: 10 }}>{title}</h3>
    {children}
  </div>
);

const Heatmap = ({ data, onSelect }) => {
  const flat = data.flat();
  const max = Math.max(...flat, 1);

  return (
    <div style={heatGrid}>
      {data.map((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r}-${c}`}
            onClick={() => onSelect({ r, c, value: v })}
            style={{
              ...heatCell,
              opacity: 0.25 + (v / max) * 0.75,
              cursor: "pointer",
            }}
          />
        ))
      )}
    </div>
  );
};

const DemandRow = ({ d }) => {
  const pct = Math.min(100, d.demandScore || 0);

  return (
    <div style={demandRow}>
      <div style={{ flex: 1 }}>
        <strong>{d.title}</strong>
        <div style={demandMeta}>{d.window} • {d.why}</div>

        {/* blue % bar */}
        <div style={demandBarBg}>
          <div
            style={{
              ...demandBarFill,
              width: `${pct}%`,
            }}
          />
        </div>
      </div>

      <span style={demandPct}>{pct}%</span>
    </div>
  );
};
const demandBarBg = {
  marginTop: 6,
  height: 6,
  width: "100%",
  background: "rgba(255,255,255,.15)",
  borderRadius: 999,
  overflow: "hidden",
};

const demandBarFill = {
  height: "100%",
  background: "linear-gradient(90deg,#6ae3ff,#3b82f6)",
};

const demandPct = {
  marginLeft: 10,
  fontSize: 12,
  fontWeight: 800,
};


/* ===================== SMALL UI ===================== */

const Row = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "space-between" }}>{children}</div>
);

const Badge = ({ children }) => (
  <span style={badge}>{children}</span>
);

const MiniStat = ({ label, value }) => (
  <div style={card}>
    <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
    <strong>{value}</strong>
  </div>
);

const StatGrid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
    {children}
  </div>
);

const InfoBlock = ({ title, children }) => (
  <div style={card}>
    <strong>{title}</strong>
    <div style={{ opacity: 0.75 }}>{children}</div>
  </div>
);

const ActionBlock = ({ children }) => (
  <div style={{ ...card, background: "rgba(80,255,160,.12)", fontWeight: 800 }}>
    {children}
  </div>
);

const BriefBlock = ({ label, children }) => (
  <div style={briefCard}>
    <strong>{label}</strong>
    <div>{children}</div>
  </div>
);

const BriefAction = ({ children }) => (
  <div style={briefAction}>{children}</div>
);

const Muted = ({ children }) => (
  <div style={{ opacity: 0.6, fontSize: 13 }}>{children}</div>
);

/* ===================== STYLES ===================== */

const page = { padding: 24, maxWidth: 1300 };
const header = { marginBottom: 20 };
const title = { fontSize: 34, fontWeight: 900 };
const subtitle = { opacity: 0.7 };

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 14,
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const card = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.12)",
};

const select = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  background: "rgba(0,0,0,.5)",
  color: "white",
  border: "1px solid rgba(255,255,255,.15)",
};

const heatGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: 4,
};

const heatCell = {
  height: 18,
  borderRadius: 4,
  background: "#6ae3ff",
};

const toneBox = (t) => ({
  boxShadow:
    t === "red"
      ? "0 0 20px rgba(255,80,80,.15)"
      : t === "blue"
      ? "0 0 20px rgba(90,200,255,.15)"
      : t === "purple"
      ? "0 0 20px rgba(185,120,255,.15)"
      : t === "green"
      ? "0 0 20px rgba(80,255,160,.15)"
      : t === "orange"
      ? "0 0 20px rgba(255,190,80,.15)"
      : "none",
});

const demandRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(255,255,255,.08)",
};

const demandMeta = { fontSize: 12, opacity: 0.65 };

const badge = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,.12)",
  fontSize: 12,
  fontWeight: 800,
};

const briefCard = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.1)",
};

const briefAction = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(80,255,160,.18)",
  fontWeight: 900,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const modalCard = {
  background: "rgba(20,20,20,.95)",
  padding: 20,
  borderRadius: 16,
  width: 360,
  border: "1px solid rgba(255,255,255,.15)",
};

const modalBtn = {
  marginTop: 12,
  width: "100%",
  padding: 10,
  borderRadius: 10,
  background: "linear-gradient(90deg,#6ae3ff,#c77dff)",
  border: "none",
  fontWeight: 900,
  cursor: "pointer",
};
const fixBtn = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(90deg,#6ae3ff,#c77dff)",
  color: "#000",
  fontWeight: 900,
  cursor: "pointer",
};
