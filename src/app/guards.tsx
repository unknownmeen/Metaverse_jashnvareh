import { Navigate, Outlet } from "react-router-dom";

import { useAppStore } from "@/app/store";

export function RequireAuth() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate replace to="/home" />;
  }

  return <Outlet />;
}
