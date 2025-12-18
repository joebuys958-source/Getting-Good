import { useState } from "react";
import PricingMethodCards from "../../components/ai/pricing/PricingMethodCards";
import PricingResult from "../../components/ai/pricing/PricingResult";
import PricingEmptyState from "../../components/ai/pricing/PricingEmptyState";
import MarketPricingResult from "../../components/ai/pricing/MarketPricingResult";

export default function AIPricing() {
  const [method, setMethod] = useState(null);

  return (
    <div style={{ padding: 24 }}>
      <h1>🤖 AI Pricing</h1>

      <PricingMethodCards
        selected={method}
        onSelect={setMethod}
      />
onClick={() => onSelect("inventory")}

      {!method && <PricingEmptyState />}

      {method === "inventory" && <PricingResult method="inventory" />}

{method === "market" && <MarketPricingResult />}

    </div>
  );
}

