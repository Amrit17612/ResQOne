import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Gateways & Authentication
import { LandingPage } from './pages/landing/LandingPage';
import { CitizenAuthPage } from './pages/auth/CitizenAuthPage';
import { OfficialLoginPage } from './pages/auth/OfficialLoginPage';
import { StaffLoginPage } from './pages/auth/StaffLoginPage';
import { RegisterOrganizationPage } from './pages/organization/RegisterOrganizationPage';
import { TrackApplicationPage } from './pages/organization/TrackApplicationPage';
import { ApplicationStatusPage } from './pages/organization/ApplicationStatusPage';
import { ActivateAccountPage } from './pages/organization/ActivateAccountPage';

// Staff Onboarding & Activation (Model A, B, C)
import { HospitalStaffRegistrationPage } from './pages/organization/HospitalStaffRegistrationPage';
import { StaffApplicationTrackingPage } from './pages/organization/StaffApplicationTrackingPage';
import { ActivateStaffPage } from './pages/organization/ActivateStaffPage';

// Dashboards (Role-Isolated)
import { CitizenPortal } from './pages/citizen/CitizenPortal';
import { CentralAdminDashboard } from './pages/admin/CentralAdminDashboard';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';

// Organization Admin Dashboards
import { HospitalAdminDashboard } from './pages/hospital/HospitalAdminDashboard';
import { PoliceAdminDashboard } from './pages/police/PoliceAdminDashboard';
import { FireAdminDashboard } from './pages/fire/FireAdminDashboard';
import { DisasterAdminDashboard } from './pages/disaster/DisasterAdminDashboard';
import { NgoAdminDashboard } from './pages/ngo/NgoAdminDashboard';
import { ShelterAdminDashboard } from './pages/shelter/ShelterAdminDashboard';

// Department Staff Individual Terminals
import { AmbulanceDriverDashboard } from './pages/ambulance/AmbulanceDriverDashboard';
import { DoctorDashboard } from './pages/hospital/DoctorDashboard';
import { PoliceStaffDashboard } from './pages/police/PoliceStaffDashboard';
import { FireStaffDashboard } from './pages/fire/FireStaffDashboard';

// Legacy / Department Overview Dashboards
import { PoliceDashboard } from './pages/police/PoliceDashboard';
import { FireRescueDashboard } from './pages/fire/FireRescueDashboard';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { AmbulanceDashboard } from './pages/ambulance/AmbulanceDashboard';
import { DisasterDashboard } from './pages/disaster/DisasterDashboard';
import { ShelterDashboard } from './pages/shelter/ShelterDashboard';
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-mono text-xs">
        Verifying ResQOne Security Clearance...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff-login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Landing Gateway with 3 Core Portals */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Public Citizen Auth (Login + Sign Up) */}
          <Route path="/citizen-auth" element={<CitizenAuthPage />} />

          {/* 3. Official Department Admin Login (Restricted with 2FA) */}
          <Route path="/official-login" element={<OfficialLoginPage />} />

          {/* 4. Shared Staff Terminal Login (DRV, DOC, NUR, POL, FIRE, VOL) */}
          <Route path="/staff-login" element={<StaffLoginPage />} />

          {/* 5. Organization Onboarding & Verification */}
          <Route path="/register-organization" element={<RegisterOrganizationPage />} />
          <Route path="/track-application" element={<TrackApplicationPage />} />
          <Route path="/application-status" element={<ApplicationStatusPage />} />
          <Route path="/activate-account" element={<ActivateAccountPage />} />

          {/* 6. Hospital Staff Registration & Tracking (Model A) */}
          <Route path="/hospital-staff-registration" element={<HospitalStaffRegistrationPage />} />
          <Route path="/staff-application-status" element={<StaffApplicationTrackingPage />} />
          <Route path="/activate-staff" element={<ActivateStaffPage />} />

          {/* 7. Public Citizen Emergency Portal */}
          <Route path="/citizen" element={<CitizenPortal />} />

          {/* 8. Central Admin & Super Admin Commands */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['CENTRAL_ADMIN']}>
                <CentralAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 9. Organization Admin Dashboards */}
          <Route
            path="/hospital-admin"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'HOSPITAL_COORDINATOR']}>
                <HospitalAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/police-admin"
            element={
              <ProtectedRoute allowedRoles={['POLICE_ADMIN', 'POLICE_DISPATCHER']}>
                <PoliceAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fire-admin"
            element={
              <ProtectedRoute allowedRoles={['FIRE_ADMIN', 'FIRE_COMMANDER']}>
                <FireAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disaster-admin"
            element={
              <ProtectedRoute allowedRoles={['DISASTER_ADMIN', 'DISASTER_OFFICER']}>
                <DisasterAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo-admin"
            element={
              <ProtectedRoute allowedRoles={['NGO_ADMIN', 'VOLUNTEER']}>
                <NgoAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter-admin"
            element={
              <ProtectedRoute allowedRoles={['SHELTER_ADMIN', 'SHELTER_MANAGER']}>
                <ShelterAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 10. Individual Staff Terminals */}
          <Route
            path="/ambulance-driver"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'AMBULANCE_PARAMEDIC']}>
                <AmbulanceDriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/police-staff"
            element={
              <ProtectedRoute allowedRoles={['POLICE_OFFICER', 'POLICE_DISPATCHER', 'TRAFFIC_OFFICER', 'PATROL_OFFICER']}>
                <PoliceStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fire-staff"
            element={
              <ProtectedRoute allowedRoles={['FIREFIGHTER', 'FIRE_COMMANDER', 'FIRE_TRUCK_DRIVER', 'RESCUE_TEAM_MEMBER']}>
                <FireStaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* 11. Legacy Department Operations & Volunteer Dashboards */}
          <Route
            path="/police"
            element={
              <ProtectedRoute allowedRoles={['POLICE_DISPATCHER', 'POLICE_ADMIN']}>
                <PoliceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fire"
            element={
              <ProtectedRoute allowedRoles={['FIRE_COMMANDER', 'FIRE_ADMIN']}>
                <FireRescueDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_COORDINATOR', 'HOSPITAL_ADMIN']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambulance"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARAMEDIC', 'AMBULANCE_DRIVER']}>
                <AmbulanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disaster"
            element={
              <ProtectedRoute allowedRoles={['DISASTER_OFFICER']}>
                <DisasterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelter"
            element={
              <ProtectedRoute allowedRoles={['SHELTER_MANAGER']}>
                <ShelterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
