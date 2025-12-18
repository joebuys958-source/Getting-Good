const KEY = "resell_recurring_expenses";

export function loadRecurring() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveRecurring(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function computeNextDue(startDate, frequency) {
  const d = new Date(startDate);

  if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);

  return d.toISOString().slice(0, 10);
}
