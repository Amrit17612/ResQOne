import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '../components/layout/AppSidebar';
import AppHeader from '../components/layout/AppHeader';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic header titles based on pathname matching the mockup
  const getHeaderMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Stay informed, stay safe.' };
      case '/report':
      case '/report-emergency':
        return { title: 'Report an Emergency', subtitle: 'Provide accurate information to get faster help.' };
      case '/incidents':
        return { title: 'My Incidents', subtitle: 'Track the status of all your reported incidents.' };
      case '/profile':
        return { title: 'My Profile', subtitle: 'Manage your account information.' };
      case '/notifications':
        return { title: 'Notifications', subtitle: 'Stay updated on your emergency reports and alerts.' };
      case '/design-system':
        return { title: 'Design System', subtitle: 'Visual reference & component library.' };
      default:
        if (location.pathname.startsWith('/incidents/')) {
          return { title: 'Incident Details', subtitle: 'View real-time status and response updates.' };
        }
        return { title: 'ResQOne', subtitle: 'Citizen Emergency Platform' };
    }
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <div className="sticky top-0 h-screen">
          <AppSidebar />
        </div>
      </div>

      {/* Mobile Sidebar Drawer & Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#111827] z-10 shadow-2xl">
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
