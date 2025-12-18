import {
  generateVintedTitle,
  generateVintedDescription,
  generateVintedHashtags,
} from "../../../ai/listings/listingsGenerator";

/* ================= LISTINGS RESULT ================= */

export default function ListingsResult({ item }) {
  // HARD GUARD — prevents ALL white screens
  if (!item || typeof item !== "object" || !item.name) {
    return null;
  }

  // Generate STRINGS ONLY
  const title = generateVintedTitle(item);
  const description = generateVintedDescription(item);
  const hashtags = generateVintedHashtags(item);

  return (
    <div className="glass" style={{ padding: 20, marginTop: 20 }}>
      <h3 style={{ marginBottom: 14 }}>✨ Generated Listing</h3>

      <CopyBlock label="📝 Title" value={title} />
      <CopyBlock label="📄 Description" value={description} />
      <CopyBlock label="🏷️ Hashtags" value={hashtags} />
    </div>
  );
}

/* ================= COPY BLOCK ================= */

function CopyBlock({ label, value }) {
  if (!value) return null;

  return (
    <div
      className="glass"
      style={{
        padding: 16,
        marginTop: 16,
        borderRadius: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          opacity: 0.75,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {value}
      </pre>

      <button
        onClick={() => navigator.clipboard.writeText(value)}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "12px 0",
          borderRadius: 14,
          fontWeight: 900,
          background: "linear-gradient(135deg,#00ff9d,#00c37a)",
          color: "#003",
          border: "none",
          cursor: "pointer",
        }}
      >
        📋 Copy
      </button>
    </div>
  );
}
