import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type{ ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
