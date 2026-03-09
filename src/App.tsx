import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "./components/SideMenu/SideMenu";
import AllItems from "./pages/AllItems/AllItems";
import SecurityDashboard from "./pages/SecurityDashboard/SecurityDashboard";
import Help from "./pages/Help/Help";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes — no login required */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <SideMenu />
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<Navigate to="all-items" replace />} />
                    <Route path="all-items" element={<AllItems />} />
                    <Route path="security-dashboard" element={<SecurityDashboard />} />
                    <Route path="help" element={<Help />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;