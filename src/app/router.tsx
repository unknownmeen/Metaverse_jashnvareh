import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAdmin, RequireAuth } from "@/app/guards";
import { AppShell } from "@/components/layout/app-shell";
import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import { AdminStreamFormPage } from "@/pages/admin-stream-form-page";
import { HelpPage } from "@/pages/help-page";
import { HomePage } from "@/pages/home-page";
import { ImageDetailsPage } from "@/pages/image-details-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProfilePage } from "@/pages/profile-page";
import { StreamExplorePage } from "@/pages/stream-explore-page";
import { StreamsPage } from "@/pages/streams-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/streams" element={<StreamsPage />} />
          <Route path="/streams/:streamId" element={<StreamExplorePage />} />
          <Route path="/images/:imageId" element={<ImageDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/streams/new" element={<AdminStreamFormPage />} />
            <Route path="/admin/streams/:streamId/edit" element={<AdminStreamFormPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
