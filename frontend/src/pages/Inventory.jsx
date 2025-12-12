import { useMemo, useState } from "react";
import vintedGroups from "../data/vintedCategories";

/* ---------------- HELPERS ---------------- */

function nextStatus(status) {
  if (status === "Bought") return "Listed";
  if (status === "Listed") return "Sold";
  return "Bought";
}

const BRANDS = [
  "Ralph Lauren",
  "The North Face",
  "Nike",
  "Adidas",
  "Stone Island",
  "Carhartt",
  "Patagonia",
  "Supreme",
  "Lacoste",
];

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLOURS = [
  { name: "Black", value: "black" },
  { name: "Navy", value: "navy" },
  { name: "White", value: "white" },
  { name: "Red", value: "red" },
  { name: "Green", value: "green" },
  { name: "Pink", value: "pink" },
  { name: "Grey", value: "grey" },
  { name: "Beige", value: "beige" },
];

/* ---------------- INVENTORY ---------------- */

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    size: "",
    colour: "",
    purchasePrice: "",
    purchaseDate: "",
    estimatedSale: "",
    soldPrice: "",
    notes: "",
    status: "Bought",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function handleSave() {
    const price = Number(form.purchasePrice);

    if (form.name.trim() === "" || isNaN(price) || price <= 0) {
      alert("Please enter an item name and a valid purchase price.");
      return;
    }

    setItems((prev) => {
      const updated = [...prev];

      const itemData = {
        ...form,
        finalCategory:
          form.category4 ||
          form.category3 ||
          form.category2 ||
          form.category1 ||
          "",
      };

      if (editingIndex !== null) {
        updated[editingIndex] = itemData;
      } else {
        updated.push(itemData);
      }

      return updated;
    });

    setEditingIndex(null);
    setShowModal(false);
  }

  /* ---------------- SUMMARY ---------------- */

  const summary = useMemo(() => {
    const n = (v) => parseFloat(v || 0) || 0;

    return {
      inventory: items
        .filter((i) => i.status !== "Sold")
        .reduce((s, i) => s + n(i.purchasePrice), 0),

      estProfit: items.reduce(
        (s, i) => s + Math.max(n(i.estimatedSale) - n(i.purchasePrice), 0),
        0
      ),

      sold: items
        .filter((i) => i.status === "Sold")
        .reduce((s, i) => s + n(i.soldPrice), 0),
    };
  }, [items]);

  return (
    <div style={{ padding: 24 }}>
      <h1>📦 Inventory</h1>

      {/* SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <SummaryCard title="💼 Inventory Value" value={`£${summary.inventory.toFixed(2)}`} />
        <SummaryCard title="📈 Estimated Profit" value={`£${summary.estProfit.toFixed(2)}`} />
        <SummaryCard title="💸 Total Sold" value={`£${summary.sold.toFixed(2)}`} />
      </div>

      {/* ADD ITEM BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          marginTop: 16,
          padding: "12px 18px",
          borderRadius: 16,
          background: "linear-gradient(135deg, #ff3b3b, #ff005c)",
          color: "white",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(255,0,92,0.45)",
        }}
      >
        ➕ Add Item
      </button>

      {/* ITEMS */}
      <div style={{ marginTop: 20 }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="glass"
            style={{
              padding: 16,
              borderRadius: 20,
              marginBottom: 12,
              display: "grid",
              gridTemplateColumns: "3fr 2fr auto auto",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div>
              <strong>{item.name}</strong>{" "}
              {item.finalCategory && <span>({item.finalCategory})</span>}
              <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                {item.brand} • Size {item.size} •{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: item.colour,
                    marginLeft: 6,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <PriceChip emoji="💰" label="Bought" value={item.purchasePrice} />
              {item.estimatedSale && (
                <PriceChip emoji="📈" label="Est" value={item.estimatedSale} glow="gold" />
              )}
              {item.soldPrice && (
                <PriceChip emoji="✅" label="Sold" value={item.soldPrice} glow="green" />
              )}
              {item.purchaseDate && <span>📅 {item.purchaseDate}</span>}
            </div>

            <div
              onClick={() =>
                setItems((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, status: nextStatus(x.status) } : x
                  )
                )
              }
              style={{
  padding: "6px 14px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  background:
    item.status === "Sold"
      ? "rgba(77,255,136,.35)"
      : item.status === "Listed"
      ? "rgba(255,183,3,.35)"
      : "rgba(120,180,255,.35)",
  boxShadow:
    item.status === "Sold"
      ? "0 0 18px rgba(77,255,136,.75)"
      : "none",
  animation:
    item.status === "Sold" ? "soldPulse 1.2s ease-out" : "none",
}}

            >
              {item.status}
            </div>

            <div style={{ display: "flex", gap: 14, fontSize: 18 }}>
              <span
  className="emoji"
  title="Mark as Listed / Sold"
  onClick={() => {
    const newStatus = nextStatus(item.status);

    setItems((prev) =>
      prev.map((x, idx) =>
        idx === i ? { ...x, status: newStatus } : x
      )
    );

    // 👇 IF IT JUST BECAME SOLD → OPEN EDIT MODAL
    if (newStatus === "Sold") {
      setForm({ ...item, status: "Sold" });
      setEditingIndex(i);
      setShowModal(true);
    }
  }}
>
  💸
</span>

              <span onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}>🗑️</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddItemModal
          form={form}
          update={update}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/* ---------------- MODAL ---------------- */

function AddItemModal({ form, update, onSave, onClose }) {
  const s = {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    background: "rgba(0,0,0,.25)",
    color: "white",
    border: "none",
    marginTop: 10,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div className="glass" style={{ width: 540, padding: 24 }}>
        <h2>Add Item</h2>

        <input placeholder="Item name *" value={form.name} onChange={(e) => update("name", e.target.value)} style={s} />
        <input list="brands" placeholder="Brand" value={form.brand} onChange={(e) => update("brand", e.target.value)} style={s} />
        <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>

        <select value={form.size} onChange={(e) => update("size", e.target.value)} style={s}>
          <option value="">📏 Size</option>
          {SIZES.map((x) => <option key={x}>{x}</option>)}
        </select>

        <select value={form.colour} onChange={(e) => update("colour", e.target.value)} style={s}>
          <option value="">🎨 Colour</option>
          {COLOURS.map((c) => <option key={c.value} value={c.value}>{c.name}</option>)}
        </select>

        <input type="number" placeholder="Purchase price *" value={form.purchasePrice} onChange={(e) => update("purchasePrice", e.target.value)} style={s} />
        <input type="date" value={form.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} style={s} />
        <input type="number" placeholder="Estimated sale price" value={form.estimatedSale} onChange={(e) => update("estimatedSale", e.target.value)} style={s} />
        

        <select value={form.status} onChange={(e) => update("status", e.target.value)} style={s}>
          <option value="Bought">🛒 Bought</option>
          <option value="Listed">📦 Listed</option>
          <option value="Sold">✅ Sold</option>
        </select>

        {form.status === "Sold" && (
          <input type="number" placeholder="Sold price *" value={form.soldPrice} onChange={(e) => update("soldPrice", e.target.value)} style={s} />
        )}

        <textarea placeholder="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} style={{ ...s, height: 80 }} />

        <button className="glass" style={{ marginTop: 16 }} onClick={onSave}>Save Item</button>
        <button style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function SummaryCard({ title, value }) {
  return (
    <div className="glass" style={{ padding: 18 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 24 }}>{value}</div>
    </div>
  );
}

function PriceChip({ emoji, label, value, glow }) {
  return (
    <div
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.12)",
        display: "flex",
        gap: 6,
        boxShadow:
          glow === "green"
            ? "0 0 10px rgba(77,255,136,.45)"
            : glow === "gold"
            ? "0 0 10px rgba(255,183,3,.45)"
            : "none",
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span>£{value}</span>
    </div>
  );
}

<style>{`
@keyframes soldPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(77,255,136,0);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 22px rgba(77,255,136,.9);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 18px rgba(77,255,136,.75);
  }
}
`}</style>
