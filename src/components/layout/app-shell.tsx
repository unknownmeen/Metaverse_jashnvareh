import { Outlet } from "react-router-dom";

import { AppHeader } from "@/components/layout/app-header";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
