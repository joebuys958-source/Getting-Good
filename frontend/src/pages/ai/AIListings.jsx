import { useState } from "react";
import { loadInventory } from "../../data/inventoryStore";
import ListingsResult from "../../components/ai/listings/ListingsResult";


export default function AIListings() {
  const inventory = loadInventory() || [];
  const [selectedIndex, setSelectedIndex] = useState("");
  const selectedItem =
    selectedIndex !== "" ? inventory[selectedIndex] : null;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>📝 AI Listings</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Generate optimised Vinted titles, descriptions and hashtags from your
        inventory.
      </p>

      {/* ================= DROPDOWN ================= */}
      <div className="glass" style={{ padding: 16, marginBottom: 24 }}>
        <label
          style={{
            fontSize: 13,
            opacity: 0.7,
            display: "block",
            marginBottom: 6,
          }}
        >
          📦 Select inventory item
        </label>

        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            background: "rgba(0,0,0,.25)",
            color: "white",
            border: "none",
          }}
        >
          <option value="">— Select an item —</option>

          {inventory.map((item, i) => (
            <option key={i} value={i}>
              {item.name} {item.brand ? `• ${item.brand}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* ================= RESULT ================= */}
      {selectedItem &&
        typeof selectedItem === "object" &&
        selectedItem.name && (
          <ListingsResult item={selectedItem} />
        )}
    </div>
  );
}
