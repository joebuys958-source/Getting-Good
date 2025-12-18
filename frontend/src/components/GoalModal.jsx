import { useRef, useState } from "react";

const EMOJIS = ["🎯", "💰", "📈", "📦", "🔥", "⭐", "🧠", "🛒", "⏳"];

export default function GoalModal({ onClose, onCreate, existing }) {
  const [form, setForm] = useState(
    existing || {
      id: Date.now(),
      title: "",
      description: "",
      type: "revenue", // ✅ restored
      target: "",
      startDate: "",
      endDate: "",
      emoji: "🎯",
      status: "active",
      current: 0,
    }
  );

  const [closing, setClosing] = useState(false);

  const startRef = useRef(null);
  const endRef = useRef(null);

  function openPicker(ref) {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
    }
  }

  function closeModal() {
    setClosing(true);
    setTimeout(onClose, 200); // sync with CSS animation
  }

  function submit() {
    if (!form.title || !form.target || !form.endDate) return;
    onCreate(form);
    closeModal();
  }

  return (
    <div className={`modal-backdrop ${closing ? "fade-out" : "fade-in"}`}>
      <div className={`modal modal-clean ${closing ? "slide-down" : "slide-up"}`}>
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2>{existing ? "Edit Goal" : "Create Goal"}</h2>
            <p>Set a clear target and track your progress</p>
          </div>
          <button className="icon-btn subtle" onClick={closeModal}>✕</button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* EMOJI PICKER */}
          <div className="field">
            <label>Goal Icon</label>
            <div className="emoji-picker">
              {EMOJIS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  className={`emoji-choice ${form.emoji === emo ? "active" : ""}`}
                  onClick={() => setForm({ ...form, emoji: emo })}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Goal Title *</label>
            <input
              placeholder="e.g. Monthly Revenue Target"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Optional description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* ✅ GOAL TYPE DROPDOWN */}
          <div className="field">
            <label>Goal Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="revenue">📈 Revenue</option>
              <option value="profit">💰 Profit</option>
              <option value="items">📦 Items Sold</option>
              <option value="reviews">⭐ Reviews</option>
              <option value="custom">🎯 Custom</option>
            </select>
          </div>

          <div className="field">
            <label>
              Target Amount *{" "}
              {(form.type === "revenue" || form.type === "profit") && "(£)"}
            </label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={form.target}
              onChange={(e) =>
                setForm({ ...form, target: e.target.value })
              }
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Start Date</label>
              <div className="date-input">
                <input
                  ref={startRef}
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="icon-btn subtle"
                  onClick={() => openPicker(startRef)}
                >
                  📅
                </button>
              </div>
            </div>

            <div className="field">
              <label>End Date *</label>
              <div className="date-input">
                <input
                  ref={endRef}
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="icon-btn subtle"
                  onClick={() => openPicker(endRef)}
                >
                  📅
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button className="primary" onClick={submit}>
            {existing ? "Save Changes" : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
