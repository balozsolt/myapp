import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SideMenu.css";

function SideMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  const username = localStorage.getItem("username");

  return (
    <div className="side-menu">
      <h2 className="menu-title">🔐 Vault</h2>

      {username && (
        <div className="menu-user">👤 {username}</div>
      )}

      <nav className="menu-links">
        <Link to="/all-items">All Items</Link>
        <Link to="/security-dashboard">Security Dashboard</Link>
        <Link to="/help">Help</Link>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default SideMenu;