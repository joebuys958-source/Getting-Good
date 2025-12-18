export default function PricingMethodCards({ selected, onSelect }) {
  const cardStyle = (active) => ({
    padding: 20,
    borderRadius: 20,
    cursor: "pointer",
    border: active
      ? "2px solid #ff3b3b"
      : "1px solid rgba(255,255,255,.15)",
    background: "rgba(0,0,0,.35)",
    boxShadow: active ? "0 0 25px rgba(255,0,80,.35)" : "none",
    transition: "all .25s ease",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 18,
        marginBottom: 24,
      }}
    >
      {/* ================= MARKET PRICING ================= */}
      <div
        className="glass"
        style={cardStyle(selected === "market")}
        onClick={() => onSelect("market")}
        role="button"
      >
        <h3>🌍 Market Pricing</h3>

        <p style={{ opacity: 0.75, fontSize: 14 }}>
          Estimates price using sold listings from external marketplaces
          like eBay.
        </p>

        <ul style={{ opacity: 0.7, fontSize: 13, marginTop: 10 }}>
          <li>✔ Recent sold listings</li>
          <li>✔ Market demand & range</li>
          <li>✔ Best for new items</li>
        </ul>
      </div>

      {/* ================= INVENTORY PRICING ================= */}
      <div
        className="glass"
        style={cardStyle(selected === "inventory")}
        onClick={() => onSelect("inventory")}
        role="button"
      >
        <h3>📦 Inventory Pricing</h3>

        <p style={{ opacity: 0.75, fontSize: 14 }}>
          Uses your own sold inventory to price similar items.
        </p>

        <ul style={{ opacity: 0.7, fontSize: 13, marginTop: 10 }}>
          <li>✔ Your historical sales</li>
          <li>✔ Keyword similarity</li>
          <li>✔ Brand-aware matching</li>
        </ul>
      </div>
    </div>
  );
}