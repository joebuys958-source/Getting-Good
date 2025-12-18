import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import vintedGroups from "../data/vintedCategories";
import { loadInventory, saveInventory } from "../data/inventoryStore";
import "../styles/inventory.css";

/* ================= HELPERS ================= */

function nextStatus(status) {
  if (status === "Bought") return "Listed";
  if (status === "Listed") return "Sold";
  return "Bought";
}

function ensureId(item) {
  if (item?.id) return item;
  const id =
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return { ...item, id };
}

const COLOUR_MAP = {
  black: "#111",
  navy: "#0a2540",
  white: "#ffffff",
  red: "#ef4444",
  green: "#22c55e",
  pink: "#ec4899",
  grey: "#9ca3af",
  beige: "#e7dcc8",
};

/* ================= CONSTANTS ================= */

const EMPTY_FORM = {
  id: "",
  name: "",
  brand: "",
  size: "",
  colour: "",
  purchasePrice: "",
  purchaseDate: "",
  estimatedSale: "",
  soldPrice: "",
  soldDate: "",
  notes: "",
  status: "Bought",
  categoryPath: [],
  finalCategory: "",
};

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

/* ================= INVENTORY ================= */

export default function Inventory() {
  const location = useLocation();
  const focusId = location.state?.focusId || null;
  const itemRefs = useRef({});

  const [items, setItems] = useState(() => {
    const raw = loadInventory();
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map(ensureId);
  });

  const [showModal, setShowModal] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  /* ================= PERSIST ================= */

  useEffect(() => {
    saveInventory(items);
  }, [items]);

  /* ================= AI FOCUS ================= */

  useEffect(() => {
    if (!focusId) return;
    const target = itemRefs.current[focusId];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.style.boxShadow =
      "0 0 0 2px rgba(255,60,60,.7), 0 0 28px rgba(255,60,60,.45)";

    const t = setTimeout(() => {
      target.style.boxShadow = "none";
    }, 2500);

    return () => clearTimeout(t);
  }, [focusId]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ================= SAVE ================= */

  function handleSave() {
    const buy = Number(form.purchasePrice);
    const sold = Number(form.soldPrice);

    if (!String(form.name || "").trim() || buy <= 0) {
      alert("Item name and valid purchase price required.");
      return;
    }

    if (form.status === "Sold" && sold <= 0) {
      alert("Sold price required when status is Sold.");
      return;
    }

    const withId = ensureId(form);

    const itemData = {
      ...withId,
      finalCategory:
        withId.finalCategory ||
        (Array.isArray(withId.categoryPath)
          ? withId.categoryPath[withId.categoryPath.length - 1]
          : "") ||
        "",
    };

    setItems((prev) => {
      const copy = [...prev];
      if (editingIndex !== null) copy[editingIndex] = itemData;
      else copy.push(itemData);
      return copy;
    });

    setForm(EMPTY_FORM);
    setEditingIndex(null);
    setShowModal(false);
  }

  /* ================= SEARCH ================= */

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = items.map((item, idx) => ({ item, idx }));
    if (!q) return base;

    return base.filter(({ item }) => {
      const text = [
        item.name,
        item.brand,
        item.finalCategory,
        Array.isArray(item.categoryPath) ? item.categoryPath.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [items, search]);

  /* ================= SUMMARY ================= */

  const summary = useMemo(() => {
    const n = (v) => Number(v) || 0;
    const list = visible.map((x) => x.item);

    return {
      inventory: list
        .filter((i) => i.status !== "Sold")
        .reduce((s, i) => s + n(i.purchasePrice), 0),
      estProfit: list
        .filter((i) => i.status !== "Sold")
        .reduce((s, i) => s + Math.max(n(i.estimatedSale) - n(i.purchasePrice), 0), 0),
      sold: list
        .filter((i) => i.status === "Sold")
        .reduce((s, i) => s + n(i.soldPrice), 0),
    };
  }, [visible]);

  /* ================= RENDER ================= */

  return (
    <div className="inventory-page">
      <h1 className="inventory-title">📦 Inventory</h1>

      <div className="inventory-summary">
        <SummaryCard title="Inventory Value" value={`£${summary.inventory.toFixed(2)}`} icon="📦" />
        <SummaryCard title="Est Profit (Unsold)" value={`£${summary.estProfit.toFixed(2)}`} icon="📈" />
        <SummaryCard title="Total Sold" value={`£${summary.sold.toFixed(2)}`} icon="💸" />
      </div>

      <div className="inventory-actions">
        <input
          className="inventory-search"
          placeholder="Search items, brands, categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="btn-red"
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingIndex(null);
            setShowModal(true);
          }}
        >
          ➕ Add Item
        </button>
      </div>

      <div className="inventory-grid-header">
        <span>Item</span>
        <span>Brand</span>
        <span>Size</span>
        <span>Colour</span>
        <span>Bought</span>
        <span>Sold</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {visible.map(({ item, idx }) => (
        <div
          key={item.id}
          ref={(el) => (itemRefs.current[item.id] = el)}
          className="inventory-row"
        >
          <div className="inv-name">
            <strong>{item.name}</strong>

            {Array.isArray(item.categoryPath) && item.categoryPath.length > 0 && (
              <div className="inv-sub">📁 {item.categoryPath.join(" / ")}</div>
            )}
          </div>

          <div>{item.brand || "—"}</div>
          <div>{item.size || "—"}</div>

          <div className="inv-colour">
            {item.colour ? (
              <>
                <span
                  className="colour-dot"
                  style={{ background: COLOUR_MAP[item.colour] || "#555" }}
                />
                <span className="colour-label">
                  {item.colour.charAt(0).toUpperCase() + item.colour.slice(1)}
                </span>
              </>
            ) : (
              "—"
            )}
          </div>

          <div>£{item.purchasePrice || "—"}</div>
          <div>{item.soldPrice ? `£${item.soldPrice}` : "—"}</div>

          <div
            className={`inv-status ${String(item.status || "").toLowerCase()}`}
            onClick={() => {
              const next = nextStatus(item.status);
              if (next === "Sold" && !item.soldPrice) {
                setForm({ ...item, status: "Sold" });
                setEditingIndex(idx);
                setShowModal(true);
                return;
              }
              setItems((p) => p.map((x, i) => (i === idx ? { ...x, status: next } : x)));
            }}
          >
            {item.status}
          </div>

          <div className="inv-actions">
            <button
              title="Edit"
              onClick={() => {
                setForm({ ...item });
                setEditingIndex(idx);
                setShowModal(true);
              }}
            >
              ✏️
            </button>

            <button
              title="Delete"
              onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
            >
              🗑️
            </button>

            <button
              title="Duplicate"
              onClick={() =>
                setItems((p) => [
                  ...p,
                  ensureId({ ...item, status: "Bought", soldPrice: "", soldDate: "" }),
                ])
              }
            >
              📄
            </button>

            <button title="Quick View" onClick={() => setQuickViewItem(item)}>
              👁️
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <AddItemModal
          form={form}
          update={update}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {quickViewItem && (
        <div className="inventory-modal-backdrop" onClick={() => setQuickViewItem(null)}>
          <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{quickViewItem.name}</h2>
            <p>
              <b>Brand:</b> {quickViewItem.brand || "—"}
            </p>
            <p>
              <b>Status:</b> {quickViewItem.status}
            </p>
            <p>
              <b>Category:</b>{" "}
              {Array.isArray(quickViewItem.categoryPath) && quickViewItem.categoryPath.length
                ? quickViewItem.categoryPath.join(" / ")
                : "—"}
            </p>
            <button className="btn-ghost" onClick={() => setQuickViewItem(null)} style={{ width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="inventory-summary-card">
      <div className="summary-top">
        <span className="summary-icon-plain">{icon}</span>
        <span className="summary-title">{title}</span>
      </div>
      <strong className="summary-value">{value}</strong>
    </div>
  );
}

/* ================= ADD ITEM MODAL ================= */

function AddItemModal({ form, update, onSave, onClose }) {
  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-header">
          <h2 className="inv-modal-title">{form.id ? "Edit Item" : "Add New Item"}</h2>
          <button className="inv-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="inv-form">
          <div className="inv-field">
            <div className="inv-label">Item Name*</div>
            <input
              className="inv-control"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="inv-field">
            <div className="inv-label">🏷️ Category</div>
            <VintedCategoryPicker
              groups={vintedGroups}
              value={form.categoryPath}
              onChange={(path) => {
                update("categoryPath", path);
                update("finalCategory", path[path.length - 1] || "");
              }}
            />
          </div>

          <div className="inv-row2">
            <div className="inv-field">
              <div className="inv-label">
                🏷️ Brand <small>(optional)</small>
              </div>
              <input
                className="inv-control"
                list="brands"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
              />
              <datalist id="brands">
                {BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="inv-field">
              <div className="inv-label">
                📏 Size <small>(optional)</small>
              </div>
              <select className="inv-control" value={form.size} onChange={(e) => update("size", e.target.value)}>
                <option value="">Select size…</option>
                {SIZES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="inv-row2">
            <div className="inv-field">
              <div className="inv-label">
                🎨 Colour <small>(optional)</small>
              </div>
              <select className="inv-control" value={form.colour} onChange={(e) => update("colour", e.target.value)}>
                <option value="">Select colour…</option>
                {COLOURS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="inv-field">
              <div className="inv-label">✅ Status</div>
              <select className="inv-control" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="Bought">Bought</option>
                <option value="Listed">Listed</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="inv-row2">
            <div className="inv-field">
              <div className="inv-label">💷 Purchase price*</div>
              <input
                className="inv-control"
                type="number"
                value={form.purchasePrice}
                onChange={(e) => update("purchasePrice", e.target.value)}
              />
            </div>

            <div className="inv-field">
              <div className="inv-label">📅 Purchase date</div>
              <input
                className="inv-control"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => update("purchaseDate", e.target.value)}
              />
            </div>
          </div>

          <div className="inv-field">
            <div className="inv-label">
              📈 Estimated sale price <small>(optional)</small>
            </div>
            <input
              className="inv-control"
              type="number"
              value={form.estimatedSale}
              onChange={(e) => update("estimatedSale", e.target.value)}
            />
          </div>

          {form.status === "Sold" && (
            <div className="inv-row2">
              <div className="inv-field">
                <div className="inv-label">✅ Sold price*</div>
                <input
                  className="inv-control"
                  type="number"
                  value={form.soldPrice}
                  onChange={(e) => update("soldPrice", e.target.value)}
                />
              </div>

              <div className="inv-field">
                <div className="inv-label">📅 Sold date</div>
                <input
                  className="inv-control"
                  type="date"
                  value={form.soldDate || ""}
                  onChange={(e) => update("soldDate", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="inv-field">
            <div className="inv-label">📝 Notes</div>
            <textarea
              className="inv-control inv-textarea"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          <button className="btn-red" style={{ width: "100%" }} onClick={onSave}>
            💾 Save Item
          </button>

          <button className="btn-ghost" style={{ width: "100%" }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= VINTED CATEGORY PICKER ================= */

function VintedCategoryPicker({ groups, value, onChange }) {
  const [path, setPath] = useState(value || []);
  const [node, setNode] = useState({ children: groups });

  useEffect(() => {
    let cur = { children: groups };
    for (const p of path) cur = cur.children?.[p] || cur;
    setNode(cur);
  }, [path, groups]);

  return (
    <div>
      <div
        className="glass"
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          marginBottom: 6,
          fontSize: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          userSelect: "none",
        }}
      >
        {path.length === 0
          ? "Select category…"
          : path.map((p, i) => (
              <span
                key={i}
                onClick={() => {
                  const np = path.slice(0, i + 1);
                  setPath(np);
                  onChange(np);
                }}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {p}
                {i < path.length - 1 && " › "}
              </span>
            ))}
      </div>

      <div
        className="glass"
        style={{
          maxHeight: 160,
          overflowY: "auto",
          padding: 6,
          borderRadius: 10,
        }}
      >
        {Object.keys(node.children || {}).map((k) => (
          <div
            key={k}
            onClick={() => {
              const np = [...path, k];
              setPath(np);
              onChange(np);
            }}
            style={{
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 12,
              borderRadius: 8,
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            📁 {k}
          </div>
        ))}
      </div>
    </div>
  );
}
