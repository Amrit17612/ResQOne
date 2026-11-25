import React, { useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Activity, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const ActivateStaffPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const appId = searchParams.get('appId') || '';
  const emailParam = searchParams.get('email') || '';
  const staffIdParam = searchParams.get('staffId') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Model A (Hospital Application) or Model B (Police/Fire Admin Provisioned)
      let data;
      if (appId) {
        const res = await api.post('/staff-applications/activate', {
          applicationId: appId,
          token,
          newPassword: password
        });
        data = res.data;
      } else {
        // Government Police/Fire activation
        const res = await api.post('/organizations/activate-with-token', {
          token,
          newPassword: password
        });
        data = res.data;
      }

      if (data.success) {
        setSuccessData(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed. Token may be expired or already used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-3">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-2xl font-black text-white">Activate Operational Account</h1>
          <p className="mt-1 text-xs text-slate-400">
            Set your confidential password to unlock your authorized staff terminal.
          </p>
        </div>

        {successData ? (
          <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Account Activated Successfully!</h2>
            <p className="text-xs text-slate-500">
              Your staff credentials have been verified and your master password is set.
            </p>
            {successData.staffId && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                <span className="text-slate-500 block">Your Staff ID:</span>
                <span className="font-mono text-base font-bold text-indigo-700">{successData.staffId}</span>
              </div>
            )}
            <NavLink
              to="/staff-login"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md"
            >
              Proceed to Staff Terminal Login
            </NavLink>
          </div>
        ) : (
          <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Single-Use Cryptographic Token
                </label>
                <input
                  type="text"
                  disabled
                  value={token ? `${token.slice(0, 16)}...` : 'No token provided'}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-slate-100 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  New Master Password (Min 8 Characters)
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

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Confirm Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Activating Account...' : 'Set Password & Activate'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

