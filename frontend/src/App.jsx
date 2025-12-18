import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

/* AI Pages */
import AIOverview from "./pages/ai/AIOverview";
import AIPricing from "./pages/ai/AIPricing";
import AIListings from "./pages/ai/AIListings";
import AIInsights from "./pages/ai/AIInsights";




/* Core Pages */
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Expenses from "./pages/Expenses";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";

/* UI */
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <ProfileMenu />

   <main
  style={{
    marginLeft: collapsed ? 110 : 260,
    padding: 16,
    paddingLeft: 28, // 👈 pushes everything slightly right
    transition: "margin-left 0.3s ease",

    transform: "scale(0.94)",
    transformOrigin: "top left",
    width: "98%",
  }}

>

        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Core */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* AI */}
          <Route path="/ai" element={<AIOverview />} />
          <Route path="/ai/pricing" element={<AIPricing />} />
          <Route path="/ai/listings" element={<AIListings />} />
          <Route path="/ai/insights" element={<AIInsights />} />



          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
