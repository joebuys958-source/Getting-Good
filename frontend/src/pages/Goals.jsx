import { useEffect, useMemo, useState } from "react";
import GoalCard from "../components/GoalCard";
import GoalModal from "../components/GoalModal";
import "../styles/goals.css";
import { loadGoals, saveGoals, normalizeGoals } from "../data/goalsStore";
import { getTotalRevenue, getTotalProfit } from "../data/metrics";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [hydrated, setHydrated] = useState(false); // 🔒 KEY FIX
  const [filter, setFilter] = useState("active");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* ===================== LOAD ONCE ===================== */
  useEffect(() => {
    const stored = loadGoals();
    setGoals(normalizeGoals(stored));
    setHydrated(true); // ✅ allow saving AFTER load
  }, []);

  /* ===================== SAVE AFTER HYDRATION ===================== */
  useEffect(() => {
    if (!hydrated) return; // 🛡️ prevents wipe
    saveGoals(goals);
  }, [goals, hydrated]);
useEffect(() => {
  if (!hydrated) return;

  setGoals((prev) =>
    normalizeGoals(
      prev.map((g) => {
        if (g.type === "revenue") {
          return {
            ...g,
            current: getTotalRevenue(),
          };
        }

        if (g.type === "profit") {
          // for now expenses = 0, we'll wire it next
          return {
            ...g,
            current: getTotalProfit(0),
          };
        }

        return g;
      })
    )
  );
}, [hydrated]);

  /* ===================== COUNTS ===================== */
  const counts = useMemo(() => ({
    active: goals.filter((g) => g.status === "active").length,
    completed: goals.filter((g) => g.status === "completed").length,
    paused: goals.filter((g) => g.status === "paused").length,
    archived: goals.filter((g) => g.status === "archived").length,
    onTrack: goals.filter((g) => g.health === "on-track").length,
  }), [goals]);

  /* ===================== FILTER ===================== */
  const filteredGoals = useMemo(() => {
    if (filter === "on-track") return goals.filter((g) => g.health === "on-track");
    if (filter === "active")
      return goals.filter(
        (g) =>
          g.status === "active" ||
          g.status === "paused" ||
          g.status === "archived"
      );
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  /* ===================== ACTIONS ===================== */
  function addGoal(goal) {
    setGoals((prev) => normalizeGoals([goal, ...prev]));
  }

  function updateGoal(id, patch) {
    if (patch.__edit) {
      setEditing(goals.find((g) => g.id === id));
      return;
    }

    setGoals((prev) =>
      normalizeGoals(
        prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      )
    );
  }

  function deleteGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  /* ===================== UI ===================== */
  return (
    <div className="goals-page">
      <div className="goals-hero">
        <div>
          <h1>🎯 Goals</h1>
          <p>Track your business targets and monitor progress</p>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          ➕ Add Goal
        </button>
      </div>

      <div className="goal-summary">
        <Summary emoji="🎯" label="Active" value={counts.active} onClick={() => setFilter("active")} />
        <Summary emoji="✅" label="Completed" value={counts.completed} onClick={() => setFilter("completed")} />
        <Summary emoji="📈" label="On Track" value={counts.onTrack} onClick={() => setFilter("on-track")} />
        <Summary emoji="📦" label="Archived" value={counts.archived} onClick={() => setFilter("archived")} />
        <Summary emoji="⏸" label="Paused" value={counts.paused} onClick={() => setFilter("paused")} />
      </div>

      <div className="section">
        <div className="section-title">
          <h2>📌 Your Goals</h2>
          <span className="pill">{filteredGoals.length} total</span>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="empty">No goals yet. Click Add Goal.</div>
        ) : (
          <div className="goals-list">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={deleteGoal}
                onUpdate={updateGoal}
              />
            ))}
          </div>
        )}
      </div>

      {open && (
        <GoalModal onClose={() => setOpen(false)} onCreate={addGoal} />
      )}

      {editing && (
        <GoalModal
          existing={editing}
          onClose={() => setEditing(null)}
          onCreate={(updated) => {
            setGoals((prev) =>
              normalizeGoals(prev.map((g) => (g.id === updated.id ? updated : g)))
            );
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Summary({ emoji, label, value, onClick }) {
  return (
    <div className="summary-card" onClick={onClick}>
      <div className="summary-icon">{emoji}</div>
      <div className="summary-value">{value}</div>
      <div className="summary-label">{label}</div>
    </div>
  );
}
