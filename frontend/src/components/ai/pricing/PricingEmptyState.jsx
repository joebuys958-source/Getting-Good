export default function PricingEmptyState() {
  return (
    <div
      className="glass"
      style={{
        padding: 30,
        borderRadius: 20,
        textAlign: "center",
        opacity: 0.7,
      }}
    >
      <h3>👈 Choose a pricing method</h3>
      <p style={{ fontSize: 14 }}>
        Select how you want the AI to estimate prices.
        Nothing will change automatically.
      </p>
    </div>
  );
}
