export default function CopyButton({ text }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      style={{
        marginTop: 8,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: "rgba(255,255,255,.15)",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      📋 Copy
    </button>
  );
}
