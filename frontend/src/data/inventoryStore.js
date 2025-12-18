const STORAGE_KEY = "inventory";

/* ================= LOAD / SAVE ================= */

export function loadInventory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveInventory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ================= APPLY AI PRICE ================= */

export function applyEstimatedPriceToInventory(itemName, estimatedPrice) {
  if (!itemName || !estimatedPrice) return false;

  const items = loadInventory();

  const index = items.findIndex((i) =>
    i.name?.toLowerCase().includes(itemName.toLowerCase())
  );

  if (index === -1) return false;

  items[index] = {
    ...items[index],
    estimatedSale: estimatedPrice,
  };

  saveInventory(items);
  return true;
}
