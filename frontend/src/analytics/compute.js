const n = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

export function computeItems(rawItems) {
  return (rawItems || []).map((item) => {
    const purchase = n(item.purchasePrice);
    const sold = item.status === "Sold" ? n(item.soldPrice) : 0;
    const profit = item.status === "Sold" ? sold - purchase : 0;
    const roi = purchase > 0 && item.status === "Sold" ? (profit / purchase) * 100 : 0;
    const costMultiple = purchase > 0 && item.status === "Sold" ? sold / purchase : 0;

    // Days to sell: if sold and purchaseDate exists, use that. (We’ll improve later with soldDate)
    let daysToSell = null;
    if (item.status === "Sold" && item.purchaseDate) {
      const start = new Date(item.purchaseDate);
      const end = new Date(); // base version: uses “today” (we’ll upgrade later)
      const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      daysToSell = Number.isFinite(diff) ? diff : null;
    }
    
    return {
      ...item,
      purchase,
      sold,
      profit,
      roi,
      costMultiple,
      daysToSell,
      isSold: item.status === "Sold",
      isListed: item.status === "Listed",
      finalCategory: item.finalCategory || "",
      brand: item.brand || "",
    };
  });
}

export function computeTotals(items) {
  const computed = computeItems(items);

  const totalRevenue = computed.reduce((s, i) => s + (i.isSold ? i.sold : 0), 0);
  const totalCostSold = computed.reduce((s, i) => s + (i.isSold ? i.purchase : 0), 0);
  const totalProfit = computed.reduce((s, i) => s + (i.isSold ? i.profit : 0), 0);

  const soldCount = computed.filter((i) => i.isSold).length;
  const listedCount = computed.filter((i) => i.isListed).length;
  const totalCount = computed.length;

  const inventoryValue = computed
    .filter((i) => !i.isSold)
    .reduce((s, i) => s + i.purchase, 0);

  const avgSalePrice = soldCount > 0 ? totalRevenue / soldCount : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const avgROI =
    soldCount > 0
      ? computed.filter((i) => i.isSold && i.purchase > 0).reduce((s, i) => s + i.roi, 0) /
        computed.filter((i) => i.isSold && i.purchase > 0).length
      : 0;

  const sellThrough = totalCount > 0 ? (soldCount / totalCount) * 100 : 0;

  return {
    totalRevenue,
    totalCostSold,
    totalProfit,
    inventoryValue,
    soldCount,
    listedCount,
    totalCount,
    avgSalePrice,
    avgROI,
    profitMargin,
    sellThrough,
  };
}
