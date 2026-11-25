import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Shield,
  Users,
  Building2,
  Lock,
  ArrowRight,
  PhoneCall,
  Flame,
  Hospital,
  Truck,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-resq-blue selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                ResQ<span className="text-resq-crimson">One</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Unified Emergency Response & Disaster Grid
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NavLink
              to="/track-application"
              className="px-3 py-2 text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-700/60 rounded-lg transition"
            >
              Track Application Status
            </NavLink>
            <NavLink
              to="/staff-login"
              className="px-3 py-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-700/60 rounded-lg transition"
            >
              Staff Terminal
            </NavLink>
            <NavLink
              to="/citizen-auth"
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Citizen Login / Sign Up
            </NavLink>
            <NavLink
              to="/official-login"
              className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg transition flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Login</span>
            </NavLink>
            <NavLink
              to="/register-organization"
              className="px-4 py-2 text-xs font-bold bg-resq-blue hover:bg-blue-600 text-white rounded-lg shadow-md transition"
            >
              Register Organization
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section with 3 Core Gateways */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest bg-blue-950 text-blue-400 border border-blue-800/60 px-3.5 py-1.5 rounded-full inline-block mb-4">
            Security Guarantee: Strict Role-Based Access Control
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Centralized Emergency Coordination <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400">
              For Citizens, Departments & Hospitals
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Eliminating delay bottlenecks during accidents, fires, and mass-casualty disasters by connecting
            citizens, police units, fire brigades, ambulances, and verified hospital bed capacity through an
            AI-assisted operational grid.
          </p>
        </div>

        {/* 3 Core Landing Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Citizen Public Gateway */}
          <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700/80 hover:border-emerald-500/60 transition shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Citizen Login / Sign Up</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Public registration open for all citizens. Report accidents, fires, and medical crises, locate verified
                nearby hospital beds, and track live response teams.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Free, Instant Public Sign Up</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Offline Report Syncing Queue</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Live Emergency Tracking by Reference ID</span>
                </li>
              </ul>
            </div>

            <NavLink
              to="/citizen-auth"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Access Citizen Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </NavLink>
          </div>

          {/* Card 2: Official Restricted Gateway */}
          <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700/80 hover:border-amber-500/60 transition shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-white">2. Official Login</h3>
                <span className="text-[10px] uppercase font-black bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                  Restricted
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Authorized entry for verified department personnel: Central Admin, Police Dispatch, Fire Brigade,
                Ambulance Paramedics, and Disaster Response officers.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>No Public Sign Up Allowed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Admin-Issued Official Credentials</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Role-Based API Boundaries & Audit Logging</span>
                </li>
              </ul>
            </div>

            <NavLink
              to="/official-login"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Authorized Official Entry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </NavLink>
          </div>

          {/* Card 3: Register Your Organization */}
          <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700/80 hover:border-blue-500/60 transition shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Register Your Organization</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                For Hospitals, Trauma Centers, NGOs, and Municipal Emergency Providers wishing to integrate into the
                ResQOne emergency network.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Multi-Tier Verification Workflow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Live Application Status Tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Secure Account Activation Token</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <NavLink
                to="/register-organization"
                className="w-full bg-resq-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Submit Onboarding Application</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </NavLink>
              <NavLink
                to="/track-application"
                className="w-full block text-center py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                Track Existing Application Status →
              </NavLink>
            </div>
          </div>
        </div>

        {/* Live Network Statistics */}
        <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl font-black text-white">10</span>
            <span className="block text-xs text-slate-400 uppercase font-bold mt-1">Unified Dashboards</span>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-400">100%</span>
            <span className="block text-xs text-slate-400 uppercase font-bold mt-1">Backend Enforced RBAC</span>
          </div>
          <div>
            <span className="text-3xl font-black text-blue-400">0 ms</span>
            <span className="block text-xs text-slate-400 uppercase font-bold mt-1">Socket.IO Sync Latency</span>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-400">Python ML</span>
            <span className="block text-xs text-slate-400 uppercase font-bold mt-1">FastAPI Advisory Triage</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ResQOne © 2026. AI-Powered Emergency Response, Disaster Management & Multi-Department Coordination Platform.
      </footer>
    </div>
  );
};

