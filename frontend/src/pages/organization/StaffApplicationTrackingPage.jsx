import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import { Activity, Search, ShieldCheck, CheckCircle2, Clock, ArrowRight, UserCheck } from 'lucide-react';

export const StaffApplicationTrackingPage = () => {
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/staff-applications/track/request-otp', {
        applicationId: applicationId.trim(),
        email: email.trim()
      });
      if (data.success) {
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/staff-applications/track/verify-otp', {
        applicationId: applicationId.trim(),
        email: email.trim(),
        otp: otp.trim()
      });
      if (data.success) {
        setApplicationData(data.application);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-3">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-2xl font-black text-white">Track Staff Application Status</h1>
          <p className="mt-1 text-xs text-slate-400">
            Protected status tracking with email second-factor OTP authentication.
          </p>
        </div>

        {applicationData ? (
          <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {applicationData.applicationId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{applicationData.fullName}</h3>
                <p className="text-xs text-slate-500">{applicationData.requestedRole.replace(/_/g, ' ')}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  applicationData.status === 'APPROVED' || applicationData.status === 'ACCOUNT_ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : applicationData.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {applicationData.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Facility:</span>
                <span className="font-bold text-slate-800">{applicationData.organizationName}</span>
              </div>
              {applicationData.assignedStaffId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Staff ID:</span>
                  <span className="font-mono font-bold text-indigo-700">{applicationData.assignedStaffId}</span>
                </div>
              )}
              {applicationData.adminRemarks && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5 font-semibold">Hospital Admin Remarks:</span>
                  <p className="text-slate-700 italic">{applicationData.adminRemarks}</p>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase text-slate-500 block">Verification Progress</span>
              <div className="space-y-2">
                {applicationData.statusHistory?.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{step.status}</span>
                      <span className="text-[11px] text-slate-500">{step.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(step.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setApplicationData(null);
                setOtpSent(false);
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Track Another Application
            </button>
          </div>
        ) : (
          <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Staff Application ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STAFF-20261104-0001"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Registered Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="applicant@example.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Transmitting OTP...' : 'Request Email Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                  A 6-digit verification code was sent to <strong>{email}</strong>. Enter it below to unlock status.
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Enter 6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center tracking-widest text-lg font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying OTP...' : 'Unlock Application Details'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

