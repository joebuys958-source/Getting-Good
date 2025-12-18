const KEY = "resell_expenses";

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  if (!Array.isArray(expenses)) return;
  localStorage.setItem(KEY, JSON.stringify(expenses));
}

export function normalizeExpenses(list) {
  return list.map((e) => ({
    ...e,
    amount: Number(e.amount || 0),
    category: e.category || "misc",
    date: e.date || new Date().toISOString().slice(0, 10),
  }));
}

/* -------- METRICS -------- */
export function getTotalExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyExpenses(expenses, month = new Date()) {
  const y = month.getFullYear();
  const m = month.getMonth();

  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}
