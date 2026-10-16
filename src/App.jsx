import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPlaceholders';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated Application Placeholders
import {
  DashboardPlaceholder,
  ReportEmergencyPlaceholder,
  MyIncidentsPlaceholder,
  IncidentDetailsPlaceholder,
  ProfilePlaceholder,
  NotificationsPlaceholder,
} from './pages/AppPlaceholders';

// Interactive Design System Showcase
import DesignSystemPage from './pages/DesignSystemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Visitor Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* Authentication Pages (Standalone Split-Screen Layouts) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Citizen App Routes (Shared Deep Navy Sidebar & Header) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/report" element={<ReportEmergencyPlaceholder />} />
          <Route path="/incidents" element={<MyIncidentsPlaceholder />} />
          <Route path="/incidents/:id" element={<IncidentDetailsPlaceholder />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
          <Route path="/notifications" element={<NotificationsPlaceholder />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
