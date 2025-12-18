export default function ProfileMenu() {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
        zIndex: 1000,
      }}
    >
      {/* Temporary placeholder – auth disabled */}
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff3b3b, #ff7a7a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        U
      </span>

      <span style={{ opacity: 0.85 }}>User</span>
    </div>
  );
}
