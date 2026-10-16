import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';

export default function AppHeader({ onMenuClick, title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon with Indicator */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
        </Link>

        {/* User Profile Pill (matching Rohan Singh / Citizen from mockup) */}
        <Link
          to="/profile"
          className="flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-300 overflow-hidden">
            <span className="text-slate-600">RS</span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">Rohan Singh</div>
            <div className="text-[10px] text-slate-500 leading-tight">Citizen</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
