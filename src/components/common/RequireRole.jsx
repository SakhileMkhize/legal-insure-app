import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function RequireRole({ role }) {
  const { currentUser } = useAuth();

  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
