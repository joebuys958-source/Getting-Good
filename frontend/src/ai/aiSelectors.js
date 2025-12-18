import { loadInventory } from "../data/inventoryStore";

export function getInventoryForAI() {
  const inventory = loadInventory();

  return inventory.map(item => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    categoryPath: item.categoryPath,
    finalCategory: item.finalCategory,

    purchasePrice: Number(item.purchasePrice) || 0,
    estimatedSale: Number(item.estimatedSale) || 0,
    soldPrice: Number(item.soldPrice) || 0,

    status: item.status,
    purchaseDate: item.purchaseDate,
    soldDate: item.soldDate ?? null,
  }));
}
