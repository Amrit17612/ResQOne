import React, { useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long for official security.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/organizations/activate', {
        token,
        password,
        confirmPassword
      });

      if (data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed or link expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-6 font-sans text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-4">
          <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black">
            ResQ<span className="text-resq-crimson">One</span>
          </span>
        </NavLink>
        <h2 className="text-3xl font-black text-white tracking-tight">Activate Official Account</h2>
        <p className="mt-2 text-xs text-slate-400">
          Set up a secure master password for your approved Organization or Department account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Account Successfully Activated</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your official credentials have been established. You can now log into your specialized dashboard.
              </p>
              <NavLink
                to="/official-login"
                className="w-full inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Proceed to Official Department Login
              </NavLink>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  New Official Password (Min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Activating Official Account...' : 'Set Password & Activate'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

