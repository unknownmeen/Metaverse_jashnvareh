import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAppStore } from "@/app/store";

export function RequireAuth() {
  const { currentUser, loading } = useAppStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { currentUser, loading } = useAppStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    return <Navigate replace to="/home" />;
  }

  return <Outlet />;
}

export function RequireSuperAdmin() {
  const { currentUser, loading } = useAppStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate replace to="/login" />;
  }

  if (currentUser.role !== "SUPER_ADMIN") {
    return <Navigate replace to="/home" />;
  }

  return <Outlet />;
}
