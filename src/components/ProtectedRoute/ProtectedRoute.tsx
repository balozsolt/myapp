/* Register page uses the same styles as Login */
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

// Wraps any page that requires authentication.
// If no token is found in localStorage, redirects to /login.
const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;