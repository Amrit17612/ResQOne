import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ShieldAlert, Heart } from 'lucide-react';
import Logo from '../common/Logo';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Logo variant="dark" size="md" to="/" showSubtitle />
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time community emergency and resource management platform. Connecting citizens with rapid emergency response teams.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/#about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/design-system" className="hover:text-red-400 transition-colors">Design System Preview</Link>
              </li>
            </ul>
          </div>

          {/* Citizen Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Citizen Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Citizen Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register Account</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Citizen Dashboard</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors">Report Emergency</Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="text-slate-400">National Emergency Number</p>
                <p className="text-sm font-bold text-white tracking-wide">112</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Ambulance</p>
                  <p className="text-xs font-bold text-white">108</p>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Fire Service</p>
                  <p className="text-xs font-bold text-white">101</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} ResQOne Platform. Capstone Project — Citizen Module.</p>
          <p className="flex items-center gap-1">
            Built for safer communities with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
