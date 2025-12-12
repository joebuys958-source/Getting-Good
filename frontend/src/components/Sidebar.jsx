import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";


export default function Sidebar({ collapsed, setCollapsed }) {


  const location = useLocation();
  const navigate = useNavigate();
  
  const items = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "Inventory", icon: "📦", path: "/inventory" },
    { label: "Expenses", icon: "💸", path: "/expenses" },
    { label: "Goals", icon: "🎯", path: "/goals" },
    { label: "Analytics", icon: "📈", path: "/analytics" },
    { label: "AI", icon: "🤖", path: "/ai" },
  ];

  return (
    <div className={`glass sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <span style={{ display: "flex", gap: 8 }}>
            <span className="emoji">✨</span> Your App
          </span>
        )}

        {/* Hamburger toggle */}
        <div
          className={`hamburger ${collapsed ? "active" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* Nav items */}
      {items.map((item) => (
        <div
          key={item.path}
          className={`sidebar-item ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
          title={collapsed ? item.label : ""}
        >
          <span className="emoji">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </div>
      ))}

      <div className="sidebar-spacer" />

      {/* Logout placeholder */}
      <div
  className="sidebar-item"
  onClick={async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      alert("Failed to log out");
    }
  }}
  title={collapsed ? "Logout" : ""}
>
  <span className="emoji">🚪</span>
  {!collapsed && <span>Logout</span>}
</div>

    </div>
  );
}
