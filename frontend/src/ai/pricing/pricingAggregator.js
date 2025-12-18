import { getInventoryBasedPricing } from "./inventoryPricing";
import { getMarketBasedPricing } from "./marketPricing";

export function getCombinedPricing(query, method) {
  console.log("🔗 AGGREGATOR METHOD:", method, query);

  if (method === "inventory") {
    return getInventoryBasedPricing(query);
  }

  if (method === "market") {
    return getMarketBasedPricing(query);
  }

  return null;
}
