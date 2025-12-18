/* ================= VINTED LISTING GENERATORS ================= */

export function generateVintedTitle(item) {
  if (!item) return "";

  const colour = item.colour ? capitalise(item.colour) : "";
  const brand = item.brand || "";
  const name = item.name || "";
  const gender = "Men’s";
  const size = item.size || "";

  return `${colour} ${brand} ${name} – ${gender} ${size}`.trim();
}

export function generateVintedDescription(item) {
  if (!item) return "";

  return `
Size: ${item.size || "N/A"}
Colour: ${capitalise(item.colour) || "N/A"}
Condition: Very good condition, no flaws or imperfections

✅ Authenticity guaranteed

📥 Open to offers – message if you have any questions
`.trim();
}

export function generateVintedHashtags(item) {
  if (!item) return "";

  const base = [
    item.brand,
    item.name,
    "menswear",
    "streetwear",
    "vinted",
    "resell",
    "preloved",
    "designer",
    "fashion",
    "mensfashion",
  ]
    .filter(Boolean)
    .map(v => `#${v.toLowerCase().replace(/\s+/g, "")}`);

  return [...new Set(base)].join(" ");
}

/* ================= HELPERS ================= */

function capitalise(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
