import { loadInventory } from "./inventoryStore";

/* ------------------ REVENUE ------------------ */
export function getTotalRevenue() {
  const inventory = loadInventory();
  return inventory
    .filter((i) => i.status === "Sold")
    .reduce((sum, i) => sum + Number(i.soldPrice || 0), 0);
}

/* ------------------ PROFIT ------------------ */
export function getTotalProfit(expenses = 0) {
  const inventory = loadInventory();

  const revenue = inventory
    .filter((i) => i.status === "Sold")
    .reduce((sum, i) => sum + Number(i.soldPrice || 0), 0);

  const cost = inventory
    .filter((i) => i.status === "Sold")
    .reduce((sum, i) => sum + Number(i.purchasePrice || 0), 0);

  return revenue - cost - expenses;
}
