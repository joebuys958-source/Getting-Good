import { useMemo, useState } from "react";
import { loadInventory } from "../data/inventoryStore";
import { computeItems, computeTotals } from "../analytics/compute";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

/* =========================
   Analytics Page
   ========================= */

export default function Analytics() {
  const allRaw = loadInventory();

  // ✅ Small dropdown filter (corner)
  const [range, setRange] = useState("30"); // 30 | 90 | all
  const [tab, setTab] = useState("overview");

  // ✅ Filter raw inventory by purchaseDate (safe + simple for now)
  const raw = useMemo(() => {
    if (range === "all") return allRaw;

    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return allRaw.filter((i) => {
      if (!i.purchaseDate) return false;
      const d = new Date(i.purchaseDate);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  }, [allRaw, range]);

  const items = useMemo(() => computeItems(raw), [raw]);
  const totals = useMemo(() => computeTotals(raw), [raw]);

  return (
    <div style={{ padding: 36 }}>
      {/* HEADER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <h1 style={{ margin: 0 }}>📊 Analytics</h1>
          <span style={{ opacity: 0.6, fontSize: 13 }}>
            Live insights from your inventory
          </span>
        </div>

        {/* ✅ Corner dropdown range filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ opacity: 0.65, fontSize: 12, fontWeight: 700 }}>
            Range
          </span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="glass"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              cursor: "pointer",
              color: "white",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              outline: "none",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Tabs (kept as-is) */}
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <Tab
          label="Overview"
          active={tab === "overview"}
          onClick={() => setTab("overview")}
        />
        <Tab
          label="Items"
          active={tab === "items"}
          onClick={() => setTab("items")}
        />
        <Tab
          label="Insights"
          active={tab === "insights"}
          onClick={() => setTab("insights")}
        />
      </div>

      {tab === "overview" && <Overview totals={totals} items={items} />}
      {tab === "items" && <ItemsTab items={items} totals={totals} />}
      {tab === "insights" && <InsightsTab items={items} totals={totals} />}
    </div>
  );
}

/* =========================
   Overview
   ========================= */

function Overview({ totals, items }) {
  const sold = items.filter((i) => i.isSold);
  const listed = items.filter((i) => i.isListed);
  const bought = items.filter((i) => !i.isListed && !i.isSold);

  const timeSeries = useMemo(() => buildMonthlySeries(items), [items]);

  const statusData = useMemo(
    () => [
      { name: "Bought", value: bought.length },
      { name: "Listed", value: listed.length },
      { name: "Sold", value: sold.length },
    ],
    [bought.length, listed.length, sold.length]
  );

  return (
    <>
      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 26,
        }}
      >
        <Kpi
          title="Total Revenue"
          value={`£${totals.totalRevenue.toFixed(0)}`}
          sub="All-time sold"
        />
        <Kpi
          title="Total Profit"
          value={`£${totals.totalProfit.toFixed(0)}`}
          sub="After cost only"
        />
        <Kpi
          title="Inventory Value"
          value={`£${totals.inventoryValue.toFixed(0)}`}
          sub="Money tied up"
        />
        <Kpi
          title="Sell-through"
          value={`${totals.sellThrough.toFixed(1)}%`}
          sub="Sold ÷ total"
        />
        <Kpi
          title="Avg ROI"
          value={`${totals.avgROI.toFixed(1)}%`}
          sub="Sold items"
        />
        <Kpi
          title="Active Listings"
          value={`${totals.listedCount}`}
          sub="Listed status"
        />
      </div>

      {/* Main Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 28,
        }}
      >
        <div className="glass" style={{ padding: 26 }}>
          <SectionTitle emoji="📈" title="Revenue vs Profit (Monthly)" />
          {timeSeries.length === 0 ? (
            <EmptyState text="No time-series data yet. Add purchase dates and mark items Sold to build charts." />
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 10,
              opacity: 0.75,
              fontSize: 13,
            }}
          >
            <LegendDot label="Revenue" />
            <LegendDot label="Profit" />
          </div>
        </div>

        <div className="glass" style={{ padding: 26 }}>
          <SectionTitle emoji="🧩" title="Status Breakdown" />
          {items.length === 0 ? (
            <EmptyState text="No items yet. Add inventory to see breakdown." />
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={idx} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <MiniRow label="Bought" value={bought.length} />
            <MiniRow label="Listed" value={listed.length} />
            <MiniRow label="Sold" value={sold.length} />
          </div>
        </div>
      </div>

      {/* Business + Inventory Panels (kept + improved) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 24,
        }}
      >
        <div className="glass" style={{ padding: 26 }}>
          <SectionTitle emoji="🏦" title="Business Performance" />
          <InsightRow
            label="Total Revenue"
            value={`£${totals.totalRevenue.toFixed(2)}`}
          />
          <InsightRow
            label="Cost of Sold Items"
            value={`£${totals.totalCostSold.toFixed(2)}`}
          />
          <InsightRow
            label="Total Profit"
            value={`£${totals.totalProfit.toFixed(2)}`}
          />
          <InsightRow
            label="Profit Margin"
            value={`${totals.profitMargin.toFixed(1)}%`}
          />
          <InsightRow
            label="Avg Sale Price"
            value={`£${totals.avgSalePrice.toFixed(2)}`}
          />
        </div>

        <div className="glass" style={{ padding: 26 }}>
          <SectionTitle emoji="🧊" title="Inventory Health" />
          <InsightRow label="Total Items" value={totals.totalCount} />
          <InsightRow label="Sold Items" value={totals.soldCount} />
          <InsightRow label="Active Listings" value={totals.listedCount} />
          <InsightRow
            label="Unsold Value"
            value={`£${totals.inventoryValue.toFixed(2)}`}
          />
          <div style={{ marginTop: 14, opacity: 0.7, fontSize: 13 }}>
            Tip: Add purchase dates for stronger “slow movers” analytics.
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   Items Tab
   ========================= */

function ItemsTab({ items, totals }) {
  const sold = useMemo(() => items.filter((i) => i.isSold), [items]);
  const unsold = useMemo(() => items.filter((i) => !i.isSold), [items]);

  const topProfit = useMemo(
    () => [...sold].sort((a, b) => b.profit - a.profit).slice(0, 10),
    [sold]
  );

  const topROI = useMemo(
    () =>
      [...sold]
        .filter((x) => x.purchase > 0)
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 10),
    [sold]
  );

  const slowMovers = useMemo(() => {
    const withDates = unsold.filter((i) => i.purchaseDate);
    return [...withDates]
      .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate))
      .slice(0, 10);
  }, [unsold]);

  const tiedUp = useMemo(
    () => [...unsold].sort((a, b) => b.purchase - a.purchase).slice(0, 10),
    [unsold]
  );

  return (
    <div style={{ marginTop: 26, display: "grid", gap: 24 }}>
      {/* Headline summary */}
      <div className="glass" style={{ padding: 26 }}>
        <SectionTitle emoji="🎯" title="Item Performance" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <MiniCard title="Sold Items" value={totals.soldCount} />
          <MiniCard
            title="Avg Sale Price"
            value={`£${totals.avgSalePrice.toFixed(2)}`}
          />
          <MiniCard
            title="Total Profit"
            value={`£${totals.totalProfit.toFixed(2)}`}
          />
          <MiniCard
            title="Inventory Value"
            value={`£${totals.inventoryValue.toFixed(2)}`}
          />
        </div>
      </div>

      {/* Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <TableCard
          title="🏆 Top Profit Items"
          subtitle="Highest profit per sale"
          columns={["Item", "Buy", "Sold", "Profit"]}
          rows={topProfit.map((i) => [
            short(i.name),
            money(i.purchase),
            money(i.sold),
            money(i.profit, true),
          ])}
          emptyText="No sold items yet."
        />

        <TableCard
          title="🚀 Best ROI Items"
          subtitle="Highest ROI %"
          columns={["Item", "Buy", "Sold", "ROI"]}
          rows={topROI.map((i) => [
            short(i.name),
            money(i.purchase),
            money(i.sold),
            `${i.roi.toFixed(1)}%`,
          ])}
          emptyText="Sell some items to see ROI leaders."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <TableCard
          title="🐢 Slow Movers"
          subtitle="Oldest unsold items (by purchase date)"
          columns={["Item", "Brand", "Status", "Bought"]}
          rows={slowMovers.map((i) => [
            short(i.name),
            i.brand || "—",
            i.status,
            i.purchaseDate || "—",
          ])}
          emptyText="Add purchase dates + keep inventory unsold to populate."
        />

        <TableCard
          title="💷 Most Money Tied Up"
          subtitle="Highest purchase price unsold items"
          columns={["Item", "Brand", "Status", "Buy"]}
          rows={tiedUp.map((i) => [
            short(i.name),
            i.brand || "—",
            i.status,
            money(i.purchase),
          ])}
          emptyText="No unsold items yet."
        />
      </div>
    </div>
  );
}

/* =========================
   Insights Tab
   ========================= */

function InsightsTab({ items }) {
  const sold = items.filter((i) => i.isSold);

  const profitByBrand = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const k = i.brand || "Unknown";
      map[k] = (map[k] || 0) + i.profit;
    });
    return toBarData(map, 12);
  }, [sold]);

  const profitByCategory = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const k = i.finalCategory || "Uncategorised";
      map[k] = (map[k] || 0) + i.profit;
    });
    return toBarData(map, 12);
  }, [sold]);

  const inventoryMixByBrand = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      const k = i.brand || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return toBarData(map, 10, true);
  }, [items]);

  // ✅ NEW: size analytics (profit)
  const profitBySize = useMemo(() => {
    const map = {};
    sold.forEach((i) => {
      const k = i.size || "Unknown";
      map[k] = (map[k] || 0) + i.profit;
    });
    return toBarData(map, 10);
  }, [sold]);

  // ✅ NEW: colour analytics (count)
  const countByColour = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      const k = i.colour || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return toBarData(map, 10, true);
  }, [items]);

  return (
    <div style={{ marginTop: 26, display: "grid", gap: 24 }}>
      {/* Insight headline cards */}
      <div className="glass" style={{ padding: 26 }}>
        <SectionTitle emoji="🧠" title="Insights" />
        <div style={{ opacity: 0.75, marginTop: 8 }}>
          This section shows what’s working (profit drivers) and where your
          inventory is concentrated.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ChartCard
          title="Profit by Brand"
          subtitle="Where your profit is coming from"
          data={profitByBrand}
          valueKey="value"
        />

        <ChartCard
          title="Profit by Category"
          subtitle="Top profit categories"
          data={profitByCategory}
          valueKey="value"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ChartCard
          title="Inventory Mix by Brand"
          subtitle="Count of items by brand (sold + unsold)"
          data={inventoryMixByBrand}
          valueKey="value"
          isCount
        />

        <div className="glass" style={{ padding: 26 }}>
          <SectionTitle emoji="✅" title="What to focus on" />
          {sold.length === 0 ? (
            <div style={{ opacity: 0.75, marginTop: 10 }}>
              Sell a few items to unlock strong profit insights. For now:
              <ul style={{ marginTop: 10 }}>
                <li>
                  Track brands you source most (see “Inventory Mix by Brand”).
                </li>
                <li>Add purchase dates to identify slow movers.</li>
                <li>Use Listed status consistently for sell-through accuracy.</li>
              </ul>
            </div>
          ) : (
            <div style={{ opacity: 0.75, marginTop: 10 }}>
              <ul>
                <li>Double down on your top profit brand & category.</li>
                <li>Check “Slow Movers” in Items tab to clear dead stock.</li>
                <li>
                  Compare “Best ROI” vs “Top Profit” to improve sourcing
                  strategy.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW ROW: Size + Colour analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ChartCard
          title="Profit by Size"
          subtitle="Which sizes generate the most profit"
          data={profitBySize}
          valueKey="value"
        />

        <ChartCard
          title="Inventory by Colour"
          subtitle="Count of items by colour (sold + unsold)"
          data={countByColour}
          valueKey="value"
          isCount
        />
      </div>
    </div>
  );
}

/* =========================
   Helpers
   ========================= */

function buildMonthlySeries(items) {
  // Uses sold items only. If you later store soldDate, swap it in here.
  const sold = items.filter((i) => i.isSold);

  const map = {};
  sold.forEach((i) => {
    // We only have purchaseDate right now; better than nothing for a base.
    // Later: add soldDate and use that here for true sales timeline.
    const dateStr = i.purchaseDate;
    if (!dateStr) return;
    const month = dateStr.slice(0, 7);
    map[month] = map[month] || { month, revenue: 0, profit: 0 };
    map[month].revenue += i.sold || 0;
    map[month].profit += i.profit || 0;
  });

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

function toBarData(map, limit = 12, isCount = false) {
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((x) => ({
      ...x,
      value: isCount ? x.value : Number(x.value.toFixed(2)),
    }));
}

function money(v, highlight = false) {
  const num = Number(v || 0);
  return `${highlight ? "" : ""}£${num.toFixed(2)}`;
}

function short(text) {
  const s = String(text || "");
  return s.length > 26 ? s.slice(0, 26) + "…" : s;
}

/* =========================
   UI Components
   ========================= */

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass"
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        fontWeight: 800,
        opacity: active ? 1 : 0.6,
        border: active ? "1px solid rgba(255,255,255,0.35)" : "none",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Kpi({ title, value, sub }) {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ opacity: 0.7, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
        {value}
      </div>
      {sub && (
        <div style={{ opacity: 0.55, fontSize: 12, marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionTitle({ emoji, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="emoji">{emoji}</span>
      <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
    </div>
  );
}

function InsightRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 12,
        opacity: 0.88,
      }}
    >
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        opacity: 0.75,
      }}
    >
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="glass" style={{ padding: 18 }}>
      <div style={{ opacity: 0.7, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ marginTop: 14, opacity: 0.7 }}>{text}</div>;
}

function LegendDot({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "rgba(255,255,255,0.35)",
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

function TableCard({ title, subtitle, columns, rows, emptyText }) {
  return (
    <div className="glass" style={{ padding: 26 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
          <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {rows.length === 0 ? (
          <div style={{ opacity: 0.7 }}>{emptyText}</div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                gap: 12,
                opacity: 0.6,
                fontSize: 12,
                fontWeight: 700,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {columns.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>

            {rows.map((r, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    idx === rows.length - 1
                      ? "none"
                      : "1px solid rgba(255,255,255,0.08)",
                  fontSize: 13,
                }}
              >
                {r.map((cell, i) => (
                  <div
                    key={i}
                    style={{
                      opacity: i === columns.length - 1 ? 1 : 0.85,
                      fontWeight:
                        i === columns.length - 1 ? 800 : 500,
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, data, valueKey, isCount }) {
  return (
    <div className="glass" style={{ padding: 26 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>
        {subtitle}
      </div>

      {data.length === 0 ? (
        <div style={{ marginTop: 16, opacity: 0.7 }}>
          No data yet. Sell items (or fill brand/category/size) to populate charts.
        </div>
      ) : (
        <div style={{ height: 280, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* ✅ PREMIUM BAR CHART STYLE */}
            <BarChart data={data} barGap={10} barCategoryGap="22%">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.25} />
                </linearGradient>

                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.25} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 6"
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
              />

              <Bar
                dataKey={valueKey}
                fill={isCount ? "url(#purpleGrad)" : "url(#goldGrad)"}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isCount && data.length > 0 && (
        <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
          Showing top {Math.min(12, data.length)} groups
        </div>
      )}
    </div>
  );
}
