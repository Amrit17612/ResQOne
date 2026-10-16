import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated Application Pages
import DashboardPage from './pages/DashboardPage';
import ReportEmergencyPage from './pages/ReportEmergencyPage';
import MyIncidentsPage from './pages/MyIncidentsPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/report" element={<ReportEmergencyPage />} />
          <Route path="/incidents" element={<MyIncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
