import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-navy-900 text-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emergency-600 rounded-lg text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ResQOne</h1>
              <p className="text-xs text-navy-200">Citizen Emergency Platform</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-navy-800 text-navy-200 rounded-full border border-navy-700">
            Frontend Scaffold v0.1.0
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-lg w-full">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Citizen Frontend Scaffold Ready</h2>
          <p className="text-sm text-slate-600 mb-6">
            React, Vite, Tailwind CSS, and Lucide Icons are initialized. Awaiting Milestone 2 to build shared layouts, design tokens, and reusable components.
          </p>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-left">
            <div>Status: Scaffold Initialized</div>
            <div>Mode: Citizen Client</div>
            <div>Branch: main</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        ResQOne Community Emergency &amp; Resource Management System &bull; Citizen Frontend
      </footer>
    </div>
  );
}
