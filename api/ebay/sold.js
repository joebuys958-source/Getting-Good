import { getMarketPricingFromEbayMock } from "./marketPricing";
import { getInventoryBasedPricing } from "./inventoryPricing";

export function getCombinedPricing(query, method) {
  console.log("🔗 AGGREGATOR METHOD:", method);

  if (method === "inventory") {
    return getInventoryBasedPricing(query);
  }

  if (method === "market") {
    return getMarketPricingFromEbayMock(query);
  }

  return null;
}
