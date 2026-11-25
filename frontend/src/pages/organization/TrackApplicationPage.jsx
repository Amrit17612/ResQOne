import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import { Search, Activity, CheckCircle2, Clock, AlertCircle, FileCheck, Key } from 'lucide-react';

export const TrackApplicationPage = () => {
  const [step, setStep] = useState(1); // 1 = Input ID & Email, 2 = Enter Tracking OTP
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/organizations/track/request-otp', {
        applicationId,
        email
      });
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No matching application found.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and show Application Status
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/organizations/track/verify-otp', {
        applicationId,
        email,
        otp
      });
      if (data.success) {
        setApplication(data.application);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-4">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-3xl font-black text-white tracking-tight">Track Organization Application</h1>
          <p className="mt-2 text-xs text-slate-400">
            Protected via Email OTP Verification to prevent unauthorized inspection.
          </p>
        </div>

        {!application ? (
          <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 mb-8">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Application Identifier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORG-20261104-0001"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Registered Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="director@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-resq-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Validating Application...' : 'Request Tracking Verification Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  A 6-digit Verification Code was sent to <strong>{email}</strong>. Enter it below to inspect application status.
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Enter Tracking OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center tracking-widest text-xl font-bold border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Unlock Application Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700"
                >
                  ← Change Email or Application ID
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Application Status Display after OTP */
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-700">
              <div>
                <span className="font-mono text-xs text-slate-400 font-bold block">
                  ID: {application.applicationId}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{application.organizationName}</h3>
                <span className="text-xs text-slate-400">{application.organizationType}</span>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400">Audit Status History</h4>
              <div className="space-y-2">
                {application.statusHistory?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs flex justify-between items-start"
                  >
                    <div>
                      <span className="font-bold text-emerald-400 block mb-0.5">
                        {step.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-300">{step.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-4">
                      {new Date(step.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setApplication(null);
                setStep(1);
                setOtp('');
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              ← Track Another Organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
