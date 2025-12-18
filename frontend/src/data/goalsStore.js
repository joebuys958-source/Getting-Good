const KEY = "resell_goals"; // 🔒 DO NOT CHANGE THIS AGAIN

export function loadGoals() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals) {
  if (!Array.isArray(goals)) return; // 🛡️ guard
  localStorage.setItem(KEY, JSON.stringify(goals));
}

export function computeHealth(goal) {
  if (goal.status === "completed") return "on-track";

  const now = new Date();
  const start = goal.startDate ? new Date(goal.startDate) : null;
  const end = goal.endDate ? new Date(goal.endDate) : null;

  if (!start || !end || end <= start) return "behind";

  const totalDuration = end - start;
  const elapsed = Math.max(0, now - start);

  const timeProgress = Math.min(elapsed / totalDuration, 1); // 0 → 1
  const target = Number(goal.target || 0);
  const current = Number(goal.current || 0);

  if (target <= 0) return "behind";

  const expectedByNow = target * timeProgress;

  // 🎯 CORE LOGIC
  if (current >= expectedByNow) return "on-track";

  // ⚠️ Due soon logic
  const daysLeft = Math.ceil((end - now) / 86400000);
  if (daysLeft <= 3) return "due-soon";

  return "behind";
}


export function normalizeGoals(goals) {
  return goals.map((g) => {
    const goal = {
      ...g,
      target: Number(g.target || 0),
      current: Number(g.current || 0),
      status: g.status || "active",
      emoji: g.emoji || "🎯",
    };

    if (goal.target > 0 && goal.current >= goal.target) {
      goal.status = "completed";
    }

    goal.health = computeHealth(goal);
    return goal;
  });
}
