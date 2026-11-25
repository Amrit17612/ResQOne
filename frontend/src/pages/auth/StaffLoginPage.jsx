import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, KeyRound, ArrowRight, UserCheck } from 'lucide-react';

export const StaffLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/staff/login', {
        identifier: identifier.trim(),
        password
      });

      if (data.success) {
        // Save auth state in context
        login(data.user, data.token);

        // Role-based redirect to respective individual dashboard
        const role = data.user.role;
        if (role === 'AMBULANCE_DRIVER') {
          navigate('/ambulance-driver');
        } else if (role === 'DOCTOR') {
          navigate('/doctor');
        } else if (role === 'NURSE') {
          navigate('/nurse');
        } else if (role === 'BED_MANAGER') {
          navigate('/bed-manager');
        } else if (role === 'HOSPITAL_COORDINATOR') {
          navigate('/hospital-coordinator');
        } else if (['POLICE_OFFICER', 'POLICE_DISPATCHER', 'TRAFFIC_OFFICER', 'PATROL_OFFICER'].includes(role)) {
          navigate('/police-staff');
        } else if (['FIREFIGHTER', 'FIRE_COMMANDER', 'FIRE_TRUCK_DRIVER', 'RESCUE_TEAM_MEMBER'].includes(role)) {
          navigate('/fire-staff');
        } else if (role === 'VOLUNTEER') {
          navigate('/volunteer');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your Staff ID / Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-3">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-2xl font-black text-white">Department Staff Terminal Login</h1>
          <p className="mt-1 text-xs text-slate-400">
            For Ambulance Drivers, Doctors, Police Officers, Firefighters & Volunteers.
          </p>
        </div>

        <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100 text-xs text-slate-500 font-bold uppercase">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Shared Staff Authentication Gate</span>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Staff ID or Registered Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DRV-001, DOC-001, POL-001, FIRE-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Backend dynamically resolves role and redirects to your dedicated dashboard.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Confidential Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating Staff Terminal...' : 'Sign In to Staff Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
            <div className="text-slate-500">
              Need to join an approved hospital?{' '}
              <NavLink to="/hospital-staff-registration" className="text-indigo-600 font-bold hover:underline">
                Apply as Hospital Staff
              </NavLink>
            </div>
            <div className="text-slate-500">
              Have an activation link?{' '}
              <NavLink to="/activate-staff" className="text-emerald-600 font-bold hover:underline">
                Set Staff Password
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

