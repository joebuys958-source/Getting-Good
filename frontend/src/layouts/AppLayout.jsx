import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import ProfileMenu from "../components/ProfileMenu";

export default function AppLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/auth";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {!hideSidebar && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}

      {!hideSidebar && <ProfileMenu />}

      <div
        style={{
          marginLeft: hideSidebar ? 0 : collapsed ? 110 : 260,
          padding: 16,
          transition: "margin-left 0.35s ease",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}
