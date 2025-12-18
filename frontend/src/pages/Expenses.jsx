import { useEffect, useMemo, useState } from "react";
import "../styles/expenses.css";

import { loadExpenses, saveExpenses, normalizeExpenses } from "../data/expensesStore";
import { loadRecurring, saveRecurring, computeNextDue } from "../data/recurringExpensesStore";

/* ===================== HELPERS ===================== */

const ONEOFF_CATEGORIES = [
  { value: "stock", label: "📦 Stock / Inventory" },
  { value: "shipping", label: "🚚 Shipping" },
  { value: "fees", label: "💸 Platform Fees" },
  { value: "equipment", label: "🧰 Equipment" },
  { value: "supplies", label: "📦 Packaging / Supplies" },
  { value: "marketing", label: "📢 Marketing" },
  { value: "software", label: "💻 Software" },
  { value: "travel", label: "🧭 Travel" },
  { value: "education", label: "🎓 Education" },
  { value: "tax", label: "🧾 Tax / Accounting" },
  { value: "other", label: "🧾 Other" },
];

const RECURRING_CATEGORIES = [
  { value: "subscription", label: "🔁 Subscription" },
  { value: "software", label: "💻 Software" },
  { value: "storage", label: "📦 Storage" },
  { value: "marketing", label: "📢 Marketing" },
  { value: "tools", label: "🧰 Tools" },
  { value: "insurance", label: "🛡️ Insurance" },
  { value: "phone", label: "📱 Phone / Data" },
  { value: "other", label: "🧾 Other" },
];

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

function money(n) {
  const x = Number(n || 0);
  return `£${x.toFixed(2)}`;
}

/* ===================== MAIN ===================== */

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [hydrated, setHydrated] = useState(false);
const oneOffTotal = expenses.reduce(
  (sum, e) => sum + Number(e.amount || 0),
  0
);

  const [tab, setTab] = useState("oneoff");
  const [search, setSearch] = useState("");

  // modal state
  const [expenseModal, setExpenseModal] = useState({ open: false, mode: "add", item: null });
  const [recurringModal, setRecurringModal] = useState({ open: false, mode: "add", item: null });

  /* ---------- LOAD ---------- */
  useEffect(() => {
    setExpenses(normalizeExpenses(loadExpenses()));
    setRecurring(loadRecurring());
    setHydrated(true);
  }, []);

  /* ---------- SAVE ---------- */
  useEffect(() => {
    if (!hydrated) return;
    saveExpenses(expenses);
    saveRecurring(recurring);
  }, [expenses, recurring, hydrated]);

  /* ---------- METRICS ---------- */
  const activeRecurring = useMemo(() => recurring.filter((r) => r.active !== false), [recurring]);

  const monthlyCost = useMemo(
    () =>
      activeRecurring.reduce((s, r) => {
        // estimate monthly from frequency (simple & good enough)
        const amt = Number(r.amount || 0);
        const f = String(r.frequency || "monthly").toLowerCase();
        if (f === "weekly") return s + amt * 4.33;
        if (f === "biweekly") return s + amt * 2.165;
        if (f === "quarterly") return s + amt / 3;
        if (f === "yearly") return s + amt / 12;
        return s + amt; // monthly default
      }, 0),
    [activeRecurring]
  );

  const yearlyCost = monthlyCost * 12;

  const nextDue = useMemo(() => {
    const list = activeRecurring
      .filter((r) => r.nextDue)
      .slice()
      .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
    return list[0] || null;
  }, [activeRecurring]);

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((e) => {
      return (
        String(e.name || "").toLowerCase().includes(q) ||
        String(e.category || "").toLowerCase().includes(q) ||
        String(e.note || "").toLowerCase().includes(q)
      );
    });
  }, [expenses, search]);

  /* ---------- QUICK ACTIONS ---------- */

  function deleteOneOff(id) {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  }

  function deleteRecurring(id) {
    setRecurring((prev) => prev.filter((x) => x.id !== id));
  }

  function toggleRecurringActive(id) {
    setRecurring((prev) =>
      prev.map((x) => (x.id === id ? { ...x, active: x.active === false ? true : false } : x))
    );
  }

  function openAddExpense() {
    setExpenseModal({ open: true, mode: "add", item: null });
  }

  function openEditExpense(item) {
    setExpenseModal({ open: true, mode: "edit", item });
  }

  function openAddRecurring() {
    setRecurringModal({ open: true, mode: "add", item: null });
  }

  function openEditRecurring(item) {
    setRecurringModal({ open: true, mode: "edit", item });
  }

  return (
    <div className="expenses-page">
      {/* ================= HEADER ================= */}
      <div className="expenses-header">
        <div>
          <h1>💸 Expenses</h1>
          <p>Track and manage your business expenses</p>
        </div>

        <div className="header-actions">
          <button className="btn-blue" type="button" onClick={openAddRecurring}>
            ➕ Add Recurring
          </button>
          <button className="btn-red" type="button" onClick={openAddExpense}>
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="expense-summary-grid">
        <SummaryCard emoji="🔁" title="Active Expenses" value={String(activeRecurring.length)} sub="Recurring expenses" />
        <SummaryCard
  emoji="💰"
  title="One-off Total"
  value={`£${oneOffTotal.toFixed(2)}`}
  sub="Non-recurring expenses"
  accent="red"
/>

        <SummaryCard emoji="📆" title="Monthly Cost" value={money(monthlyCost)} sub="Average per month" accent="blue" />
        <SummaryCard emoji="📈" title="Yearly Cost" value={money(yearlyCost)} sub="Total per year" accent="green" />
        <SummaryCard
          emoji="📅"
          title="Next Due"
          value={nextDue?.nextDue ? formatPrettyDate(nextDue.nextDue) : "—"}
          sub={nextDue?.nextDue ? `Due on ${formatPrettyDate(nextDue.nextDue)}` : "No upcoming"}
          accent="amber"
          pill={nextDue?.nextDue ? "Upcoming" : ""}
        />
        <SummaryCard emoji="✅" title="Status" value={nextDue?.nextDue ? "Upcoming" : "All up to date"} sub="" accent="red" />
      </div>

      {/* ================= TABS ================= */}
      <div className="tabs">
        <button className={tab === "oneoff" ? "active" : ""} onClick={() => setTab("oneoff")}>
          One-off Expenses
        </button>
        <button className={tab === "recurring" ? "active" : ""} onClick={() => setTab("recurring")}>
          Recurring Expenses
        </button>
      </div>

      {/* ================= PANEL ================= */}
      <div className="tab-panel">
        {tab === "oneoff" && (
          <>
            <input
              className="search"
              placeholder="Search by name, category or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="table-wrap">
              <table className="card-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nothing here yet
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id}>
                        <td className="td-strong">{e.name || "—"}</td>
                        <td>
                          <span className={`badge badge-${String(e.category || "other")}`}>
                            {getCategoryLabel(ONEOFF_CATEGORIES, e.category)}
                          </span>
                        </td>
                        <td className="td-strong">{money(e.amount)}</td>
                        <td className="muted">{formatPrettyDate(e.date)}</td>
                        <td className="actions">
                          <IconBtn title="Edit" onClick={() => openEditExpense(e)}>
                            ✏️
                          </IconBtn>
                          <IconBtn title="Delete" danger onClick={() => deleteOneOff(e.id)}>
                            🗑
                          </IconBtn>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "recurring" && (
          <div className="table-wrap">
            <table className="card-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {recurring.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty">
                      No recurring expenses yet
                    </td>
                  </tr>
                ) : (
                  recurring.map((r) => (
                    <tr key={r.id}>
                      <td className="td-strong">{r.name || "—"}</td>
                      <td>
                        <span className={`badge badge-${String(r.category || "other")}`}>
                          {getCategoryLabel(RECURRING_CATEGORIES, r.category)}
                        </span>
                      </td>
                      <td className="td-strong">{money(r.amount)}</td>
                      <td className="muted">{prettyFrequency(r.frequency)}</td>
                      <td className="muted">{r.nextDue ? formatPrettyDate(r.nextDue) : "—"}</td>
                      <td>
                        <span className={`pill ${r.active === false ? "pill-gray" : "pill-green"}`}>
                          {r.active === false ? "Paused" : "Active"}
                        </span>
                      </td>
                      <td className="actions">
                        <IconBtn title="Edit" onClick={() => openEditRecurring(r)}>
                          ✏️
                        </IconBtn>
                        <IconBtn
                          title={r.active === false ? "Resume" : "Pause"}
                          onClick={() => toggleRecurringActive(r.id)}
                        >
                          {r.active === false ? "▶️" : "⏸"}
                        </IconBtn>
                        <IconBtn title="Delete" danger onClick={() => deleteRecurring(r.id)}>
                          🗑
                        </IconBtn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODALS (with CLOSE ANIMATION) ================= */}
      {expenseModal.open && (
        <ExpenseModal
          mode={expenseModal.mode}
          initial={expenseModal.item}
          onClose={() => setExpenseModal({ open: false, mode: "add", item: null })}
          onSave={(payload) => {
            if (expenseModal.mode === "edit" && expenseModal.item) {
              setExpenses((prev) => prev.map((x) => (x.id === expenseModal.item.id ? { ...x, ...payload } : x)));
            } else {
              setExpenses((prev) => [{ id: Date.now(), ...payload }, ...prev]);
            }
          }}
        />
      )}

      {recurringModal.open && (
        <RecurringModal
          mode={recurringModal.mode}
          initial={recurringModal.item}
          onClose={() => setRecurringModal({ open: false, mode: "add", item: null })}
          onSave={(payload) => {
            const next = computeNextDue(payload.startDate, payload.frequency);
            if (recurringModal.mode === "edit" && recurringModal.item) {
              setRecurring((prev) =>
                prev.map((x) => (x.id === recurringModal.item.id ? { ...x, ...payload, nextDue: next } : x))
              );
            } else {
              setRecurring((prev) => [{ id: Date.now(), ...payload, nextDue: next }, ...prev]);
            }
          }}
        />
      )}
    </div>
  );
}

/* ===================== UI PIECES ===================== */

function SummaryCard({ emoji, title, value, sub, accent = "", pill = "" }) {
  return (
    <div className={`summary-card ${accent ? `card-${accent}` : ""}`}>
      <div className="card-top">
        <div className="card-emoji" aria-hidden="true">
          {emoji}
        </div>
        <div className="card-title">{title}</div>
      </div>
      <div className="card-value">{value}</div>
      {sub ? <div className="card-sub">{sub}</div> : null}
      {pill ? <div className="card-pill">{pill}</div> : null}
    </div>
  );
}

function IconBtn({ children, onClick, danger, title }) {
  return (
    <button
      type="button"
      className={`icon-btn ${danger ? "danger" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

/* ===================== MODALS ===================== */

function ExpenseModal({ mode, initial, onClose, onSave }) {
  const [closing, setClosing] = useState(false);

  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    category: initial?.category || "stock",
    amount: initial?.amount ?? "",
    date: initial?.date || new Date().toISOString().slice(0, 10),
    note: initial?.note || "",
  }));

  function requestClose() {
    setClosing(true);
    setTimeout(() => onClose(), 180); // match CSS close animation
  }

  function openDatePicker(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  }

  return (
    <ModalShell title={mode === "edit" ? "Edit Expense" : "Add New Expense"} closing={closing} onClose={requestClose}>
      <div className="modal-grid">
        <div className="modal-field">
          <label>Expense Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Packaging supplies"
          />
        </div>

        <div className="modal-field">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {ONEOFF_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="modal-grid">
        <div className="modal-field">
          <label>Amount (£)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="modal-field">
          <label>Date</label>
          <div className="date-input">
            <button type="button" className="calendar-btn" onClick={() => openDatePicker("oneoff-date")} title="Pick date">
              📅
            </button>
            <input
              id="oneoff-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="modal-field">
        <label>Notes</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Optional notes…"
        />
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={requestClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-red"
          onClick={() => {
            onSave(form);
            requestClose();
          }}
          disabled={!String(form.name).trim() || Number(form.amount) <= 0}
        >
          {mode === "edit" ? "Save Changes" : "Save Expense"}
        </button>
      </div>
    </ModalShell>
  );
}

function RecurringModal({ mode, initial, onClose, onSave }) {
  const [closing, setClosing] = useState(false);

  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    category: initial?.category || "subscription",
    amount: initial?.amount ?? "",
    frequency: initial?.frequency || "monthly",
    startDate: initial?.startDate || new Date().toISOString().slice(0, 10),
    endDate: initial?.endDate || "",
    active: initial?.active !== false,
  }));

  function requestClose() {
    setClosing(true);
    setTimeout(() => onClose(), 180);
  }

  function openDatePicker(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  }

  return (
    <ModalShell title={mode === "edit" ? "Edit Recurring Expense" : "Add Recurring Expense"} closing={closing} onClose={requestClose}>
      <div className="modal-grid">
        <div className="modal-field">
          <label>Expense Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Resell tools subscription"
          />
        </div>

        <div className="modal-field">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {RECURRING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="modal-grid">
        <div className="modal-field">
          <label>Amount (£)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="modal-field">
          <label>Frequency</label>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="modal-grid">
        <div className="modal-field">
          <label>Start Date</label>
          <div className="date-input">
            <button type="button" className="calendar-btn" onClick={() => openDatePicker("rec-start")} title="Pick start date">
              📅
            </button>
            <input
              id="rec-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-field">
          <label>End Date (optional)</label>
          <div className="date-input">
            <button type="button" className="calendar-btn" onClick={() => openDatePicker("rec-end")} title="Pick end date">
              📅
            </button>
            <input
              id="rec-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={requestClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => {
            onSave(form);
            requestClose();
          }}
          disabled={!String(form.name).trim() || Number(form.amount) <= 0}
        >
          {mode === "edit" ? "Save Changes" : "Add Recurring"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose, closing }) {
  return (
    <div className={`modal-backdrop ${closing ? "closing" : ""}`} onMouseDown={onClose}>
      <div className={`modal ${closing ? "closing" : ""}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/* ===================== FORMATTERS ===================== */

function formatPrettyDate(input) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function prettyFrequency(f) {
  const x = String(f || "").toLowerCase();
  if (x === "biweekly") return "Bi-weekly";
  if (x === "weekly") return "Weekly";
  if (x === "quarterly") return "Quarterly";
  if (x === "yearly") return "Yearly";
  return "Monthly";
}

function getCategoryLabel(list, value) {
  const v = String(value || "").toLowerCase();
  return list.find((x) => x.value === v)?.label || "🧾 Other";
}
