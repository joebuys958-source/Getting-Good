import { useMemo } from "react";
import { loadInventory } from "../../../data/inventoryStore";

export default function ListingsItemPicker({ onSelect }) {
  const items = useMemo(() => loadInventory(), []);

  return (
    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
      <h3>📦 Select inventory item</h3>

      <select
        onChange={(e) => {
          const index = e.target.value;
          if (index !== "") onSelect(items[index]);
        }}
        style={select}
      >
        <option value="">Select an item…</option>
        {items.map((item, i) => (
          <option key={i} value={i}>
            {item.brand} {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const select = {
  width: "100%",
  padding: 14,
  marginTop: 12,
  borderRadius: 14,
  background: "rgba(0,0,0,.25)",
  color: "white",
  border: "none",
};
