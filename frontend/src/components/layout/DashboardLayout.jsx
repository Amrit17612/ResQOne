import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Flame,
  Shield,
  Hospital,
  Truck,
  CloudLightning,
  Home,
  Users,
  Settings,
  AlertTriangle,
  LogOut,
  User,
  Activity,
  Menu,
  X,
  Compass
} from 'lucide-react';

const navItems = [
  { name: 'Citizen Portal', path: '/citizen', icon: AlertTriangle, roles: ['CITIZEN', 'SUPER_ADMIN'] },
  { name: 'Live Tracking', path: '/track-incident', icon: Compass, roles: ['CITIZEN', 'SUPER_ADMIN'] },
  { name: 'Central Admin', path: '/admin', icon: ShieldAlert, roles: ['CENTRAL_ADMIN', 'SUPER_ADMIN'] },
  { name: 'Police Command', path: '/police', icon: Shield, roles: ['POLICE_DISPATCHER', 'SUPER_ADMIN'] },
  { name: 'Fire & Rescue', path: '/fire', icon: Flame, roles: ['FIRE_COMMANDER', 'SUPER_ADMIN'] },
  { name: 'Hospital Ops', path: '/hospital', icon: Hospital, roles: ['HOSPITAL_COORDINATOR', 'SUPER_ADMIN'] },
  { name: 'Disaster Hub', path: '/disaster', icon: CloudLightning, roles: ['DISASTER_OFFICER', 'SUPER_ADMIN'] },
  { name: 'Shelter & Relief', path: '/shelter', icon: Home, roles: ['SHELTER_MANAGER', 'SUPER_ADMIN'] },
  { name: 'Volunteer Ops', path: '/volunteer', icon: Users, roles: ['VOLUNTEER', 'SUPER_ADMIN'] },
  { name: 'Super Admin', path: '/superadmin', icon: Settings, roles: ['SUPER_ADMIN'] },
];

export const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/citizen-auth');
  };

  // Filter links visible to the current role (or show all to demo if logged in)
  const accessibleNav = user
    ? navItems.filter((item) => item.roles.includes(user.role) || user.role === 'SUPER_ADMIN')
    : navItems;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans relative">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar - Responsive Drawer for Mobile, Permanent for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-resq-navy text-slate-300 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-resq-crimson flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">ResQ<span className="text-resq-crimson">One</span></span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Emergency Grid</span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Clearance Badge */}
          <div className="px-4 py-2 mt-2">
            <div className="bg-slate-800/80 rounded-md p-2.5 text-xs border border-slate-700/60">
              <span className="text-slate-400 block mb-1">Active Clearance:</span>
              <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 inline-block text-[11px]">
                {user ? user.role : 'Guest Citizen'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {accessibleNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-resq-blue text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition ml-2"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/citizen-auth"
              className="w-full block text-center py-2 bg-resq-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Sign In to Command
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Operational Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
              <span className="hidden sm:inline">Live Network Active</span>
              <span className="sm:hidden">Live</span>
            </span>
            <NavLink
              to="/official-login"
              className="text-xs font-semibold text-slate-600 hover:text-resq-blue transition bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200"
            >
              Switch Role
            </NavLink>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

