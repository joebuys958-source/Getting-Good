import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "Inventory", icon: "📦", path: "/inventory" },
    { label: "Expenses", icon: "💸", path: "/expenses" },
    { label: "Goals", icon: "🎯", path: "/goals" },
    { label: "Analytics", icon: "📈", path: "/analytics" },

    // ✅ ONE AI HUB (cards inside /ai)
    { label: "AI", icon: "🤖", path: "/ai" },
  ];

  const isActivePath = (path) => {
    // ✅ Make AI stay highlighted for anything under /ai too
    if (path === "/ai") return location.pathname === "/ai" || location.pathname.startsWith("/ai/");
    return location.pathname === path;
  };

  return (
    <aside className={`glass sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div
        className="sidebar-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 16,
        }}
      >
        {!collapsed && (
          <span style={{ fontWeight: 700, display: "flex", gap: 8 }}>
            ✨ Resell Reserve
          </span>
        )}

        <button
          className="hamburger"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Navigation */}
      <nav>
        {items.map((item) => {
          const isActive = isActivePath(item.path);

          return (
            <div
              key={item.path}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
            >
              <span className="emoji">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      {/* Logout placeholder */}
      <div
        className="sidebar-item logout"
        onClick={() => alert("Logout will be added later")}
        title={collapsed ? "Logout" : ""}
      >
        <span className="emoji">🚪</span>
        {!collapsed && <span>Logout</span>}
      </div>
    </aside>
  );
}
