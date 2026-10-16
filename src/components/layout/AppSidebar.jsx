import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  Bell,
  User,
  LogOut,
  X,
} from 'lucide-react';
import Logo from '../common/Logo';
import notificationService from '../../services/notificationService';

export default function AppSidebar({ onClose }) {
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      const counts = notificationService.getSummaryCounts(list);
      setUnreadCount(counts.unread);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Emergency', path: '/report', icon: ShieldAlert },
    { name: 'My Incidents', path: '/incidents', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#111827] text-white flex flex-col h-full border-r border-slate-800 flex-shrink-0 select-none">
      {/* Sidebar Header with Brand */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
        <Logo variant="dark" size="md" to="/dashboard" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white min-w-[18px]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Logout Action */}
      <div className="p-3 border-t border-slate-800/80">
        <NavLink
          to="/login"
          onClick={onClose}
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
