export function runAlertEngine({ deadStock, lockup, sellSpeed }) {
  const alerts = [];

  if (deadStock.count > 3) {
    alerts.push({
      text: "Dead stock is increasing — consider discounts",
      severity: "warning",
      confidence: 82,
    });
  }

  if (lockup.total > 500) {
    alerts.push({
      text: "High capital lock-up detected",
      severity: "danger",
      confidence: 88,
    });
  }

  if (sellSpeed.avg && sellSpeed.avg < 12) {
    alerts.push({
      text: "Your sell speed is improving 📈",
      severity: "success",
      confidence: 75,
    });
  }

  return alerts;
}
