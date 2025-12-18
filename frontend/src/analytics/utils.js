export function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(d1) || isNaN(d2)) return null;
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}
