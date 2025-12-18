import { useNavigate } from "react-router-dom";

export default function AIOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "AI Pricing",
      subtitle: "Smart pricing suggestions",
      description:
        "Generate suggested list prices, confidence scores, and detect undervalued or slow-moving items.",
      icon: "💰",
      path: "/ai/pricing",
      enabled: true,
    },
    {
      title: "AI Listings",
      subtitle: "Auto-generated listings",
      description:
        "Create optimised titles, descriptions, and hashtags tailored for resale platforms.",
      icon: "📝",
      path: "/ai/listings",
      enabled: true, // ✅ UNLOCKED
    },
    {
  title: "AI Insights",
  subtitle: "Performance intelligence",
  description:
    "Dead stock detection, capital lock-up, sell speed, and best/worst brand performance.",
  icon: "📈",
  path: "/ai/insights",
  enabled: true,
}

  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#ff4d4f" }}>
        AI Assistant
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 32, maxWidth: 700 }}>
        Read-only intelligence powered by your inventory data.
        No prices or items are ever changed automatically.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className="glass-card"
            style={{
              padding: 20,
              cursor: card.enabled ? "pointer" : "not-allowed",
              opacity: card.enabled ? 1 : 0.5,
            }}
            onClick={() => card.enabled && card.path && navigate(card.path)}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>
              {card.icon}
            </div>

            <div style={{ fontWeight: 600 }}>{card.title}</div>
            <div style={{ color: "#ff4d4f", fontSize: 13 }}>
              {card.subtitle}
            </div>

            <p style={{ fontSize: 14, opacity: 0.7, marginTop: 10 }}>
              {card.description}
            </p>

            {!card.enabled && (
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 10 }}>
                Coming soon
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="glass-card"
        style={{
          marginTop: 30,
          padding: 14,
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        AI features analyse inventory data only. No automatic changes are ever applied.
      </div>
    </div>
  );
}
