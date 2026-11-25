import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Shield, Lock, Activity, Key, CheckCircle2, ArrowRight } from 'lucide-react';

export const OfficialLoginPage = () => {
  const [step, setStep] = useState(1); // 1 = Password, 2 = 2FA OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Password Verification
  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/official/login-initiate', { email, password });

      if (data.requires2FA) {
        setMaskedEmail(data.maskedEmail);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied: Invalid official credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 2FA OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/official/verify-otp', { email, otp });

      if (data.success) {
        localStorage.setItem('resqone_token', data.token);
        setUser(data.user);

        // Role-based destination
        switch (data.user.role) {
          case 'CENTRAL_ADMIN':
            navigate('/admin');
            break;
          case 'POLICE_DISPATCHER':
            navigate('/police');
            break;
          case 'FIRE_COMMANDER':
            navigate('/fire');
            break;
          case 'HOSPITAL_COORDINATOR':
            navigate('/hospital');
            break;
          case 'AMBULANCE_PARAMEDIC':
            navigate('/ambulance');
            break;
          case 'DISASTER_OFFICER':
            navigate('/disaster');
            break;
          case 'SHELTER_MANAGER':
            navigate('/shelter');
            break;
          case 'VOLUNTEER':
            navigate('/volunteer');
            break;
          case 'SUPER_ADMIN':
            navigate('/superadmin');
            break;
          default:
            navigate('/admin');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-4">
          <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black">
            ResQ<span className="text-resq-crimson">One</span>
          </span>
        </NavLink>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Department Network (2FA Protected)</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">Official Department Login</h2>
        <p className="mt-2 text-xs text-slate-400">
          Super Admin, Police, Fire, Hospital & Ambulance personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          {error && (
            <div className="mb-4 bg-red-950 border-l-4 border-red-500 p-3 rounded text-xs text-red-200">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* Step 1 Form */
            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Official Identifier / Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. officer@police.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Verifying Credentials...' : 'Verify Password & Request OTP'}</span>
              </button>
            </form>
          ) : (
            /* Step 2 Form (2FA OTP) */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-200">
                A 6-digit Security Verification Code has been dispatched to <strong>{maskedEmail}</strong>. (Valid for 5 minutes).
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Enter 6-Digit Email OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="482731"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center tracking-widest text-xl font-bold bg-slate-800 border border-slate-700 rounded-lg p-3 text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>{loading ? 'Validating 2FA...' : 'Authenticate & Enter Dashboard'}</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Back to Password
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setError('');
                    setLoading(true);
                    try {
                      const { data } = await api.post('/auth/official/login-initiate', { email, password });
                      if (data.requires2FA) {
                        alert('Fresh 2FA Verification code requested and generated!');
                      }
                    } catch (err) {
                      setError(err.response?.data?.message || 'Failed to resend code');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Citizen reporting emergencies?{' '}
            <NavLink to="/citizen-auth" className="text-emerald-400 font-bold hover:underline">
              Go to Citizen Portal →
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
