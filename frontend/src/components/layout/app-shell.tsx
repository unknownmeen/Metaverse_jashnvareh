import { Outlet } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { ChangelogModal } from "@/components/changelog-modal";
import { AppHeader } from "@/components/layout/app-header";
import { useChangelogAutoPopup } from "@/hooks/use-changelog-auto-popup";

export function AppShell() {
  const { currentUser, showChangelogModal, changelogInitialRelease, closeChangelog, openChangelog } = useAppStore();
  useChangelogAutoPopup(!!currentUser, openChangelog);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <ChangelogModal open={showChangelogModal} onClose={closeChangelog} initialRelease={changelogInitialRelease} />
    </div>
  );
}
