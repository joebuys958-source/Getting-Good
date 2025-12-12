import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Expenses from "./pages/Expenses";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import AIChat from "./pages/AIChat";
import Auth from "./pages/Auth";

import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------------- Layout Wrapper ---------------- */

function AppLayout({ children }) {
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
        {children}
      </div>
    </>
  );
}

/* ---------------- App ---------------- */

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
