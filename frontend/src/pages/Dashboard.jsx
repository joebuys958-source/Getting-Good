import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";



import { loadInventory } from "../data/inventoryStore";
import { loadGoals } from "../data/goalsStore";
import { loadExpenses } from "../data/expensesStore";

/* ===========================
   HELPERS
=========================== */

function daysBetween(a, b) {
  return Math.abs((a - b) / 86400000);
}

/* ===========================
   DASHBOARD
=========================== */

export default function Dashboard() {
  const navigate = useNavigate();

  const inventory = loadInventory();
  const goals = loadGoals();
  const expenses = loadExpenses();

  /* ---------- INVENTORY METRICS ---------- */

  const soldItems = inventory.filter(i => i.status === "Sold");
  const activeItems = inventory.filter(i => i.status !== "Sold");

  const totalRevenue = soldItems.reduce(
    (s, i) => s + Number(i.soldPrice || 0),
    0
  );

  const totalCost = soldItems.reduce(
    (s, i) => s + Number(i.purchasePrice || 0),
    0
  );

  const totalProfit = totalRevenue - totalCost;

  const sellThrough =
    inventory.length > 0
      ? (soldItems.length / inventory.length) * 100
      : 0;

  const avgDaysToSell =
    soldItems.length === 0
      ? "—"
      : Math.round(
          soldItems.reduce((s, i) => {
            if (!i.purchaseDate || !i.soldDate) return s;
            return (
              s +
              daysBetween(
                new Date(i.purchaseDate),
                new Date(i.soldDate)
              )
            );
          }, 0) / soldItems.length
        );

  const itemsAtRisk = activeItems.filter(i => {
    if (!i.purchaseDate) return false;
    return daysBetween(new Date(), new Date(i.purchaseDate)) > 30;
  }).length;

  /* ---------- EXPENSES ---------- */

  const totalExpenses = expenses.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );

  /* ---------- TOP BRANDS & CATEGORIES ---------- */

  const topBrands = useMemo(() => {
    const map = {};
    soldItems.forEach(i => {
      if (!i.brand) return;
      map[i.brand] = (map[i.brand] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [soldItems]);

  const topCategories = useMemo(() => {
    const map = {};
    soldItems.forEach(i => {
      if (!i.finalCategory) return;
      map[i.finalCategory] =
        (map[i.finalCategory] || 0) + Number(i.soldPrice || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [soldItems]);

  /* ===========================
     RENDER
  =========================== */

  return (
    <div className="dashboard-page">
      {/* ===== OVERVIEW ===== */}
      <section className="dashboard-grid">
        <OverviewCard emoji="💰" label="Total Profit" value={`£${totalProfit.toFixed(0)}`} />
        <OverviewCard emoji="💳" label="Total Revenue" value={`£${totalRevenue.toFixed(0)}`} />
        <OverviewCard emoji="💸" label="Total Expenses" value={`£${totalExpenses.toFixed(0)}`} />
        <OverviewCard emoji="📦" label="Active Listings" value={activeItems.length} />
        <OverviewCard emoji="✅" label="Sold Items" value={soldItems.length} />
      </section>

      {/* ===== PERFORMANCE + ALERTS ===== */}
      <section className="dashboard-two">
        <Glass title="📈 Performance Insights">
          <Insight label="Avg Days to Sell" value={avgDaysToSell} />
          <Insight label="Profit Margin" value={`${((totalProfit / Math.max(totalRevenue,1)) * 100).toFixed(1)}%`} />
          <Insight label="Sell-through Rate" value={`${sellThrough.toFixed(1)}%`} />
          <Insight label="Items at Risk" value={itemsAtRisk || "—"} />
        </Glass>

        <Glass title="🚨 Alerts & Notifications">
          {itemsAtRisk > 0 && <p>⚠️ {itemsAtRisk} items listed over 30 days</p>}
          {goals.length > 0 && <p>🎯 {goals.length} active goals</p>}
          {expenses.some(e => e.recurring) && <p>⏰ Recurring expenses active</p>}
        </Glass>
      </section>

      {/* ===== ACTIVITY + TOP ===== */}
      <section className="dashboard-three">
        <Glass title="🕒 Recent Activity">
          {inventory.slice(0, 5).map(i => (
            <div
              key={i.id}
              className="activity-row"
              onClick={() => navigate("/inventory")}
            >
              {i.status === "Sold" ? "✅ Sold" : "📦 Listed"} {i.name}
            </div>
          ))}
        </Glass>

        <Glass title="🏆 Top Performers">
          <h4>Top Brands</h4>
          {topBrands.map(([b, c]) => (
            <div key={b} onClick={() => navigate("/inventory")}>
              {b} — {c} sold
            </div>
          ))}

          <h4 style={{ marginTop: 12 }}>Top Categories</h4>
          {topCategories.map(([c, v]) => (
            <div key={c} onClick={() => navigate("/inventory")}>
              {c} — £{v.toFixed(0)}
            </div>
          ))}
        </Glass>

        <Glass title="⚡ Quick Actions">
          <QuickAction emoji="📦" label="Add Item" onClick={() => navigate("/inventory")} />
          <QuickAction emoji="💸" label="Log Expense" onClick={() => navigate("/expenses")} />
          <QuickAction emoji="🔁" label="Recurring Expense" onClick={() => navigate("/expenses")} />
          <QuickAction emoji="🎯" label="Set Goal" onClick={() => navigate("/goals")} />
          <QuickAction emoji="📊" label="Analytics" onClick={() => navigate("/analytics")} />
        </Glass>
      </section>

      {/* ===== GOALS + PROFIT ===== */}
      <section className="dashboard-two">
        <Glass title="🎯 Goal Progress">
          {goals.slice(0, 3).map(g => {
            const pct =
              g.target > 0 ? (g.current / g.target) * 100 : 0;
            return (
              <div key={g.id} className="goal-row">
                <div>{g.emoji} {g.name}</div>
                <div className="progress">
                  <div style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </Glass>

        <Glass title="📆 7-Day Profit">
          <div className="mini-bars">
            {[12, 22, 8, 30, 18, 25, 10].map((v, i) => (
              <div key={i} style={{ height: v * 2 }} />
            ))}
          </div>
        </Glass>
      </section>
    </div>
  );
}

/* ===========================
   COMPONENTS
=========================== */

function OverviewCard({ emoji, label, value }) {
  return (
    <div className="summary-card">
      <div className="card-top">
        <span className="card-emoji">{emoji}</span>
        <span className="card-title">{label}</span>
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
}

function Glass({ title, children }) {
  return (
    <div className="glass-panel">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div className="insight-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({ emoji, label, onClick }) {
  return (
    <div className="quick-action" onClick={onClick}>
      <span>{emoji}</span>
      <p>{label}</p>
    </div>
  );
}
