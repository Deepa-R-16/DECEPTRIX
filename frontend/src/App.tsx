import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Investigations from "./pages/Investigations";
import Campaigns from "./pages/Campaigns";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import Forensics from "./pages/Forensics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvestigationDetails from "./pages/InvestigationDetails";
import NarrativeIntelligence from "./pages/NarrativeIntelligence";



function App() {
  return (
    <Routes>
      {/* Public authentication pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected DECEPTRIX application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/investigations" element={<Investigations />} />
          <Route path="/investigations/:caseNumber" element={<InvestigationDetails />} />
          <Route path="/campaigns" element={<Campaigns />} />
<Route
  path="/narrative-intelligence"
  element={<NarrativeIntelligence />}
/>

          <Route
            path="/threat-intelligence"
            element={<ThreatIntelligence />}
          />

          <Route path="/forensics" element={<Forensics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;