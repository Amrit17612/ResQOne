import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  Search,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  ArrowRight
} from 'lucide-react';

const STATUS_STAGES = [
  { key: 'APPLICATION_SUBMITTED', label: 'Application Submitted' },
  { key: 'UNDER_INITIAL_REVIEW', label: 'Initial Review' },
  { key: 'DOCUMENT_VERIFICATION_PENDING', label: 'Document Verification' },
  { key: 'DOCUMENT_VERIFIED', label: 'Documents Verified' },
  { key: 'ADDITIONAL_INFORMATION_REQUIRED', label: 'Info Required' },
  { key: 'PHYSICAL_VERIFICATION_PENDING', label: 'Physical Check Pending' },
  { key: 'PHYSICAL_VERIFICATION_COMPLETED', label: 'Physical Check Completed' },
  { key: 'FINAL_APPROVAL_PENDING', label: 'Final Approval' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'ACTIVATION_PENDING', label: 'Activation Pending' },
  { key: 'SUCCESSFULLY_REGISTERED', label: 'Active Organization' }
];

export const ApplicationStatusPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Enter AppID & Email, 2 = Enter OTP, 3 = View Status
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/organizations/request-tracking-otp', {
        applicationId: applicationId.trim(),
        email: email.trim()
      });
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Application lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/organizations/verify-tracking-otp', {
        applicationId: applicationId.trim(),
        email: email.trim(),
        otp: otp.trim()
      });
      if (data.success) {
        setApplicationData(data.application);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = STATUS_STAGES.findIndex(s => s.key === applicationData?.status);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/60 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">ResQOne Onboarding Status Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time 13-Stage Verification Tracking with Cryptographic OTP Authentication
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Inquire Credentials */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Application Tracking ID
              </label>
              <input
                type="text"
                required
                value={applicationId}
                onChange={e => setApplicationId(e.target.value)}
                placeholder="e.g. ORG-20261104-0001"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Authorized Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@delhi-hospital.org"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Dispatching OTP...' : 'Request Secure 2FA Tracking OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-amber-300 text-center">
              A 6-digit verification code has been dispatched to <strong>{email}</strong>.
            </p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Verify Code & Access Status'}
            </button>
          </form>
        )}

        {/* Step 3: Verified Status Display */}
        {step === 3 && applicationData && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">{applicationData.applicationId}</span>
                <h2 className="text-lg font-black text-white">{applicationData.organizationName}</h2>
                <p className="text-xs text-slate-400">{applicationData.organizationType} | Reg: {applicationData.registrationNumber}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {applicationData.status}
              </span>
            </div>

            {/* Stages Progression List */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Onboarding Verification Stages</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {STATUS_STAGES.map((stg, i) => {
                  const isPassed = currentStageIndex >= i;
                  const isCurrent = applicationData.status === stg.key;
                  return (
                    <div
                      key={stg.key}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-xs ${
                        isCurrent
                          ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold'
                          : isPassed
                          ? 'bg-slate-900/30 text-emerald-400'
                          : 'bg-slate-900/10 text-slate-600'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span>{stg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {applicationData.adminNotes && (
              <div className="p-3 bg-slate-900/40 border border-slate-700/50 rounded-xl text-xs text-slate-300">
                <span className="font-bold text-amber-400">Super Admin Note: </span>
                {applicationData.adminNotes}
              </div>
            )}

            <button
              onClick={() => { setStep(1); setApplicationData(null); setOtp(''); }}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
            >
              Check Another Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

